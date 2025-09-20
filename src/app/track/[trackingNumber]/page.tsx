import { prisma } from "@/lib/db";

export default async function Tracking({
  params,
}: { params: { trackingNumber: string } }) {
  const tracking = decodeURIComponent(params.trackingNumber);

  const order = await prisma.order.findFirst({
    where: { shipment: { trackingNumber: tracking } },
    include: {
      items: true,
      shipment: { include: { events: { orderBy: { eventTime: "asc" } } } },
    },
  });

  if (!order) {
    return (
      <div className="bg-white shadow rounded-2xl p-6">
        <p className="text-red-600 font-medium">
          No shipment found for: {tracking}
        </p>
      </div>
    );
  }

  const s = order.shipment!;
  const totalItems = order.items.reduce((sum, it) => sum + it.quantity, 0);
  const totalWeight = order.items.reduce(
    (sum, it) => sum + Number(it.weightKg) * it.quantity,
    0
  );
  const subtotal = order.items.reduce(
    (sum, it) => sum + Number(it.price) * it.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Order summary */}
      <section className="bg-white shadow rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Order {order.orderNumber}</h2>
            <p className="text-sm text-gray-600">
              {order.customerName} • {order.customerEmail}
            </p>
          </div>
          <div className="text-sm text-gray-700">
            <div>Total items: <span className="font-medium">{totalItems}</span></div>
            <div>Total weight: <span className="font-medium">{totalWeight.toFixed(3)} kg</span></div>
            <div>Subtotal: <span className="font-medium">£{subtotal.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold">Shipping Address</h3>
            <p className="text-gray-700 whitespace-pre-line">{order.shippingAddr}</p>
          </div>
          <div>
            <h3 className="font-semibold">Billing Address</h3>
            <p className="text-gray-700 whitespace-pre-line">{order.billingAddr}</p>
          </div>
        </div>
      </section>

      {/* Shipment card */}
      <section className="bg-white shadow rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">Shipment</h3>
            <p className="text-sm text-gray-600">{s.carrier} • {s.serviceLevel}</p>
            <p className="text-sm">
              Tracking: <span className="font-mono">{s.trackingNumber}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block rounded-full px-3 py-1 text-sm bg-gray-900 text-white">
              {s.status}
            </span>
            {s.estimatedDate && (
              <p className="text-xs text-gray-500 mt-1">
                ETA: {new Date(s.estimatedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Events timeline (compact) */}
        {s.events.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Events</h4>
            <ul className="relative border-l ml-2 pl-6">
              {s.events.map((e) => (
                <li key={e.id} className="mb-3">
                  <div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-gray-900" />
                  <p className="text-sm">
                    <span className="font-medium">{e.status}</span> — {e.location}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(e.eventTime).toLocaleString()}
                  </p>
                  {e.description && (
                    <p className="text-sm text-gray-700">{e.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Items table, with weights */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h3 className="font-semibold mb-2">Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">SKU</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit weight (kg)</th>
                <th>Line weight (kg)</th>
                <th>Unit price</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => {
                const unitW = Number(it.weightKg);
                const lineW = unitW * it.quantity;
                const unitP = Number(it.price);
                const lineP = unitP * it.quantity;
                return (
                  <tr key={it.id} className="border-b last:border-0">
                    <td className="py-2 font-mono">{it.sku}</td>
                    <td>{it.name}</td>
                    <td>{it.quantity}</td>
                    <td>{unitW.toFixed(3)}</td>
                    <td>{lineW.toFixed(3)}</td>
                    <td>£{unitP.toFixed(2)}</td>
                    <td>£{lineP.toFixed(2)}</td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr>
                <td colSpan={4} className="pt-3 text-right font-semibold">Totals:</td>
                <td className="pt-3 font-semibold">{totalWeight.toFixed(3)} kg</td>
                <td />
                <td className="pt-3 font-semibold">£{subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
