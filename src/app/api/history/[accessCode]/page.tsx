import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function HistoryPage({ params }: { params: { accessCode: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { accessCode: params.accessCode },
  });

  if (!customer) {
    return (
      <div className="bg-white shadow rounded-2xl p-6">
        <p className="text-red-600 font-medium">No history found for this code.</p>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      shipment: { include: { events: { orderBy: { eventTime: "asc" } } } }
    }
  });

  return (
    <div className="space-y-6">
      <section className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-2">Order History</h2>
        <p className="text-sm text-gray-600">{customer.email}</p>
      </section>

      {orders.length === 0 ? (
        <div className="bg-white shadow rounded-2xl p-6">
          <p className="text-gray-700">No orders yet.</p>
        </div>
      ) : (
        orders.map((order) => (
          <section key={order.id} className="bg-white shadow rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Order {order.orderNumber}</h3>
                <p className="text-sm text-gray-600">
                  {order.customerName} — {order.customerEmail}
                </p>
              </div>
              {order.shipment && (
                <div className="text-right">
                  <span className="inline-block rounded-full px-3 py-1 text-sm bg-gray-900 text-white">
                    {order.shipment.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.shipment.trackingNumber}
                  </p>
                  <Link
                    className="text-xs underline text-gray-700"
                    href={`/track/${encodeURIComponent(order.shipment.trackingNumber)}`}
                  >
                    View shipment
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Items</h4>
              <ul className="text-sm list-disc pl-5">
                {order.items.map((it) => (
                  <li key={it.id}>
                    {it.name} (x{it.quantity}) — £{Number(it.price).toFixed(2)} [{it.sku}]
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
