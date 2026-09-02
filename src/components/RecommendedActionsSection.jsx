import { ShieldCheck, Flame, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

export default function RecommendedActionsSection({ incident }) {
  if (!incident) return null;

  const playbook = incident.playbook && incident.playbook.length > 0
    ? incident.playbook
    : [
        "1. Triage raw alert data and verify scope.",
        "2. Preserve volatile forensic evidence and logs.",
        "3. Assess business impact and system criticalities.",
        "4. Implement temporary network/system containment.",
        "5. Remediate root vulnerability and revoke access.",
        "6. Conduct post-incident verification and monitoring."
      ];

  const urgencyText = incident.urgencyIndicator || (
    incident.level === "CRITICAL"
      ? "Immediate containment and escalation recommended."
      : incident.level === "HIGH"
      ? "High-priority response required. Initiate containment playbooks promptly."
      : incident.level === "MEDIUM"
      ? "Standard investigation and containment procedures."
      : "Continue investigation and monitor activity."
  );

  return (
    <div className="rounded-xl border border-signal-blue/25 bg-signal-blue/[0.04] p-5 sm:p-6 transition-colors">
      <div className="flex items-center gap-2.5 border-b border-signal-blue/20 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-blue/15 text-signal-cyan">
          <ShieldCheck size={18} />
        </div>
        <div>
          <h2 className="font-display text-base font-semibold text-signal-cyan">
            Automated Response Recommendations
          </h2>
          <p className="text-xs text-ink-500">
            Deterministic incident response playbook for <strong className="text-ink-200">{incident.type}</strong>
          </p>
        </div>
      </div>

      {/* Priority Urgency Banner */}
      <div className={`mt-4 flex items-center gap-2.5 rounded-lg border p-3 text-xs font-semibold ${
        incident.level === "CRITICAL"
          ? "border-signal-red/30 bg-signal-red/10 text-signal-red"
          : incident.level === "HIGH"
          ? "border-signal-orange/30 bg-signal-orange/10 text-signal-orange"
          : incident.level === "MEDIUM"
          ? "border-signal-yellow/30 bg-signal-yellow/10 text-signal-yellow"
          : "border-signal-green/30 bg-signal-green/10 text-signal-green"
      }`}>
        {incident.level === "CRITICAL" ? (
          <Flame size={16} className="shrink-0" />
        ) : incident.level === "HIGH" ? (
          <ShieldAlert size={16} className="shrink-0" />
        ) : incident.level === "MEDIUM" ? (
          <AlertCircle size={16} className="shrink-0" />
        ) : (
          <CheckCircle2 size={16} className="shrink-0" />
        )}
        <span>Urgency Advisory: {urgencyText}</span>
      </div>

      {/* Ordered Response Playbook Steps */}
      <div className="mt-4 space-y-2">
        <h4 className="text-xs font-mono font-semibold text-ink-400 uppercase tracking-wider">
          Recommended Playbook Steps:
        </h4>
        <div className="space-y-2">
          {playbook.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-base-600/40 bg-base-850/80 p-3 text-xs text-ink-200 transition-colors hover:border-signal-cyan/40"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-cyan/10 font-mono text-[10px] font-bold text-signal-cyan">
                {idx + 1}
              </div>
              <span className="leading-relaxed mt-0.5">{step.replace(/^\d+\.\s*/, "")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
