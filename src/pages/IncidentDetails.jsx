import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, GitCompareArrows, CircleAlert, Calculator } from "lucide-react";
import Topbar from "../components/Topbar";
import PriorityScore from "../components/PriorityScore";
import PriorityBadge from "../components/PriorityBadge";
import FactorContribution from "../components/FactorContribution";
import { useIncidents } from "../context/IncidentsContext";
import { FACTORS, explainRanking, riskTags } from "../utils/priorityEngine";

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { incidents, getIncident, markInvestigating } = useIncidents();
  const incident = getIncident(id);

  if (!incident) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-ink-500">
        <p>Incident not found.</p>
        <button onClick={() => navigate("/app")} className="text-signal-cyan">
          Back to Command Center
        </button>
      </div>
    );
  }

  const neighborIndex = incidents.findIndex((i) => i.id === incident.id);
  const compareTarget =
    neighborIndex >= 0
      ? incidents[neighborIndex + 1] || incidents[neighborIndex - 1] || null
      : incidents[0] || null;

  const explanation = explainRanking(incident);
  const tags = riskTags(incident.contributions);

  // Compute exact contribution sum
  const contributionSum = FACTORS.reduce((sum, f) => {
    return sum + (incident.contributions?.[f.key]?.contribution ?? 0);
  }, 0).toFixed(1);

  return (
    <>
      <Topbar title="Incident Investigation" subtitle="Full breakdown of TRIAGENT's ranking decision" />

      <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-100"
        >
          <ArrowLeft size={15} />
          Back to Priority Queue
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.35fr]">
          {/* Left: identity + score */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-base-600/60 bg-base-850/60 p-6">
              <div className="flex items-center gap-2 font-mono text-xs text-ink-500">
                {incident.id}
                {incident.rank && (
                  <>
                    <span className="text-base-500">·</span>
                    <span>Rank #{incident.rank}</span>
                  </>
                )}
              </div>
              <h1 className="mt-2 font-display text-2xl font-semibold text-ink-100">
                {incident.type}
              </h1>
              <p className="mt-1 text-sm text-ink-500">{incident.asset}</p>

              <div className="mt-6 flex items-center gap-6">
                <PriorityScore score={incident.score} level={incident.level} size={140} />
                <div className="flex flex-col gap-2">
                  <PriorityBadge level={incident.level} />
                  <span className="text-xs text-ink-500">
                    Status: <span className="text-ink-300 font-medium">{incident.status}</span>
                  </span>
                  <span className="text-xs text-ink-500">
                    {(Number(incident.affectedUsersCount) || 0).toLocaleString()} users potentially affected
                  </span>
                </div>
              </div>

              <p className="mt-6 border-t border-base-600/50 pt-5 text-sm leading-relaxed text-ink-300">
                {incident.description}
              </p>
            </div>

            <div className="rounded-xl border border-signal-blue/25 bg-signal-blue/[0.05] p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-signal-cyan">
                <ShieldCheck size={16} />
                Recommended Action
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-100">
                {incident.recommendedAction}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => markInvestigating(incident.id)}
                  className="rounded-md bg-signal-blue px-4 py-2 text-sm font-semibold text-white shadow-glow transition-opacity hover:opacity-90"
                >
                  Mark as Investigating
                </button>
                {compareTarget && compareTarget.id !== incident.id && (
                  <button
                    onClick={() => {
                      const [top, bottom] =
                        (incident.rank || 99) < (compareTarget.rank || 99)
                          ? [incident, compareTarget]
                          : [compareTarget, incident];
                      navigate(`/app/compare/${top.id}/${bottom.id}`);
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-base-600 px-4 py-2 text-sm font-medium text-ink-300 transition-colors hover:bg-base-800 hover:text-ink-100"
                  >
                    <GitCompareArrows size={14} />
                    View Comparison
                  </button>
                )}
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 rounded-full border border-base-600 bg-base-800/60 px-3 py-1.5 text-xs text-ink-300"
                  >
                    <CircleAlert size={12} className="text-signal-cyan" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: factor breakdown + math verification */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-base-600/60 bg-base-850/60 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-semibold text-ink-100">
                    Weighted Factor Breakdown
                  </h2>
                  <p className="text-xs text-ink-500">
                    Raw Value → Normalized (0–100) → Fixed Weight → Contribution
                  </p>
                </div>
                <span className="font-mono text-xs text-signal-cyan">Total: {incident.score} pts</span>
              </div>

              <div className="flex flex-col gap-3">
                {FACTORS.map((f, i) => {
                  const c = incident.contributions[f.key];
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
                      delay={i * 0.05}
                    />
                  );
                })}
              </div>

              {/* Formula Sum Box */}
              <div className="mt-5 rounded-lg border border-signal-blue/30 bg-signal-blue/10 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-signal-cyan">
                  <Calculator size={14} />
                  Mathematical Verification
                </div>
                <p className="mt-1.5 font-mono text-xs text-ink-100">
                  {FACTORS.map((f) => incident.contributions[f.key]?.contribution ?? 0).join(" + ")} ={" "}
                  <strong className="text-signal-cyan">{contributionSum} pts</strong>
                </p>
                <p className="mt-1 text-[11px] text-ink-400">
                  Sum of all weighted factor contributions equals the final Priority Score ({incident.score}).
                </p>
              </div>
            </div>

            {/* Explanation box */}
            <div className="rounded-xl border border-base-600/60 bg-gradient-to-br from-signal-blue/[0.08] to-transparent p-6">
              <h2 className="font-display text-sm font-semibold text-signal-cyan">
                TRIAGENT Decision Explanation
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-100">{explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
