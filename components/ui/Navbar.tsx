"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "⚡" },
  { href: "/orders", label: "Bestellungen", icon: "📋" },
  { href: "/orders/new", label: "Neu", icon: "＋" },
  { href: "/finances", label: "Finanzen", icon: "💰" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop-Sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-zinc-900 border-r border-zinc-800 p-5 fixed left-0 top-0">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎽</span>
            <span className="text-xl font-bold text-white tracking-tight">
              Jersey<span className="text-indigo-400">Flow</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 ml-0.5">Bestell-Management</p>
        </div>

        {/* Nav-Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href) && item.href !== "/";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-5 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">JerseyFlow v1.0</p>
        </div>
      </aside>

      {/* Mobile Bottom-Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 flex">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href) && item.href !== "/";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? "text-indigo-400" : "text-zinc-500"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
