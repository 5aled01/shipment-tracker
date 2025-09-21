"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TrackLanding() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const router = useRouter();

  const isTrackingNumber = (input: string) => /^TRK-[A-Z0-9-]+$/i.test(input.trim());
  const isAccessCode = (input: string) => /^ACC-[A-Z0-9-]{4,}$/i.test(input.trim());

  const handleSubmit = async () => {
    const raw = q.trim();
    setError("");

    if (!raw) {
      setError("يرجى إدخال رقم تتبع أو رمز وصول.");
      return;
    }

    const tracking = isTrackingNumber(raw);
    const access = isAccessCode(raw);

    if (!tracking && !access) {
      setError("المدخل غير صحيح. استخدم TRK- للشحنة أو ACC- لسجل الطلبات.");
      return;
    }

    setLoading(true);
    try {
      const checkUrl = tracking
        ? `/api/orders/${encodeURIComponent(raw)}`
        : `/api/history/${encodeURIComponent(raw)}`;

      const res = await fetch(checkUrl, { method: "GET", cache: "no-store" });

      if (res.ok) {
        router.push(tracking ? `/track/${encodeURIComponent(raw)}` : `/history/${encodeURIComponent(raw)}`);
        return;
      }

      let msg = tracking
        ? "لم يتم العثور على رقم التتبع. يرجى التحقق والمحاولة مرة أخرى."
        : "رمز الوصول غير صحيح أو منتهي. يرجى التحقق والمحاولة مرة أخرى.";

      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
      } catch {
        // تجاهل خطأ قراءة JSON
      }

      setError(msg);
    } catch {
      setError("حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) handleSubmit();
  };

  return (
    <div className="flex items-center justify-center" dir="rtl">
      <div className="bg-white shadow-md rounded-xl w-full max-w-xl px-4 py-6 md:p-8 text-center">
        {/* صورة تعريفية */}
        <div className="flex justify-center mb-4">
          <Image
            src="/shipping-persona.png"
            alt="شخصية الشحن"
            width={80}
            height={80}
            className="rounded-full"
            priority
          />
        </div>

        <h2 className="text-base md:text-lg font-semibold mb-2">
          تتبّع شحنتك أو اعرض سجل الطلبات
        </h2>

        {/* شريط البحث: غلاف موحد يمنع كسر الحواف ويضمن تساوي الارتفاع */}
        <form onSubmit={onFormSubmit} className="mx-auto w-full sm:w-auto">
          <div
            className="
              inline-flex w-full sm:w-[28rem]
              items-stretch
              rounded-lg border border-gray-300 bg-white
              overflow-hidden shadow-sm
              focus-within:ring-2 focus-within:ring-green-700
            "
            role="search"
          >
            <input
              className="
                w-full
                px-3 md:px-4
                py-2
                text-sm md:text-base
                text-right
                outline-none border-0 bg-transparent
                placeholder:text-gray-400
              "
              placeholder="مثال: -TRK أو -ACC"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              disabled={loading}
              aria-invalid={!!error}
              aria-describedby={error ? "search-error" : undefined}
            />

            <button
              type="submit"
              className="
                shrink-0
                px-3 md:px-4
                min-h-[40px]
                bg-green-700 text-white
                hover:bg-green-800 transition
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center
              "
              aria-label="بحث"
              title="بحث"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                // أيقونة البحث
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div
            id="search-error"
            className="text-red-600 text-sm mt-3"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <p className="text-[11px] md:text-xs text-gray-500 mt-3">
          • رقم التتبع ← شحنة واحدة <br />
          • رمز الوصول ← كل الطلبات السابقة
        </p>
      </div>
    </div>
  );
}
