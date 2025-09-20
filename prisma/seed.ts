import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Wipe old data for testing
  await prisma.trackingEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.item.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  // === Customer 1: Jane Doe (already had) ===
  const jane = await prisma.customer.create({
    data: {
      email: "jane@example.com",
      phoneE164: "+447700900123",
      accessCode: "ACC-7H92Q3KD",
    },
  });

  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-1001",
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      shippingAddr: "221B Baker Street, London, UK",
      billingAddr: "221B Baker Street, London, UK",
      customerId: jane.id,
      weightKg: 0.75,
      items: {
        create: [
          { sku: "TSHIRT-RED-S", name: "Red T-Shirt (Small)", quantity: 2, price: 19.99, weightKg: 0.2 },
          { sku: "MUG-WHITE", name: "Ceramic Mug", quantity: 1, price: 7.50, weightKg: 0.35 },
        ],
      },
      shipment: {
        create: {
          trackingNumber: "TRK-ABC123",
          carrier: "Royal Mail",
          serviceLevel: "Standard",
          status: "In Transit",
          estimatedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          events: {
            create: [
              { status: "Label Created", location: "London", description: "Shipping label generated" },
              { status: "Picked Up", location: "London", description: "Carrier picked up the package" },
              { status: "In Transit", location: "Manchester", description: "Package in transit" },
            ],
          },
        },
      },
    },
  });

  // === Customer 2: Alex Smith (delivered order) ===
  const alex = await prisma.customer.create({
    data: {
      email: "alex@example.com",
      phoneE164: "+14155552671",
      accessCode: "ACC-4D8ZPQ1A",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2001",
      customerName: "Alex Smith",
      customerEmail: "alex@example.com",
      shippingAddr: "742 Evergreen Terrace, Springfield, USA",
      billingAddr: "742 Evergreen Terrace, Springfield, USA",
      customerId: alex.id,
      weightKg: 1.8,
      items: {
        create: [
          { sku: "LAPTOP-BAG-BLK", name: "Laptop Bag", quantity: 1, price: 49.99, weightKg: 1.2 },
          { sku: "MOUSE-WL-LOGI", name: "Wireless Mouse", quantity: 1, price: 29.99, weightKg: 0.6 },
        ],
      },
      shipment: {
        create: {
          trackingNumber: "TRK-DELIV001",
          carrier: "FedEx",
          serviceLevel: "Express",
          status: "Delivered",
          estimatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          events: {
            create: [
              { status: "Picked Up", location: "Los Angeles", description: "Package collected" },
              { status: "In Transit", location: "Chicago", description: "Package in transit" },
              { status: "Delivered", location: "Springfield", description: "Delivered to customer" },
            ],
          },
        },
      },
    },
  });

  // === Customer 3: Maria Lopez (multiple pending orders) ===
  const maria = await prisma.customer.create({
    data: {
      email: "maria@example.com",
      phoneE164: "+34911222333",
      accessCode: "ACC-LOPEZ91",
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: "ORD-3001",
      customerName: "Maria Lopez",
      customerEmail: "maria@example.com",
      shippingAddr: "Calle Mayor 45, Madrid, Spain",
      billingAddr: "Calle Mayor 45, Madrid, Spain",
      customerId: maria.id,
      weightKg: 0.5,
      items: {
        create: [
          { sku: "BOOK-ML-NOVEL", name: "Mystery Novel", quantity: 1, price: 14.99, weightKg: 0.5 },
        ],
      },
      shipment: {
        create: {
          trackingNumber: "TRK-MADRID001",
          carrier: "Correos",
          serviceLevel: "Standard",
          status: "Label Created",
          events: { create: [{ status: "Label Created", location: "Madrid", description: "Shipping label created" }] },
        },
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: "ORD-3002",
      customerName: "Maria Lopez",
      customerEmail: "maria@example.com",
      shippingAddr: "Calle Mayor 45, Madrid, Spain",
      billingAddr: "Calle Mayor 45, Madrid, Spain",
      customerId: maria.id,
      weightKg: 2.0,
      items: {
        create: [
          { sku: "SHOES-RUN-BLU", name: "Running Shoes", quantity: 1, price: 89.99, weightKg: 1.5 },
          { sku: "SOCKS-3PK", name: "Socks (3 pack)", quantity: 1, price: 9.99, weightKg: 0.5 },
        ],
      },
      shipment: {
        create: {
          trackingNumber: "TRK-MADRID002",
          carrier: "Correos",
          serviceLevel: "Standard",
          status: "Processing",
          events: { create: [{ status: "Processing", location: "Madrid", description: "Preparing package" }] },
        },
      },
    },
  });

  console.log("✅ Seed complete with Jane, Alex, and Maria test scenarios");
}

main().finally(() => prisma.$disconnect());
