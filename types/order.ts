// ============================================================
// JerseyFlow - Typen-Definitionen
// Neue Struktur: 1 Bestellung = 1 Kunde + mehrere Trikots
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

// Ein einzelnes Trikot innerhalb einer Bestellung
export interface JerseyItem {
  id: string;
  club: string;
  playerName: string;
  jerseyNumber: string;
  size: JerseySize;
  version: JerseyVersion;
  jerseyType: JerseyType;
  purchasePrice: number;
  sellingPrice: number;
  isOrdered: boolean;
  hasArrived: boolean;
  isPickedUp: boolean;
  notes: string;
}

// Eine Bestellung = ein Kunde mit beliebig vielen Trikots
export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  whatsapp: string;
  isPaid: boolean;
  paymentDate: string | null;
  jerseys: JerseyItem[]; // Alle Trikots dieses Kunden
  notes: string;
}

// Leeres Trikot als Vorlage
export function emptyJersey(): JerseyItem {
  return {
    id: crypto.randomUUID(),
    club: "",
    playerName: "",
    jerseyNumber: "",
    size: "L",
    version: "Fan Version",
    jerseyType: "Heimtrikot",
    purchasePrice: 0,
    sellingPrice: 0,
    isOrdered: false,
    hasArrived: false,
    isPickedUp: false,
    notes: "",
  };
}

export type NewOrder = Omit<Order, "id" | "createdAt" | "updatedAt">;

export type OrderFilter =
  | "all"
  | "payment-open"
  | "paid"
  | "not-arrived"
  | "arrived"
  | "picked-up";

export type OrderSort =
  | "date-desc"
  | "date-asc"
  | "name-asc"
  | "profit-desc";
