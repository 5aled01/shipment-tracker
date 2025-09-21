import { prisma } from "@/lib/db";
import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";

/** تنسيق التاريخ: يوم/شهر(عربي)/سنة بأرقام لاتينية */
function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);     // 01..31 (لاتيني)
  const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);   // 2025 (لاتيني)
  const monthAr = new Intl.DateTimeFormat("ar", { month: "long" }).format(date);  // اسم الشهر بالعربية
  return `${day} ${monthAr} ${year}`;
}

/** خريطة ألوان الحالة */
function statusClass(s: string) {
  const k = s.toLowerCase();
  if (k.includes("delivered")) return "bg-green-100 text-green-800 border-green-200";
  if (k.includes("transit")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (k.includes("processing") || k.includes("created")) return "bg-amber-100 text-amber-800 border-amber-200";
  if (k.includes("delayed")) return "bg-orange-100 text-orange-800 border-orange-200";
  if (k.includes("cancel")) return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
}

/** ترجمة عرض الحالة فقط (لا نغيّر قيمة قاعدة البيانات) */
function statusLabel(s: string) {
  const k = s?.toLowerCase() ?? "";
  if (k.includes("delivered")) return "تم التسليم";
  if (k.includes("transit")) return "قيد النقل";
  if (k.includes("processing") || k.includes("created")) return "قيد المعالجة";
  if (k.includes("delayed")) return "تأخير";
  if (k.includes("cancel")) return "أُلغي";
  return s || "—";
}

export default async function HistoryPage({ params }: { params: { accessCode: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { accessCode: params.accessCode },
  });

  if (!customer) {
    return (
      <div className="bg-white shadow rounded-2xl p-6" dir="rtl">
        <p className="text-red-600 font-medium">لا توجد سجلات لهذا الرمز.</p>
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
    <div className="space-y-4 md:space-y-6" dir="rtl">
      <section className="bg-white shadow rounded-2xl p-5 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold">طلباتك</h2>
        <p className="text-xs text-gray-500 mt-1">عدد الطلبات: {orders.length}</p>
      </section>

      {orders.length === 0 ? (
        <div className="bg-white shadow rounded-2xl p-5 md:p-6">
          <p className="text-gray-700">لا توجد طلبات حتى الآن.</p>
          <Link href="/track" className="inline-block mt-3 text-sm text-gray-700 underline">
            الذهاب إلى صفحة التتبع
          </Link>
        </div>
      ) : (
        orders.map((order) => {
          const totalItems = order.items.reduce((sum, it) => sum + it.quantity, 0);
          const totalAED = order.items.reduce((sum, it) => sum + Number(it.priceAED) * it.quantity, 0);
          const totalMRU = order.items.reduce((sum, it) => sum + Number(it.priceMRU) * it.quantity, 0);
          const statusRaw = order.shipment?.status ?? "—";
          const tracking = order.shipment?.trackingNumber;
          const serviceLevel = order.shipment?.serviceLevel || null;
          const isExpress = (serviceLevel || "").toLowerCase() === "express";

          return (
            <section key={order.id} className="bg-white shadow rounded-2xl p-4 md:p-5">
              {/* الرأس */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base md:text-lg font-semibold">الطلب {order.orderNumber}</h3>

                    {/* شارة الحالة (مترجمة + ألوان) */}
                    <span className={clsx("text-xs rounded-full px-2.5 py-0.5 border", statusClass(statusRaw))}>
                      {statusLabel(statusRaw)}
                    </span>

                    {/* شارة مستوى الخدمة من الشحنة مع الرموز */}
                    {serviceLevel && (
                      isExpress ? (
                        <span className="text-xs flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          ⚡ مستعجل
                        </span>
                      ) : (
                        <span className="text-xs flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          🚚 عادي
                        </span>
                      )
                    )}
                  </div>

                  <p className="text-xs text-gray-500">تاريخ الإنشاء: {fmtDate(order.createdAt)}</p>
                  <p className="text-sm text-gray-700">
                    {order.customerName} • {order.customerPhone}
                  </p>
                  <p className="text-sm text-gray-600">
                    المسار: <span className="font-medium">من {order.fromCountry}</span>{" "}
                    <span className="font-medium">إلى {order.toCountry}</span>
                  </p>
                </div>

                {/* إحصائيات سريعة + التتبع */}
                <div className="text-sm text-gray-700 sm:text-left">
                  <div>العناصر: <span className="font-medium">{totalItems}</span></div>

                  {/* المجاميع (محاذاة يمين: مبلغ + رمز + علم) */}
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-semibold">{totalAED.toFixed(2)} AED</span>
                      <Image src="/flags/uae.png" alt="علم الإمارات" width={18} height={12} className="inline-block rounded-sm" />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-semibold">{totalMRU.toFixed(2)} MRU</span>
                      <Image src="/flags/mru.png" alt="علم موريتانيا" width={18} height={12} className="inline-block rounded-sm" />
                    </div>
                  </div>

                  {tracking && (
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">رقم التتبع:</span>{" "}
                      <span className="font-mono text-xs">{tracking}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* شريط الإجراءات */}
              <div className="mt-3 flex gap-2 items-start">
                {tracking && (
                  <Link
                    href={`/track/${encodeURIComponent(tracking)}`}
                    className="
                      shrink-0 inline-flex items-center justify-center
                      h-10 px-3 rounded-md text-sm font-medium
                      bg-gray-900 text-white hover:bg-gray-800
                      whitespace-nowrap
                    "
                  >
                    عرض الشحنة
                  </Link>
                )}

                {/* قائمة العناصر */}
                <details className="group flex-1 min-w-0">
                  <summary
                    className="
                      list-none h-10 px-3 rounded-md border border-gray-200
                      flex items-center justify-between
                      text-sm cursor-pointer select-none
                      whitespace-nowrap
                    "
                  >
                    <span className="font-medium">العناصر ({totalItems})</span>
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

                  {/* العناصر */}
                  <div className="mt-2 rounded-md border border-gray-200">
                    <ul className="divide-y divide-gray-100">
                      {order.items.map((it) => (
                        <li key={it.id} className="py-2 px-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{it.name}</p>
                            <p className="text-xs text-gray-500">الكمية: {it.quantity}</p>
                          </div>

                          {/* محاذاة يمين: مبلغ + رمز + علم */}
                          <div className="flex flex-col gap-1 items-end">
                            <span className="flex items-center gap-2 text-sm">
                              {Number(it.priceAED).toFixed(2)} AED
                              <Image src="/flags/uae.png" alt="علم الإمارات" width={18} height={12} className="inline-block rounded-sm" />
                            </span>
                            <span className="flex items-center gap-2 text-sm">
                              {Number(it.priceMRU).toFixed(2)} MRU
                              <Image src="/flags/mru.png" alt="علم موريتانيا" width={18} height={12} className="inline-block rounded-sm" />
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
