import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Play, RefreshCw, AlertCircle, Clock, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import TriageAnimation from "../components/TriageAnimation";
import AddIncidentModal from "../components/AddIncidentModal";
import { useIncidents } from "../context/IncidentsContext";

export default function IncidentsPage() {
  const {
    incomingIncidents,
    incidents,
    isTriaging,
    runTriage,
    finishTriage,
    addIncident,
    loadDemoIncidents,
  } = useIncidents();
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const handleAdd = (form) => {
    addIncident(form);
    setShowAddModal(false);
  };

  return (
    <>
      <Topbar
        title="Incoming Incidents"
        subtitle="Raw security alerts queued for TRIAGENT engine normalization and priority scoring"
      />

      <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
        {/* Top Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-base-600/60 bg-base-850/40 p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-lg font-semibold text-ink-100 sm:text-xl">
                Awaiting Triage Queue
              </h2>
              <span className="rounded-full border border-signal-yellow/30 bg-signal-yellow/10 px-2.5 py-0.5 font-mono text-xs font-medium text-signal-yellow">
                {incomingIncidents.length} Pending
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              Security alerts ingested into SQLite persistent store awaiting batch triage execution
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadDemoIncidents}
              className="flex items-center gap-1.5 rounded-md border border-base-600 px-3.5 py-2 text-sm font-medium text-ink-300 transition-colors hover:bg-base-800 hover:text-ink-100"
            >
              <RefreshCw size={14} />
              Load Demo Incidents
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-md border border-base-600 px-3.5 py-2 text-sm font-medium text-ink-300 transition-colors hover:bg-base-800 hover:text-ink-100"
            >
              <Plus size={15} strokeWidth={2.25} />
              Add Incident Manually
            </button>
            <button
              onClick={runTriage}
              disabled={isTriaging || incomingIncidents.length === 0}
              className="flex items-center gap-2 rounded-md bg-signal-blue px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play size={14} strokeWidth={2.5} fill="currentColor" />
              RUN TRIAGE
            </button>
          </div>
        </div>

        {/* Incidents Grid */}
        <div className="mt-8">
          {incomingIncidents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {incomingIncidents.map((incident) => (
                  <motion.div
                    key={incident.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col justify-between rounded-xl border border-base-600/50 bg-base-850/60 p-5 transition-colors hover:border-signal-yellow/40"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-ink-500">{incident.id}</span>
                        <span className="rounded bg-signal-yellow/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase text-signal-yellow border border-signal-yellow/20">
                          Awaiting Triage
                        </span>
                      </div>
                      <h3 className="mt-2.5 font-display text-base font-semibold text-ink-100">
                        {incident.type}
                      </h3>
                      <p className="mt-1 truncate text-xs text-ink-500">{incident.asset}</p>
                      <p className="mt-3 text-xs leading-relaxed text-ink-300 line-clamp-2">
                        {incident.description}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-base-600/40 pt-3">
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-ink-400">
                        <div>
                          Sev: <strong className="text-ink-200">{incident.rawFactors?.severity ?? 5}/10</strong>
                        </div>
                        <div>
                          Impact: <strong className="text-ink-200">{incident.rawFactors?.businessImpact ?? 5}/10</strong>
                        </div>
                        <div>
                          Sens: <strong className="text-ink-200">{incident.rawFactors?.dataSensitivity ?? 5}/10</strong>
                        </div>
                        <div>
                          Users: <strong className="text-ink-200">{Number(incident.affectedUsersCount || 0).toLocaleString()}</strong>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-ink-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(incident.detectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-signal-cyan font-medium">Raw Alert Data</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-base-600/60 bg-base-850/20 py-16 text-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-cyan/10 text-signal-cyan">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-100">
                All Incoming Incidents Triaged
              </h3>
              <p className="mt-1 max-w-md text-xs text-ink-500 leading-relaxed">
                There are currently no raw alerts waiting in the incoming queue. All incidents have been processed and placed into the Priority Queue.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={loadDemoIncidents}
                  className="flex items-center gap-1.5 rounded-md border border-base-600 bg-base-800 px-4 py-2 text-xs font-semibold text-ink-100 hover:bg-base-700 transition-colors"
                >
                  <RefreshCw size={14} />
                  Load Demo Incidents
                </button>
                <button
                  onClick={() => navigate("/app/priority-queue")}
                  className="flex items-center gap-1.5 rounded-md bg-signal-blue px-4 py-2 text-xs font-semibold text-white shadow-glow hover:opacity-90 transition-opacity"
                >
                  View Ranked Priority Queue ({incidents.length})
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Triage Animation & Add Modal */}
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
