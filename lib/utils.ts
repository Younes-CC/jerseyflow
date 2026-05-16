// ============================================================
// JerseyFlow - Hilfsfunktionen (aktualisiert für Multi-Trikot)
// ============================================================

import { Order, OrderFilter, JerseyItem } from "@/types/order";

// Gesamtgewinn einer Bestellung (Summe aller Trikots)
export function calcOrderProfit(order: Order): number {
  return order.jerseys.reduce((sum, j) => sum + (j.sellingPrice - j.purchasePrice), 0);
}

// Gesamtumsatz einer Bestellung
export function calcOrderRevenue(order: Order): number {
  return order.jerseys.reduce((sum, j) => sum + j.sellingPrice, 0);
}

// Gesamtkosten einer Bestellung
export function calcOrderCosts(order: Order): number {
  return order.jerseys.reduce((sum, j) => sum + j.purchasePrice, 0);
}

// Zahl als Euro formatieren: 42 → "42,00 €"
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

// Datum formatieren: ISO-String → "15.05.2026"
export function formatDate(isoString: string | null): string {
  if (!isoString) return "—";
  return new Intl.DateTimeFormat("de-DE").format(new Date(isoString));
}

// Finanzzusammenfassung über alle Bestellungen
export function calcFinancials(orders: Order[]) {
  const totalRevenue = orders.reduce((sum, o) => sum + calcOrderRevenue(o), 0);
  const totalCosts = orders.reduce((sum, o) => sum + calcOrderCosts(o), 0);
  const totalProfit = totalRevenue - totalCosts;
  const openPayments = orders
    .filter((o) => !o.isPaid)
    .reduce((sum, o) => sum + calcOrderRevenue(o), 0);
  const totalJerseys = orders.reduce((sum, o) => sum + o.jerseys.length, 0);
  const avgProfit = totalJerseys > 0 ? totalProfit / totalJerseys : 0;
  return { totalRevenue, totalCosts, totalProfit, openPayments, avgProfit, totalJerseys };
}

// Bestellungen nach Filter
export function filterOrders(orders: Order[], filter: OrderFilter): Order[] {
  switch (filter) {
    case "payment-open":
      return orders.filter((o) => !o.isPaid);
    case "paid":
      return orders.filter((o) => o.isPaid);
    case "not-arrived":
      // Hat mindestens ein Trikot das noch nicht angekommen ist
      return orders.filter((o) => o.jerseys.some((j) => !j.hasArrived));
    case "arrived":
      // Alle Trikots angekommen, aber noch nicht alle abgeholt
      return orders.filter(
        (o) => o.jerseys.every((j) => j.hasArrived) && o.jerseys.some((j) => !j.isPickedUp)
      );
    case "picked-up":
      return orders.filter((o) => o.jerseys.every((j) => j.isPickedUp));
    default:
      return orders;
  }
}

// Bestellungen durchsuchen
export function searchOrders(orders: Order[], query: string): Order[] {
  if (!query.trim()) return orders;
  const q = query.toLowerCase();
  return orders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(q) ||
      o.jerseys.some(
        (j) =>
          j.club.toLowerCase().includes(q) ||
          j.playerName.toLowerCase().includes(q)
      )
  );
}

// Zahlungs-Status
export function getPaymentStatus(order: Order): { label: string; color: string } {
  if (order.isPaid) return { label: "Bezahlt", color: "green" };
  return { label: "Zahlung offen", color: "red" };
}

// Liefer-Status basierend auf allen Trikots
export function getDeliveryStatus(order: Order): { label: string; color: string } {
  const jerseys = order.jerseys;
  if (jerseys.length === 0) return { label: "Kein Trikot", color: "gray" };
  if (jerseys.every((j) => j.isPickedUp)) return { label: "Abgeholt", color: "gray" };
  if (jerseys.every((j) => j.hasArrived)) return { label: "Angekommen", color: "blue" };
  if (jerseys.some((j) => j.hasArrived)) {
    const arrived = jerseys.filter((j) => j.hasArrived).length;
    return { label: `${arrived}/${jerseys.length} angekommen`, color: "blue" };
  }
  if (jerseys.some((j) => j.isOrdered)) return { label: "Bestellt", color: "orange" };
  return { label: "Nicht bestellt", color: "red" };
}

// Trikot-Status (für einzelne Trikots in der Detailansicht)
export function getJerseyDeliveryStatus(jersey: JerseyItem): { label: string; color: string } {
  if (jersey.isPickedUp) return { label: "Abgeholt", color: "gray" };
  if (jersey.hasArrived) return { label: "Angekommen", color: "blue" };
  if (jersey.isOrdered) return { label: "Bestellt", color: "orange" };
  return { label: "Nicht bestellt", color: "red" };
}
