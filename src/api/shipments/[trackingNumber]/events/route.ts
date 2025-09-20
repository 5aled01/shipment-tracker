import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";


function requireApiKey(headers: Headers) {
const key = headers.get("x-api-key");
if (!key || key !== process.env.ADMIN_API_KEY) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
return null;
}


const EventSchema = z.object({
status: z.string(),
location: z.string(),
description: z.string(),
eventTime: z.string().optional()
});


export async function POST(req: Request, { params }: { params: { trackingNumber: string } }) {
const unauthorized = requireApiKey(req.headers);
if (unauthorized) return unauthorized;


const body = await req.json().catch(() => null);
const parsed = EventSchema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });


const shipment = await prisma.shipment.findUnique({ where: { trackingNumber: params.trackingNumber } });
if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });


const evt = await prisma.trackingEvent.create({
data: {
shipmentId: shipment.id,
...parsed.data,
eventTime: parsed.data.eventTime ? new Date(parsed.data.eventTime) : undefined
}
});


// Auto-update shipment.status to latest event
await prisma.shipment.update({ where: { id: shipment.id }, data: { status: parsed.data.status } });


return NextResponse.json(evt, { status: 201 });
}