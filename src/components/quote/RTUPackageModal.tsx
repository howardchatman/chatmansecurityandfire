"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2, Wind, AlertCircle } from "lucide-react";
import {
  RTU_STATUS_OPTIONS,
  type RTUUnit,
  type RTUStatus,
} from "@/lib/quote-templates";

interface RTUPackageModalProps {
  onClose: () => void;
  onSave: (units: RTUUnit[]) => void;
  initialUnits?: RTUUnit[];
}

const generateUnitId = () => `rtu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function RTUPackageModal({
  onClose,
  onSave,
  initialUnits,
}: RTUPackageModalProps) {
  const [units, setUnits] = useState<RTUUnit[]>(
    initialUnits || [
      {
        id: generateUnitId(),
        location: "RTU-1",
        status: "unknown",
        troubleshootingHours: 1,
        replaceDuctSmoke: false,
        notes: "",
      },
    ]
  );

  const addUnit = () => {
    const newUnit: RTUUnit = {
      id: generateUnitId(),
      location: `RTU-${units.length + 1}`,
      status: "unknown",
      troubleshootingHours: 1,
      replaceDuctSmoke: false,
      notes: "",
    };
    setUnits([...units, newUnit]);
  };

  const removeUnit = (id: string) => {
    if (units.length > 1) {
      setUnits(units.filter((u) => u.id !== id));
    }
  };

  const updateUnit = (id: string, field: keyof RTUUnit, value: string | number | boolean) => {
    setUnits(
      units.map((unit) =>
        unit.id === id ? { ...unit, [field]: value } : unit
      )
    );
  };

  const handleSave = () => {
    onSave(units);
  };

  // Calculate summary
  const totalTroubleshootingHours = units.reduce(
    (sum, u) => sum + u.troubleshootingHours,
    0
  );
  const totalReplacements = units.filter(
    (u) => u.replaceDuctSmoke || u.status === "needs_new_duct_smoke"
  ).length;
  const needsShutdownWiring = units.some(
    (u) => u.status === "needs_shutdown_wiring"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wind className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                RTU / Duct Smoke Package
              </h2>
              <p className="text-sm text-gray-500">
                Configure rooftop units and duct smoke detectors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* RTU Count Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              <strong>{units.length}</strong> RTU{units.length !== 1 ? "s" : ""} configured
            </p>
            <button
              onClick={addUnit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add RTU
            </button>
          </div>

          {/* Units List */}
          <div className="space-y-4">
            {units.map((unit, index) => (
              <div
                key={unit.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    Unit {index + 1}
                  </h3>
                  {units.length > 1 && (
                    <button
                      onClick={() => removeUnit(unit.id)}
                      className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location / Name
                    </label>
                    <input
                      type="text"
                      value={unit.location}
                      onChange={(e) =>
                        updateUnit(unit.id, "location", e.target.value)
                      }
                      placeholder="RTU-1 Cafe"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={unit.status}
                      onChange={(e) =>
                        updateUnit(unit.id, "status", e.target.value as RTUStatus)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {RTU_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Troubleshooting Hours */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Troubleshooting Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={unit.troubleshootingHours}
                      onChange={(e) =>
                        updateUnit(
                          unit.id,
                          "troubleshootingHours",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Replace Duct Smoke */}
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={unit.replaceDuctSmoke}
                        onChange={(e) =>
                          updateUnit(unit.id, "replaceDuctSmoke", e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Replace duct smoke detector
                    </label>
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={unit.notes}
                      onChange={(e) =>
                        updateUnit(unit.id, "notes", e.target.value)
                      }
                      placeholder="Additional notes..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h4 className="font-medium text-blue-900 mb-3">
              Package Summary
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              {totalTroubleshootingHours > 0 && (
                <p>
                  • RTU duct smoke troubleshooting: {totalTroubleshootingHours} hour{totalTroubleshootingHours !== 1 ? "s" : ""}
                </p>
              )}
              {totalReplacements > 0 && (
                <p>
                  • Duct smoke detector replacement: {totalReplacements} unit{totalReplacements !== 1 ? "s" : ""}
                </p>
              )}
              {needsShutdownWiring && (
                <p>• RTU shutdown interlock wiring (allowance)</p>
              )}
              {units.length > 0 && (
                <p>• Functional test & documentation</p>
              )}
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Line items will be automatically generated based on this configuration.
              You can edit quantities and prices after adding to the quote.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Add to Quote
          </button>
        </div>
      </motion.div>
    </div>
  );
}
