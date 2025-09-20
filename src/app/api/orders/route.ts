import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const ItemSchema = z.object({
  sku: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  // NEW: per-unit weight in kilograms
  weightKg: z.number().nonnegative().default(0),
});

const CreateOrderSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  shippingAddr: z.string(),
  billingAddr: z.string(),
  carrier: z.string(),
  serviceLevel: z.string(),
  estimatedDate: z.string().optional(),
  trackingNumber: z.string(),
  items: z.array(ItemSchema).min(1),
  // Optional: allow caller to provide a pre-computed total (we’ll recompute anyway)
  weightKg: z.number().nonnegative().optional(),
});

function requireApiKey(headers: Headers) {
  const key = headers.get("x-api-key");
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(req: Request) {
  const unauthorized = requireApiKey(req.headers);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const {
    orderNumber, customerName, customerEmail, shippingAddr, billingAddr,
    carrier, serviceLevel, estimatedDate, trackingNumber, items, weightKg,
  } = parsed.data;

  // Compute total order weight from items
  const computedWeight = items.reduce(
    (sum, it) => sum + (it.weightKg ?? 0) * it.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      orderNumber, customerName, customerEmail, shippingAddr, billingAddr,
      // store computed total (or provided if greater truth prevails)
      weightKg: typeof weightKg === "number" ? weightKg : computedWeight,
      items: {
        create: items.map((i) => ({
          sku: i.sku,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          weightKg: i.weightKg ?? 0,
        })),
      },
      shipment: {
        create: {
          trackingNumber, carrier, serviceLevel,
          status: "Created",
          estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
        },
      },
    },
    include: { shipment: true, items: true },
  });

  // If provided weight was missing or wrong, ensure DB has the computed total
  const ensuredTotal = order.items.reduce(
    (sum, it) => sum + Number(it.weightKg) * it.quantity,
    0
  );
  if (Number(order.weightKg) !== ensuredTotal) {
    await prisma.order.update({ where: { id: order.id }, data: { weightKg: ensuredTotal } });
  }

  return NextResponse.json(order, { status: 201 });
}
