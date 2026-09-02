import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, Save, AlertCircle, Clock } from "lucide-react";

const FALSE_POSITIVE_REASONS = [
  "Expected Activity",
  "Duplicate Alert",
  "Benign Behavior",
  "Test Activity",
  "Security Tool Misconfiguration",
  "Other",
];

export default function AnalystFeedbackCard({ incident, updateFeedback }) {
  const [outcome, setOutcome] = useState(incident?.investigationOutcome || "");
  const [reasonCategory, setReasonCategory] = useState(() => {
    const r = incident?.feedbackReason || "";
    if (FALSE_POSITIVE_REASONS.includes(r)) return r;
    return r ? "Other" : "";
  });
  const [customReason, setCustomReason] = useState(() => {
    const r = incident?.feedbackReason || "";
    return FALSE_POSITIVE_REASONS.includes(r) ? "" : r;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!incident) return null;

  const handleSave = async () => {
    if (!outcome) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    let finalReason = "";
    if (outcome === "FALSE_POSITIVE") {
      finalReason = reasonCategory === "Other" ? customReason : reasonCategory;
    } else {
      finalReason = reasonCategory;
    }

    try {
      await updateFeedback(incident.id, {
        investigationOutcome: outcome,
        feedbackReason: finalReason,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to update analyst feedback.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentOutcome = incident.investigationOutcome;
  const currentReason = incident.feedbackReason;
  const reviewedAtStr = incident.reviewedAt
    ? new Date(incident.reviewedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="rounded-xl border border-base-600/60 bg-base-850/60 p-5 sm:p-6 transition-colors">
      <div className="flex items-center justify-between border-b border-base-600/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-cyan/10 text-signal-cyan">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-ink-100">
              Analyst Feedback / Investigation Outcome
            </h2>
            <p className="text-xs text-ink-500">
              Classify alert legitimacy without altering priority score
            </p>
          </div>
        </div>

        {currentOutcome && (
          <div className="flex items-center gap-2">
            {currentOutcome === "TRUE_POSITIVE" && (
              <span className="flex items-center gap-1.5 rounded-full border border-signal-green/30 bg-signal-green/10 px-3 py-1 font-mono text-xs font-semibold text-signal-green">
                <CheckCircle2 size={13} />
                TRUE POSITIVE
              </span>
            )}
            {currentOutcome === "FALSE_POSITIVE" && (
              <span className="flex items-center gap-1.5 rounded-full border border-signal-orange/30 bg-signal-orange/10 px-3 py-1 font-mono text-xs font-semibold text-signal-orange">
                <XCircle size={13} />
                FALSE POSITIVE
              </span>
            )}
            {currentOutcome === "NEEDS_INVESTIGATION" && (
              <span className="flex items-center gap-1.5 rounded-full border border-signal-yellow/30 bg-signal-yellow/10 px-3 py-1 font-mono text-xs font-semibold text-signal-yellow">
                <HelpCircle size={13} />
                NEEDS INVESTIGATION
              </span>
            )}
          </div>
        )}
      </div>

      {/* Outcome Selection Buttons */}
      <div className="mt-5 space-y-4">
        <label className="block text-xs font-mono text-ink-400 uppercase tracking-wider">
          Select Investigation Outcome:
        </label>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setOutcome("TRUE_POSITIVE")}
            className={`flex items-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all ${
              outcome === "TRUE_POSITIVE"
                ? "border-signal-green bg-signal-green/15 text-signal-green shadow-glow-sm"
                : "border-base-600/60 bg-base-900/60 text-ink-300 hover:border-signal-green/40 hover:text-ink-100"
            }`}
          >
            <CheckCircle2 size={16} />
            <span>True Positive</span>
          </button>

          <button
            type="button"
            onClick={() => setOutcome("FALSE_POSITIVE")}
            className={`flex items-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all ${
              outcome === "FALSE_POSITIVE"
                ? "border-signal-orange bg-signal-orange/15 text-signal-orange shadow-glow-sm"
                : "border-base-600/60 bg-base-900/60 text-ink-300 hover:border-signal-orange/40 hover:text-ink-100"
            }`}
          >
            <XCircle size={16} />
            <span>False Positive</span>
          </button>

          <button
            type="button"
            onClick={() => setOutcome("NEEDS_INVESTIGATION")}
            className={`flex items-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all ${
              outcome === "NEEDS_INVESTIGATION"
                ? "border-signal-yellow bg-signal-yellow/15 text-signal-yellow shadow-glow-sm"
                : "border-base-600/60 bg-base-900/60 text-ink-300 hover:border-signal-yellow/40 hover:text-ink-100"
            }`}
          >
            <HelpCircle size={16} />
            <span>Needs Investigation</span>
          </button>
        </div>

        {/* False Positive Reason Form */}
        {outcome === "FALSE_POSITIVE" && (
          <div className="rounded-lg border border-base-600/50 bg-base-900/60 p-4 space-y-3">
            <label className="block text-xs font-medium text-ink-300">
              False Positive Reason:
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full rounded-md border border-base-600 bg-base-850 p-2.5 text-xs text-ink-100 focus:border-signal-cyan focus:outline-none"
            >
              <option value="">-- Select Reason --</option>
              {FALSE_POSITIVE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {reasonCategory === "Other" && (
              <input
                type="text"
                placeholder="Enter custom reason details..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full rounded-md border border-base-600 bg-base-850 p-2.5 text-xs text-ink-100 placeholder:text-ink-600 focus:border-signal-cyan focus:outline-none"
              />
            )}
          </div>
        )}

        {/* Save Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-600/50 pt-4">
          <div className="text-xs text-ink-500 font-mono">
            {reviewedAtStr && (
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                Reviewed: {reviewedAtStr}
                {currentReason && <span className="text-ink-300">· Reason: {currentReason}</span>}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-medium text-signal-green flex items-center gap-1">
                <CheckCircle2 size={13} />
                Feedback Saved!
              </span>
            )}
            {errorMessage && (
              <span className="text-xs font-medium text-signal-red flex items-center gap-1">
                <AlertCircle size={13} />
                {errorMessage}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !outcome}
              className="flex items-center gap-1.5 rounded-md bg-signal-blue px-4 py-2 text-xs font-semibold text-white shadow-glow hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Feedback
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
