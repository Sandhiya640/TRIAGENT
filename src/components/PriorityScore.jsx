import { motion } from "framer-motion";

const COLORS = {
  CRITICAL: "#F13F52",
  HIGH: "#F7943B",
  MEDIUM: "#F0C542",
  LOW: "#3ECF8E",
};

export default function PriorityScore({ score, level, size = 168 }) {
  const stroke = size * 0.07;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = COLORS[level];
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1A2131"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-semibold leading-none"
          style={{ fontSize: size * 0.26, color: "#EDF0F7" }}
        >
          {score}
        </span>
        <span className="mt-1 text-[11px] font-mono tracking-wide text-ink-500">
          / 100
        </span>
      </div>
    </div>
  );
}
