"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Order } from "@/types/order";
import { getOrders } from "@/lib/storage";
import { formatCurrency, formatDate, getPaymentStatus } from "@/lib/utils";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

export default function FinancesPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.jerseys.reduce((js, j) => js + j.sellingPrice, 0), 0);
  const totalCosts = orders.reduce((s, o) => s + o.jerseys.reduce((js, j) => js + j.purchasePrice, 0), 0);
  const totalProfit = totalRevenue - totalCosts;
  const openPayments = orders.filter((o) => !o.isPaid).reduce((s, o) => s + o.jerseys.reduce((js, j) => js + j.sellingPrice, 0), 0);
  const totalJerseys = orders.reduce((s, o) => s + o.jerseys.length, 0);
  const avgProfit = totalJerseys > 0 ? totalProfit / totalJerseys : 0;
  const paidRevenue = orders.filter((o) => o.isPaid).reduce((s, o) => s + o.jerseys.reduce((js, j) => js + j.sellingPrice, 0), 0);

  // Bestellungen nach Gewinn sortiert
  const byProfit = [...orders].sort((a, b) => {
    const profitA = a.jerseys.reduce((s, j) => s + j.sellingPrice - j.purchasePrice, 0);
    const profitB = b.jerseys.reduce((s, j) => s + j.sellingPrice - j.purchasePrice, 0);
    return profitB - profitA;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Finanzen</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Vollständige Übersicht aller Einnahmen und Ausgaben</p>
      </div>

      {/* Haupt-Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Gesamtumsatz"
          value={formatCurrency(totalRevenue)}
          subtitle={`${formatCurrency(paidRevenue)} bereits eingegangen`}
          icon="💵"
          accent="blue"
        />
        <StatCard
          title="Gesamtkosten"
          value={formatCurrency(totalCosts)}
          subtitle={`${totalJerseys} Trikots eingekauft`}
          icon="🧾"
          accent="orange"
        />
        <StatCard
          title="Gesamtgewinn"
          value={formatCurrency(totalProfit)}
          subtitle={`Marge: ${totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}%`}
          icon="💰"
          accent="green"
        />
      </div>

      {/* Sekundäre Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Ø Gewinn / Trikot"
          value={formatCurrency(avgProfit)}
          subtitle="Durchschnitt über alle Bestellungen"
          icon="📊"
          accent="purple"
        />
        <StatCard
          title="Offene Forderungen"
          value={formatCurrency(openPayments)}
          subtitle={`${orders.filter((o) => !o.isPaid).length} Kunden haben noch nicht bezahlt`}
          icon="⚠️"
          accent={openPayments > 0 ? "red" : "green"}
        />
      </div>

      {/* Einnahmen-Visualisierung */}
      {orders.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Einnahmen-Übersicht</h2>
          <div className="space-y-3">
            {/* Balken: Eingegangen vs. Ausstehend */}
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>Eingegangen</span>
                <span>{formatCurrency(paidRevenue)} von {formatCurrency(totalRevenue)}</span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: totalRevenue > 0 ? `${(paidRevenue / totalRevenue) * 100}%` : "0%" }}
                />
              </div>
            </div>
            {/* Balken: Gewinn vs. Kosten */}
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>Gewinnmarge</span>
                <span>{totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}%</span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: totalRevenue > 0 ? `${(totalProfit / totalRevenue) * 100}%` : "0%" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bestellungen nach Gewinn */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Alle Bestellungen nach Gewinn
        </h2>

        {orders.length === 0 ? (
          <EmptyState icon="💸" title="Noch keine Bestellungen" description="Leg eine Bestellung an, um hier Finanzdaten zu sehen." />
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Tabellen-Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wide">
              <span>Kunde / Trikot</span>
              <span className="text-right">EK</span>
              <span className="text-right">VK</span>
              <span className="text-right">Gewinn</span>
              <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {byProfit.map((order) => {
                const rev = order.jerseys.reduce((s, j) => s + j.sellingPrice, 0);
                const cost = order.jerseys.reduce((s, j) => s + j.purchasePrice, 0);
                const profit = rev - cost;
                const pay = getPaymentStatus(order);
                const clubs = [...new Set(order.jerseys.map((j) => j.club))].join(", ");
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{order.customerName}</p>
                        <span className="text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-full shrink-0">{order.jerseys.length}x</span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{clubs}</p>
                    </div>
                    <span className="text-xs text-zinc-400 text-right whitespace-nowrap">{formatCurrency(cost)}</span>
                    <span className="text-xs text-zinc-300 text-right whitespace-nowrap">{formatCurrency(rev)}</span>
                    <span className={`text-sm font-semibold text-right whitespace-nowrap ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                    </span>
                    <div className="flex justify-end">
                      <Badge label={pay.label} color={pay.color as "green" | "red"} />
                    </div>
                  </Link>
                );
              })}
            </div>
            {/* Gesamt-Zeile */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-t border-zinc-700 bg-zinc-800/30">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Gesamt</span>
              <span className="text-xs font-semibold text-zinc-300 text-right">{formatCurrency(totalCosts)}</span>
              <span className="text-xs font-semibold text-zinc-300 text-right">{formatCurrency(totalRevenue)}</span>
              <span className="text-sm font-bold text-emerald-400 text-right">{formatCurrency(totalProfit)}</span>
              <span />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
