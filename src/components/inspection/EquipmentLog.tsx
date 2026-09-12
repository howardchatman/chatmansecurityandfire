"use client";

import { useState } from "react";
import { Plus, Trash2, Camera, Check, X, ChevronDown, ChevronUp, FlameKindling } from "lucide-react";
import PhotoCapture from "./PhotoCapture";
import {
  EquipmentRow,
  EXTINGUISHER_SIZES,
  EXTINGUISHER_TYPES,
  emptyEquipmentRow,
} from "@/lib/inspection-report";

// The device log a tech fills in on site for an extinguisher inspection: one
// card per unit, in tag order. Every field here prints as a cell of the
// report's device table, so the labels match the printed ones.

interface Props {
  inspectionId: string;
  rows: EquipmentRow[];
  onChange: (rows: EquipmentRow[]) => void;
  /** Photos already on the inspection, so the card can show which units have one. */
  photoTags?: string[];
  onPhotoUploaded?: () => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  list,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  list?: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] font-medium text-gray-500 mb-0.5">{label}</span>
      <input
        type={type}
        value={value}
        list={list}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
      />
    </label>
  );
}

export default function EquipmentLog({ inspectionId, rows, onChange, photoTags = [], onPhotoUploaded }: Props) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(rows.slice(-1).map((r) => r.id)));
  const [photoFor, setPhotoFor] = useState<string | null>(null);

  const update = (id: string, patch: Partial<EquipmentRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const add = () => {
    const next = emptyEquipmentRow(String(rows.length + 1));
    // Start the new unit from the last one — same building, usually same make.
    const last = rows[rows.length - 1];
    if (last) {
      next.make_model = last.make_model;
      next.size = last.size;
      next.type = last.type;
    }
    onChange([...rows, next]);
    setOpen(new Set([next.id]));
  };

  const remove = (id: string) => {
    if (!confirm("Remove this unit from the log?")) return;
    onChange(rows.filter((r) => r.id !== id));
  };

  const toggle = (id: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const passed = rows.filter((r) => r.result === "pass").length;
  const failed = rows.filter((r) => r.result === "fail").length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <datalist id="ext-types">
        {EXTINGUISHER_TYPES.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <datalist id="ext-sizes">
        {EXTINGUISHER_SIZES.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FlameKindling className="w-5 h-5 text-orange-500" />
            Extinguishers ({rows.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {passed} passed · {failed} failed · {rows.length - passed - failed} not yet inspected
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
        >
          <Plus className="w-4 h-4" />
          Add Unit
        </button>
      </div>

      {rows.length === 0 && (
        <div className="p-6 text-center text-sm text-gray-500">
          No units logged yet. Add one for each extinguisher on the tag list.
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {rows.map((r) => {
          const isOpen = open.has(r.id);
          const hasPhoto = photoTags.includes(r.number);
          return (
            <div key={r.id}>
              <div className="flex items-center gap-3 px-4 py-3">
                <button type="button" onClick={() => toggle(r.id)} className="flex-1 text-left flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700 shrink-0">
                    {r.number || "?"}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-gray-900 truncate">
                      {r.location || <span className="text-gray-400">Location not set</span>}
                    </span>
                    <span className="block text-xs text-gray-500 truncate">
                      {[r.make_model, r.size && `${r.size} lb`, r.type].filter(Boolean).join(" · ") || "No details yet"}
                      {hasPhoto ? " · 📷" : ""}
                    </span>
                  </span>
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => update(r.id, { result: r.result === "pass" ? "" : "pass" })}
                    className={`p-2 rounded-lg ${
                      r.result === "pass" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                    }`}
                    aria-label="Pass"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => update(r.id, { result: r.result === "fail" ? "" : "fail" })}
                    className={`p-2 rounded-lg ${
                      r.result === "fail" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                    }`}
                    aria-label="Fail"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={() => toggle(r.id)} className="p-2 text-gray-400">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="Tag #" value={r.number} onChange={(v) => update(r.id, { number: v })} />
                    <Field
                      label="Location"
                      value={r.location}
                      onChange={(v) => update(r.id, { location: v })}
                      placeholder="2nd / Room 201 / under sink"
                      className="col-span-2 sm:col-span-3"
                    />
                    <Field
                      label="Type / Make / Model"
                      value={r.make_model}
                      onChange={(v) => update(r.id, { make_model: v })}
                      placeholder="Amerex B500"
                      className="col-span-2"
                    />
                    <Field label="Serial #" value={r.serial} onChange={(v) => update(r.id, { serial: v })} />
                    <Field label="Mfg Year" value={r.mfg_date} onChange={(v) => update(r.id, { mfg_date: v })} placeholder="2021" />
                    <Field label="Size (lb)" value={r.size} onChange={(v) => update(r.id, { size: v })} list="ext-sizes" />
                    <Field label="Agent Type" value={r.type} onChange={(v) => update(r.id, { type: v })} list="ext-types" />
                    <Field label="Last Hydro" type="date" value={r.last_hydro} onChange={(v) => update(r.id, { last_hydro: v })} />
                    <Field label="Next Hydro" type="date" value={r.next_hydro} onChange={(v) => update(r.id, { next_hydro: v })} />
                    <Field label="Next Six-Year" type="date" value={r.next_six_year} onChange={(v) => update(r.id, { next_six_year: v })} />
                    <Field label="Serviced" value={r.serviced} onChange={(v) => update(r.id, { serviced: v })} placeholder="Recharged, new tag" />
                    <Field
                      label="Parts Required"
                      value={r.parts_required}
                      onChange={(v) => update(r.id, { parts_required: v })}
                      className="col-span-2"
                    />
                    <Field
                      label="Notes"
                      value={r.notes}
                      onChange={(v) => update(r.id, { notes: v })}
                      className="col-span-2 sm:col-span-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPhotoFor(photoFor === r.id ? null : r.id)}
                      className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:underline"
                    >
                      <Camera className="w-4 h-4" />
                      {hasPhoto ? "Add another photo" : "Add photo of this unit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>

                  {photoFor === r.id && (
                    <PhotoCapture
                      inspectionId={inspectionId}
                      photoType="device"
                      deviceTag={r.number}
                      defaultLocation={r.location}
                      onPhotoUploaded={() => {
                        setPhotoFor(null);
                        onPhotoUploaded?.();
                      }}
                      onClose={() => setPhotoFor(null)}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
