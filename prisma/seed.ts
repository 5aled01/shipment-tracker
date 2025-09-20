import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


async function main() {
const order = await prisma.order.create({
data: {
orderNumber: `ORD-1001-${Date.now()}`,
customerName: "Jane Doe",
customerEmail: "jane@example.com",
shippingAddr: "221B Baker Street, London, UK",
billingAddr: "221B Baker Street, London, UK",
items: {
create: [
{ sku: "SKU-RED-1", name: "Red T-Shirt", quantity: 2, price: 19.99 },
{ sku: "SKU-MUG-9", name: "Coffee Mug", quantity: 1, price: 7.50 }
]
},
shipment: {
create: {
trackingNumber: "TRK-ABC123",
carrier: "RoyalMail",
serviceLevel: "Standard",
status: "Label Created",
estimatedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
events: {
create: [
{ status: "Label Created", location: "Warehouse A", description: "Label generated" },
{ status: "Picked Up", location: "London", description: "Carrier picked up parcel" }
]
}
}
}
}
});


console.log("Seeded:", order.orderNumber);
}


main().finally(() => prisma.$disconnect());