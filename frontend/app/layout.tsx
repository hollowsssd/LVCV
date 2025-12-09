import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI JobMatch",
  description: "AI-powered CV analysis & job matching platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>

      <body
        className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <div className="relative">
                <div
                  className="
                    pointer-events-none absolute inset-0
                    bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(148,163,184,0.12),_transparent_60%)]
                    dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.10),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.35),_transparent_60%)]
                  "
                />
                <div className="relative max-w-6xl mx-auto px-4 py-8">{children}</div>
              </div>
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
