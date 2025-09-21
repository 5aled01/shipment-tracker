import "@/styles/globals.css";
import { ReactNode } from "react";
import { FaWhatsapp, FaFacebook, FaTiktok } from "react-icons/fa"; // ✅ Added icons

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <h1 className="text-lg md:text-xl font-bold">El Ghavila</h1>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t relative">
          <div className="mx-auto max-w-4xl px-4 py-4 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>&copy; {new Date().getFullYear()} Khaled Ihitt.</p>
            <nav className="flex gap-4 items-center">
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@alqafila" // 🔗 replace with your TikTok
                target="_blank"
                className="text-black hover:text-gray-800"
                aria-label="TikTok"
              >
                <FaTiktok className="text-xl" />
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/alqafila" // 🔗 replace with your FB
                target="_blank"
                className="text-blue-600 hover:text-blue-700"
                aria-label="Facebook"
              >
                <FaFacebook className="text-xl" />
              </a>

              {/* WhatsApp with popup */}
              <div className="relative group">
                <button
                  className="flex items-center gap-1 text-green-600 hover:text-green-700"
                  aria-label="WhatsApp Contact"
                >
                  <FaWhatsapp className="text-xl" />
                </button>

                {/* Popup on hover */}
                <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block bg-white border rounded-md shadow-lg p-3 w-48 text-sm text-gray-800 z-50">
                  <p className="font-semibold text-gray-900 mb-1">Contact us:</p>
                  <ul className="space-y-1">
                    <li>
                      <a
                        href="https://wa.me/971500000001"
                        target="_blank"
                        className="hover:underline"
                      >
                        +971 50 000 0001
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://wa.me/971500000002"
                        target="_blank"
                        className="hover:underline"
                      >
                        +971 50 000 0002
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <a className="hover:text-gray-900" href="#">Privacy</a>
              <a className="hover:text-gray-900" href="#">Terms</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
