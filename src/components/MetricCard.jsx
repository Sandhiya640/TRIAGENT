export default function MetricCard({ label, value, accent, icon: Icon, suffix }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-base-600/60 bg-base-850/60 px-4 py-3">
      {Icon && (
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          <Icon size={17} strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
          {label}
        </p>
        <p className="font-display text-xl font-semibold text-ink-100 leading-tight">
          {value}
          {suffix && <span className="ml-1 text-sm font-normal text-ink-500">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
