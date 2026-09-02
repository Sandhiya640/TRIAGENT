import { useState } from "react";
import { Bot, CheckCircle2, XCircle, HelpCircle, Save, AlertTriangle, ShieldCheck, Info } from "lucide-react";

const FALSE_POSITIVE_REASONS = [
  "Expected Activity",
  "Duplicate Alert",
  "Benign Behavior",
  "Test Activity",
  "Security Tool Misconfiguration",
  "Other",
];

export default function AutomatedAssessmentCard({ incident, updateFeedback }) {
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

  const predictedOutcome = incident.predictedOutcome || "NEEDS_INVESTIGATION";
  const confidence = incident.predictionConfidence ?? 50;
  const explanation = incident.predictionExplanation || "Automated assessment evaluated from available alert metrics.";
  const supportingIndicators = incident.supportingIndicators || [];
  const contradictingIndicators = incident.contradictingIndicators || [];

  const handleSave = async (selectedOutcome) => {
    const targetOutcome = selectedOutcome || outcome;
    if (!targetOutcome) return;
    setOutcome(targetOutcome);
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    let finalReason = "";
    if (targetOutcome === "FALSE_POSITIVE") {
      finalReason = reasonCategory === "Other" ? customReason : reasonCategory;
    } else {
      finalReason = reasonCategory;
    }

    try {
      await updateFeedback(incident.id, {
        investigationOutcome: targetOutcome,
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
  const isConfirmed = currentOutcome && (
    (currentOutcome === "TRUE_POSITIVE" && predictedOutcome === "LIKELY_TRUE_POSITIVE") ||
    (currentOutcome === "FALSE_POSITIVE" && predictedOutcome === "LIKELY_FALSE_POSITIVE") ||
    (currentOutcome === "NEEDS_INVESTIGATION" && predictedOutcome === "NEEDS_INVESTIGATION")
  );
  const isOverridden = currentOutcome && !isConfirmed;

  return (
    <div className="rounded-xl border border-signal-blue/30 bg-base-850/80 p-5 sm:p-6 transition-colors shadow-lg">
      {/* Header: AI Prediction Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-600/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-cyan/15 text-signal-cyan shadow-glow-sm">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-ink-100 flex items-center gap-2">
              Automated Outcome Assessment
              <span className="text-[10px] font-mono font-medium text-signal-cyan bg-signal-cyan/10 border border-signal-cyan/20 px-2 py-0.5 rounded">
                AI Decision-Support
              </span>
            </h2>
            <p className="text-xs text-ink-500">
              Deterministic prediction of genuine threat likelihood (Separate from priority score)
            </p>
          </div>
        </div>

        {/* Confidence Gauge Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500 block">AI Confidence</span>
            <span className="font-mono text-base font-bold text-signal-cyan">{confidence}%</span>
          </div>
          <div>
            {predictedOutcome === "LIKELY_TRUE_POSITIVE" && (
              <span className="flex items-center gap-1.5 rounded-full border border-signal-green/40 bg-signal-green/15 px-3 py-1 font-mono text-xs font-bold text-signal-green">
                <CheckCircle2 size={14} />
                LIKELY TRUE POSITIVE
              </span>
            )}
            {predictedOutcome === "LIKELY_FALSE_POSITIVE" && (
              <span className="flex items-center gap-1.5 rounded-full border border-signal-orange/40 bg-signal-orange/15 px-3 py-1 font-mono text-xs font-bold text-signal-orange">
                <XCircle size={14} />
                LIKELY FALSE POSITIVE
              </span>
            )}
            {predictedOutcome === "NEEDS_INVESTIGATION" && (
              <span className="flex items-center gap-1.5 rounded-full border border-signal-yellow/40 bg-signal-yellow/15 px-3 py-1 font-mono text-xs font-bold text-signal-yellow">
                <HelpCircle size={14} />
                NEEDS INVESTIGATION
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Rationale & Indicators */}
      <div className="mt-4 space-y-4">
        {/* Why TRIAGENT thinks this */}
        <div className="rounded-lg border border-base-600/60 bg-base-900/70 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-signal-cyan mb-1">
            <Info size={14} />
            Why TRIAGENT reached this conclusion:
          </div>
          <p className="text-xs leading-relaxed text-ink-200">{explanation}</p>
        </div>

        {/* Supporting Indicators List */}
        {supportingIndicators.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono font-semibold text-signal-green flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck size={14} />
              Supporting Indicators ({supportingIndicators.length}):
            </h4>
            <ul className="space-y-1.5 pl-1">
              {supportingIndicators.map((ind, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-ink-200 bg-base-900/50 border border-base-600/30 p-2.5 rounded-md">
                  <span className="text-signal-green mt-0.5">✓</span>
                  <span className="leading-relaxed">{ind}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contradicting Indicators List */}
        {contradictingIndicators.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono font-semibold text-signal-orange flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle size={14} />
              Contradicting Indicators ({contradictingIndicators.length}):
            </h4>
            <ul className="space-y-1.5 pl-1">
              {contradictingIndicators.map((ind, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-ink-200 bg-signal-orange/10 border border-signal-orange/20 p-2.5 rounded-md">
                  <span className="text-signal-orange mt-0.5">⚠️</span>
                  <span className="leading-relaxed">{ind}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Human Review & Confirmation Section */}
      <div className="mt-6 border-t border-base-600/60 pt-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-ink-100">
              Human Review & Outcome Confirmation
            </h3>
            <p className="text-xs text-ink-500">
              Confirm or override TRIAGENT's automated prediction. Feedback is stored for model evaluation.
            </p>
          </div>

          {/* Current Status Badge (Confirmed vs Overridden) */}
          {currentOutcome && (
            <div>
              {isConfirmed ? (
                <span className="flex items-center gap-1.5 rounded-md border border-signal-green/30 bg-signal-green/10 px-2.5 py-1 font-mono text-xs font-semibold text-signal-green">
                  <CheckCircle2 size={13} />
                  Confirmed: {currentOutcome}
                </span>
              ) : isOverridden ? (
                <span className="flex items-center gap-1.5 rounded-md border border-signal-orange/30 bg-signal-orange/10 px-2.5 py-1 font-mono text-xs font-semibold text-signal-orange">
                  <AlertTriangle size={13} />
                  Overridden: {currentOutcome} (Prediction: {predictedOutcome})
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => handleSave("TRUE_POSITIVE")}
            disabled={isSaving}
            className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all ${
              outcome === "TRUE_POSITIVE"
                ? "border-signal-green bg-signal-green/20 text-signal-green shadow-glow-sm"
                : "border-base-600/60 bg-base-900/60 text-ink-300 hover:border-signal-green/40 hover:text-ink-100"
            }`}
          >
            <CheckCircle2 size={15} />
            <span>Confirm True Positive</span>
          </button>

          <button
            type="button"
            onClick={() => setOutcome("FALSE_POSITIVE")}
            disabled={isSaving}
            className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all ${
              outcome === "FALSE_POSITIVE"
                ? "border-signal-orange bg-signal-orange/20 text-signal-orange shadow-glow-sm"
                : "border-base-600/60 bg-base-900/60 text-ink-300 hover:border-signal-orange/40 hover:text-ink-100"
            }`}
          >
            <XCircle size={15} />
            <span>Mark as False Positive</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave("NEEDS_INVESTIGATION")}
            disabled={isSaving}
            className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all ${
              outcome === "NEEDS_INVESTIGATION"
                ? "border-signal-yellow bg-signal-yellow/20 text-signal-yellow shadow-glow-sm"
                : "border-base-600/60 bg-base-900/60 text-ink-300 hover:border-signal-yellow/40 hover:text-ink-100"
            }`}
          >
            <HelpCircle size={15} />
            <span>Keep as Needs Investigation</span>
          </button>
        </div>

        {/* False Positive Reason Form */}
        {outcome === "FALSE_POSITIVE" && (
          <div className="rounded-lg border border-base-600/50 bg-base-900/60 p-4 space-y-3">
            <label className="block text-xs font-medium text-ink-300">
              Select False Positive Reason:
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

            <button
              type="button"
              onClick={() => handleSave("FALSE_POSITIVE")}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-1.5 rounded-md bg-signal-orange px-4 py-2 text-xs font-semibold text-base-950 shadow-glow transition-opacity hover:opacity-90"
            >
              {isSaving ? "Saving..." : "Save False Positive Feedback"}
            </button>
          </div>
        )}

        {/* Status Messages */}
        {saveSuccess && (
          <p className="text-xs font-medium text-signal-green flex items-center gap-1">
            <CheckCircle2 size={13} />
            Analyst feedback recorded successfully. Saved for model feedback evaluation.
          </p>
        )}
        {errorMessage && (
          <p className="text-xs font-medium text-signal-red flex items-center gap-1">
            <AlertTriangle size={13} />
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
