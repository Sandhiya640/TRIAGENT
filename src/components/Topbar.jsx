import { Bell, UserCircle2 } from "lucide-react";

export default function Topbar({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between border-b border-base-600/60 bg-base-900/60 px-6 py-5 sm:px-8">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100 sm:text-2xl">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <div className="hidden items-center gap-2 rounded-full border border-threat-low/25 bg-threat-low/10 px-3 py-1.5 sm:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-threat-low opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-threat-low" />
          </span>
          <span className="font-mono text-[11px] font-medium tracking-wide text-threat-low">
            SYSTEM LIVE
          </span>
        </div>

        <button className="relative text-ink-500 transition-colors hover:text-ink-100" aria-label="Notifications">
          <Bell size={19} strokeWidth={2} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-signal-cyan ring-2 ring-base-900" />
        </button>

        <button className="flex items-center gap-2 text-ink-300 transition-colors hover:text-ink-100" aria-label="Analyst profile">
          <UserCircle2 size={26} strokeWidth={1.6} />
          <span className="hidden text-sm font-medium sm:inline">A. Rhodes</span>
        </button>
      </div>
    </header>
  );
}
