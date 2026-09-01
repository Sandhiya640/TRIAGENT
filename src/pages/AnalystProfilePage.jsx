import { useMemo } from "react";
import { User, Shield, Clock, Flame, ShieldAlert, CheckCircle2, Activity, Award, Mail, Building, Key } from "lucide-react";
import Topbar from "../components/Topbar";
import MetricCard from "../components/MetricCard";
import PriorityBadge from "../components/PriorityBadge";
import { useIncidents } from "../context/IncidentsContext";

export default function AnalystProfilePage() {
  const { incidents = [], incomingIncidents = [] } = useIncidents();

  const criticalCount = incidents.filter((i) => i.level === "CRITICAL").length;
  const highCount = incidents.filter((i) => i.level === "HIGH").length;
  const avgScore =
    incidents.length > 0
      ? (incidents.reduce((sum, i) => sum + i.score, 0) / incidents.length).toFixed(1)
      : "0.0";

  return (
    <>
      <Topbar title="Analyst Profile" subtitle="SOC Duty Shift & Security Credentials" />

      <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
        {/* Analyst Identity Card */}
        <div className="rounded-xl border border-base-600/60 bg-base-850/50 p-6 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-signal-blue/20 font-display text-2xl font-bold text-signal-cyan ring-2 ring-signal-cyan/40 shadow-glow">
                AR
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-2xl font-bold text-ink-100">Alex Rhodes</h1>
                  <span className="rounded-full border border-threat-low/30 bg-threat-low/10 px-3 py-0.5 font-mono text-xs font-semibold text-threat-low">
                    Active on Shift
                  </span>
                </div>
                <p className="mt-1 font-medium text-sm text-ink-400">Senior SOC Analyst & Triage Lead</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-signal-cyan" />
                    a.rhodes@secops.triagent.io
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building size={14} className="text-signal-blue" />
                    Global Threat Intelligence Unit
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Key size={14} className="text-threat-low" />
                    Level 5 Clearance (L5 Top Secret)
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-base-600/50 bg-base-900/60 p-4 text-xs font-mono">
              <div className="text-[10px] uppercase tracking-wider text-ink-500">Duty Shift Specs</div>
              <div className="mt-2 space-y-1.5 text-ink-300">
                <div>Shift: <strong className="text-ink-100">08:00 - 16:00 UTC</strong></div>
                <div>Station: <strong className="text-ink-100">SOC Console #04</strong></div>
                <div>Operator ID: <strong className="text-signal-cyan">ANALYST-8902</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity & Performance Metrics */}
        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-100">
            Shift Triage Activity Summary
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Triaged Queue" value={incidents.length} accent="#3DD9E8" icon={Activity} />
            <MetricCard label="Incoming Alerts" value={incomingIncidents.length} accent="#F0C542" icon={Clock} />
            <MetricCard label="Critical Threat Response" value={criticalCount} accent="#F13F52" icon={Flame} />
            <MetricCard label="Avg Queue Risk Score" value={avgScore} accent="#F7943B" icon={ShieldAlert} />
          </div>
        </div>

        {/* Detailed Grid: Badges & Recent Log */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Triaged Incidents Log */}
          <div className="rounded-xl border border-base-600/60 bg-base-850/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-ink-100">
                Recent Analyst Actions Log
              </h3>
              <span className="font-mono text-xs text-signal-cyan">Live Session</span>
            </div>

            <div className="space-y-3">
              {incidents.slice(0, 4).map((inc) => (
                <div key={inc.id} className="flex items-center justify-between rounded-lg border border-base-600/40 bg-base-900/40 p-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-ink-500">{inc.id}</span>
                      <PriorityBadge level={inc.level} size="sm" />
                    </div>
                    <p className="mt-1 font-medium text-ink-100">{inc.type}</p>
                    <p className="text-[11px] text-ink-500 truncate max-w-xs">{inc.asset}</p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-signal-cyan font-semibold">{inc.score} pts</div>
                    <div className="text-[10px] text-ink-500">Rank #{inc.rank}</div>
                  </div>
                </div>
              ))}
              {incidents.length === 0 && (
                <div className="p-4 text-center text-xs text-ink-500">
                  No triaged actions logged in current session.
                </div>
              )}
            </div>
          </div>

          {/* Specialization Badges & Credentials */}
          <div className="rounded-xl border border-base-600/60 bg-base-850/50 p-6">
            <h3 className="mb-4 font-display text-base font-semibold text-ink-100">
              Analyst Certifications & Clearances
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-signal-blue/30 bg-signal-blue/10 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-blue/20 text-signal-cyan">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="font-display text-xs font-semibold text-ink-100">
                    TRIAGENT Certified Triage Operator
                  </h4>
                  <p className="text-[11px] text-ink-400">
                    Authorized for multi-factor priority score override & tier-3 containment execution.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-threat-low/30 bg-threat-low/10 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-threat-low/20 text-threat-low">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-display text-xs font-semibold text-ink-100">
                    Level 5 Threat Intelligence Specialist
                  </h4>
                  <p className="text-[11px] text-ink-400">
                    Full access to sensitive customer PII and critical production asset telemetry.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-base-600/50 bg-base-900/40 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-800 text-ink-300">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-display text-xs font-semibold text-ink-100">
                    8-Level Deterministic Tie-Breaker Training
                  </h4>
                  <p className="text-[11px] text-ink-400">
                    Certified in mathematical tie-breaking verification across multi-factor scores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
