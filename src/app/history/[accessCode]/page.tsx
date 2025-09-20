import { prisma } from "@/lib/db";
import Link from "next/link";

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default async function HistoryPage({
  params,
}: { params: { accessCode: string } }) {
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
      shipment: { include: { events: { orderBy: { eventTime: "asc" } } } },
    },
  });

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header card */}
      <section className="bg-white shadow rounded-2xl p-5 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold">Your Orders</h2>
        <p className="text-sm text-gray-600">{customer.email}</p>
        <p className="text-xs text-gray-500 mt-1">
          Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>
      </section>

      {orders.length === 0 ? (
        <div className="bg-white shadow rounded-2xl p-5 md:p-6">
          <p className="text-gray-700">No orders yet.</p>
          <Link
            href="/track"
            className="inline-block mt-3 text-sm text-gray-700 underline"
          >
            Go to tracking
          </Link>
        </div>
      ) : (
        orders.map((order) => {
          const subtotal = order.items.reduce(
            (sum, it) => sum + Number(it.price) * it.quantity,
            0
          );
          const totalItems = order.items.reduce((sum, it) => sum + it.quantity, 0);
          const status = order.shipment?.status ?? "—";
          const tracking = order.shipment?.trackingNumber;

          return (
            <section
              key={order.id}
              className="bg-white shadow rounded-2xl p-4 md:p-5"
            >
              {/* Order header */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base md:text-lg font-semibold">
                      Order {order.orderNumber}
                    </h3>
                    <span className="text-xs rounded-full px-2.5 py-0.5 bg-gray-900 text-white">
                      {status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Placed: {fmtDate(order.createdAt)}</p>
                  <p className="text-sm text-gray-700">
                    {order.customerName} • {order.customerEmail}
                  </p>
                </div>

                <div className="text-sm text-gray-700">
                  <div>Items: <span className="font-medium">{totalItems}</span></div>
                  <div>Subtotal: <span className="font-medium">£{subtotal.toFixed(2)}</span></div>
                  {tracking && (
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">Tracking:</span>{" "}
                      <span className="font-mono text-xs">{tracking}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                {tracking && (
                  <Link
                    href={`/track/${encodeURIComponent(tracking)}`}
                    className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
                  >
                    View shipment
                  </Link>
                )}

                {/* Simple accordion with chevron (no “Show/Hide” text) */}
                <details className="group rounded-lg border border-gray-200">
                  <summary className="list-none flex items-center justify-between px-3 py-2 cursor-pointer select-none">
                    <span className="text-sm font-medium">Items ({totalItems})</span>
                    <svg
                      className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.7a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </summary>
                  <div className="px-3 pb-3">
                    <ul className="divide-y divide-gray-100">
                      {order.items.map((it) => (
                        <li
                          key={it.id}
                          className="py-2 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{it.name}</p>
                            <p className="text-xs text-gray-500 break-all">
                              SKU: <span className="font-mono">{it.sku}</span>
                            </p>
                            <p className="text-xs text-gray-500">Qty: {it.quantity}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium">
                              £{Number(it.price).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Line: £{(Number(it.price) * it.quantity).toFixed(2)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </div>

              {/* Addresses */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-gray-200 p-3">
                  <h4 className="font-semibold mb-1">Shipping</h4>
                  <p className="text-gray-700 whitespace-pre-line">{order.shippingAddr}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <h4 className="font-semibold mb-1">Billing</h4>
                  <p className="text-gray-700 whitespace-pre-line">{order.billingAddr}</p>
                </div>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
