// ============================================================
// JerseyFlow - localStorage-Verwaltung
// Diese Datei kümmert sich um das Speichern und Laden
// aller Bestellungen im Browser (kein Server nötig!).
// ============================================================

import { Order, NewOrder } from "@/types/order";

const STORAGE_KEY = "jerseyflow_orders";

// Migration: Altes Format (1 Trikot pro Bestellung) → Neues Format (jerseys-Array)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateOrder(raw: any): Order {
  // Neues Format erkennen: hat bereits ein jerseys-Array
  if (Array.isArray(raw.jerseys)) return raw as Order;

  // Altes Format umwandeln: Trikot-Felder in jerseys-Array verpacken
  return {
    id: raw.id,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    customerName: raw.customerName ?? "",
    whatsapp: raw.whatsapp ?? "",
    isPaid: raw.isPaid ?? false,
    paymentDate: raw.paymentDate ?? null,
    notes: raw.notes ?? "",
    jerseys: [
      {
        id: crypto.randomUUID(),
        club: raw.club ?? "",
        playerName: raw.playerName ?? "",
        jerseyNumber: raw.jerseyNumber ?? "",
        size: raw.size ?? "L",
        version: raw.version ?? "Fan Version",
        jerseyType: raw.jerseyType ?? "Heimtrikot",
        purchasePrice: raw.purchasePrice ?? 0,
        sellingPrice: raw.sellingPrice ?? 0,
        isOrdered: raw.isOrdered ?? false,
        hasArrived: raw.hasArrived ?? false,
        isPickedUp: raw.isPickedUp ?? false,
        notes: "",
      },
    ],
  };
}

// Alle Bestellungen laden (mit automatischer Migration alter Daten)
export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.map(migrateOrder);
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
