// ============================================================
// JerseyFlow - Hilfsfunktionen
// Kleine Helfer für Formatierung, Berechnungen usw.
// ============================================================

import { Order, OrderFilter } from "@/types/order";

// Gewinn berechnen
export function calcProfit(sellingPrice: number, purchasePrice: number): number {
  return sellingPrice - purchasePrice;
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

// Finanzzusammenfassung berechnen
export function calcFinancials(orders: Order[]) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.sellingPrice, 0);
  const totalCosts = orders.reduce((sum, o) => sum + o.purchasePrice, 0);
  const totalProfit = totalRevenue - totalCosts;
  const openPayments = orders
    .filter((o) => !o.isPaid)
    .reduce((sum, o) => sum + o.sellingPrice, 0);
  const avgProfit = orders.length > 0 ? totalProfit / orders.length : 0;
  return { totalRevenue, totalCosts, totalProfit, openPayments, avgProfit };
}

// Bestellungen nach Filter sortieren
export function filterOrders(orders: Order[], filter: OrderFilter): Order[] {
  switch (filter) {
    case "payment-open":
      return orders.filter((o) => !o.isPaid);
    case "paid":
      return orders.filter((o) => o.isPaid);
    case "not-arrived":
      return orders.filter((o) => !o.hasArrived);
    case "arrived":
      return orders.filter((o) => o.hasArrived && !o.isPickedUp);
    case "picked-up":
      return orders.filter((o) => o.isPickedUp);
    default:
      return orders;
  }
}

// Bestellungen durchsuchen (Name, Verein, Spieler)
export function searchOrders(orders: Order[], query: string): Order[] {
  if (!query.trim()) return orders;
  const q = query.toLowerCase();
  return orders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(q) ||
      o.club.toLowerCase().includes(q) ||
      o.playerName.toLowerCase().includes(q)
  );
}

// Status-Label und Farbe ermitteln
export function getPaymentStatus(order: Order): { label: string; color: string } {
  if (order.isPaid) return { label: "Bezahlt", color: "green" };
  return { label: "Offen", color: "red" };
}

export function getDeliveryStatus(order: Order): { label: string; color: string } {
  if (order.isPickedUp) return { label: "Abgeholt", color: "gray" };
  if (order.hasArrived) return { label: "Angekommen", color: "blue" };
  if (order.isOrdered) return { label: "Bestellt", color: "orange" };
  return { label: "Nicht bestellt", color: "red" };
}
