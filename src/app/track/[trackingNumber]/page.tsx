// src/app/track/[trackingNumber]/page.tsx
import { prisma } from "@/lib/db";
import clsx from "clsx";
import Image from "next/image";

function statusClass(s: string) {
  const k = s.toLowerCase();
  if (k.includes("delivered")) return "bg-green-100 text-green-800 border-green-200";
  if (k.includes("transit")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (k.includes("processing") || k.includes("created")) return "bg-amber-100 text-amber-800 border-amber-200";
  if (k.includes("delayed")) return "bg-orange-100 text-orange-800 border-orange-200";
  if (k.includes("cancel")) return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
}

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
  const totalWeight = order.items.reduce((sum, it) => sum + Number(it.weightKg) * it.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Order summary */}
      <section className="bg-white shadow rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Order {order.orderNumber}</h2>
            <p className="text-sm text-gray-700">
              {order.customerName} • {order.customerPhone}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Route: <span className="font-medium">{order.fromCountry}</span> →{" "}
              <span className="font-medium">{order.toCountry}</span>
            </p>
          </div>

          <div className="text-right">
            <span
              className={clsx(
                "inline-block rounded-full px-3 py-1 text-sm border",
                statusClass(s.status)
              )}
            >
              {s.status}
            </span>
            {s.estimatedDate && (
              <p className="text-xs text-gray-500 mt-1">
                ETA: {new Date(s.estimatedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg border p-3">
            <p className="text-gray-600">Items</p>
            <p className="font-semibold">{totalItems}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-gray-600">Total weight</p>
            <p className="font-semibold">{totalWeight.toFixed(3)} kg</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-gray-600">Tracking</p>
            <p className="font-mono">{s.trackingNumber}</p>
          </div>
        </div>
      </section>

      {/* Shipment (no carrier shown) */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h3 className="font-semibold">Shipment</h3>
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
                  <p className="text-xs text-gray-500">
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

      {/* Items (no SKU, no line totals) */}
{/* Items (mobile-friendly: scroll if too wide) */}
<section className="bg-white shadow rounded-2xl p-6">
  <h3 className="font-semibold mb-2">Items</h3>

  {/* Make table scroll on small screens */}
  <div className="-mx-4 md:mx-0 overflow-x-auto">
    <table className="min-w-[520px] w-full text-sm">
      <thead>
        <tr className="text-left border-b">
          <th className="py-2 px-4 md:px-2">Item</th>
          <th className="px-4 md:px-2">Qty</th>
          <th className="px-4 md:px-2 whitespace-nowrap">Unit (AED) <Image src="/flags/uae.png" alt="UAE flag" width={18} height={12} className="inline-block rounded-sm" />
          </th>
          <th className="px-4 md:px-2 whitespace-nowrap">Unit (MRU) <Image src="/flags/mru.png" alt="Mauritania flag" width={18} height={12} className="inline-block rounded-sm" />
          </th>
        </tr>
      </thead>
      <tbody>
        {order.items.map((it) => (
          <tr key={it.id} className="border-b last:border-0">
            <td className="py-2 px-4 md:px-2">{it.name}</td>
            <td className="px-4 md:px-2">{it.quantity}</td>
            <td className="px-4 md:px-2 whitespace-nowrap">
              <span className="flex items-center gap-2 text-sm">
                                             {Number(it.priceAED).toFixed(2)} AED
                                          </span>
            </td>
            <td className="px-4 md:px-2 whitespace-nowrap">
              <span className="flex items-center gap-2 text-sm">
                                             {Number(it.priceMRU).toFixed(2)} MRU
       </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Optional tiny hint only on small screens */}
  <p className="mt-2 text-xs text-gray-500 md:hidden">Swipe to see more →</p>
</section>


    </div>
  );
}
