// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Clear data for demo
  await prisma.trackingEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.item.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  // Customers (no email)
  const c1 = await prisma.customer.create({
    data: { phoneE164: "+447700900123", accessCode: "ACC-7H92Q3KD" },
  });
  const c2 = await prisma.customer.create({
    data: { phoneE164: "+14155552671", accessCode: "ACC-4D8ZPQ1A" },
  });

  // ORDER 1 — In Transit, UAE → Mauritania
  await prisma.order.create({
    data: {
      orderNumber: "ORD-1001",
      customerName: "Jane Doe",
      customerPhone: "+971500000001",
      fromCountry: "United Arab Emirates",
      toCountry: "Mauritania",
      customerId: c1.id,
      items: {
        create: [
          { name: "Red T-Shirt (Small)", quantity: 2, priceAED: 49.0, priceMRU: 470.0, weightKg: 0.2 },
          { name: "Ceramic Mug",         quantity: 1, priceAED: 25.0, priceMRU: 240.0, weightKg: 0.35 },
        ],
      },
      shipment: {
        create: {
          trackingNumber: "TRK-ABC123",
          carrier: "Aramex",
          serviceLevel: "Standard",
          status: "In Transit",
          estimatedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          events: {
            create: [
              { status: "Label Created", location: "Dubai",   description: "Shipping label generated" },
              { status: "Picked Up",     location: "Dubai",   description: "Collected by courier" },
              { status: "In Transit",    location: "Riyadh",  description: "In transit hub" },
            ],
          },
        },
      },
    },
  });

  // ORDER 2 — Delivered, SA → Mauritania
  await prisma.order.create({
    data: {
      orderNumber: "ORD-2001",
      customerName: "Alex Smith",
      customerPhone: "+966500000002",
      fromCountry: "Saudi Arabia",
      toCountry: "Mauritania",
      customerId: c2.id,
      items: {
        create: [
          { name: "Laptop Bag",    quantity: 1, priceAED: 179.0, priceMRU: 1720.0, weightKg: 1.2 },
          { name: "Wireless Mouse",quantity: 1, priceAED: 89.0,  priceMRU: 860.0,  weightKg: 0.2 },
        ],
      },
      shipment: {
        create: {
          trackingNumber: "TRK-DELIV001",
          carrier: "DHL",
          serviceLevel: "Express",
          status: "Delivered",
          estimatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          events: {
            create: [
              { status: "Picked Up",  location: "Riyadh",       description: "Package collected" },
              { status: "In Transit", location: "Casablanca",   description: "Transit facility" },
              { status: "Delivered",  location: "Nouakchott",   description: "Delivered to recipient" },
            ],
          },
        },
      },
    },
  });

  // ORDER 3 — Processing, UAE → Mauritania
  await prisma.order.create({
    data: {
      orderNumber: "ORD-3001",
      customerName: "Maria Lopez",
      customerPhone: "+971500000003",
      fromCountry: "United Arab Emirates",
      toCountry: "Mauritania",
      customerId: c1.id,
      items: {
        create: [
          { name: "Mystery Novel", quantity: 1, priceAED: 35.0, priceMRU: 335.0, weightKg: 0.5 },
        ],
      },
      shipment: {
        create: {
          trackingNumber: "TRK-MADRID001",
          carrier: "Local",
          serviceLevel: "Standard",
          status: "Processing",
          events: { create: [{ status: "Processing", location: "Dubai", description: "Preparing package" }] },
        },
      },
    },
  });

  console.log("✅ Seeded without email/SKU");
}

main().finally(() => prisma.$disconnect());
