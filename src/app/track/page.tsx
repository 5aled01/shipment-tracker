"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function TrackSearch() {
const [q, setQ] = useState("");
const router = useRouter();


return (
<div className="bg-white shadow rounded-2xl p-6">
<h2 className="text-lg font-semibold mb-4">Find your shipment</h2>
<div className="flex gap-2">
<input
className="flex-1 border rounded-xl px-4 py-2"
placeholder="Enter tracking number (e.g., TRK-ABC123)"
value={q}
onChange={(e) => setQ(e.target.value)}
/>
<button
className="px-4 py-2 rounded-xl bg-gray-900 text-white"
onClick={() => q && router.push(`/track/${encodeURIComponent(q)}`)}
>
Track
</button>
</div>
</div>
);
}