import { useState } from "react";
import { ChevronDown, ChevronUp, Calculator, HelpCircle, Info } from "lucide-react";
import FactorContribution from "./FactorContribution";
import { FACTORS } from "../utils/priorityEngine";

export default function ScoreBreakdownSection({ incident }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!incident || !incident.contributions) return null;

  // Calculate sum of contributions for verification
  const contributionSum = FACTORS.reduce((sum, f) => {
    return sum + (incident.contributions?.[f.key]?.contribution ?? 0);
  }, 0).toFixed(1);

  return (
    <div className="rounded-xl border border-base-600/60 bg-base-850/60 p-5 sm:p-6 transition-colors">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-cyan/10 text-signal-cyan">
            <HelpCircle size={18} />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-ink-100">
              Why this score? (Score Breakdown)
            </h2>
            <p className="text-xs text-ink-500">
              Calculated dynamically using TRIAGENT's 6-factor weighted scoring formula
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-signal-cyan bg-signal-cyan/10 px-2.5 py-1 rounded border border-signal-cyan/20">
            Score: {incident.score} / 100
          </span>
          <div className="text-ink-400 hover:text-ink-100 transition-colors">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-5 border-t border-base-600/50 pt-5 space-y-5">
          {/* Factor Breakdown Grid */}
          <div className="flex flex-col gap-3">
            {FACTORS.map((f, i) => {
              const c = incident.contributions[f.key];
              if (!c) return null;
              return (
                <FactorContribution
                  key={f.key}
                  keyName={f.key}
                  label={f.label}
                  raw={c.raw}
                  normalized={c.normalized}
                  weightPercent={c.weightPercent}
                  contribution={c.contribution}
                  max={c.max}
                  delay={i * 0.04}
                />
              );
            })}
          </div>

          {/* Formula Sum Verification Box */}
          <div className="rounded-lg border border-signal-blue/30 bg-signal-blue/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-signal-cyan">
              <Calculator size={14} />
              Mathematical Verification (Sum of Contributions)
            </div>
            <p className="mt-2 font-mono text-xs text-ink-100 leading-relaxed">
              {FACTORS.map((f) => incident.contributions[f.key]?.contribution ?? 0).join(" + ")} ={" "}
              <strong className="text-signal-cyan">{contributionSum} pts</strong>
            </p>
            <p className="mt-1 text-[11px] text-ink-400">
              Sum of individual factor contributions equals the final Priority Score ({incident.score}/100).
            </p>
          </div>

          {/* Natural Language Decision Explanation */}
          {incident.explanation && (
            <div className="rounded-lg border border-base-600 bg-base-900/80 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-signal-cyan mb-1.5">
                <Info size={14} />
                Score Explanation
              </div>
              <p className="text-xs leading-relaxed text-ink-200">
                {incident.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
