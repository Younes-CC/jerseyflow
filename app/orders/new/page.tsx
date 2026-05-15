"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewOrder, JerseySize, JerseyVersion, JerseyType } from "@/types/order";
import { addOrder } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";

const SIZES: JerseySize[] = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Kids XS", "Kids S", "Kids M", "Kids L", "Kids XL"];
const VERSIONS: JerseyVersion[] = ["Fan Version", "Player Version"];
const TYPES: JerseyType[] = ["Heimtrikot", "Auswärtstrikot", "Third Kit", "Spezialtrikot"];

const empty: NewOrder = {
  customerName: "",
  whatsapp: "",
  club: "",
  playerName: "",
  jerseyNumber: "",
  size: "L",
  version: "Fan Version",
  jerseyType: "Heimtrikot",
  purchasePrice: 0,
  sellingPrice: 0,
  isPaid: false,
  paymentDate: null,
  isOrdered: false,
  hasArrived: false,
  isPickedUp: false,
  notes: "",
};

// Wiederverwendbares Eingabefeld
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors";

export default function NewOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState<NewOrder>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof NewOrder, string>>>({});

  const profit = form.sellingPrice - form.purchasePrice;

  function update<K extends keyof NewOrder>(key: K, value: NewOrder[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof NewOrder, string>> = {};
    if (!form.customerName.trim()) e.customerName = "Name ist Pflichtfeld";
    if (!form.club.trim()) e.club = "Verein ist Pflichtfeld";
    if (form.purchasePrice <= 0) e.purchasePrice = "Einkaufspreis eingeben";
    if (form.sellingPrice <= 0) e.sellingPrice = "Verkaufspreis eingeben";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    addOrder(form);
    router.push("/orders");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => router.back()} className="text-xs text-zinc-500 hover:text-zinc-300 mb-4 inline-flex items-center gap-1">
          ← Zurück
        </button>
        <h1 className="text-2xl font-bold text-white">Neue Bestellung</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Alle Pflichtfelder sind mit * markiert</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Kundendaten */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <span className="text-base">👤</span> Kundendaten
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" required>
              <input
                type="text"
                className={`${inputClass} ${errors.customerName ? "border-red-500" : ""}`}
                placeholder="z.B. Marco Bauer"
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
              />
              {errors.customerName && <p className="text-xs text-red-400 mt-1">{errors.customerName}</p>}
            </Field>
            <Field label="WhatsApp / Kontakt">
              <input
                type="text"
                className={inputClass}
                placeholder="+49 176 ..."
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Trikot-Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <span className="text-base">🎽</span> Trikot-Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Verein / Team" required>
              <input
                type="text"
                className={`${inputClass} ${errors.club ? "border-red-500" : ""}`}
                placeholder="z.B. FC Barcelona"
                value={form.club}
                onChange={(e) => update("club", e.target.value)}
              />
              {errors.club && <p className="text-xs text-red-400 mt-1">{errors.club}</p>}
            </Field>
            <Field label="Spielername (optional)">
              <input
                type="text"
                className={inputClass}
                placeholder="z.B. Pedri"
                value={form.playerName}
                onChange={(e) => update("playerName", e.target.value)}
              />
            </Field>
            <Field label="Rückennummer (optional)">
              <input
                type="text"
                className={inputClass}
                placeholder="z.B. 8"
                value={form.jerseyNumber}
                onChange={(e) => update("jerseyNumber", e.target.value)}
              />
            </Field>
            <Field label="Größe" required>
              <select className={inputClass} value={form.size} onChange={(e) => update("size", e.target.value as JerseySize)}>
                {SIZES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Version" required>
              <select className={inputClass} value={form.version} onChange={(e) => update("version", e.target.value as JerseyVersion)}>
                {VERSIONS.map((v) => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Typ" required>
              <select className={inputClass} value={form.jerseyType} onChange={(e) => update("jerseyType", e.target.value as JerseyType)}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Preise */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <span className="text-base">💰</span> Preise
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Einkaufspreis (€)" required>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`${inputClass} ${errors.purchasePrice ? "border-red-500" : ""}`}
                placeholder="0.00"
                value={form.purchasePrice || ""}
                onChange={(e) => update("purchasePrice", parseFloat(e.target.value) || 0)}
              />
              {errors.purchasePrice && <p className="text-xs text-red-400 mt-1">{errors.purchasePrice}</p>}
            </Field>
            <Field label="Verkaufspreis (€)" required>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`${inputClass} ${errors.sellingPrice ? "border-red-500" : ""}`}
                placeholder="0.00"
                value={form.sellingPrice || ""}
                onChange={(e) => update("sellingPrice", parseFloat(e.target.value) || 0)}
              />
              {errors.sellingPrice && <p className="text-xs text-red-400 mt-1">{errors.sellingPrice}</p>}
            </Field>
          </div>
          {/* Gewinn-Vorschau */}
          {(form.purchasePrice > 0 || form.sellingPrice > 0) && (
            <div className={`flex items-center justify-between rounded-xl px-4 py-3 border ${profit >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
              <span className="text-sm text-zinc-400">Gewinn (automatisch berechnet)</span>
              <span className={`text-lg font-bold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
              </span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <span className="text-base">📊</span> Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bezahlt */}
            <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-4 py-3">
              <span className="text-sm text-zinc-300">Bezahlt</span>
              <button
                type="button"
                onClick={() => {
                  update("isPaid", !form.isPaid);
                  if (!form.isPaid) update("paymentDate", new Date().toISOString());
                  else update("paymentDate", null);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative ${form.isPaid ? "bg-emerald-500" : "bg-zinc-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isPaid ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
              </button>
            </div>
            {/* Bestellt */}
            <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-4 py-3">
              <span className="text-sm text-zinc-300">Beim Lieferanten bestellt</span>
              <button
                type="button"
                onClick={() => update("isOrdered", !form.isOrdered)}
                className={`w-11 h-6 rounded-full transition-colors relative ${form.isOrdered ? "bg-emerald-500" : "bg-zinc-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isOrdered ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
              </button>
            </div>
            {/* Angekommen */}
            <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-4 py-3">
              <span className="text-sm text-zinc-300">Angekommen</span>
              <button
                type="button"
                onClick={() => update("hasArrived", !form.hasArrived)}
                className={`w-11 h-6 rounded-full transition-colors relative ${form.hasArrived ? "bg-emerald-500" : "bg-zinc-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.hasArrived ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
              </button>
            </div>
            {/* Abgeholt */}
            <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-4 py-3">
              <span className="text-sm text-zinc-300">Abgeholt</span>
              <button
                type="button"
                onClick={() => update("isPickedUp", !form.isPickedUp)}
                className={`w-11 h-6 rounded-full transition-colors relative ${form.isPickedUp ? "bg-emerald-500" : "bg-zinc-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isPickedUp ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notizen */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <span className="text-base">📝</span> Notizen
          </h2>
          <textarea
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Besondere Wünsche, Hinweise..."
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>

        {/* Speichern */}
        <div className="flex gap-3 pb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Bestellung speichern
          </button>
        </div>
      </form>
    </div>
  );
}
