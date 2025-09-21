// src/app/track/[trackingNumber]/page.tsx
import { prisma } from "@/lib/db";
import clsx from "clsx";
import Image from "next/image";

/** ألوان الحالة لبادج الحالة أعلى الصفحة */
function statusClass(s: string) {
  const k = s.toLowerCase();
  if (k.includes("delivered")) return "bg-green-100 text-green-800 border-green-200";
  if (k.includes("transit")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (k.includes("processing") || k.includes("created")) return "bg-amber-100 text-amber-800 border-amber-200";
  if (k.includes("delayed")) return "bg-orange-100 text-orange-800 border-orange-200";
  if (k.includes("cancel")) return "bg-red-100 text-red-800 border-red-200";
  if (k.includes("out for delivery")) return "bg-indigo-100 text-indigo-800 border-indigo-200";
  if (k.includes("picked up") || k.includes("package collected")) return "bg-teal-100 text-teal-800 border-teal-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
}

/** لون نقطة الحدث في المخطط الزمني */
function dotColor(s: string) {
  const k = s.toLowerCase();
  if (k.includes("delivered")) return "bg-black";
  if (k.includes("transit")) return "bg-blue-600";
  if (k.includes("processing") || k.includes("created")) return "bg-amber-600";
  if (k.includes("delayed")) return "bg-orange-500";
  if (k.includes("cancel")) return "bg-red-600";
  if (k.includes("out for delivery")) return "bg-indigo-600";
  if (k.includes("picked up") || k.includes("package collected")) return "bg-teal-600";
  return "bg-gray-400";
}

/** ترجمة عرض الحالة فقط (لا نغيّر قيمة قاعدة البيانات) */
function statusLabel(s: string) {
  const k = s?.toLowerCase() ?? "";
  if (k.includes("delivered")) return "تم التسليم";
  if (k.includes("out for delivery")) return "خرج للتسليم";
  if (k.includes("picked up") || k.includes("package collected")) return "تم الاستلام";
  if (k.includes("transit")) return "قيد النقل";
  if (k.includes("processing") || k.includes("created")) return "قيد المعالجة";
  if (k.includes("delayed")) return "تأخير";
  if (k.includes("cancel")) return "أُلغي";
  return s || "—";
}

/** تاريخ: يوم/شهر(عربي)/سنة بأرقام لاتينية */
function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
  const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  const monthAr = new Intl.DateTimeFormat("ar", { month: "long" }).format(date);
  return `${day} ${monthAr} ${year}`;
}

export default async function Tracking({ params }: { params: { trackingNumber: string } }) {
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
      <div className="bg-white shadow rounded-2xl p-6" dir="rtl">
        <p className="text-red-600 font-medium">لا توجد شحنة برقم التتبع: {tracking}</p>
      </div>
    );
  }

  const s = order.shipment!;
  const totalItems = order.items.reduce((sum, it) => sum + it.quantity, 0);
  const totalWeight = order.items.reduce((sum, it) => sum + Number(it.weightKg) * it.quantity, 0);
  const isExpress = (s.serviceLevel || "").toLowerCase() === "express";

  return (
    <div className="space-y-6" dir="rtl">
      {/* ملخص الطلب */}
      <section className="bg-white shadow rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">الطلب {order.orderNumber}</h2>
            <p className="text-sm text-gray-700">
              {order.customerName} • {order.customerPhone}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              المسار: <span className="font-medium">من {order.fromCountry}</span>{" "}
              <span className="font-medium">إلى {order.toCountry}</span>
            </p>
          </div>

          <div className="text-left md:text-right">
            {/* شارة الحالة (مُحسّنة لتقليل تباعد النص) */}
            <span
              className={clsx(
                "inline-flex items-center rounded-full px-2 py-0.5 text-sm border leading-none tracking-tight whitespace-nowrap",
                statusClass(s.status)
              )}
            >
              {statusLabel(s.status)}
            </span> &nbsp;
            {/* شارة مستوى الخدمة */}
            {s.serviceLevel && (
              isExpress ? (
                <span className="ml-2 inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded leading-none whitespace-nowrap">
                  ⚡ مستعجل
                </span>
              ):(
                <span className="ml-2 inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded leading-none whitespace-nowrap">
                  🚚 عادي
                </span>
              )
            )}

            {s.estimatedDate && (
              <p className="text-xs text-gray-500 mt-1">
                موعد متوقع: {fmtDate(s.estimatedDate)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg border p-3">
            <p className="text-gray-600">العناصر</p>
            <p className="font-semibold">{totalItems}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-gray-600">الوزن الإجمالي</p>
            <p className="font-semibold">{totalWeight.toFixed(3)} kg</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-gray-600">رقم التتبع</p>
            <p className="font-mono">{s.trackingNumber}</p>
          </div>
        </div>
      </section>

      {/* الشحنة */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h3 className="font-semibold">الشحنة</h3>
        {s.events.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">الأحداث</h4>
            <ul className="relative border-l ml-2 pl-6">
              {s.events.map((e) => (
                <li key={e.id} className="mb-3">
                  <div className={clsx("absolute -left-1.5 mt-1 w-3 h-3 rounded-full", dotColor(e.status))} />
                  <p className="text-sm">
                    <span className="font-medium">{statusLabel(e.status)}</span> — {e.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {fmtDate(e.eventTime)} • {new Date(e.eventTime).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* العناصر (جدول RTL مريح للقراءة + تمرير على الجوال) */}
      <section className="bg-white shadow rounded-2xl p-6">
        <h3 className="font-semibold mb-2">العناصر</h3>

        <div className="-mx-4 md:mx-0 overflow-x-auto">
          <table className="min-w-[560px] w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 md:px-2 text-right">الصنف</th>
                <th className="px-4 md:px-2 text-center">الكمية</th>
                {/* أعرض العلم مرة واحدة في رأس العمود فقط */}
                <th className="px-4 md:px-2 whitespace-nowrap text-right">
                  سعر الوحدة (AED)
                  <Image
                    src="/flags/uae.png"
                    alt="علم الإمارات"
                    width={18}
                    height={12}
                    className="inline-block rounded-sm ml-2 align-[-2px]"
                  />
                </th>
                <th className="px-4 md:px-2 whitespace-nowrap text-right">
                  سعر الوحدة (MRU)
                  <Image
                    src="/flags/mru.png"
                    alt="علم موريتانيا"
                    width={18}
                    height={12}
                    className="inline-block rounded-sm ml-2 align-[-2px]"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="border-b last:border-0">
                  <td className="py-2 px-4 md:px-2 text-right">{it.name}</td>
                  <td className="px-4 md:px-2 text-center">{it.quantity}</td>

                  {/* محاذاة يمين: المبلغ ثم رمز العملة (بدون علم داخل الصفوف) */}
                  <td className="px-4 md:px-2 whitespace-nowrap text-right">
                    <span className="text-sm font-medium">{Number(it.priceAED).toFixed(2)} AED</span>
                  </td>
                  <td className="px-4 md:px-2 whitespace-nowrap text-right">
                    <span className="text-sm font-medium">{Number(it.priceMRU).toFixed(2)} MRU</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* تلميح للجوال */}
        <p className="mt-2 text-xs text-gray-500 md:hidden">اسحب لليمين/اليسار لعرض المزيد →</p>
      </section>
    </div>
  );
}
