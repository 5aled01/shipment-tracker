import "@/styles/globals.css";
import { ReactNode } from "react";


export default function RootLayout({ children }: { children: ReactNode }) {
return (
<html lang="en">
<body className="min-h-screen bg-gray-50 text-gray-900">
<div className="mx-auto max-w-4xl p-6">
<header className="mb-6">
<h1 className="text-2xl font-bold">Shipment Tracker</h1>
<p className="text-sm text-gray-600">Track orders by tracking number.</p>
</header>
{children}
</div>
</body>
</html>
);
}