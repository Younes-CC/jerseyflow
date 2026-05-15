"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Order, JerseySize, JerseyVersion, JerseyType } from "@/types/order";
import { getOrderById, updateOrder, deleteOrder } from "@/lib/storage";
import { formatCurrency, formatDate, getDeliveryStatus, getPaymentStatus } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

const SIZES: JerseySize[] = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Kids XS", "Kids S", "Kids M", "Kids L", "Kids XL"];
const VERSIONS: JerseyVersion[] = ["Fan Version", "Player Version"];
const TYPES: JerseyType[] = ["Heimtrikot", "Auswärtstrikot", "Third Kit", "Spezialtrikot"];

const inputClass = "w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-zinc-800 last:border-0">
      <span className="text-xs text-zinc-500 uppercase tracking-wide shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-4 py-3">
      <span className="text-sm text-zinc-300">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-emerald-500" : "bg-zinc-600"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Order | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const o = getOrderById(id);
    setOrder(o);
    setEditForm(o ? { ...o } : null);
  }, [id]);

  function handleUpdate<K extends keyof Order>(key: K, value: Order[K]) {
    setEditForm((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  function saveEdits() {
    if (!editForm) return;
    const updated = updateOrder(id, editForm);
    if (updated) {
      setOrder(updated);
      setEditForm({ ...updated });
    }
    setIsEditing(false);
  }

  function handleDelete() {
    deleteOrder(id);
    router.push("/orders");
  }

  // Schnell-Status-Toggle (ohne Edit-Modus)
  function quickToggle(key: "isPaid" | "isOrdered" | "hasArrived" | "isPickedUp") {
    if (!order) return;
    const updates: Partial<Order> = { [key]: !order[key] };
    if (key === "isPaid" && !order.isPaid) updates.paymentDate = new Date().toISOString();
    if (key === "isPaid" && order.isPaid) updates.paymentDate = null;
    const updated = updateOrder(id, updates);
    if (updated) {
      setOrder(updated);
      setEditForm({ ...updated });
    }
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Bestellung nicht gefunden.</p>
        <button onClick={() => router.push("/orders")} className="text-indigo-400 text-sm mt-2 hover:underline">
          Zurück zur Liste
        </button>
      </div>
    );
  }

  const profit = order.sellingPrice - order.purchasePrice;
  const pay = getPaymentStatus(order);
  const del = getDeliveryStatus(order);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-xs text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1">
          ← Zurück
        </button>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              >
                ✏️ Bearbeiten
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              >
                🗑️ Löschen
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setIsEditing(false); setEditForm({ ...order }); }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={saveEdits}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                Speichern
              </button>
            </>
          )}
        </div>
      </div>

      {/* Titel-Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold shrink-0">
            {order.customerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-lg font-bold rounded-xl px-3 py-1.5 mb-1 focus:outline-none focus:border-indigo-500"
                value={editForm?.customerName ?? ""}
                onChange={(e) => handleUpdate("customerName", e.target.value)}
              />
            ) : (
              <h1 className="text-xl font-bold text-white">{order.customerName}</h1>
            )}
            <p className="text-sm text-zinc-400">
              {order.club}{order.playerName ? ` · ${order.playerName} #${order.jerseyNumber}` : ""}
            </p>
            <div className="flex gap-2 mt-2">
              <Badge label={pay.label} color={pay.color as "green" | "red"} />
              <Badge label={del.label} color={del.color as "gray" | "blue" | "orange" | "red"} />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-zinc-500">Gewinn</p>
            <p className={`text-xl font-bold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
            </p>
          </div>
        </div>
      </div>

      {/* Trikot-Details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Trikot</h2>
        {!isEditing ? (
          <>
            <DetailRow label="Verein" value={order.club} />
            <DetailRow label="Spieler" value={order.playerName || "—"} />
            <DetailRow label="Nummer" value={order.jerseyNumber || "—"} />
            <DetailRow label="Größe" value={order.size} />
            <DetailRow label="Version" value={order.version} />
            <DetailRow label="Typ" value={order.jerseyType} />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-zinc-500 mb-1 block">Verein</label>
              <input className={inputClass} value={editForm?.club ?? ""} onChange={(e) => handleUpdate("club", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Spielername</label>
              <input className={inputClass} value={editForm?.playerName ?? ""} onChange={(e) => handleUpdate("playerName", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Nummer</label>
              <input className={inputClass} value={editForm?.jerseyNumber ?? ""} onChange={(e) => handleUpdate("jerseyNumber", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Größe</label>
              <select className={inputClass} value={editForm?.size} onChange={(e) => handleUpdate("size", e.target.value as JerseySize)}>
                {SIZES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Version</label>
              <select className={inputClass} value={editForm?.version} onChange={(e) => handleUpdate("version", e.target.value as JerseyVersion)}>
                {VERSIONS.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-500 mb-1 block">Typ</label>
              <select className={inputClass} value={editForm?.jerseyType} onChange={(e) => handleUpdate("jerseyType", e.target.value as JerseyType)}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Preise */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Finanzen</h2>
        {!isEditing ? (
          <>
            <DetailRow label="Einkaufspreis" value={formatCurrency(order.purchasePrice)} />
            <DetailRow label="Verkaufspreis" value={formatCurrency(order.sellingPrice)} />
            <DetailRow
              label="Gewinn"
              value={
                <span className={profit >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                </span>
              }
            />
            {order.isPaid && order.paymentDate && (
              <DetailRow label="Bezahlt am" value={formatDate(order.paymentDate)} />
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Einkaufspreis (€)</label>
              <input type="number" min="0" step="0.01" className={inputClass}
                value={editForm?.purchasePrice ?? ""}
                onChange={(e) => handleUpdate("purchasePrice", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Verkaufspreis (€)</label>
              <input type="number" min="0" step="0.01" className={inputClass}
                value={editForm?.sellingPrice ?? ""}
                onChange={(e) => handleUpdate("sellingPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
            {editForm && (
              <div className="col-span-2">
                <div className={`flex items-center justify-between rounded-xl px-4 py-3 border ${(editForm.sellingPrice - editForm.purchasePrice) >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                  <span className="text-sm text-zinc-400">Gewinn</span>
                  <span className={`font-bold ${(editForm.sellingPrice - editForm.purchasePrice) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatCurrency(editForm.sellingPrice - editForm.purchasePrice)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status (immer als Toggles sichtbar) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Status</h2>
        <div className="space-y-2">
          <Toggle label="Bezahlt" checked={order.isPaid} onChange={() => quickToggle("isPaid")} />
          <Toggle label="Beim Lieferanten bestellt" checked={order.isOrdered} onChange={() => quickToggle("isOrdered")} />
          <Toggle label="Angekommen" checked={order.hasArrived} onChange={() => quickToggle("hasArrived")} />
          <Toggle label="Abgeholt" checked={order.isPickedUp} onChange={() => quickToggle("isPickedUp")} />
        </div>
      </div>

      {/* Kontakt + Notizen */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Sonstiges</h2>
        {!isEditing ? (
          <>
            <DetailRow label="WhatsApp" value={order.whatsapp || "—"} />
            <DetailRow label="Notizen" value={order.notes || "—"} />
            <DetailRow label="Erstellt" value={formatDate(order.createdAt)} />
            <DetailRow label="Zuletzt bearbeitet" value={formatDate(order.updatedAt)} />
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">WhatsApp / Kontakt</label>
              <input className={inputClass} value={editForm?.whatsapp ?? ""} onChange={(e) => handleUpdate("whatsapp", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Notizen</label>
              <textarea rows={3} className={`${inputClass} resize-none`}
                value={editForm?.notes ?? ""}
                onChange={(e) => handleUpdate("notes", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Löschen-Bestätigung */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center">
              <span className="text-4xl">🗑️</span>
              <h3 className="text-lg font-semibold text-white mt-2">Bestellung löschen?</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Bestellung von <strong className="text-white">{order.customerName}</strong> wird dauerhaft gelöscht.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl text-sm font-medium"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
