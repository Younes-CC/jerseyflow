// ============================================================
// JerseyFlow - localStorage-Verwaltung
// Diese Datei kümmert sich um das Speichern und Laden
// aller Bestellungen im Browser (kein Server nötig!).
// ============================================================

import { Order, NewOrder } from "@/types/order";

const STORAGE_KEY = "jerseyflow_orders";

// Alle Bestellungen laden
export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Alle Bestellungen speichern (überschreibt alles)
function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// Neue Bestellung hinzufügen
export function addOrder(newOrder: NewOrder): Order {
  const orders = getOrders();
  const order: Order = {
    ...newOrder,
    id: crypto.randomUUID(), // Zufällige eindeutige ID
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.unshift(order); // Am Anfang einfügen (neueste zuerst)
  saveOrders(orders);
  return order;
}

// Bestellung aktualisieren
export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
  saveOrders(orders);
  return orders[index];
}

// Bestellung löschen
export function deleteOrder(id: string): boolean {
  const orders = getOrders();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length === orders.length) return false;
  saveOrders(filtered);
  return true;
}

// Eine einzelne Bestellung per ID laden
export function getOrderById(id: string): Order | null {
  return getOrders().find((o) => o.id === id) ?? null;
}

// Beispieldaten einmalig laden (für Demo-Zwecke)
export function seedSampleData(sampleOrders: Order[]): void {
  const existing = getOrders();
  if (existing.length === 0) {
    saveOrders(sampleOrders);
  }
}
