import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";
import PriorityBadge from "./PriorityBadge";

const RANK_STYLE = {
  1: "border-signal-blue/50 bg-gradient-to-r from-signal-blue/[0.08] to-transparent",
  2: "border-base-500/60 bg-base-800/40",
  3: "border-base-500/40 bg-base-800/25",
};

function relativeTime(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

export default function IncidentRow({ incident, onSelect }) {
  const { rank, type, id, asset, score, level, detectedAt } = incident;
  const topThree = rank <= 3;

  return (
    <motion.button
      layout
      layoutId={`row-${id}`}
      onClick={() => onSelect(incident)}
      transition={{ type: "spring", stiffness: 350, damping: 32 }}
      className={`group grid w-full grid-cols-[2.75rem_1fr_auto] items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-colors sm:grid-cols-[2.75rem_1.6fr_1fr_5.5rem_auto] sm:px-5 ${
        topThree
          ? RANK_STYLE[rank]
          : "border-base-600/50 bg-base-850/40 hover:border-base-500"
      }`}
    >
      <div className="flex items-center justify-center">
        <span
          className={`font-display text-lg font-semibold ${
            rank === 1
              ? "text-signal-blue"
              : rank === 2
              ? "text-ink-100"
              : rank === 3
              ? "text-ink-300"
              : "text-ink-700"
          }`}
        >
          {String(rank).padStart(2, "0")}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-ink-100">{type}</p>
          {incident.status === "Investigating" && (
            <span className="rounded bg-signal-yellow/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-signal-yellow border border-signal-yellow/30">
              Investigating
            </span>
          )}
          {incident.status === "Resolved" && (
            <span className="rounded bg-threat-low/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-threat-low border border-threat-low/30">
              Resolved
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-500">
          <span className="font-mono">{id}</span>
          <span className="text-base-500">·</span>
          <span className="truncate">{asset}</span>
        </div>
      </div>

      <div className="hidden items-center gap-1.5 text-xs text-ink-500 sm:flex">
        <Clock size={12} strokeWidth={2} />
        {relativeTime(detectedAt)}
      </div>

      <div className="hidden flex-col items-end gap-1 sm:flex">
        <span className="font-mono text-sm font-semibold text-ink-100">{score}<span className="text-ink-700">/100</span></span>
        <PriorityBadge level={level} size="sm" />
      </div>

      <div className="flex items-center justify-end gap-3 sm:hidden">
        <PriorityBadge level={level} size="sm" />
      </div>

      <ChevronRight
        size={16}
        strokeWidth={2}
        className="hidden shrink-0 text-ink-700 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-300 sm:block"
      />
    </motion.button>
  );
}
