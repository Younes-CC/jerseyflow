"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Order } from "@/types/order";
import { getOrders, seedSampleData } from "@/lib/storage";
import { sampleOrders } from "@/lib/sampleData";
import { calcFinancials, formatCurrency, formatDate, getDeliveryStatus, getPaymentStatus } from "@/lib/utils";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    seedSampleData(sampleOrders);
    setOrders(getOrders());
  }, []);

  const financials = calcFinancials(orders);
  const openPaymentOrders = orders.filter((o) => !o.isPaid);
  const notArrivedOrders = orders.filter((o) => !o.hasArrived && o.isOrdered);
  const arrivedNotPickedUp = orders.filter((o) => o.hasArrived && !o.isPickedUp);
  const paidCount = orders.filter((o) => o.isPaid).length;
  const arrivedCount = orders.filter((o) => o.hasArrived).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Übersicht aller Bestellungen</p>
        </div>
        <Link
          href="/orders/new"
          className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          <span>＋</span> Neue Bestellung
        </Link>
      </div>

      {/* Haupt-Statistiken */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Bestellungen gesamt"
          value={String(orders.length)}
          subtitle={`${paidCount} bezahlt · ${orders.length - paidCount} offen`}
          icon="📋"
          accent="default"
        />
        <StatCard
          title="Angekommen"
          value={String(arrivedCount)}
          subtitle={`${arrivedNotPickedUp.length} noch nicht abgeholt`}
          icon="📦"
          accent="blue"
        />
        <StatCard
          title="Offene Zahlungen"
          value={String(openPaymentOrders.length)}
          subtitle={formatCurrency(financials.openPayments) + " ausstehend"}
          icon="⚠️"
          accent={openPaymentOrders.length > 0 ? "red" : "green"}
        />
        <StatCard
          title="Ausstehende Lieferungen"
          value={String(notArrivedOrders.length)}
          subtitle="Bestellt, noch nicht da"
          icon="🚚"
          accent={notArrivedOrders.length > 0 ? "orange" : "green"}
        />
      </div>

      {/* Finanz-Statistiken */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Finanzen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            title="Gesamtumsatz"
            value={formatCurrency(financials.totalRevenue)}
            subtitle="Summe aller Verkaufspreise"
            icon="💵"
            accent="blue"
          />
          <StatCard
            title="Gesamtkosten"
            value={formatCurrency(financials.totalCosts)}
            subtitle="Summe aller Einkaufspreise"
            icon="🧾"
            accent="orange"
          />
          <StatCard
            title="Gesamtgewinn"
            value={formatCurrency(financials.totalProfit)}
            subtitle={`Ø ${formatCurrency(financials.avgProfit)} pro Trikot`}
            icon="💰"
            accent="green"
          />
        </div>
      </div>

      {/* Warnungen */}
      {(openPaymentOrders.length > 0 || notArrivedOrders.length > 0) && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Aktionsbedarf</h2>

          {openPaymentOrders.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-400 text-lg">💳</span>
                <h3 className="font-semibold text-red-400 text-sm">
                  {openPaymentOrders.length} offene Zahlung{openPaymentOrders.length !== 1 ? "en" : ""}
                  {" "}— {formatCurrency(financials.openPayments)} ausstehend
                </h3>
              </div>
              <div className="space-y-2">
                {openPaymentOrders.slice(0, 3).map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between bg-red-500/10 hover:bg-red-500/20 rounded-xl px-3 py-2 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-white">{order.customerName}</span>
                      <span className="text-xs text-zinc-400 ml-2">{order.club} · {order.jerseyType}</span>
                    </div>
                    <span className="text-sm font-semibold text-red-400">{formatCurrency(order.sellingPrice)}</span>
                  </Link>
                ))}
                {openPaymentOrders.length > 3 && (
                  <Link href="/orders?filter=payment-open" className="text-xs text-zinc-500 hover:text-zinc-300 block text-center pt-1">
                    + {openPaymentOrders.length - 3} weitere →
                  </Link>
                )}
              </div>
            </div>
          )}

          {notArrivedOrders.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-orange-400 text-lg">🚚</span>
                <h3 className="font-semibold text-orange-400 text-sm">
                  {notArrivedOrders.length} Trikot{notArrivedOrders.length !== 1 ? "s" : ""} noch nicht angekommen
                </h3>
              </div>
              <div className="space-y-2">
                {notArrivedOrders.slice(0, 3).map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between bg-orange-500/10 hover:bg-orange-500/20 rounded-xl px-3 py-2 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-white">{order.customerName}</span>
                      <span className="text-xs text-zinc-400 ml-2">
                        {order.club}{order.playerName ? ` · ${order.playerName}` : ""}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500">seit {formatDate(order.createdAt)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Letzte Bestellungen */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Letzte Bestellungen</h2>
          <Link href="/orders" className="text-xs text-indigo-400 hover:text-indigo-300">Alle anzeigen →</Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-500 text-sm">Noch keine Bestellungen.</p>
            <Link href="/orders/new" className="text-indigo-400 text-sm mt-2 inline-block hover:underline">
              Erste Bestellung anlegen →
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="divide-y divide-zinc-800">
              {orders.slice(0, 5).map((order) => {
                const pay = getPaymentStatus(order);
                const del = getDeliveryStatus(order);
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold shrink-0">
                      {order.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{order.customerName}</p>
                      <p className="text-xs text-zinc-500 truncate">
                        {order.club}{order.playerName ? ` · ${order.playerName} #${order.jerseyNumber}` : ""} · {order.size}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex gap-1.5">
                        <Badge label={pay.label} color={pay.color as "green" | "red"} />
                        <Badge label={del.label} color={del.color as "gray" | "blue" | "orange" | "red"} />
                      </div>
                      <span className="text-xs font-semibold text-emerald-400">
                        +{formatCurrency(order.sellingPrice - order.purchasePrice)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
