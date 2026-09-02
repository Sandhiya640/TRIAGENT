import { useState, useEffect } from "react";
import { Clock, AlertTriangle, ShieldCheck, CheckCircle2, Flame, Gauge, AlertCircle } from "lucide-react";

export default function SlaTrackingCard({ incident }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!incident) return null;

  const createdTime = incident.createdAt ? new Date(incident.createdAt).getTime() : new Date(incident.detectedAt).getTime();
  const targetMins = incident.resolutionTargetMinutes || (
    incident.level === "CRITICAL" ? 60 : incident.level === "HIGH" ? 240 : incident.level === "MEDIUM" ? 1440 : 4320
  );

  const deadlineTime = incident.resolutionDeadline
    ? new Date(incident.resolutionDeadline).getTime()
    : createdTime + targetMins * 60 * 1000;

  const resolvedTime = incident.resolvedAt ? new Date(incident.resolvedAt).getTime() : null;

  // Determine current live SLA status
  let status = incident.slaStatus || "ON_TRACK";
  let timeRemainingStr = "";
  let isBreached = false;
  let isAtRisk = false;

  if (resolvedTime) {
    if (resolvedTime > deadlineTime) {
      status = "SLA_BREACHED";
    } else {
      status = "RESOLVED_WITHIN_SLA";
    }
  } else {
    const diffMs = deadlineTime - now;
    if (diffMs <= 0) {
      status = "BREACHED";
      isBreached = true;
      timeRemainingStr = "0m 0s (Breached)";
    } else {
      const totalMs = deadlineTime - createdTime;
      const elapsedMs = now - createdTime;
      const fraction = elapsedMs / totalMs;

      if (fraction >= 0.75) {
        status = "AT_RISK";
        isAtRisk = true;
      } else {
        status = "ON_TRACK";
      }

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      if (hours > 0) {
        timeRemainingStr = `${hours}h ${mins}m ${secs}s`;
      } else {
        timeRemainingStr = `${mins}m ${secs}s`;
      }
    }
  }

  // Format target display
  const targetDisplay = targetMins >= 60 ? `${targetMins / 60} hour${targetMins / 60 > 1 ? "s" : ""}` : `${targetMins} mins`;

  // Format actual resolution duration if resolved
  let actualDurationStr = "";
  if (resolvedTime) {
    const actualMins = Math.max(1, Math.round((resolvedTime - createdTime) / (1000 * 60)));
    const h = Math.floor(actualMins / 60);
    const m = actualMins % 60;
    actualDurationStr = h > 0 ? `${h}h ${m}m` : `${m} minutes`;
  }

  return (
    <div className="rounded-xl border border-base-600/60 bg-base-850/60 p-5 sm:p-6 transition-colors">
      <div className="flex items-center justify-between border-b border-base-600/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-cyan/10 text-signal-cyan">
            <Clock size={18} />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-ink-100">
              Resolution & SLA Tracking
            </h2>
            <p className="text-xs text-ink-500">
              Target resolution deadline based on priority ({incident.level})
            </p>
          </div>
        </div>

        {/* Dynamic SLA Status Badge */}
        <div>
          {status === "ON_TRACK" && (
            <span className="flex items-center gap-1.5 rounded-full border border-signal-green/30 bg-signal-green/10 px-3 py-1 font-mono text-xs font-semibold text-signal-green">
              <CheckCircle2 size={13} />
              ON TRACK
            </span>
          )}
          {status === "AT_RISK" && (
            <span className="flex items-center gap-1.5 rounded-full border border-signal-orange/40 bg-signal-orange/15 px-3 py-1 font-mono text-xs font-semibold text-signal-orange animate-pulse">
              <AlertTriangle size={13} />
              AT RISK (Final 25% Time)
            </span>
          )}
          {status === "BREACHED" && (
            <span className="flex items-center gap-1.5 rounded-full border border-signal-red/40 bg-signal-red/15 px-3 py-1 font-mono text-xs font-semibold text-signal-red">
              <Flame size={13} />
              SLA BREACHED
            </span>
          )}
          {status === "RESOLVED_WITHIN_SLA" && (
            <span className="flex items-center gap-1.5 rounded-full border border-signal-cyan/30 bg-signal-cyan/10 px-3 py-1 font-mono text-xs font-semibold text-signal-cyan">
              <ShieldCheck size={13} />
              RESOLVED WITHIN SLA
            </span>
          )}
          {status === "SLA_BREACHED" && (
            <span className="flex items-center gap-1.5 rounded-full border border-signal-red/30 bg-signal-red/10 px-3 py-1 font-mono text-xs font-semibold text-signal-red">
              <AlertCircle size={13} />
              RESOLVED AFTER DEADLINE
            </span>
          )}
        </div>
      </div>

      {/* SLA Details Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
        <div className="rounded-lg border border-base-600/50 bg-base-900/60 p-3">
          <span className="text-[10px] text-ink-500 uppercase tracking-wider block">Resolution Target</span>
          <span className="mt-1 block text-sm font-semibold text-ink-100">{targetDisplay}</span>
        </div>

        <div className="rounded-lg border border-base-600/50 bg-base-900/60 p-3">
          <span className="text-[10px] text-ink-500 uppercase tracking-wider block">Target Deadline</span>
          <span className="mt-1 block text-xs font-medium text-ink-200">
            {new Date(deadlineTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className="rounded-lg border border-base-600/50 bg-base-900/60 p-3">
          <span className="text-[10px] text-ink-500 uppercase tracking-wider block">Created Time</span>
          <span className="mt-1 block text-xs font-medium text-ink-300">
            {new Date(createdTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className={`rounded-lg border p-3 ${
          resolvedTime
            ? "border-signal-cyan/30 bg-signal-cyan/10 text-signal-cyan"
            : isBreached
            ? "border-signal-red/30 bg-signal-red/10 text-signal-red"
            : isAtRisk
            ? "border-signal-orange/30 bg-signal-orange/10 text-signal-orange"
            : "border-signal-green/30 bg-signal-green/10 text-signal-green"
        }`}>
          <span className="text-[10px] uppercase tracking-wider block font-semibold opacity-80">
            {resolvedTime ? "Resolution Time" : "Time Remaining"}
          </span>
          <span className="mt-1 block text-sm font-bold">
            {resolvedTime ? actualDurationStr : timeRemainingStr}
          </span>
        </div>
      </div>

      {/* Resolution Outcome Banner if Resolved */}
      {resolvedTime && (
        <div className="mt-4 rounded-lg border border-base-600 bg-base-900/80 p-3.5 flex items-center justify-between text-xs font-mono">
          <span className="text-ink-400">
            Actual Resolution: <strong className="text-ink-100">{actualDurationStr}</strong> (Target: {targetDisplay})
          </span>
          <span className={`font-semibold ${status === "RESOLVED_WITHIN_SLA" ? "text-signal-cyan" : "text-signal-red"}`}>
            {status === "RESOLVED_WITHIN_SLA" ? "Result: RESOLVED WITHIN SLA" : "Result: SLA BREACHED"}
          </span>
        </div>
      )}
    </div>
  );
}
