import { AnimatePresence, motion } from "framer-motion";
import { GitCompareArrows } from "lucide-react";
import IncidentRow from "./IncidentRow";

export default function PriorityQueue({ incidents, onSelect, onCompareTop }) {
  return (
    <div>
      <div className="mb-3 hidden grid-cols-[2.75rem_1.6fr_1fr_5.5rem_auto] gap-4 px-5 text-[11px] font-medium uppercase tracking-wider text-ink-700 sm:grid">
        <span className="text-center">Rank</span>
        <span>Incident</span>
        <span>Detected</span>
        <span className="text-right">Score</span>
        <span />
      </div>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {incidents.map((incident) => (
            <IncidentRow key={incident.id} incident={incident} onSelect={onSelect} />
          ))}
        </AnimatePresence>
      </div>

      {incidents.length >= 2 && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={onCompareTop}
            className="group flex items-center gap-2 rounded-full border border-signal-blue/30 bg-signal-blue/[0.07] px-4 py-2 text-xs font-medium text-signal-cyan transition-colors hover:bg-signal-blue/[0.14]"
          >
            <GitCompareArrows size={14} strokeWidth={2} />
            Why #1 outranks #2?
          </button>
        </div>
      )}
    </div>
  );
}
