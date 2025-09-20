import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";


const ItemSchema = z.object({
sku: z.string(),
name: z.string(),
quantity: z.number().int().positive(),
price: z.number().nonnegative()
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
items: z.array(ItemSchema).min(1)
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
try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }


const parsed = CreateOrderSchema.safeParse(body);
if (!parsed.success) {
return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
}


const { orderNumber, customerName, customerEmail, shippingAddr, billingAddr, carrier, serviceLevel, estimatedDate, trackingNumber, items } = parsed.data;


const order = await prisma.order.create({
data: {
orderNumber, customerName, customerEmail, shippingAddr, billingAddr,
items: { create: items.map(i => ({ ...i })) },
shipment: {
create: {
trackingNumber, carrier, serviceLevel,
status: "Created",
estimatedDate: estimatedDate ? new Date(estimatedDate) : null
}
}
},
include: { shipment: true, items: true }
});


return NextResponse.json(order, { status: 201 });
}