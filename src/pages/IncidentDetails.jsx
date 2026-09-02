import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, GitCompareArrows, CircleAlert } from "lucide-react";
import Topbar from "../components/Topbar";
import PriorityScore from "../components/PriorityScore";
import PriorityBadge from "../components/PriorityBadge";
import ScoreBreakdownSection from "../components/ScoreBreakdownSection";
import SlaTrackingCard from "../components/SlaTrackingCard";
import RecommendedActionsSection from "../components/RecommendedActionsSection";
import AnalystFeedbackCard from "../components/AnalystFeedbackCard";
import { useIncidents } from "../context/IncidentsContext";
import { riskTags } from "../utils/priorityEngine";
import { api } from "../services/api";

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    incidents,
    getIncident,
    updateStatus,
    updateFeedback,
    markInvestigating,
    markResolved,
    isLoading: contextLoading,
  } = useIncidents();

  const [fetchedIncident, setFetchedIncident] = useState(null);
  const [loading, setLoading] = useState(false);

  const contextIncident = getIncident(id);
  const incident = contextIncident || fetchedIncident;

  useEffect(() => {
    if (!contextIncident && id) {
      setLoading(true);
      api
        .getIncidentDetails(id)
        .then((res) => setFetchedIncident(res))
        .catch((err) => console.warn("[TRIAGENT API] Incident details fetch fallback failed:", err))
        .finally(() => setLoading(false));
    }
  }, [contextIncident, id]);

  if (!incident) {
    if (contextLoading || loading) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-ink-500">
          <p>Loading incident details from backend...</p>
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-ink-500">
        <p>Incident not found.</p>
        <button onClick={() => navigate("/app")} className="text-signal-cyan font-medium">
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

  const tags = riskTags(incident.contributions);

  return (
    <>
      <Topbar title="Incident Investigation" subtitle="Full breakdown of TRIAGENT's ranking decision, SLA, playbooks & feedback" />

      <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-100"
        >
          <ArrowLeft size={15} />
          Back to Priority Queue
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Overview, Actions, SLA, Feedback */}
          <div className="flex flex-col gap-6">
            {/* Identity & Overview Card */}
            <div className="rounded-xl border border-base-600/60 bg-base-850/60 p-6">
              <div className="flex items-center justify-between font-mono text-xs text-ink-500">
                <span className="text-signal-cyan font-bold">{incident.id}</span>
                {incident.rank && <span>Queue Rank #{incident.rank}</span>}
              </div>
              <h1 className="mt-2 font-display text-2xl font-semibold text-ink-100">
                {incident.type}
              </h1>
              <p className="mt-1 text-sm text-ink-500">{incident.asset}</p>

              <div className="mt-6 flex items-center gap-6">
                <PriorityScore score={incident.score} level={incident.level} size={130} />
                <div className="flex flex-col gap-2">
                  <PriorityBadge level={incident.level} />
                  <span className="text-xs text-ink-500">
                    Workflow Status: <strong className="text-ink-200 font-medium">{incident.status}</strong>
                  </span>
                  <span className="text-xs text-ink-500">
                    {(Number(incident.affectedUsersCount) || 0).toLocaleString()} users potentially affected
                  </span>
                </div>
              </div>

              <p className="mt-6 border-t border-base-600/50 pt-5 text-sm leading-relaxed text-ink-300">
                {incident.description}
              </p>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap gap-3 border-t border-base-600/40 pt-4">
                {incident.status !== "Investigating" && incident.status !== "Resolved" && (
                  <button
                    onClick={() => markInvestigating(incident.id)}
                    className="rounded-md bg-signal-blue px-4 py-2 text-xs font-semibold text-white shadow-glow transition-opacity hover:opacity-90"
                  >
                    Mark as Investigating
                  </button>
                )}

                {incident.status === "Investigating" && (
                  <>
                    <button
                      onClick={() => markResolved(incident.id)}
                      className="rounded-md bg-threat-low px-4 py-2 text-xs font-semibold text-base-950 transition-opacity hover:opacity-90"
                    >
                      Mark as Resolved
                    </button>
                    <button
                      onClick={() => updateStatus(incident.id, "TRIAGED")}
                      className="rounded-md border border-base-600 px-4 py-2 text-xs font-medium text-ink-300 transition-colors hover:bg-base-800 hover:text-ink-100"
                    >
                      Revert to Triaged
                    </button>
                  </>
                )}

                {incident.status === "Resolved" && (
                  <>
                    <button
                      onClick={() => markInvestigating(incident.id)}
                      className="rounded-md bg-signal-blue px-4 py-2 text-xs font-semibold text-white shadow-glow transition-opacity hover:opacity-90"
                    >
                      Reopen Investigation
                    </button>
                    <button
                      onClick={() => updateStatus(incident.id, "TRIAGED")}
                      className="rounded-md border border-base-600 px-4 py-2 text-xs font-medium text-ink-300 transition-colors hover:bg-base-800 hover:text-ink-100"
                    >
                      Revert to Triaged
                    </button>
                  </>
                )}

                {compareTarget && compareTarget.id !== incident.id && (
                  <button
                    onClick={() => {
                      const [top, bottom] =
                        (incident.rank || 99) < (compareTarget.rank || 99)
                          ? [incident, compareTarget]
                          : [compareTarget, incident];
                      navigate(`/app/compare/${top.id}/${bottom.id}`);
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-base-600 px-4 py-2 text-xs font-medium text-ink-300 transition-colors hover:bg-base-800 hover:text-ink-100"
                  >
                    <GitCompareArrows size={14} />
                    View Comparison
                  </button>
                )}
              </div>

              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 pt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 rounded-full border border-base-600 bg-base-800/60 px-3 py-1 text-[11px] text-ink-300"
                    >
                      <CircleAlert size={12} className="text-signal-cyan" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Feature 4: Resolution & SLA Tracking Card */}
            <SlaTrackingCard incident={incident} />

            {/* Feature 2: Analyst Feedback / Investigation Outcome */}
            <AnalystFeedbackCard incident={incident} updateFeedback={updateFeedback} />
          </div>

          {/* Right Column: Score Breakdown & Recommended Actions */}
          <div className="flex flex-col gap-6">
            {/* Feature 1: Explainable Score Breakdown */}
            <ScoreBreakdownSection incident={incident} />

            {/* Feature 3: Automated Response Recommendations */}
            <RecommendedActionsSection incident={incident} />
          </div>
        </div>
      </div>
    </>
  );
}
