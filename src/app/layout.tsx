import "@/styles/globals.css";
import { ReactNode } from "react";
import { FaWhatsapp, FaFacebook, FaTiktok } from "react-icons/fa";
import Link from "next/link"; // ✅ لازم نستورد Link

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col text-gray-900 relative bg-gray-50">
        {/* الخلفية */}
        <div
          className="fixed inset-0 -z-10 bg-[url('/bg-shipping.png')] bg-cover bg-center"
          aria-hidden="true"
        />
        <div className="fixed inset-0 -z-10 bg-black/40" aria-hidden="true" />

        {/* محتوى الموقع */}
        <div className="relative flex flex-col min-h-screen">
          {/* الهيدر */}
          <header className="bg-gradient-to-r from-green-700 to-green-900 text-white shadow-lg">
            <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
              {/* ✅ الرابط إلى الصفحة الرئيسية */}
              <Link href="/" className="text-lg md:text-xl font-bold hover:opacity-90 transition">
                القافلة للشحن
              </Link>
              <span className="text-sm opacity-80">سهلنا لك التتبع</span>
            </div>
          </header>

          {/* المحتوى */}
          <main className="flex-1">
            <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">{children}</div>
          </main>

          {/* الفوتر */}
          <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-inner">
            <div className="mx-auto max-w-4xl px-4 py-4 text-sm flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>&copy; {new Date().getFullYear()} Khaled Ihitt</p>
              <nav className="flex gap-5 items-center">
                <a
                  href="https://www.tiktok.com/@alqafila"
                  target="_blank"
                  className="hover:text-gray-300 transition"
                  aria-label="تيك توك"
                >
                  <FaTiktok className="text-lg" />
                </a>
                <a
                  href="https://facebook.com/alqafila"
                  target="_blank"
                  className="hover:text-gray-300 transition"
                  aria-label="فيسبوك"
                >
                  <FaFacebook className="text-lg" />
                </a>
                <div className="relative group">
                  <button
                    className="flex items-center gap-1 text-green-400 hover:text-green-300 transition"
                    aria-label="تواصل عبر واتساب"
                  >
                    <FaWhatsapp className="text-lg" />
                  </button>
                  <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block bg-white border rounded-md shadow-lg p-3 w-48 text-sm text-gray-800 z-50">
                    <p className="font-semibold text-gray-900 mb-1">تواصل معنا:</p>
                    <ul className="space-y-1">
                      <li>
                        <a
                          href="https://wa.me/971500000001"
                          target="_blank"
                          className="hover:underline"
                        >
                          ‎+971 50 000 0001
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://wa.me/971500000002"
                          target="_blank"
                          className="hover:underline"
                        >
                          ‎+971 50 000 0002
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <a className="hover:text-gray-300 transition" href="#">
                  الخصوصية
                </a>
                <a className="hover:text-gray-300 transition" href="#">
                  الشروط
                </a>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
