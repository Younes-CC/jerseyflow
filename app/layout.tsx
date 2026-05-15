import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JerseyFlow",
  description: "Professionelles Trikot-Bestell-Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="bg-zinc-950 text-white min-h-screen">
        <Navbar />
        {/* Haupt-Content: links Platz für Sidebar (Desktop), unten für Mobile-Nav */}
        <main className="md:ml-60 pb-20 md:pb-0 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
