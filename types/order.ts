// ============================================================
// JerseyFlow - Typen-Definitionen
// Hier definieren wir, wie eine Bestellung aussieht.
// TypeScript nutzt das, um Fehler früh zu erkennen.
// ============================================================

export type JerseyVersion = "Fan Version" | "Player Version";

export type JerseyType =
  | "Heimtrikot"
  | "Auswärtstrikot"
  | "Third Kit"
  | "Spezialtrikot";

export type JerseySize =
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "3XL"
  | "Kids XS"
  | "Kids S"
  | "Kids M"
  | "Kids L"
  | "Kids XL";

// Das ist die Haupt-Datenstruktur für jede Bestellung
export interface Order {
  id: string; // Eindeutige ID, automatisch generiert
  createdAt: string; // Wann die Bestellung erstellt wurde (ISO-Datum)
  updatedAt: string; // Wann sie zuletzt bearbeitet wurde

  // Kundendaten
  customerName: string; // Name des Kunden
  whatsapp: string; // WhatsApp oder Kontakt (optional)

  // Trikot-Details
  club: string; // Verein / Team
  playerName: string; // Spielername auf dem Trikot (optional)
  jerseyNumber: string; // Rückennummer (optional)
  size: JerseySize; // Größe
  version: JerseyVersion; // Fan oder Player Version
  jerseyType: JerseyType; // Heim, Auswärts, Third, Spezial

  // Preise
  purchasePrice: number; // Einkaufspreis (was mein Freund bezahlt)
  sellingPrice: number; // Verkaufspreis (was der Kunde zahlt)
  // profit wird automatisch berechnet: sellingPrice - purchasePrice

  // Status-Felder
  isPaid: boolean; // Hat der Kunde bezahlt?
  paymentDate: string | null; // Wann wurde bezahlt?
  isOrdered: boolean; // Wurde das Trikot beim Lieferanten bestellt?
  hasArrived: boolean; // Ist das Trikot angekommen?
  isPickedUp: boolean; // Wurde das Trikot abgeholt?

  // Sonstiges
  notes: string; // Notizen / Besonderheiten
}

// Typ für neue Bestellungen (ohne id, createdAt, updatedAt - die werden automatisch gesetzt)
export type NewOrder = Omit<Order, "id" | "createdAt" | "updatedAt">;

// Filter-Optionen für die Bestellliste
export type OrderFilter =
  | "all"
  | "payment-open"
  | "paid"
  | "not-arrived"
  | "arrived"
  | "picked-up";

// Sortier-Optionen
export type OrderSort =
  | "date-desc"
  | "date-asc"
  | "name-asc"
  | "profit-desc"
  | "status";
