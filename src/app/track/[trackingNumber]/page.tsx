import { prisma } from "@/lib/db";


export default async function Tracking({ params }: { params: { trackingNumber: string } }) {
const order = await prisma.order.findFirst({
where: { shipment: { trackingNumber: params.trackingNumber } },
include: { shipment: { include: { events: { orderBy: { eventTime: "asc" } } } }, items: true }
});


if (!order) return (
<div className="bg-white shadow rounded-2xl p-6">
<p className="text-red-600 font-medium">No shipment found for: {decodeURIComponent(params.trackingNumber)}</p>
</div>
);

const s = order.shipment!;


return (
<div className="space-y-6">
<section className="bg-white shadow rounded-2xl p-6">
<h2 className="text-lg font-semibold mb-2">Order {order.orderNumber}</h2>
<p className="text-sm text-gray-600">{order.customerName} — {order.customerEmail}</p>
<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<h3 className="font-semibold">Shipping Address</h3>
<p className="text-sm text-gray-700 whitespace-pre-line">{order.shippingAddr}</p>
</div>
<div>
<h3 className="font-semibold">Billing Address</h3>
<p className="text-sm text-gray-700 whitespace-pre-line">{order.billingAddr}</p>
</div>
</div>
</section>

<section className="bg-white shadow rounded-2xl p-6">
<div className="flex items-center justify-between">
<div>
<h3 className="font-semibold">Shipment</h3>
<p className="text-sm text-gray-600">{s.carrier} — {s.serviceLevel}</p>
<p className="text-sm text-gray-600">Tracking: <span className="font-mono">{s.trackingNumber}</span></p>
</div>
<div className="text-right">
<span className="inline-block rounded-full px-3 py-1 text-sm bg-gray-900 text-white">{s.status}</span>
{s.estimatedDate && (
<p className="text-xs text-gray-500 mt-1">ETA: {new Date(s.estimatedDate).toLocaleDateString()}</p>
)}
</div>
</div>


<div className="mt-6">
<h4 className="font-semibold mb-2">Events</h4>
<ul className="relative border-l ml-2 pl-6">
{s.events.map(e => (
<li key={e.id} className="mb-4">
<div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-gray-900" />
<p className="text-sm"><span className="font-medium">{e.status}</span> — {e.location}</p>
<p className="text-xs text-gray-600">{new Date(e.eventTime).toLocaleString()}</p>
<p className="text-sm text-gray-700">{e.description}</p>
</li>
))}
</ul>
</div>
</section>


<section className="bg-white shadow rounded-2xl p-6">
<h3 className="font-semibold mb-2">Items</h3>
<table className="w-full text-sm">
<thead>
<tr className="text-left border-b">
<th className="py-2">SKU</th>
<th>Name</th>
<th>Qty</th>
<th>Price</th>
</tr>
</thead>
<tbody>
{order.items.map(it => (
<tr key={it.id} className="border-b last:border-0">
<td className="py-2 font-mono">{it.sku}</td>
<td>{it.name}</td>
<td>{it.quantity}</td>
<td>£{Number(it.price).toFixed(2)}</td>
</tr>
))}
</tbody>
</table>
</section>
</div>
);
}