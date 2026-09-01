import { motion } from "framer-motion";

export default function FactorContribution({
  label,
  raw,
  normalized,
  weightPercent,
  contribution,
  max,
  delay = 0,
  keyName,
}) {
  const isScale10 = keyName !== "attackConfidence" && keyName !== "affectedUsers";
  const rawDisplay = isScale10
    ? `${raw}/10`
    : keyName === "attackConfidence"
    ? `${raw}%`
    : `${Number(raw).toLocaleString()} users`;

  return (
    <div className="rounded-lg border border-base-600/50 bg-base-800/40 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-sm font-semibold text-ink-100">{label}</span>
        <span className="font-mono text-xs font-semibold text-signal-cyan">
          +{contribution} <span className="text-ink-500 font-normal">/ {max} pts</span>
        </span>
      </div>

      {/* 4-Step Raw -> Normalized -> Weight -> Contribution Chain */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] font-mono sm:grid-cols-4">
        <div className="rounded bg-base-850 px-2 py-1">
          <span className="text-ink-500 block text-[10px] uppercase tracking-wider">Raw Input</span>
          <span className="text-ink-100 font-medium">{rawDisplay}</span>
        </div>
        <div className="rounded bg-base-850 px-2 py-1">
          <span className="text-ink-500 block text-[10px] uppercase tracking-wider">Normalized</span>
          <span className="text-signal-cyan font-medium">{normalized}/100</span>
        </div>
        <div className="rounded bg-base-850 px-2 py-1">
          <span className="text-ink-500 block text-[10px] uppercase tracking-wider">Weight</span>
          <span className="text-ink-300 font-medium">{weightPercent}%</span>
        </div>
        <div className="rounded bg-base-850 px-2 py-1">
          <span className="text-ink-500 block text-[10px] uppercase tracking-wider">Contribution</span>
          <span className="text-signal-blue font-semibold">{contribution} pts</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-base-700">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-signal-blue to-signal-cyan"
          initial={{ width: 0 }}
          animate={{ width: `${normalized}%` }}
          transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

