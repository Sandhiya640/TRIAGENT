import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldHalf,
  ArrowRight,
  ListOrdered,
  MessageSquareText,
  Compass,
  ChevronRight,
} from "lucide-react";
import PriorityBadge from "../components/PriorityBadge";

const PREVIEW = [
  { rank: 1, label: "DATA EXFILTRATION", score: 96, level: "CRITICAL" },
  { rank: 2, label: "MALWARE DETECTED", score: 92, level: "CRITICAL" },
  { rank: 3, label: "BRUTE FORCE ATTACK", score: 81, level: "HIGH" },
];

const FEATURES = [
  {
    icon: ListOrdered,
    title: "Intelligent Triage",
    body: "Ranks incidents based on multiple risk factors, so nothing critical waits behind noise.",
  },
  {
    icon: MessageSquareText,
    title: "Explainable Decisions",
    body: "Understand exactly why an incident receives its priority, factor by factor.",
  },
  {
    icon: Compass,
    title: "Actionable Insights",
    body: "Know what to investigate before the threat escalates further.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-signal-blue/15 text-signal-blue">
            <ShieldHalf size={18} strokeWidth={2.25} />
          </div>
          <span className="font-display text-base font-semibold tracking-tight text-ink-100">
            TRIAGENT
          </span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-ink-300 md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-ink-100">How It Works</a>
          <a href="#features" className="transition-colors hover:text-ink-100">Features</a>
          <Link to="/app" className="transition-colors hover:text-ink-100">Command Center</Link>
        </div>

        <Link
          to="/app"
          className="flex items-center gap-1.5 rounded-md bg-signal-blue px-4 py-2 text-sm font-semibold text-white shadow-glow transition-opacity hover:opacity-90"
        >
          Launch TRIAGE
        </Link>
      </nav>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:pt-16">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-signal-blue/30 bg-signal-blue/[0.08] px-3 py-1.5 font-mono text-[11px] font-medium tracking-wide text-signal-cyan"
          >
            AI-POWERED INCIDENT INTELLIGENCE
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink-100 sm:text-5xl lg:text-[3.4rem]"
          >
            Too many alerts.
            <br />
            Know what matters <span className="text-signal-blue">first</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-5 max-w-md text-base leading-relaxed text-ink-500"
          >
            TRIAGENT transforms overwhelming security alerts into an explainable
            priority queue, helping security teams identify which incident
            demands attention first.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/app"
              className="flex items-center gap-2 rounded-md bg-signal-blue px-5 py-3 text-sm font-semibold text-white shadow-glow transition-opacity hover:opacity-90"
            >
              Launch TRIAGE
              <ArrowRight size={15} />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-1.5 text-sm font-medium text-ink-300 transition-colors hover:text-ink-100"
            >
              See How It Works
              <ChevronRight size={15} />
            </a>
          </motion.div>
        </div>

        {/* Priority queue preview visual */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-2xl border border-base-600/60 bg-base-850/70 p-5 shadow-soft"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-700">
              Priority Queue
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-threat-low">
              <span className="h-1.5 w-1.5 rounded-full bg-threat-low" />
              LIVE
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {PREVIEW.map((item, i) => (
              <motion.div
                key={item.rank}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.35 + i * 0.12 }}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                  item.rank === 1
                    ? "border-signal-blue/50 bg-gradient-to-r from-signal-blue/[0.1] to-transparent"
                    : "border-base-600/50 bg-base-800/40"
                }`}
              >
                <span
                  className={`font-display text-base font-semibold ${
                    item.rank === 1 ? "text-signal-blue" : "text-ink-500"
                  }`}
                >
                  {String(item.rank).padStart(2, "0")}
                </span>
                <span className="flex-1 truncate text-xs font-semibold tracking-wide text-ink-100">
                  {item.label}
                </span>
                <span className="font-mono text-sm font-semibold text-ink-100">
                  {item.score}
                </span>
                <PriorityBadge level={item.level} size="sm" />
              </motion.div>
            ))}
          </div>

          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-signal-blue/20 blur-3xl" />
        </motion.div>
      </section>

      {/* PROCESS */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-center sm:gap-4">
          <ProcessNode label="100+ ALERTS" />
          <ProcessArrow />
          <ProcessNode label="TRIAGENT ANALYSIS" accent />
          <ProcessArrow />
          <ProcessNode label="1 CLEAR PRIORITY QUEUE" />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-24 sm:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-base-600/60 bg-base-850/40 p-6 transition-colors hover:border-signal-blue/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal-blue/10 text-signal-blue">
                <Icon size={18} strokeWidth={2} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-100">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-base-600/50 px-6 py-8 text-center text-xs text-ink-700 sm:px-8">
        TRIAGENT — From alert overload to clear action.
      </footer>
    </div>
  );
}

function ProcessNode({ label, accent }) {
  return (
    <div
      className={`rounded-lg border px-5 py-3 font-mono text-xs font-medium tracking-wide ${
        accent
          ? "border-signal-blue/40 bg-signal-blue/10 text-signal-cyan"
          : "border-base-600/60 bg-base-850/50 text-ink-300"
      }`}
    >
      {label}
    </div>
  );
}

function ProcessArrow() {
  return (
    <ChevronRight size={18} className="rotate-90 text-ink-700 sm:rotate-0" />
  );
}
