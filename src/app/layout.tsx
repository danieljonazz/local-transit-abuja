import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Abuja Transit - Community Routes",
  description: "Community-powered local transit navigation for Abuja",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 w-full h-[100dvh] overflow-hidden`}>
        <header className="sticky top-0 z-50 bg-white border-b px-4 py-3 shadow-sm flex items-center justify-between">
          <h1 className="font-bold text-xl text-green-700">Transit<span className="text-slate-800">Abuja</span></h1>
          <button className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200">
            Sign In
          </button>
        </header>
        <main className="flex flex-col flex-1 h-[calc(100vh-60px)] relative">
          {children}
        </main>
      </body>
    </html>
  );
}
