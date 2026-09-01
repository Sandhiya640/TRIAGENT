import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GitCompareArrows, ShieldAlert, Flame, Gauge, ArrowRight, Play } from "lucide-react";
import Topbar from "../components/Topbar";
import PriorityQueue from "../components/PriorityQueue";
import { useIncidents } from "../context/IncidentsContext";

export default function PriorityQueuePage() {
  const { incidents, incomingIncidents, runTriage } = useIncidents();
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const navigate = useNavigate();

  const investigatingCount = incidents.filter((i) => i.status === "Investigating").length;
  const triagedCount = incidents.filter((i) => i.status === "Triaged").length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;

  const filteredIncidents = useMemo(() => {
    return incidents.filter((i) => {
      const matchStatus =
        filterStatus === "ALL" ||
        (filterStatus === "INVESTIGATING" && i.status === "Investigating") ||
        (filterStatus === "TRIAGED" && i.status === "Triaged") ||
        (filterStatus === "RESOLVED" && i.status === "Resolved");
      const matchLevel = filterLevel === "ALL" || i.level === filterLevel;
      return matchStatus && matchLevel;
    });
  }, [incidents, filterStatus, filterLevel]);

  const criticalCount = incidents.filter((i) => i.level === "CRITICAL").length;
  const highCount = incidents.filter((i) => i.level === "HIGH").length;
  const mediumCount = incidents.filter((i) => i.level === "MEDIUM").length;
  const lowCount = incidents.filter((i) => i.level === "LOW").length;

  return (
    <>
      <Topbar
        title="Priority Queue"
        subtitle="Ranked security alerts driven by TRIAGENT's 6-factor algorithm and 8-level tie-breakers"
      />

      <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
        {/* Header & Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-base-600/60 bg-base-850/40 p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-lg font-semibold text-ink-100 sm:text-xl">
                Triaged Priority Queue
              </h2>
              <span className="rounded-full border border-signal-blue/30 bg-signal-blue/10 px-2.5 py-0.5 font-mono text-xs font-medium text-signal-cyan">
                {incidents.length} Total
              </span>
              {investigatingCount > 0 && (
                <span className="rounded-full border border-signal-yellow/30 bg-signal-yellow/10 px-2.5 py-0.5 font-mono text-xs font-medium text-signal-yellow">
                  {investigatingCount} Investigating
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-ink-500">
              Deterministic queue order: Score (25% Sev, 20% Imp, 15% Sens, 15% Asset, 15% Conf, 10% Users) + Tie-Breakers
            </p>
          </div>

          {incidents.length >= 2 && (
            <button
              onClick={() => navigate(`/app/compare/${incidents[0].id}/${incidents[1].id}`)}
              className="flex items-center gap-2 rounded-lg border border-signal-blue/40 bg-signal-blue/10 px-4 py-2 text-xs font-semibold text-signal-cyan hover:bg-signal-blue/20 transition-colors"
            >
              <GitCompareArrows size={15} />
              Compare Top Threats (#{incidents[0].rank} vs #{incidents[1].rank})
            </button>
          )}
        </div>

        {/* Status & Priority Filter Bar */}
        <div className="mt-6 space-y-3">
          {/* Status Lifecycle Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-base-600/40 pb-3">
            <span className="text-xs font-mono text-ink-500 mr-2">Lifecycle Status:</span>
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`rounded-md px-3 py-1 font-mono text-xs font-medium transition-colors ${
                filterStatus === "ALL"
                  ? "bg-signal-blue text-white"
                  : "bg-base-850/60 text-ink-400 border border-base-600 hover:text-ink-100"
              }`}
            >
              ALL QUEUE ({incidents.length})
            </button>
            <button
              onClick={() => setFilterStatus("INVESTIGATING")}
              className={`rounded-md px-3 py-1 font-mono text-xs font-medium transition-colors ${
                filterStatus === "INVESTIGATING"
                  ? "bg-signal-yellow text-base-950 font-bold"
                  : "bg-base-850/60 text-signal-yellow/80 border border-signal-yellow/30 hover:text-signal-yellow"
              }`}
            >
              INVESTIGATING ({investigatingCount})
            </button>
            <button
              onClick={() => setFilterStatus("TRIAGED")}
              className={`rounded-md px-3 py-1 font-mono text-xs font-medium transition-colors ${
                filterStatus === "TRIAGED"
                  ? "bg-signal-cyan text-base-950 font-bold"
                  : "bg-base-850/60 text-signal-cyan/80 border border-signal-blue/30 hover:text-signal-cyan"
              }`}
            >
              TRIAGED ({triagedCount})
            </button>
            <button
              onClick={() => setFilterStatus("RESOLVED")}
              className={`rounded-md px-3 py-1 font-mono text-xs font-medium transition-colors ${
                filterStatus === "RESOLVED"
                  ? "bg-threat-low text-base-950 font-bold"
                  : "bg-base-850/60 text-threat-low/80 border border-threat-low/30 hover:text-threat-low"
              }`}
            >
              RESOLVED ({resolvedCount})
            </button>
          </div>

          {/* Level Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-mono text-ink-500 mr-2 self-center">Risk Level:</span>
              <button
                onClick={() => setFilterLevel("ALL")}
                className={`rounded-lg px-3.5 py-1 font-mono text-xs font-medium transition-colors ${
                  filterLevel === "ALL"
                    ? "bg-base-700 text-white"
                    : "border border-base-600 bg-base-850/60 text-ink-400 hover:text-ink-100"
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setFilterLevel("CRITICAL")}
                className={`rounded-lg px-3.5 py-1 font-mono text-xs font-medium transition-colors ${
                  filterLevel === "CRITICAL"
                    ? "bg-threat-critical text-white"
                    : "border border-base-600 bg-base-850/60 text-threat-critical/80 hover:text-threat-critical"
                }`}
              >
                CRITICAL ({criticalCount})
              </button>
              <button
                onClick={() => setFilterLevel("HIGH")}
                className={`rounded-lg px-3.5 py-1 font-mono text-xs font-medium transition-colors ${
                  filterLevel === "HIGH"
                    ? "bg-threat-high text-white"
                    : "border border-base-600 bg-base-850/60 text-threat-high/80 hover:text-threat-high"
                }`}
              >
                HIGH ({highCount})
              </button>
              <button
                onClick={() => setFilterLevel("MEDIUM")}
                className={`rounded-lg px-3.5 py-1 font-mono text-xs font-medium transition-colors ${
                  filterLevel === "MEDIUM"
                    ? "bg-threat-medium text-base-950 font-semibold"
                    : "border border-base-600 bg-base-850/60 text-threat-medium/80 hover:text-threat-medium"
                }`}
              >
                MEDIUM ({mediumCount})
              </button>
              <button
                onClick={() => setFilterLevel("LOW")}
                className={`rounded-lg px-3.5 py-1 font-mono text-xs font-medium transition-colors ${
                  filterLevel === "LOW"
                    ? "bg-threat-low text-base-950 font-semibold"
                    : "border border-base-600 bg-base-850/60 text-threat-low/80 hover:text-threat-low"
                }`}
              >
                LOW ({lowCount})
              </button>
            </div>

            <span className="font-mono text-xs text-ink-500">
              Showing {filteredIncidents.length} of {incidents.length} incidents
            </span>
          </div>
        </div>

        {/* Priority Queue List */}
        <div className="mt-6">
          {incidents.length > 0 ? (
            <PriorityQueue
              incidents={filteredIncidents}
              onSelect={(incident) => navigate(`/app/incident/${incident.id}`)}
              onCompareTop={() => {
                if (incidents.length >= 2) {
                  navigate(`/app/compare/${incidents[0].id}/${incidents[1].id}`);
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-base-600/60 bg-base-850/20 py-16 text-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-blue/10 text-signal-cyan">
                <Gauge size={24} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-100">
                Priority Queue Empty
              </h3>
              <p className="mt-1 max-w-md text-xs text-ink-500 leading-relaxed">
                {incomingIncidents.length > 0
                  ? `There are ${incomingIncidents.length} security incidents awaiting triage in the incoming queue.`
                  : "No incidents found in database. Load demo incidents or add manual alerts to begin triage."}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/app/incidents")}
                  className="flex items-center gap-2 rounded-md bg-signal-blue px-4 py-2 text-xs font-semibold text-white shadow-glow hover:opacity-90 transition-opacity"
                >
                  Go to Incoming Incidents Page
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
