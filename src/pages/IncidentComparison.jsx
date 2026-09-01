import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, TrendingUp, Sparkles, Scale } from "lucide-react";
import Topbar from "../components/Topbar";
import PriorityBadge from "../components/PriorityBadge";
import { useIncidents } from "../context/IncidentsContext";
import { FACTORS, explainComparison } from "../utils/priorityEngine";
import { api } from "../services/api";

export default function IncidentComparison() {
  const { idA, idB } = useParams();
  const navigate = useNavigate();
  const { getIncident } = useIncidents();
  const [showCalc, setShowCalc] = useState(true);
  const [backendComparison, setBackendComparison] = useState(null);

  useEffect(() => {
    if (idA && idB) {
      api.compareIncidents(idA, idB)
        .then((res) => setBackendComparison(res))
        .catch((err) => console.warn("[TRIAGENT API] Comparison fetch fallback:", err));
    }
  }, [idA, idB]);

  const first = getIncident(idA) || backendComparison?.incidentA;
  const second = getIncident(idB) || backendComparison?.incidentB;

  if (!first || !second) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-ink-500">
        <p>Loading comparison from TRIAGENT backend...</p>
        <button onClick={() => navigate("/app")} className="text-signal-cyan font-medium">
          Back to Command Center
        </button>
      </div>
    );
  }

  // Ensure first is higher ranked / higher score than second
  const [incidentA, incidentB] =
    (first.rank || 0) <= (second.rank || 0) ? [first, second] : [second, first];

  const diffs = FACTORS.map((f) => {
    const c1 = incidentA.contributions[f.key] || { normalized: 0, contribution: 0, weightPercent: 0 };
    const c2 = incidentB.contributions[f.key] || { normalized: 0, contribution: 0, weightPercent: 0 };
    const normDiff = c1.normalized - c2.normalized;
    const contribDiff = Math.round((c1.contribution - c2.contribution) * 10) / 10;
    return {
      ...f,
      c1,
      c2,
      normDiff,
      contribDiff,
    };
  });

  const advantages = diffs.filter((d) => d.contribDiff > 0).sort((a, b) => b.contribDiff - a.contribDiff);
  const explanation = backendComparison?.explanation || explainComparison(incidentA, incidentB);

  return (
    <>
      <Topbar title="Explainable Comparison" subtitle="TRIAGENT's prioritization decision, broken down" />

      <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-100"
        >
          <ArrowLeft size={15} />
          Back to Priority Queue
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-signal-blue/10 text-signal-cyan">
            <Scale size={20} />
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink-100 sm:text-3xl">
            Why does #{incidentA.rank || 1} outrank #{incidentB.rank || 2}?
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Deterministic factor-by-factor comparison generated directly from score calculations
          </p>
        </div>

        {/* Incidents VS Header Card */}
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-xl border border-base-600/60 bg-base-850/60 p-6">
          <IncidentSummary incident={incidentA} align="right" />
          <div className="flex flex-col items-center gap-1">
            <span className="rounded-full bg-base-700 px-3 py-1 font-mono text-xs font-semibold text-signal-cyan">
              +{Math.round((incidentA.score - incidentB.score) * 10) / 10} pts
            </span>
            <span className="font-display text-[10px] font-semibold tracking-widest text-ink-700">VS</span>
          </div>
          <IncidentSummary incident={incidentB} align="left" />
        </div>

        {/* Explainable Decision Card */}
        <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-signal-blue/30 bg-gradient-to-br from-signal-blue/[0.1] to-transparent p-6 shadow-glow">
          <div className="flex items-center gap-2 text-sm font-semibold text-signal-cyan">
            <Sparkles size={16} />
            TRIAGENT Deterministic Explanation
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-100">{explanation}</p>
        </div>

        {/* Detailed Comparison Table */}
        <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-base-600/60 bg-base-850/50 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-100">
              Factor-by-Factor Metric Breakdown
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-signal-cyan">#{incidentA.rank} {incidentA.id}</span>
              <span className="text-ink-500">vs</span>
              <span className="text-ink-300">#{incidentB.rank} {incidentB.id}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {diffs.map((d) => {
              const isAdvantage = d.contribDiff > 0;
              const isDisadvantage = d.contribDiff < 0;
              return (
                <div
                  key={d.key}
                  className={`rounded-lg border p-4 transition-colors ${
                    isAdvantage
                      ? "border-signal-blue/40 bg-signal-blue/[0.04]"
                      : "border-base-600/40 bg-base-800/30"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-display text-sm font-semibold text-ink-100">{d.label}</span>
                      <span className="ml-2 font-mono text-xs text-ink-500">
                        (Weight: {d.c1.weightPercent}%)
                      </span>
                    </div>
                    <div className="font-mono text-xs">
                      {isAdvantage ? (
                        <span className="rounded bg-signal-blue/20 px-2 py-0.5 font-semibold text-signal-cyan">
                          #{incidentA.rank} Advantage: +{d.contribDiff} pts
                        </span>
                      ) : isDisadvantage ? (
                        <span className="rounded bg-base-700 px-2 py-0.5 font-medium text-ink-300">
                          #{incidentB.rank} Advantage: +{Math.abs(d.contribDiff)} pts
                        </span>
                      ) : (
                        <span className="text-ink-500">Equal Contribution</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-4 rounded bg-base-850 p-3 text-xs font-mono">
                    <div>
                      <div className="text-[10px] uppercase text-ink-500">#{incidentA.rank} ({incidentA.id})</div>
                      <div className="mt-0.5 text-ink-100">
                        Normalized: <strong className="text-signal-cyan">{d.c1.normalized}/100</strong> → Contrib:{" "}
                        <strong className="text-signal-blue">{d.c1.contribution} pts</strong>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-ink-500">#{incidentB.rank} ({incidentB.id})</div>
                      <div className="mt-0.5 text-ink-300">
                        Normalized: <strong>{d.c2.normalized}/100</strong> → Contrib:{" "}
                        <strong>{d.c2.contribution} pts</strong>
                      </div>
                    </div>
                  </div>

                  {/* Visual Bar Comparison */}
                  <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-base-700">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-ink-500/40"
                      style={{ width: `${d.c2.normalized}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-signal-cyan"
                      style={{ width: `${d.c1.normalized}%`, opacity: 0.85 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {advantages.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-base-600/50 pt-5">
              {advantages.map((d) => (
                <span
                  key={d.key}
                  className="flex items-center gap-1.5 rounded-full border border-signal-blue/30 bg-signal-blue/[0.08] px-3 py-1.5 text-xs font-medium text-signal-cyan"
                >
                  <TrendingUp size={12} />
                  #{incidentA.rank} Advantage · +{d.contribDiff} pts ({d.label})
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Calculation Table Accordion */}
        <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-base-600/60 bg-base-850/40">
          <button
            onClick={() => setShowCalc((s) => !s)}
            className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-ink-100"
          >
            Full Mathematical Calculation Matrix
            <ChevronDown
              size={16}
              className={`text-ink-500 transition-transform ${showCalc ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {showCalc && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-6 px-6 pb-6 sm:grid-cols-2">
                  <CalcColumn label={`Incident #${incidentA.rank} (${incidentA.id})`} incident={incidentA} />
                  <CalcColumn label={`Incident #${incidentB.rank} (${incidentB.id})`} incident={incidentB} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function IncidentSummary({ incident, align }) {
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
      <span className="font-mono text-xs text-ink-500">
        #{incident.rank || "?"} · {incident.id}
      </span>
      <h3 className="mt-1 font-display text-lg font-semibold text-ink-100">{incident.type}</h3>
      <p className="text-xs text-ink-500">{incident.asset}</p>
      <div className="mt-2.5 flex items-center gap-2">
        <span className="font-mono text-2xl font-bold text-ink-100">{incident.score}</span>
        <PriorityBadge level={incident.level} size="sm" />
      </div>
    </div>
  );
}

function CalcColumn({ label, incident }) {
  return (
    <div>
      <p className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-500">{label}</p>
      <div className="flex flex-col gap-2">
        {FACTORS.map((f) => {
          const c = incident.contributions[f.key];
          return (
            <div key={f.key} className="flex items-center justify-between font-mono text-xs">
              <span className="text-ink-500">{f.label} ({c.weightPercent}%)</span>
              <span className="text-ink-300">
                {c.normalized} × {c.weight} = <span className="text-signal-cyan font-semibold">{c.contribution}</span>
              </span>
            </div>
          );
        })}
        <div className="mt-2 flex items-center justify-between border-t border-base-600/50 pt-2 font-mono text-xs">
          <span className="text-ink-300 font-semibold">Final Priority Score</span>
          <span className="font-bold text-signal-cyan">{incident.score} / 100</span>
        </div>
      </div>
    </div>
  );
}

