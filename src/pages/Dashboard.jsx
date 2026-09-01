import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Play,
  ShieldAlert,
  Flame,
  Gauge,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowRight,
  GitCompareArrows,
  CheckCircle2,
} from "lucide-react";
import Topbar from "../components/Topbar";
import MetricCard from "../components/MetricCard";
import PriorityQueue from "../components/PriorityQueue";
import TriageAnimation from "../components/TriageAnimation";
import AddIncidentModal from "../components/AddIncidentModal";
import { useIncidents } from "../context/IncidentsContext";

export default function Dashboard() {
  const {
    incidents,
    incomingIncidents,
    isTriaging,
    runTriage,
    finishTriage,
    addIncident,
    loadDemoIncidents,
  } = useIncidents();
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const critical = incidents.filter((i) => i.level === "CRITICAL").length;
  const high = incidents.filter((i) => i.level === "HIGH").length;

  const handleAdd = (form) => {
    addIncident(form);
    setShowAddModal(false);
  };

  return (
    <>
      <Topbar title="Security Command Center" subtitle="Prioritize. Investigate. Respond." />

      <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div
            onClick={() => navigate("/app/incidents")}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <MetricCard label="Incoming Alerts" value={incomingIncidents.length} accent="#F0C542" icon={AlertCircle} />
          </div>
          <div
            onClick={() => navigate("/app/priority-queue")}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <MetricCard label="Ranked Queue" value={incidents.length} accent="#3DD9E8" icon={Gauge} />
          </div>
          <MetricCard label="Critical Risk" value={critical} accent="#F13F52" icon={Flame} />
          <MetricCard label="High Priority" value={high} accent="#F7943B" icon={ShieldAlert} />
        </div>

        {/* 1. OVERVIEW: INCOMING INCIDENTS SUMMARY */}
        <div className="mt-8 rounded-xl border border-base-600/60 bg-base-850/40 p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-lg font-semibold text-ink-100 sm:text-xl">
                  Incoming Incidents Summary
                </h2>
                <span className="rounded-full border border-signal-yellow/30 bg-signal-yellow/10 px-2.5 py-0.5 font-mono text-xs font-medium text-signal-yellow">
                  Awaiting Triage ({incomingIncidents.length})
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                Raw security alerts queued for TRIAGENT engine normalization and priority scoring
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/app/incidents")}
                className="flex items-center gap-1.5 rounded-md border border-signal-yellow/40 bg-signal-yellow/10 px-3.5 py-2 text-xs font-semibold text-signal-yellow hover:bg-signal-yellow/20 transition-colors"
              >
                View All Incidents ({incomingIncidents.length})
                <ArrowRight size={14} />
              </button>
              <button
                onClick={runTriage}
                disabled={isTriaging || incomingIncidents.length === 0}
                className="flex items-center gap-2 rounded-md bg-signal-blue px-4 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play size={14} strokeWidth={2.5} fill="currentColor" />
                RUN TRIAGE
              </button>
            </div>
          </div>

          {incomingIncidents.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {incomingIncidents.slice(0, 3).map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => navigate("/app/incidents")}
                  className="cursor-pointer flex flex-col justify-between rounded-lg border border-base-600/50 bg-base-800/50 p-4 transition-colors hover:border-signal-yellow/40"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-ink-500">{incident.id}</span>
                      <span className="rounded bg-signal-yellow/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase text-signal-yellow">
                        Awaiting Triage
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-sm font-semibold text-ink-100">
                      {incident.type}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-ink-500">{incident.asset}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-base-600/40 pt-3 text-[11px] text-ink-500">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(incident.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>
                      Sev: <strong className="text-ink-300">{incident.rawFactors?.severity ?? 5}/10</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-base-600/50 py-8 text-center">
              <CheckCircle2 size={28} className="text-signal-cyan/60" />
              <p className="mt-2 text-sm font-medium text-ink-300">All incoming incidents triaged</p>
              <p className="mt-1 text-xs text-ink-500">
                Click <strong>"Load Demo Incidents"</strong> or navigate to <strong>"Incidents"</strong> tab to queue new alerts.
              </p>
            </div>
          )}
        </div>

        {/* 2. OVERVIEW: PRIORITY QUEUE PREVIEW */}
        <div className="mt-9">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-ink-100 sm:text-xl">
                  Priority Queue Overview
                </h2>
                {incidents.length > 0 && (
                  <span className="rounded-full border border-signal-blue/30 bg-signal-blue/10 px-2.5 py-0.5 font-mono text-xs font-medium text-signal-cyan">
                    {incidents.length} Ranked
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-500">
                Top risk threats prioritized by TRIAGENT scoring engine
              </p>
            </div>

            <div className="flex items-center gap-3">
              {incidents.length >= 2 && (
                <button
                  onClick={() => navigate(`/app/compare/${incidents[0].id}/${incidents[1].id}`)}
                  className="flex items-center gap-1.5 rounded-md border border-base-600 bg-base-850 px-3.5 py-2 text-xs font-medium text-ink-300 transition-colors hover:bg-base-800 hover:text-ink-100"
                >
                  <GitCompareArrows size={14} />
                  Why #{incidents[0].rank} outranks #{incidents[1].rank}?
                </button>
              )}
              <button
                onClick={() => navigate("/app/priority-queue")}
                className="flex items-center gap-1.5 rounded-md bg-signal-blue px-4 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:opacity-90"
              >
                View Full Queue ({incidents.length})
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <PriorityQueue
            incidents={incidents.slice(0, 5)}
            onSelect={(incident) => navigate(`/app/incident/${incident.id}`)}
            onCompareTop={() => {
              if (incidents.length >= 2) {
                navigate(`/app/compare/${incidents[0].id}/${incidents[1].id}`);
              }
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {isTriaging && (
          <TriageAnimation
            incidentCount={incomingIncidents.length + incidents.length}
            onComplete={finishTriage}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <AddIncidentModal onClose={() => setShowAddModal(false)} onSubmit={handleAdd} />
        )}
      </AnimatePresence>
    </>
  );
}
