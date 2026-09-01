import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { ShieldHalf, LayoutGrid, ListOrdered, FileWarning, BarChart3, Settings, UserCircle2 } from "lucide-react";
import ProfileSettingsModal from "./ProfileSettingsModal";
import { AnimatePresence } from "framer-motion";

const linkClasses = (isActive) =>
  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-signal-blue/15 text-signal-cyan font-semibold border-l-2 border-signal-cyan"
      : "text-ink-500 hover:bg-base-800 hover:text-ink-300"
  }`;

export default function Sidebar() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-base-600/60 bg-base-900/80 px-4 py-5 lg:flex">
        {/* Brand Logo & Title */}
        <Link to="/app" className="flex items-center gap-2 px-2 hover:opacity-90 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-signal-blue/15 text-signal-blue">
            <ShieldHalf size={18} strokeWidth={2.25} />
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight text-ink-100">
            TRIAGENT
          </span>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="mt-9 flex flex-col gap-1">
          <NavLink to="/app" end className={({ isActive }) => linkClasses(isActive)}>
            <LayoutGrid size={16} strokeWidth={2} />
            Overview
          </NavLink>

          <NavLink to="/app/priority-queue" className={({ isActive }) => linkClasses(isActive)}>
            <ListOrdered size={16} strokeWidth={2} />
            Priority Queue
          </NavLink>

          <NavLink to="/app/incidents" className={({ isActive }) => linkClasses(isActive)}>
            <FileWarning size={16} strokeWidth={2} />
            Incidents
          </NavLink>

          <NavLink to="/app/analytics" className={({ isActive }) => linkClasses(isActive)}>
            <BarChart3 size={16} strokeWidth={2} />
            Analytics
          </NavLink>
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-1 border-t border-base-600/60 pt-4">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-500 hover:bg-base-800 hover:text-ink-300 transition-colors text-left"
          >
            <Settings size={16} strokeWidth={2} />
            Settings
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-500 hover:bg-base-800 hover:text-ink-300 transition-colors text-left"
          >
            <UserCircle2 size={16} strokeWidth={2} />
            Analyst Profile
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {showSettingsModal && (
          <ProfileSettingsModal onClose={() => setShowSettingsModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
