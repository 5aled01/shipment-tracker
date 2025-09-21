import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

/** ---------- Validation Schemas ---------- */

const ItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.coerce.number().int().positive("Quantity must be > 0"),
  priceAED: z.coerce.number().min(0, "priceAED must be >= 0"),
  priceMRU: z.coerce.number().min(0, "priceMRU must be >= 0"),
  weightKg: z.coerce.number().min(0, "weightKg must be >= 0").optional().default(0),
});

const CreateOrderSchema = z.object({
  orderNumber: z.string().min(1, "orderNumber is required"),
  customerName: z.string().min(1, "customerName is required"),
  customerPhone: z.string().min(4, "customerPhone is required"),
  fromCountry: z.string().min(1, "fromCountry is required"),
  toCountry: z.string().min(1, "toCountry is required"),

  // Shipment fields
  serviceLevel: z.enum(["Standard", "Express"]).or(z.string().min(1)), // allow custom strings if needed
  trackingNumber: z.string().min(1, "trackingNumber is required"),
  estimatedDate: z.string().datetime().optional(), // ISO string preferred

  // Items
  items: z.array(ItemSchema).min(1, "At least one item is required"),
});

/** ---------- Auth Helper ---------- */
function requireApiKey(headers: Headers) {
  const key = headers.get("x-api-key");
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** ---------- POST /api/orders ---------- */
export async function POST(req: Request) {
  // Admin auth
  const unauthorized = requireApiKey(req.headers);
  if (unauthorized) return unauthorized;

  // Parse JSON
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    orderNumber,
    customerName,
    customerPhone,
    fromCountry,
    toCountry,
    serviceLevel,
    estimatedDate,
    trackingNumber,
    items,
  } = parsed.data;

  // Create
  try {
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
            serviceLevel,
            status: "Created",
            estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
          },
        },
      },
      include: { shipment: true, items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    console.error("Create order error:", err);
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }
}
