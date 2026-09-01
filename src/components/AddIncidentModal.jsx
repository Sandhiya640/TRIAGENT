import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { computeScore, priorityLevel, FACTORS } from "../utils/priorityEngine";
import { INCIDENT_TYPES } from "../data/mockIncidents";
import PriorityBadge from "./PriorityBadge";

const initialForm = {
  type: INCIDENT_TYPES[0],
  title: "",
  asset: "",
  severity: 5,
  businessImpact: 5,
  dataSensitivity: 5,
  assetImportance: 5,
  attackConfidence: 50,
  affectedUsersCount: 100,
  description: "",
};

function Slider({ label, minLabel, maxLabel, value, onChange, min = 1, max = 10, unit = "" }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <label className="font-medium text-ink-300">{label}</label>
        <span className="font-mono text-xs font-semibold text-signal-cyan">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-base-700 accent-signal-blue"
      />
      {(minLabel || maxLabel) && (
        <div className="mt-1 flex justify-between text-[10px] text-ink-500">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

export default function AddIncidentModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const preview = useMemo(() => {
    const rawFactors = {
      severity: form.severity,
      businessImpact: form.businessImpact,
      dataSensitivity: form.dataSensitivity,
      assetImportance: form.assetImportance,
      attackConfidence: form.attackConfidence,
      affectedUsersCount: form.affectedUsersCount,
    };
    const { total, contributions } = computeScore(rawFactors);
    return { total, level: priorityLevel(total), contributions };
  }, [form]);

  const topFactor = useMemo(() => {
    return FACTORS.map((f) => ({ ...f, ...preview.contributions[f.key] })).sort(
      (a, b) => b.contribution - a.contribution
    )[0];
  }, [preview]);

  const canSubmit = form.asset.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-hidden rounded-xl border border-base-600/70 bg-base-850 shadow-soft md:grid-cols-[1.4fr_1fr]"
      >
        <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink-100">Add New Incident</h2>
              <p className="text-xs text-ink-500">Provide raw incident metrics for TRIAGENT analysis</p>
            </div>
            <button onClick={onClose} className="text-ink-500 hover:text-ink-100" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-300">Incident Type</label>
                <select
                  value={form.type}
                  onChange={(e) => set("type")(e.target.value)}
                  className="w-full rounded-md border border-base-600 bg-base-800 px-3 py-2 text-sm text-ink-100 outline-none focus:border-signal-blue"
                >
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-300">Affected Asset</label>
                <input
                  value={form.asset}
                  onChange={(e) => set("asset")(e.target.value)}
                  placeholder="e.g. Production API Gateway"
                  className="w-full rounded-md border border-base-600 bg-base-800 px-3 py-2 text-sm text-ink-100 outline-none placeholder:text-ink-700 focus:border-signal-blue"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-300">Incident Title</label>
              <input
                value={form.title}
                onChange={(e) => set("title")(e.target.value)}
                placeholder="Short summary of what was detected"
                className="w-full rounded-md border border-base-600 bg-base-800 px-3 py-2 text-sm text-ink-100 outline-none placeholder:text-ink-700 focus:border-signal-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-base-600/60 bg-base-800/40 p-4">
              <Slider
                label="Severity (1–10)"
                minLabel="Low (1)"
                maxLabel="Critical (10)"
                value={form.severity}
                onChange={set("severity")}
              />
              <Slider
                label="Business Impact (1–10)"
                minLabel="Minor (1)"
                maxLabel="Severe (10)"
                value={form.businessImpact}
                onChange={set("businessImpact")}
              />
              <Slider
                label="Data Sensitivity (1–10)"
                minLabel="Public (1)"
                maxLabel="Highly Sensitive (10)"
                value={form.dataSensitivity}
                onChange={set("dataSensitivity")}
              />
              <Slider
                label="Asset Importance (1–10)"
                minLabel="Non-Critical (1)"
                maxLabel="Business Critical (10)"
                value={form.assetImportance}
                onChange={set("assetImportance")}
              />
              <Slider
                label="Attack Confidence (0–100)"
                minLabel="Unconfirmed (0)"
                maxLabel="Confirmed (100)"
                value={form.attackConfidence}
                onChange={set("attackConfidence")}
                min={0}
                max={100}
                unit="%"
              />
              <Slider
                label="Affected Users (Count)"
                minLabel="0"
                maxLabel="5,000+"
                value={form.affectedUsersCount}
                onChange={set("affectedUsersCount")}
                min={0}
                max={5000}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-300">Incident Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                rows={3}
                placeholder="What did the analyst or detection engine observe?"
                className="w-full resize-none rounded-md border border-base-600 bg-base-800 px-3 py-2 text-sm text-ink-100 outline-none placeholder:text-ink-700 focus:border-signal-blue"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-md border border-base-600 px-4 py-2 text-sm font-medium text-ink-300 transition-colors hover:bg-base-800"
            >
              Cancel
            </button>
            <button
              disabled={!canSubmit}
              onClick={() => onSubmit(form)}
              className="rounded-md bg-signal-blue px-4 py-2 text-sm font-semibold text-white shadow-glow transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add to Incoming Incidents
            </button>
          </div>
        </div>

        <div className="flex flex-col border-t border-base-600/60 bg-base-900/70 p-6 sm:p-7 md:border-l md:border-t-0">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-500">
            <Sparkles size={13} className="text-signal-cyan" />
            Live Priority Preview
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-ink-100">{preview.total}</span>
            <span className="font-mono text-sm text-ink-500">/ 100</span>
          </div>
          <div className="mt-2">
            <PriorityBadge level={preview.level} />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-500">
            {topFactor && (
              <>
                Estimated score driven mainly by{" "}
                <span className="font-medium text-ink-300">{topFactor.label}</span>.
              </>
            )}
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {FACTORS.map((f) => {
              const c = preview.contributions[f.key];
              return (
                <div key={f.key}>
                  <div className="mb-1 flex justify-between text-[11px] text-ink-500">
                    <span>{f.label} ({Math.round(f.weight * 100)}%)</span>
                    <span className="font-mono text-ink-300">{c.contribution} pts</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-700">
                    <div
                      className="h-full rounded-full bg-signal-blue transition-all duration-300"
                      style={{ width: `${c.normalized}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

