import "@/styles/globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <h1 className="text-lg md:text-xl font-bold">Al Qafila</h1>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t">
          <div className="mx-auto max-w-4xl px-4 py-4 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>&copy; {new Date().getFullYear()} Khaled Ihitt.</p>
            <nav className="flex gap-4">
              <a className="hover:text-gray-900" href="#">Privacy</a>
              <a className="hover:text-gray-900" href="#">Terms</a>
              <a className="hover:text-gray-900" href="#">Support</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
