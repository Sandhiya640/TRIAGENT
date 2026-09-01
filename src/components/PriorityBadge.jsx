const STYLES = {
  CRITICAL: "bg-threat-critical/12 text-threat-critical border-threat-critical/30",
  HIGH: "bg-threat-high/12 text-threat-high border-threat-high/30",
  MEDIUM: "bg-threat-medium/12 text-threat-medium border-threat-medium/30",
  LOW: "bg-threat-low/12 text-threat-low border-threat-low/30",
};

const DOT = {
  CRITICAL: "bg-threat-critical",
  HIGH: "bg-threat-high",
  MEDIUM: "bg-threat-medium",
  LOW: "bg-threat-low",
};

export default function PriorityBadge({ level, size = "md" }) {
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-wide ${padding} ${STYLES[level]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[level]}`} />
      {level}
    </span>
  );
}
