import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";


export async function GET(_: Request, { params }: { params: { trackingNumber: string } }) {
const key = `orders:${params.trackingNumber}`;
const lim = rateLimit(key, 120, 60_000);
if (!lim.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });


const order = await prisma.order.findFirst({
where: { shipment: { trackingNumber: params.trackingNumber } },
include: { shipment: { include: { events: { orderBy: { eventTime: "asc" } } } }, items: true }
});


if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
return NextResponse.json(order);
}