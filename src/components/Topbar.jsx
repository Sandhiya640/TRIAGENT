import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  UserCircle2,
  AlertTriangle,
  CheckCircle2,
  Flame,
  ShieldAlert,
  Database,
  Sliders,
  Check,
  ChevronRight,
  ShieldCheck,
  User,
  Settings,
} from "lucide-react";
import { useIncidents } from "../context/IncidentsContext";
import ProfileSettingsModal from "./ProfileSettingsModal";

export default function Topbar({ title, subtitle }) {
  const navigate = useNavigate();
  const { incidents = [], incomingIncidents = [] } = useIncidents();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(new Set());

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Generate dynamic notifications based on real application state
  const notifications = useMemo(() => {
    const list = [];
    const criticalCount = incidents.filter((i) => i.level === "CRITICAL").length;
    const highCount = incidents.filter((i) => i.level === "HIGH").length;

    if (incomingIncidents.length > 0) {
      list.push({
        id: "notif-incoming",
        type: "incoming",
        icon: AlertTriangle,
        iconColor: "text-signal-yellow",
        bgColor: "bg-signal-yellow/10 border-signal-yellow/25",
        title: "Incoming Incidents Awaiting Triage",
        message: `${incomingIncidents.length} raw security alert${
          incomingIncidents.length > 1 ? "s" : ""
        } queued in Command Center.`,
        time: "Live Queue",
      });
    }

    if (criticalCount > 0) {
      list.push({
        id: "notif-critical",
        type: "critical",
        icon: Flame,
        iconColor: "text-threat-critical",
        bgColor: "bg-threat-critical/10 border-threat-critical/25",
        title: "Critical Priority Risk Alert",
        message: `${criticalCount} Critical priority threat${
          criticalCount > 1 ? "s" : ""
        } demand immediate containment.`,
        time: "Action Required",
      });
    }

    if (highCount > 0) {
      list.push({
        id: "notif-high",
        type: "high",
        icon: ShieldAlert,
        iconColor: "text-threat-high",
        bgColor: "bg-threat-high/10 border-threat-high/25",
        title: "High Priority Incidents Active",
        message: `${highCount} High priority alert${
          highCount > 1 ? "s" : ""
        } prioritized ahead of standard queue.`,
        time: "Active Risk",
      });
    }

    if (incidents.length > 0) {
      list.push({
        id: "notif-triage-complete",
        type: "triaged",
        icon: CheckCircle2,
        iconColor: "text-signal-cyan",
        bgColor: "bg-signal-blue/10 border-signal-blue/25",
        title: "Priority Queue Triaged & Ranked",
        message: `TRIAGENT engine successfully calculated scores for ${incidents.length} incidents.`,
        time: "Synced",
      });
    }

    list.push({
      id: "notif-db-persisted",
      type: "system",
      icon: Database,
      iconColor: "text-signal-blue",
      bgColor: "bg-base-800/60 border-base-600/40",
      title: "SQLite Persistence Active",
      message: "Database state connected & synchronized with Spring Boot REST backend.",
      time: "System Live",
    });

    return list;
  }, [incomingIncidents.length, incidents]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readNotifIds.has(n.id)).length;
  }, [notifications, readNotifIds]);

  const markAllRead = () => {
    setReadNotifIds(new Set(notifications.map((n) => n.id)));
  };

  const toggleNotifRead = (id) => {
    setReadNotifIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-base-600/60 bg-base-900/60 px-6 py-5 sm:px-8">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-100 sm:text-2xl">
            {title}
          </h1>
          {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          {/* System Live Indicator */}
          <div className="hidden items-center gap-2 rounded-full border border-threat-low/25 bg-threat-low/10 px-3 py-1.5 sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-threat-low opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-threat-low" />
            </span>
            <span className="font-mono text-[11px] font-medium tracking-wide text-threat-low">
              SYSTEM LIVE
            </span>
          </div>

          {/* Notifications Button */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowProfile(false);
              }}
              className="relative rounded-lg p-1 text-ink-500 transition-colors hover:text-ink-100 focus:outline-none"
              aria-label="Notifications"
            >
              <Bell size={19} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal-cyan px-1 text-[10px] font-mono font-bold text-base-950 ring-2 ring-base-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-50 mt-3 w-80 sm:w-96 overflow-hidden rounded-xl border border-base-600 bg-base-900 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-base-600/60 bg-base-850/60 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-semibold text-ink-100">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-signal-blue/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-signal-cyan">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 font-mono text-[11px] text-signal-cyan hover:underline"
                      >
                        <Check size={12} />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-base-600/40 p-1">
                    {notifications.length > 0 ? (
                      notifications.map((n) => {
                        const isRead = readNotifIds.has(n.id);
                        const Icon = n.icon;
                        return (
                          <div
                            key={n.id}
                            onClick={() => toggleNotifRead(n.id)}
                            className={`flex cursor-pointer gap-3 rounded-lg p-3 transition-colors ${
                              isRead
                                ? "opacity-60 hover:bg-base-850/30"
                                : "bg-base-850/40 hover:bg-base-800/60"
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${n.bgColor}`}
                            >
                              <Icon size={16} className={n.iconColor} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-ink-100 truncate">
                                  {n.title}
                                </span>
                                <span className="font-mono text-[10px] text-ink-500 shrink-0 ml-2">
                                  {n.time}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-ink-400 leading-normal">
                                {n.message}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-xs text-ink-500">
                        No active notifications
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Analyst Profile Button */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfile((prev) => !prev);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 text-ink-300 transition-colors hover:text-ink-100 focus:outline-none"
              aria-label="Analyst profile"
            >
              <UserCircle2 size={26} strokeWidth={1.6} />
              <span className="hidden text-sm font-medium sm:inline">A. Rhodes</span>
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-xl border border-base-600 bg-base-900 shadow-2xl"
                >
                  {/* User Badge Header */}
                  <div className="border-b border-base-600/60 bg-base-850/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-blue/20 font-display text-sm font-bold text-signal-cyan ring-2 ring-signal-cyan/40">
                        AR
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-sm font-semibold text-ink-100 truncate">
                            Alex Rhodes
                          </h3>
                        </div>
                        <p className="text-xs text-ink-500 truncate">Senior SOC Analyst</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-lg border border-base-600/40 bg-base-800/40 px-3 py-1.5 text-[11px]">
                      <span className="flex items-center gap-1.5 font-mono text-threat-low">
                        <span className="h-1.5 w-1.5 rounded-full bg-threat-low" />
                        Active on Shift
                      </span>
                      <span className="font-mono text-ink-500">Clearance: L5</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2 space-y-1 text-xs font-medium">
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        navigate("/app/profile");
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-ink-200 hover:bg-base-800 hover:text-ink-100 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <User size={14} className="text-signal-cyan" />
                        Analyst Profile Page
                      </span>
                      <ChevronRight size={14} className="text-ink-500" />
                    </button>

                    <button
                      onClick={() => {
                        setShowProfile(false);
                        navigate("/app/settings");
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-ink-200 hover:bg-base-800 hover:text-ink-100 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Settings size={14} className="text-signal-blue" />
                        Application Settings
                      </span>
                      <ChevronRight size={14} className="text-ink-500" />
                    </button>

                    <div className="flex items-center justify-between rounded-lg px-3 py-2 text-ink-400">
                      <span className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-signal-blue" />
                        Security Clearance
                      </span>
                      <span className="font-mono text-[11px] text-ink-300">Level 5 (CTI)</span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg px-3 py-2 text-ink-400">
                      <span className="flex items-center gap-2">
                        <Database size={14} className="text-threat-low" />
                        SQLite Integration
                      </span>
                      <span className="font-mono text-[11px] text-threat-low">Connected</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Analyst Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <ProfileSettingsModal onClose={() => setShowSettingsModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
