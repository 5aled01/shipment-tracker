"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TrackLanding() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const router = useRouter();

  const isTrackingNumber = (input: string) =>
    /^TRK-[A-Z0-9-]+$/i.test(input.trim());
  const isAccessCode = (input: string) =>
    /^ACC-[A-Z0-9-]{4,}$/i.test(input.trim());

  const handleSubmit = async () => {
    const raw = q.trim();
    setError("");

    if (!raw) {
      setError("Please enter a tracking number or an access code.");
      return;
    }

    const tracking = isTrackingNumber(raw);
    const access = isAccessCode(raw);

    if (!tracking && !access) {
      setError("Invalid input. Use TRK-… for a shipment or ACC-… for history.");
      return;
    }

    setLoading(true);
    try {
      const checkUrl = tracking
        ? `/api/orders/${encodeURIComponent(raw)}`
        : `/api/history/${encodeURIComponent(raw)}`;

      const res = await fetch(checkUrl, { method: "GET", cache: "no-store" });

      if (res.ok) {
        router.push(
          tracking
            ? `/track/${encodeURIComponent(raw)}`
            : `/history/${encodeURIComponent(raw)}`
        );
        return;
      }

      let msg = tracking
        ? "Tracking number not found. Please check and try again."
        : "Access code is incorrect or expired. Please check and try again.";

      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
      } catch {}

      setError(msg);
    } catch {
      setError("Something went wrong while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white shadow-md rounded-xl w-full max-w-xl px-4 py-6 md:p-8 text-center">
        {/* Persona image */}
        <div className="flex justify-center mb-4">
          <Image
            src="/shipping-persona.png"
            alt="Shipping persona"
            width={80}
            height={80}
            className="rounded-full"
            priority
          />
        </div>

        <h2 className="text-base md:text-lg font-semibold mb-2">
          Find Your Shipment
        </h2>

        <div className="flex w-full sm:w-auto justify-center">
          {/* Input with left-rounded corners only */}
          <input
            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 md:px-4 md:py-2 text-sm md:text-base focus:outline-none focus:ring-2"
            placeholder="e.g. TRK- or ACC-"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !loading && handleSubmit()
            }
            disabled={loading}
            aria-invalid={!!error}
            aria-describedby={error ? "search-error" : undefined}
          />

          {/* Button with right-rounded corners only */}
          <button
            className="
              flex items-center justify-center
              bg-green-700 text-white shadow-sm
              hover:bg-green-800 transition
              disabled:opacity-60 disabled:cursor-not-allowed
              h-10 w-10 sm:h-auto sm:w-auto
              sm:px-4 sm:py-2
              rounded-r-lg
            "
            onClick={handleSubmit}
            disabled={loading}
            aria-label="Search"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              // Search icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
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
          • Tracking number → single shipment <br />
          • Access code → full orders history
        </p>
      </div>
    </div>
  );
}
