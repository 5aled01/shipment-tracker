// src/app/api/history/[accessCode]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(
  _req: Request,
  { params }: { params: { accessCode: string } }
) {
  const accessCode = decodeURIComponent(params.accessCode || "").trim();

  const lim = rateLimit(`history:${accessCode}`, 60, 60_000);
  if (!lim.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (!/^ACC-[A-Z0-9-]{4,}$/i.test(accessCode)) {
    return NextResponse.json({ error: "Invalid access code format" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { accessCode } });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      shipment: { include: { events: { orderBy: { eventTime: "asc" } } } },
    },
  });

  // No email returned; return accessCode/phone if needed
  return NextResponse.json(
    { ok: true, customer: { phoneE164: customer.phoneE164, accessCode: customer.accessCode }, orders },
    { status: 200 }
  );
}
