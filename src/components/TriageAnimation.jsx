import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ScanSearch } from "lucide-react";

const STEPS = [
  "Normalizing factors",
  "Applying scoring weights",
  "Calculating priority scores",
  "Applying tie-breakers",
  "Ranking incidents",
];

export default function TriageAnimation({ incidentCount, onComplete }) {
  const [activeStep, setActiveStep] = useState(-1);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    let i = -1;
    const stepInterval = setInterval(() => {
      i += 1;
      setActiveStep(i);
      if (i >= STEPS.length - 1) {
        clearInterval(stepInterval);
        setTimeout(() => setScoring(true), 250);
        setTimeout(() => onComplete(), 1100);
      }
    }, 280);
    return () => clearInterval(stepInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/85 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-[min(92vw,26rem)] overflow-hidden rounded-xl border border-signal-blue/25 bg-base-850 p-7 shadow-glow"
      >
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
          <div className="h-full w-1/3 animate-scan bg-gradient-to-r from-transparent via-signal-cyan to-transparent" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal-blue/12 text-signal-blue">
            <ScanSearch size={19} strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-ink-100">
              TRIAGENT ANALYZING INCIDENTS
            </p>
            <p className="text-xs text-ink-500">{incidentCount} incidents in queue</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          {STEPS.map((step, i) => {
            const done = i < activeStep || scoring;
            const active = i === activeStep && !scoring;
            return (
              <div key={step} className="flex items-center gap-3 text-sm">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    done
                      ? "border-signal-blue bg-signal-blue/20 text-signal-blue"
                      : active
                      ? "border-signal-cyan text-signal-cyan"
                      : "border-base-600 text-base-600"
                  }`}
                >
                  {done ? (
                    <Check size={11} strokeWidth={3} />
                  ) : active ? (
                    <Loader2 size={11} strokeWidth={3} className="animate-spin" />
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-current" />
                  )}
                </span>
                <span className={done || active ? "text-ink-100 font-medium" : "text-ink-700"}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {scoring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-5 overflow-hidden border-t border-base-600/60 pt-4"
            >
              <p className="font-mono text-xs text-signal-cyan">
                Populating priority queue…
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

