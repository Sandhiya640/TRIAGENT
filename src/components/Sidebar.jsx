import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ShieldHalf, LayoutGrid, ListOrdered, FileWarning, BarChart3, Settings, UserCircle2 } from "lucide-react";

const linkClasses = (isActive) =>
  `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
    isActive
      ? "bg-signal-blue/10 text-ink-100"
      : "text-ink-500 hover:bg-base-800 hover:text-ink-300"
  }`;

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const onDashboard = location.pathname === "/app";

  const goToSection = (id) => {
    if (!onDashboard) {
      navigate("/app");
      requestAnimationFrame(() =>
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60)
      );
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-base-600/60 bg-base-900/80 px-4 py-5 lg:flex">
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-signal-blue/15 text-signal-blue">
          <ShieldHalf size={18} strokeWidth={2.25} />
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink-100">
          TRIAGENT
        </span>
      </div>

      <nav className="mt-9 flex flex-col gap-1">
        <NavLink to="/app" end className={({ isActive }) => linkClasses(isActive)}>
          <LayoutGrid size={16} strokeWidth={2} />
          Overview
        </NavLink>
        <button className={linkClasses(false) + " text-left"} onClick={() => goToSection("priority-queue")}>
          <ListOrdered size={16} strokeWidth={2} />
          Priority Queue
        </button>
        <button className={linkClasses(false) + " text-left"} onClick={() => goToSection("priority-queue")}>
          <FileWarning size={16} strokeWidth={2} />
          Incidents
        </button>
        <NavLink to="/app/analytics" className={({ isActive }) => linkClasses(isActive)}>
          <BarChart3 size={16} strokeWidth={2} />
          Analytics
        </NavLink>
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-base-600/60 pt-4">
        <button className={linkClasses(false) + " text-left"}>
          <Settings size={16} strokeWidth={2} />
          Settings
        </button>
        <button className={linkClasses(false) + " text-left"}>
          <UserCircle2 size={16} strokeWidth={2} />
          Analyst Profile
        </button>
      </div>
    </aside>
  );
}
