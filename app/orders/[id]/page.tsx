"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Order, JerseyItem, JerseySize, JerseyVersion, JerseyType, emptyJersey } from "@/types/order";
import { getOrderById, updateOrder, deleteOrder } from "@/lib/storage";
import {
  calcOrderProfit,
  formatCurrency,
  formatDate,
  getDeliveryStatus,
  getJerseyDeliveryStatus,
  getPaymentStatus,
} from "@/lib/utils";
import Badge from "@/components/ui/Badge";

const SIZES: JerseySize[] = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Kids XS", "Kids S", "Kids M", "Kids L", "Kids XL"];
const VERSIONS: JerseyVersion[] = ["Fan Version", "Player Version"];
const TYPES: JerseyType[] = ["Heimtrikot", "Auswärtstrikot", "Third Kit", "Spezialtrikot"];

const inputClass =
  "w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors";

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
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
            checked ? "left-5.5 translate-x-0.5" : "left-0.5"
          }`}
        />
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
    setEditForm(o ? { ...o, jerseys: o.jerseys.map((j) => ({ ...j })) } : null);
  }, [id]);

  // ── Customer-level field update ──────────────────────────────────────────────
  function handleUpdate<K extends keyof Order>(key: K, value: Order[K]) {
    setEditForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  // ── Jersey-level field update ────────────────────────────────────────────────
  function handleJerseyUpdate<K extends keyof JerseyItem>(jerseyId: string, key: K, value: JerseyItem[K]) {
    setEditForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        jerseys: prev.jerseys.map((j) => (j.id === jerseyId ? { ...j, [key]: value } : j)),
      };
    });
  }

  function addJersey() {
    setEditForm((prev) => {
      if (!prev) return prev;
      return { ...prev, jerseys: [...prev.jerseys, emptyJersey()] };
    });
  }

  function removeJersey(jerseyId: string) {
    setEditForm((prev) => {
      if (!prev) return prev;
      return { ...prev, jerseys: prev.jerseys.filter((j) => j.id !== jerseyId) };
    });
  }

  function saveEdits() {
    if (!editForm) return;
    const updated = updateOrder(id, editForm);
    if (updated) {
      setOrder(updated);
      setEditForm({ ...updated, jerseys: updated.jerseys.map((j) => ({ ...j })) });
    }
    setIsEditing(false);
  }

  function cancelEdits() {
    if (!order) return;
    setIsEditing(false);
    setEditForm({ ...order, jerseys: order.jerseys.map((j) => ({ ...j })) });
  }

  function handleDelete() {
    deleteOrder(id);
    router.push("/orders");
  }

  // ── Payment quick-toggle ─────────────────────────────────────────────────────
  function togglePayment() {
    if (!order) return;
    const updates: Partial<Order> = {
      isPaid: !order.isPaid,
      paymentDate: !order.isPaid ? new Date().toISOString() : null,
    };
    const updated = updateOrder(id, updates);
    if (updated) {
      setOrder(updated);
      setEditForm({ ...updated, jerseys: updated.jerseys.map((j) => ({ ...j })) });
    }
  }

  // ── Jersey-level status quick-toggle ────────────────────────────────────────
  function toggleJerseyField(jerseyId: string, field: "isOrdered" | "hasArrived" | "isPickedUp") {
    if (!order) return;
    const updatedJerseys = order.jerseys.map((j) =>
      j.id === jerseyId ? { ...j, [field]: !j[field] } : j
    );
    const updated = updateOrder(id, { jerseys: updatedJerseys });
    if (updated) {
      setOrder(updated);
      setEditForm({ ...updated, jerseys: updated.jerseys.map((j) => ({ ...j })) });
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

  const totalProfit = calcOrderProfit(order);
  const pay = getPaymentStatus(order);
  const del = getDeliveryStatus(order);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Top nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-xs text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1"
        >
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
                onClick={cancelEdits}
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

      {/* Customer header card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold shrink-0">
            {order.customerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-lg font-bold rounded-xl px-3 py-1.5 mb-2 focus:outline-none focus:border-indigo-500"
                value={editForm?.customerName ?? ""}
                onChange={(e) => handleUpdate("customerName", e.target.value)}
                placeholder="Kundenname"
              />
            ) : (
              <h1 className="text-xl font-bold text-white">{order.customerName}</h1>
            )}
            <p className="text-sm text-zinc-400 mt-0.5">
              {order.jerseys.length} Trikot{order.jerseys.length !== 1 ? "s" : ""}
              {order.jerseys.length > 0 &&
                ` · ${[...new Set(order.jerseys.map((j) => j.club))].join(", ")}`}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge label={pay.label} color={pay.color as "green" | "red"} />
              <Badge label={del.label} color={del.color as "gray" | "blue" | "orange" | "red"} />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-zinc-500">Gewinn</p>
            <p className={`text-xl font-bold ${totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalProfit >= 0 ? "+" : ""}
              {formatCurrency(totalProfit)}
            </p>
          </div>
        </div>

        {/* WhatsApp + Dates in view mode, inline in card */}
        {!isEditing && (
          <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-x-4">
            <div>
              <p className="text-xs text-zinc-500">WhatsApp</p>
              <p className="text-sm text-white mt-0.5">{order.whatsapp || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Erstellt</p>
              <p className="text-sm text-white mt-0.5">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        )}

        {/* Edit: whatsapp */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <label className="text-xs text-zinc-500 mb-1 block">WhatsApp / Kontakt</label>
            <input
              className={inputClass}
              value={editForm?.whatsapp ?? ""}
              onChange={(e) => handleUpdate("whatsapp", e.target.value)}
              placeholder="+49 ..."
            />
          </div>
        )}
      </div>

      {/* Payment toggle — always visible */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Zahlung</h2>
        <Toggle label="Bezahlt" checked={order.isPaid} onChange={togglePayment} />
        {order.isPaid && order.paymentDate && (
          <p className="text-xs text-zinc-500 mt-2 px-1">Bezahlt am {formatDate(order.paymentDate)}</p>
        )}
      </div>

      {/* Jersey cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Trikots ({isEditing ? (editForm?.jerseys.length ?? 0) : order.jerseys.length})
          </h2>
          {isEditing && (
            <button
              onClick={addJersey}
              className="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Trikot hinzufügen
            </button>
          )}
        </div>

        {(isEditing ? editForm?.jerseys : order.jerseys)?.map((jersey, idx) => {
          const jerseyProfit = jersey.sellingPrice - jersey.purchasePrice;
          const jerseyStatus = getJerseyDeliveryStatus(jersey);
          return (
            <div key={jersey.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              {/* Jersey card header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">
                      {jersey.club || "Verein?"}{jersey.playerName ? ` · ${jersey.playerName}` : ""}
                      {jersey.jerseyNumber ? ` #${jersey.jerseyNumber}` : ""}
                    </span>
                    <span className="text-xs text-zinc-500">#{idx + 1}</span>
                  </div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <Badge label={jerseyStatus.label} color={jerseyStatus.color as "gray" | "blue" | "orange" | "red"} />
                    <span className="text-xs text-zinc-500">{jersey.size} · {jersey.version} · {jersey.jerseyType}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-zinc-500">Gewinn</p>
                  <p className={`text-base font-bold ${jerseyProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {jerseyProfit >= 0 ? "+" : ""}
                    {formatCurrency(jerseyProfit)}
                  </p>
                </div>
              </div>

              {/* View mode: jersey details */}
              {!isEditing && (
                <>
                  <div className="space-y-0 divide-y divide-zinc-800">
                    <DetailRow label="Verein" value={jersey.club || "—"} />
                    <DetailRow label="Spieler" value={jersey.playerName || "—"} />
                    <DetailRow label="Nummer" value={jersey.jerseyNumber || "—"} />
                    <DetailRow label="Größe" value={jersey.size} />
                    <DetailRow label="Version" value={jersey.version} />
                    <DetailRow label="Typ" value={jersey.jerseyType} />
                    <DetailRow label="Einkaufspreis" value={formatCurrency(jersey.purchasePrice)} />
                    <DetailRow label="Verkaufspreis" value={formatCurrency(jersey.sellingPrice)} />
                    {jersey.notes && <DetailRow label="Notizen" value={jersey.notes} />}
                  </div>
                  <div className="space-y-2 pt-1">
                    <Toggle
                      label="Beim Lieferanten bestellt"
                      checked={jersey.isOrdered}
                      onChange={() => toggleJerseyField(jersey.id, "isOrdered")}
                    />
                    <Toggle
                      label="Angekommen"
                      checked={jersey.hasArrived}
                      onChange={() => toggleJerseyField(jersey.id, "hasArrived")}
                    />
                    <Toggle
                      label="Abgeholt"
                      checked={jersey.isPickedUp}
                      onChange={() => toggleJerseyField(jersey.id, "isPickedUp")}
                    />
                  </div>
                </>
              )}

              {/* Edit mode: jersey fields */}
              {isEditing && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs text-zinc-500 mb-1 block">Verein</label>
                      <input
                        className={inputClass}
                        value={jersey.club}
                        onChange={(e) => handleJerseyUpdate(jersey.id, "club", e.target.value)}
                        placeholder="z.B. FC Bayern"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Spielername</label>
                      <input
                        className={inputClass}
                        value={jersey.playerName}
                        onChange={(e) => handleJerseyUpdate(jersey.id, "playerName", e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Trikotnummer</label>
                      <input
                        className={inputClass}
                        value={jersey.jerseyNumber}
                        onChange={(e) => handleJerseyUpdate(jersey.id, "jerseyNumber", e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Größe</label>
                      <select
                        className={inputClass}
                        value={jersey.size}
                        onChange={(e) => handleJerseyUpdate(jersey.id, "size", e.target.value as JerseySize)}
                      >
                        {SIZES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Version</label>
                      <select
                        className={inputClass}
                        value={jersey.version}
                        onChange={(e) => handleJerseyUpdate(jersey.id, "version", e.target.value as JerseyVersion)}
                      >
                        {VERSIONS.map((v) => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-zinc-500 mb-1 block">Typ</label>
                      <select
                        className={inputClass}
                        value={jersey.jerseyType}
                        onChange={(e) => handleJerseyUpdate(jersey.id, "jerseyType", e.target.value as JerseyType)}
                      >
                        {TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Einkaufspreis (€)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={jersey.purchasePrice}
                        onChange={(e) => handleJerseyUpdate(jersey.id, "purchasePrice", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Verkaufspreis (€)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={jersey.sellingPrice}
                        onChange={(e) => handleJerseyUpdate(jersey.id, "sellingPrice", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <div
                        className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                          jerseyProfit >= 0
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-red-500/10 border-red-500/20"
                        }`}
                      >
                        <span className="text-sm text-zinc-400">Gewinn</span>
                        <span className={`font-bold ${jerseyProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {formatCurrency(jerseyProfit)}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-zinc-500 mb-1 block">Notizen zum Trikot</label>
                      <input
                        className={inputClass}
                        value={jersey.notes}
                        onChange={(e) => handleJerseyUpdate(jersey.id, "notes", e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Toggle
                      label="Beim Lieferanten bestellt"
                      checked={jersey.isOrdered}
                      onChange={() =>
                        handleJerseyUpdate(jersey.id, "isOrdered", !jersey.isOrdered)
                      }
                    />
                    <Toggle
                      label="Angekommen"
                      checked={jersey.hasArrived}
                      onChange={() =>
                        handleJerseyUpdate(jersey.id, "hasArrived", !jersey.hasArrived)
                      }
                    />
                    <Toggle
                      label="Abgeholt"
                      checked={jersey.isPickedUp}
                      onChange={() =>
                        handleJerseyUpdate(jersey.id, "isPickedUp", !jersey.isPickedUp)
                      }
                    />
                  </div>
                  <button
                    onClick={() => removeJersey(jersey.id)}
                    className="w-full text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl py-2 transition-colors"
                  >
                    Trikot entfernen
                  </button>
                </>
              )}
            </div>
          );
        })}

        {(isEditing ? editForm?.jerseys : order.jerseys)?.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-500 text-sm">Noch keine Trikots.</p>
            {isEditing && (
              <button
                onClick={addJersey}
                className="text-indigo-400 text-sm mt-2 hover:underline"
              >
                Erstes Trikot hinzufügen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Order notes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Notizen zur Bestellung</h2>
        {!isEditing ? (
          <p className="text-sm text-white whitespace-pre-wrap">{order.notes || <span className="text-zinc-500">—</span>}</p>
        ) : (
          <textarea
            rows={3}
            className={`${inputClass} resize-none`}
            value={editForm?.notes ?? ""}
            onChange={(e) => handleUpdate("notes", e.target.value)}
            placeholder="Anmerkungen zur Bestellung..."
          />
        )}
      </div>

      {/* Timestamps */}
      {!isEditing && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Verlauf</h2>
          <DetailRow label="Erstellt" value={formatDate(order.createdAt)} />
          <DetailRow label="Zuletzt bearbeitet" value={formatDate(order.updatedAt)} />
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center">
              <span className="text-4xl">🗑️</span>
              <h3 className="text-lg font-semibold text-white mt-2">Bestellung löschen?</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Bestellung von <strong className="text-white">{order.customerName}</strong> mit{" "}
                {order.jerseys.length} Trikot{order.jerseys.length !== 1 ? "s" : ""} wird dauerhaft gelöscht.
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
