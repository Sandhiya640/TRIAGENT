import { useState } from "react";
import { Sliders, Bell, Database, RefreshCw, Check, ShieldCheck, Monitor, Info, Layers } from "lucide-react";
import Topbar from "../components/Topbar";
import { useIncidents } from "../context/IncidentsContext";

export default function SettingsPage() {
  const { loadDemoIncidents } = useIncidents();
  const [autoSync, setAutoSync] = useState(true);
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyIncoming, setNotifyIncoming] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [layoutMode, setLayoutMode] = useState("detailed");
  const [defaultLanding, setDefaultLanding] = useState("overview");

  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetDemoData = async () => {
    try {
      setResetting(true);
      await loadDemoIncidents();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err) {
      console.error("Error resetting demo data:", err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <Topbar title="Application Settings" subtitle="SOC Command Center Preferences & System Configuration" />

      <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8 max-w-5xl">
        {/* Notification Banner */}
        {resetSuccess && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-threat-low/40 bg-threat-low/10 p-4 text-xs font-semibold text-threat-low">
            <Check size={16} />
            Demo dataset reloaded successfully from Spring Boot SQLite persistent database!
          </div>
        )}

        <div className="space-y-8">
          {/* 1. NOTIFICATION PREFERENCES */}
          <div className="rounded-xl border border-base-600/60 bg-base-850/50 p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-blue/15 text-signal-cyan">
                <Bell size={18} />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink-100">
                  Notification & Alert Preferences
                </h2>
                <p className="text-xs text-ink-500">Manage how threat notifications appear across the SOC UI</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <label className="flex items-center justify-between rounded-lg border border-base-600/40 bg-base-900/40 p-4 cursor-pointer hover:border-base-600">
                <div>
                  <span className="font-semibold text-ink-100 block">Critical Risk Alerts</span>
                  <span className="text-ink-500 text-[11px]">Flag notifications immediately for incidents with Score ≥ 90.0</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyCritical}
                  onChange={(e) => setNotifyCritical(e.target.checked)}
                  className="h-4 w-4 rounded border-base-600 bg-base-800 text-signal-blue focus:ring-signal-blue"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-base-600/40 bg-base-900/40 p-4 cursor-pointer hover:border-base-600">
                <div>
                  <span className="font-semibold text-ink-100 block">Incoming Alert Queue Badges</span>
                  <span className="text-ink-500 text-[11px]">Display unread count badges when new alerts enter AWAITING_TRIAGE queue</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyIncoming}
                  onChange={(e) => setNotifyIncoming(e.target.checked)}
                  className="h-4 w-4 rounded border-base-600 bg-base-800 text-signal-blue focus:ring-signal-blue"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-base-600/40 bg-base-900/40 p-4 cursor-pointer hover:border-base-600">
                <div>
                  <span className="font-semibold text-ink-100 block">Audio / Visual Cues</span>
                  <span className="text-ink-500 text-[11px]">Play subtle sound indicator on critical triage rank changes</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-base-600 bg-base-800 text-signal-blue focus:ring-signal-blue"
                />
              </label>
            </div>
          </div>

          {/* 2. COMMAND CENTER DISPLAY PREFERENCES */}
          <div className="rounded-xl border border-base-600/60 bg-base-850/50 p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-blue/15 text-signal-cyan">
                <Monitor size={18} />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-ink-100">
                  Command Center Display Preferences
                </h2>
                <p className="text-xs text-ink-500">Configure default views and data synchronization</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-center justify-between rounded-lg border border-base-600/40 bg-base-900/40 p-4 cursor-pointer hover:border-base-600">
                <div>
                  <span className="font-semibold text-ink-100 block">Auto-Sync Database State</span>
                  <span className="text-ink-500 text-[11px]">Automatically poll Spring Boot REST API for incoming security alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="h-4 w-4 rounded border-base-600 bg-base-800 text-signal-blue focus:ring-signal-blue"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-base-600/40 bg-base-900/40 p-4">
                  <label className="font-semibold text-ink-100 block mb-1">Queue Card Density</label>
                  <p className="text-[11px] text-ink-500 mb-3">Card layout detail on Priority Queue view</p>
                  <select
                    value={layoutMode}
                    onChange={(e) => setLayoutMode(e.target.value)}
                    className="w-full rounded-md border border-base-600 bg-base-800 px-3 py-2 text-xs text-ink-100 focus:outline-none"
                  >
                    <option value="detailed">Detailed (With Factor Bars & Tags)</option>
                    <option value="compact">Compact (Minimal Rows)</option>
                  </select>
                </div>

                <div className="rounded-lg border border-base-600/40 bg-base-900/40 p-4">
                  <label className="font-semibold text-ink-100 block mb-1">Default Command Route</label>
                  <p className="text-[11px] text-ink-500 mb-3">Initial route opened on app launch</p>
                  <select
                    value={defaultLanding}
                    onChange={(e) => setDefaultLanding(e.target.value)}
                    className="w-full rounded-md border border-base-600 bg-base-800 px-3 py-2 text-xs text-ink-100 focus:outline-none"
                  >
                    <option value="overview">Overview (/app)</option>
                    <option value="incidents">Incoming Incidents (/app/incidents)</option>
                    <option value="priority-queue">Priority Queue (/app/priority-queue)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SCORING ENGINE MODEL POLICY OVERVIEW */}
          <div className="rounded-xl border border-base-600/60 bg-base-850/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-blue/15 text-signal-cyan">
                  <Layers size={18} />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-ink-100">
                    TRIAGENT Scoring Formula Weights
                  </h2>
                  <p className="text-xs text-ink-500">Fixed scoring weights defined by SOC triage policy</p>
                </div>
              </div>
              <span className="font-mono text-xs text-threat-low font-semibold flex items-center gap-1">
                <ShieldCheck size={14} /> Governance Locked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono sm:grid-cols-3">
              <div className="rounded-lg border border-base-600/40 bg-base-900/40 p-3">
                <span className="text-ink-500 text-[10px] uppercase">Severity</span>
                <div className="text-signal-cyan font-bold mt-0.5">25% (0.25)</div>
              </div>
              <div className="rounded-lg border border-base-600/40 bg-base-900/40 p-3">
                <span className="text-ink-500 text-[10px] uppercase">Business Impact</span>
                <div className="text-signal-cyan font-bold mt-0.5">20% (0.20)</div>
              </div>
              <div className="rounded-lg border border-base-600/40 bg-base-900/40 p-3">
                <span className="text-ink-500 text-[10px] uppercase">Data Sensitivity</span>
                <div className="text-signal-cyan font-bold mt-0.5">15% (0.15)</div>
              </div>
              <div className="rounded-lg border border-base-600/40 bg-base-900/40 p-3">
                <span className="text-ink-500 text-[10px] uppercase">Asset Importance</span>
                <div className="text-signal-cyan font-bold mt-0.5">15% (0.15)</div>
              </div>
              <div className="rounded-lg border border-base-600/40 bg-base-900/40 p-3">
                <span className="text-ink-500 text-[10px] uppercase">Attack Confidence</span>
                <div className="text-signal-cyan font-bold mt-0.5">15% (0.15)</div>
              </div>
              <div className="rounded-lg border border-base-600/40 bg-base-900/40 p-3">
                <span className="text-ink-500 text-[10px] uppercase">Affected Users</span>
                <div className="text-signal-cyan font-bold mt-0.5">10% (0.10)</div>
              </div>
            </div>
          </div>

          {/* 4. DATA MANAGEMENT & DATABASE STATUS */}
          <div className="rounded-xl border border-base-600/60 bg-base-850/50 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-blue/15 text-signal-cyan">
                  <Database size={18} />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-ink-100">
                    Application Data Management
                  </h2>
                  <p className="text-xs text-ink-500">Persistent SQLite database and API endpoints</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-base-600/40 bg-base-900/40 p-4">
              <div>
                <h3 className="font-display text-sm font-semibold text-ink-100">Reset Demo Incidents Dataset</h3>
                <p className="text-xs text-ink-500 mt-0.5">
                  Reloads the 12 seed cybersecurity incidents into the persistent SQLite database (`/api/incidents/demo`).
                </p>
              </div>

              <button
                onClick={handleResetDemoData}
                disabled={resetting}
                className="flex items-center gap-2 rounded-lg border border-base-600 bg-base-800 px-4 py-2 text-xs font-semibold text-ink-100 hover:bg-base-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={resetting ? "animate-spin" : ""} />
                {resetting ? "Reloading Demo Data..." : "Reset Application Data"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs font-mono text-ink-400">
              <div className="rounded-lg border border-base-600/30 bg-base-900/30 p-3">
                <span className="text-[10px] text-ink-500 uppercase block">Database Engine</span>
                <span className="text-ink-200">SQLite 3 (File: `./data/triagent.db`)</span>
              </div>
              <div className="rounded-lg border border-base-600/30 bg-base-900/30 p-3">
                <span className="text-[10px] text-ink-500 uppercase block">REST API Proxy Target</span>
                <span className="text-ink-200">`/api` → `http://localhost:8080`</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
