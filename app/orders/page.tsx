"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Order, OrderFilter, OrderSort } from "@/types/order";
import { getOrders } from "@/lib/storage";
import {
  calcOrderProfit,
  filterOrders,
  formatCurrency,
  formatDate,
  getDeliveryStatus,
  getPaymentStatus,
  searchOrders,
} from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

const filterLabels: Record<OrderFilter, string> = {
  all: "Alle",
  "payment-open": "Zahlung offen",
  paid: "Bezahlt",
  "not-arrived": "Nicht angekommen",
  arrived: "Angekommen",
  "picked-up": "Abgeholt",
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get("filter") as OrderFilter) || "all";

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OrderFilter>(initialFilter);
  const [sort, setSort] = useState<OrderSort>("date-desc");

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  // Filter → search → sort
  let displayed = filterOrders(orders, filter);
  displayed = searchOrders(displayed, search);
  displayed = [...displayed].sort((a, b) => {
    if (sort === "date-desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "date-asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "name-asc") return a.customerName.localeCompare(b.customerName);
    if (sort === "profit-desc") return calcOrderProfit(b) - calcOrderProfit(a);
    return 0;
  });

  const totalJerseys = orders.reduce((sum, o) => sum + o.jerseys.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bestellungen</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {orders.length} Bestellungen · {totalJerseys} Trikots
          </p>
        </div>
        <Link
          href="/orders/new"
          className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          <span>＋</span> Neue Bestellung
        </Link>
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Suche nach Name, Verein oder Spieler..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as OrderSort)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="date-desc">Neueste zuerst</option>
          <option value="date-asc">Älteste zuerst</option>
          <option value="name-asc">Name A–Z</option>
          <option value="profit-desc">Höchster Gewinn</option>
        </select>
      </div>

      {/* Filter tabs with counts */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(Object.keys(filterLabels) as OrderFilter[]).map((f) => {
          const count = f === "all" ? orders.length : filterOrders(orders, f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
              }`}
            >
              {filterLabels[f]}
              <span className="ml-1.5 text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Result count */}
      {(search || filter !== "all") && (
        <p className="text-xs text-zinc-500">
          {displayed.length} Ergebnis{displayed.length !== 1 ? "se" : ""}
          {search && ` für "${search}"`}
        </p>
      )}

      {/* Order list */}
      {displayed.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Keine Bestellungen gefunden"
          description="Ändere die Suche oder den Filter."
        />
      ) : (
        <div className="space-y-2">
          {displayed.map((order) => {
            const pay = getPaymentStatus(order);
            const del = getDeliveryStatus(order);
            const profit = calcOrderProfit(order);
            const clubs = [...new Set(order.jerseys.map((j) => j.club).filter(Boolean))];
            const jerseyCount = order.jerseys.length;

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl px-4 py-4 transition-all"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {order.customerName.charAt(0).toUpperCase()}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{order.customerName}</span>
                    {/* Jersey count badge */}
                    <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-full px-2 py-0.5 font-medium">
                      {jerseyCount} Trikot{jerseyCount !== 1 ? "s" : ""}
                    </span>
                    {order.notes && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5">
                        Notiz
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate">
                    {clubs.length > 0 ? clubs.join(", ") : "Kein Verein"}
                  </p>
                  <p className="text-xs text-zinc-600">{formatDate(order.createdAt)}</p>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <Badge label={pay.label} color={pay.color as "green" | "red"} />
                    <Badge label={del.label} color={del.color as "gray" | "blue" | "orange" | "red"} />
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`font-semibold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {profit >= 0 ? "+" : ""}
                      {formatCurrency(profit)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-sm p-8">Laden...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
