import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Shield, Sliders, Bell, Database, Check } from "lucide-react";

export default function ProfileSettingsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyIncoming, setNotifyIncoming] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-base-600 bg-base-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-600/60 bg-base-850/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-blue/15 text-signal-cyan">
              <User size={18} />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-ink-100">Analyst Profile & Settings</h2>
              <p className="text-xs text-ink-500">SOC Command Center Preferences & Identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-500 hover:bg-base-800 hover:text-ink-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-base-600/40 bg-base-850/30 px-6 font-mono text-xs">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-medium transition-colors ${
              activeTab === "profile"
                ? "border-signal-cyan text-signal-cyan"
                : "border-transparent text-ink-500 hover:text-ink-300"
            }`}
          >
            <User size={13} />
            Analyst Identity
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-medium transition-colors ${
              activeTab === "preferences"
                ? "border-signal-cyan text-signal-cyan"
                : "border-transparent text-ink-500 hover:text-ink-300"
            }`}
          >
            <Sliders size={13} />
            SOC Preferences
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-medium transition-colors ${
              activeTab === "system"
                ? "border-signal-cyan text-signal-cyan"
                : "border-transparent text-ink-500 hover:text-ink-300"
            }`}
          >
            <Database size={13} />
            System Specs
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-base-600/50 bg-base-850/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-blue/20 font-display text-lg font-bold text-signal-cyan ring-2 ring-signal-cyan/40">
                  AR
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-ink-100">Alex Rhodes</h3>
                  <p className="text-xs text-ink-500">Senior SOC Analyst & Triage Lead</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 font-mono text-threat-low">
                      <span className="h-1.5 w-1.5 rounded-full bg-threat-low" />
                      Active on Shift
                    </span>
                    <span className="text-base-500">•</span>
                    <span className="font-mono text-ink-500">Clearance: L5 Top Secret</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-base-600/40 bg-base-850/40 p-3">
                  <span className="text-[10px] uppercase tracking-wider text-ink-500 block">Organization</span>
                  <span className="mt-0.5 font-medium text-ink-100 block truncate">Global Cyber Threat Intel</span>
                </div>
                <div className="rounded-lg border border-base-600/40 bg-base-850/40 p-3">
                  <span className="text-[10px] uppercase tracking-wider text-ink-500 block">Duty Shift</span>
                  <span className="mt-0.5 font-medium text-ink-100 block">08:00 - 16:00 UTC</span>
                </div>
                <div className="rounded-lg border border-base-600/40 bg-base-850/40 p-3">
                  <span className="text-[10px] uppercase tracking-wider text-ink-500 block">Analyst ID</span>
                  <span className="mt-0.5 font-mono text-ink-100 block">ANALYST-8902</span>
                </div>
                <div className="rounded-lg border border-base-600/40 bg-base-850/40 p-3">
                  <span className="text-[10px] uppercase tracking-wider text-ink-500 block">Default View</span>
                  <span className="mt-0.5 font-medium text-ink-100 block">Command Center</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-3.5 text-xs">
              <label className="flex items-center justify-between rounded-lg border border-base-600/40 bg-base-850/40 p-3.5 cursor-pointer">
                <div>
                  <span className="font-medium text-ink-100 block">Auto-Sync Database State</span>
                  <span className="text-ink-500 text-[11px]">Real-time synchronization with Spring Boot SQLite backend</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="h-4 w-4 rounded border-base-600 bg-base-800 text-signal-blue focus:ring-signal-blue"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-base-600/40 bg-base-850/40 p-3.5 cursor-pointer">
                <div>
                  <span className="font-medium text-ink-100 block">Critical Risk Alerts</span>
                  <span className="text-ink-500 text-[11px]">Show notification badge for incidents with Score ≥ 90.0</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyCritical}
                  onChange={(e) => setNotifyCritical(e.target.checked)}
                  className="h-4 w-4 rounded border-base-600 bg-base-800 text-signal-blue focus:ring-signal-blue"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-base-600/40 bg-base-850/40 p-3.5 cursor-pointer">
                <div>
                  <span className="font-medium text-ink-100 block">Incoming Alert Badges</span>
                  <span className="text-ink-500 text-[11px]">Notify when new incidents enter AWAITING_TRIAGE queue</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyIncoming}
                  onChange={(e) => setNotifyIncoming(e.target.checked)}
                  className="h-4 w-4 rounded border-base-600 bg-base-800 text-signal-blue focus:ring-signal-blue"
                />
              </label>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-lg border border-base-600/40 bg-base-850/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Engine Version:</span>
                  <span className="text-signal-cyan font-semibold">TRIAGENT v1.0.0</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-ink-500">Backend Framework:</span>
                  <span className="text-ink-300">Spring Boot 3.3.5 (Java 17+)</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-ink-500">Database Driver:</span>
                  <span className="text-ink-300">SQLite 3.46.0.0 (Persistent)</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-ink-500">Scoring Weights:</span>
                  <span className="text-ink-300">Sev 25% | Imp 20% | Sens 15% | Asset 15% | Conf 15% | Users 10%</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-base-600/50 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-base-600 px-4 py-2 text-xs font-medium text-ink-300 hover:bg-base-800 hover:text-ink-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-signal-blue px-4 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:opacity-90"
            >
              {savedSuccess ? (
                <>
                  <Check size={14} />
                  Preferences Saved
                </>
              ) : (
                "Save Preferences"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
