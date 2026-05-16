"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewOrder, JerseyItem, JerseySize, JerseyVersion, JerseyType, emptyJersey } from "@/types/order";
import { addOrder } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";

const SIZES: JerseySize[] = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Kids XS", "Kids S", "Kids M", "Kids L", "Kids XL"];
const VERSIONS: JerseyVersion[] = ["Fan Version", "Player Version"];
const TYPES: JerseyType[] = ["Heimtrikot", "Auswärtstrikot", "Third Kit", "Spezialtrikot"];

const inputClass = "w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors";

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-4 py-3">
      <span className="text-sm text-zinc-300">{label}</span>
      <button type="button" onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-emerald-500" : "bg-zinc-600"}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

// Formular für ein einzelnes Trikot
function JerseyForm({
  jersey, index, onUpdate, onRemove, canRemove,
}: {
  jersey: JerseyItem;
  index: number;
  onUpdate: (id: string, field: keyof JerseyItem, value: JerseyItem[keyof JerseyItem]) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const profit = jersey.sellingPrice - jersey.purchasePrice;
  const u = (field: keyof JerseyItem, value: JerseyItem[keyof JerseyItem]) => onUpdate(jersey.id, field, value);

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 space-y-4">
      {/* Trikot-Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">
            {index + 1}
          </span>
          Trikot {index + 1}
        </h3>
        {canRemove && (
          <button type="button" onClick={() => onRemove(jersey.id)}
            className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg transition-colors">
            ✕ Entfernen
          </button>
        )}
      </div>

      {/* Trikot-Felder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs text-zinc-500 mb-1 block">Verein / Team *</label>
          <input type="text" className={inputClass} placeholder="z.B. FC Bayern München"
            value={jersey.club} onChange={(e) => u("club", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Spielername</label>
          <input type="text" className={inputClass} placeholder="z.B. Kane"
            value={jersey.playerName} onChange={(e) => u("playerName", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Rückennummer</label>
          <input type="text" className={inputClass} placeholder="z.B. 9"
            value={jersey.jerseyNumber} onChange={(e) => u("jerseyNumber", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Größe</label>
          <select className={inputClass} value={jersey.size} onChange={(e) => u("size", e.target.value as JerseySize)}>
            {SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Version</label>
          <select className={inputClass} value={jersey.version} onChange={(e) => u("version", e.target.value as JerseyVersion)}>
            {VERSIONS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-zinc-500 mb-1 block">Typ</label>
          <select className={inputClass} value={jersey.jerseyType} onChange={(e) => u("jerseyType", e.target.value as JerseyType)}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Einkaufspreis (€) *</label>
          <input type="number" min="0" step="0.01" className={inputClass} placeholder="0.00"
            value={jersey.purchasePrice || ""}
            onChange={(e) => u("purchasePrice", parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Verkaufspreis (€) *</label>
          <input type="number" min="0" step="0.01" className={inputClass} placeholder="0.00"
            value={jersey.sellingPrice || ""}
            onChange={(e) => u("sellingPrice", parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      {/* Gewinn-Vorschau */}
      {(jersey.purchasePrice > 0 || jersey.sellingPrice > 0) && (
        <div className={`flex items-center justify-between rounded-xl px-3 py-2 border text-sm ${profit >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
          <span className="text-zinc-400">Gewinn dieses Trikots</span>
          <span className={`font-bold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
          </span>
        </div>
      )}

      {/* Status-Toggles pro Trikot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Toggle label="Bestellt" checked={jersey.isOrdered} onChange={() => u("isOrdered", !jersey.isOrdered)} />
        <Toggle label="Angekommen" checked={jersey.hasArrived} onChange={() => u("hasArrived", !jersey.hasArrived)} />
        <Toggle label="Abgeholt" checked={jersey.isPickedUp} onChange={() => u("isPickedUp", !jersey.isPickedUp)} />
      </div>

      {/* Notiz pro Trikot */}
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Notiz zu diesem Trikot</label>
        <input type="text" className={inputClass} placeholder="z.B. Beflockung prüfen"
          value={jersey.notes} onChange={(e) => u("notes", e.target.value)} />
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [jerseys, setJerseys] = useState<JerseyItem[]>([emptyJersey()]);
  const [nameError, setNameError] = useState("");

  const totalProfit = jerseys.reduce((s, j) => s + (j.sellingPrice - j.purchasePrice), 0);
  const totalRevenue = jerseys.reduce((s, j) => s + j.sellingPrice, 0);

  function updateJersey(id: string, field: keyof JerseyItem, value: JerseyItem[keyof JerseyItem]) {
    setJerseys((prev) => prev.map((j) => j.id === id ? { ...j, [field]: value } : j));
  }

  function addJersey() {
    setJerseys((prev) => [...prev, emptyJersey()]);
  }

  function removeJersey(id: string) {
    setJerseys((prev) => prev.filter((j) => j.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) { setNameError("Name ist Pflichtfeld"); return; }
    const order: NewOrder = {
      customerName: customerName.trim(),
      whatsapp,
      isPaid,
      paymentDate: isPaid ? new Date().toISOString() : null,
      jerseys,
      notes: orderNotes,
    };
    addOrder(order);
    router.push("/orders");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.back()} className="text-xs text-zinc-500 hover:text-zinc-300 mb-4 inline-flex items-center gap-1">
          ← Zurück
        </button>
        <h1 className="text-2xl font-bold text-white">Neue Bestellung</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Füge einen Kunden und beliebig viele Trikots hinzu</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Kundendaten */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <span>👤</span> Kundendaten
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Name *</label>
              <input type="text" className={`${inputClass} ${nameError ? "border-red-500" : ""}`}
                placeholder="z.B. Marco Bauer" value={customerName}
                onChange={(e) => { setCustomerName(e.target.value); setNameError(""); }} />
              {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">WhatsApp / Kontakt</label>
              <input type="text" className={inputClass} placeholder="+49 176 ..."
                value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
          </div>
          <Toggle label="Bereits bezahlt" checked={isPaid} onChange={() => setIsPaid(!isPaid)} />
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Allgemeine Notiz zur Bestellung</label>
            <input type="text" className={inputClass} placeholder="z.B. Dringend, bis 20. Mai"
              value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} />
          </div>
        </div>

        {/* Trikots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <span>🎽</span> Trikots
              <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {jerseys.length}
              </span>
            </h2>
          </div>

          {jerseys.map((jersey, index) => (
            <JerseyForm
              key={jersey.id}
              jersey={jersey}
              index={index}
              onUpdate={updateJersey}
              onRemove={removeJersey}
              canRemove={jerseys.length > 1}
            />
          ))}

          {/* Trikot hinzufügen */}
          <button type="button" onClick={addJersey}
            className="w-full border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-zinc-500 hover:text-indigo-400 rounded-2xl py-4 text-sm font-medium transition-all flex items-center justify-center gap-2">
            <span className="text-lg">＋</span> Weiteres Trikot hinzufügen
          </button>
        </div>

        {/* Gesamtübersicht */}
        {jerseys.length > 0 && totalRevenue > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Zusammenfassung</h2>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-xs text-zinc-500 mb-0.5">Trikots</p>
                <p className="text-lg font-bold text-white">{jerseys.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500 mb-0.5">Gesamtumsatz</p>
                <p className="text-lg font-bold text-white">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500 mb-0.5">Gesamtgewinn</p>
                <p className={`text-lg font-bold ${totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {totalProfit >= 0 ? "+" : ""}{formatCurrency(totalProfit)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Speichern */}
        <div className="flex gap-3 pb-4">
          <button type="button" onClick={() => router.back()}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-3 rounded-xl font-medium text-sm transition-colors">
            Abbrechen
          </button>
          <button type="submit"
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-colors">
            Bestellung speichern
          </button>
        </div>
      </form>
    </div>
  );
}
