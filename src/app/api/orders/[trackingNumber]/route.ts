import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(
  _req: Request,
  { params }: { params: { trackingNumber: string } }
) {
  const trackingNumber = decodeURIComponent(params.trackingNumber || "").trim();
  const lim = rateLimit(`order:${trackingNumber}`, 60, 60_000);
  if (!lim.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!/^TRK-[A-Z0-9-]+$/i.test(trackingNumber)) {
    return NextResponse.json({ error: "Invalid tracking number format" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { shipment: { trackingNumber } },
    include: {
      items: true,
      shipment: { include: { events: { orderBy: { eventTime: "asc" } } } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order Not found" }, { status: 404 });
  }

  // keep payload small & consistent
  return NextResponse.json(
    {
      ok: true,
      order,
    },
    { status: 200 }
  );
}
