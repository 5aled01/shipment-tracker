// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Item without SKU; dual prices
const ItemSchema = z.object({
  name: z.string(),
  quantity: z.number().int().positive(),
  priceAED: z.number().nonnegative(),
  priceMRU: z.number().nonnegative(),
  weightKg: z.number().nonnegative().default(0),
});

// Order payload: name/phone/from/to only (no email/addresses)
const CreateOrderSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  fromCountry: z.string(),
  toCountry: z.string(),
  trackingNumber: z.string(),
  serviceLevel: z.string().default("Standard"),
  status: z.string().default("Created"),
  estimatedDate: z.string().optional(),
  items: z.array(ItemSchema).min(1),
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
    orderNumber,
    customerName,
    customerPhone,
    fromCountry,
    toCountry,
    trackingNumber,
    serviceLevel,
    status,
    estimatedDate,
    items,
  } = parsed.data;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      customerPhone,
      fromCountry,
      toCountry,
      items: {
        create: items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          priceAED: i.priceAED,
          priceMRU: i.priceMRU,
          weightKg: i.weightKg ?? 0,
        })),
      },
      shipment: {
        create: {
          trackingNumber,
          carrier: "hidden", // kept in DB, not shown in UI
          serviceLevel,
          status,
          estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
        },
      },
    },
    include: { items: true, shipment: true },
  });

  return NextResponse.json(order, { status: 201 });
}
