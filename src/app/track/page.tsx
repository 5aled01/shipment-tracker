"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function isTrackingNumber(input: string) {
  return /^TRK-[A-Z0-9-]+$/i.test(input.trim());
}
function isAccessCode(input: string) {
  return /^ACC-[A-Z0-9-]{4,}$/i.test(input.trim());
}

export default function TrackLanding() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const router = useRouter();

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
        router.push(tracking ? `/track/${encodeURIComponent(raw)}` : `/history/${encodeURIComponent(raw)}`);
        return;
      }

      // If we reach here, it's a 4xx/5xx—extract error if any
      let msg = tracking
        ? "Tracking number not found. Please check and try again."
        : "Access code is incorrect or expired. Please check and try again.";

      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
      } catch {
        // ignore JSON parse errors
      }

      setError(msg);
    } catch {
      setError("Something went wrong while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white shadow-md rounded-xl w-full max-w-xl px-4 py-5 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-center mb-2">
          Find Your Shipment or Order History
        </h2>
        <p className="text-xs md:text-sm text-gray-600 text-center mb-4 md:mb-6">
          Enter a tracking number for one shipment, or your access code to view all past orders.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-2 text-sm md:text-base
                       focus:outline-none focus:ring-2 focus:ring-gray-800"
            placeholder="e.g. TRK-ABC123 or ACC-7H92Q3KD"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
            disabled={loading}
            aria-invalid={!!error}
            aria-describedby={error ? "search-error" : undefined}
          />
          <button
            className="px-4 md:px-6 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition
                       disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {error && (
          <div
            id="search-error"
            className="text-red-600 text-sm mt-3 text-center"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <p className="text-[11px] md:text-xs text-gray-500 mt-3 text-center">
          • Tracking number → single shipment • Access code → full order history
        </p>
      </div>
    </div>
  );
}
