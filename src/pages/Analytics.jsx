import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import Topbar from "../components/Topbar";
import MetricCard from "../components/MetricCard";
import { useIncidents } from "../context/IncidentsContext";
import { Activity, Target, TrendingUp } from "lucide-react";

const LEVEL_COLORS = {
  CRITICAL: "#F13F52",
  HIGH: "#F7943B",
  MEDIUM: "#F0C542",
  LOW: "#3ECF8E",
};

const trend = [
  { t: "-6h", v: 52 },
  { t: "-5h", v: 58 },
  { t: "-4h", v: 61 },
  { t: "-3h", v: 55 },
  { t: "-2h", v: 64 },
  { t: "-1h", v: 60 },
  { t: "now", v: 68 },
];

const tooltipStyle = {
  backgroundColor: "#131826",
  border: "1px solid #232B3D",
  borderRadius: 8,
  fontSize: 12,
  color: "#EDF0F7",
};

export default function Analytics() {
  const { incidents } = useIncidents();

  const byType = useMemo(() => {
    const map = {};
    incidents.forEach((i) => {
      map[i.type] = (map[i.type] || 0) + 1;
    });
    return Object.entries(map).map(([type, count]) => ({ type, count }));
  }, [incidents]);

  const byLevel = useMemo(() => {
    const map = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    incidents.forEach((i) => (map[i.level] += 1));
    return Object.entries(map)
      .map(([level, value]) => ({ level, value }))
      .filter((d) => d.value > 0);
  }, [incidents]);

  const byAsset = useMemo(() => {
    const map = {};
    incidents.forEach((i) => {
      map[i.asset] = (map[i.asset] || 0) + 1;
    });
    return Object.entries(map)
      .map(([asset, count]) => ({ asset, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [incidents]);

  const avgScore = (
    incidents.reduce((sum, i) => sum + i.score, 0) / (incidents.length || 1)
  ).toFixed(1);

  return (
    <>
      <Topbar title="Analytics" subtitle="A high-level view of incident trends" />

      <div className="flex-1 px-6 py-6 sm:px-8 sm:py-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard label="Average Risk Score" value={avgScore} accent="#3E7BFA" icon={Target} />
          <MetricCard label="Incidents Tracked" value={incidents.length} accent="#3DD9E8" icon={Activity} />
          <MetricCard
            label="Trend (6h)"
            value={trend[trend.length - 1].v > trend[0].v ? "Rising" : "Falling"}
            accent="#F7943B"
            icon={TrendingUp}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartCard title="Incident Distribution by Type">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byType} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid stroke="#1A2131" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#7C879E", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="type"
                  type="category"
                  width={140}
                  tick={{ fill: "#B7C0D4", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: "rgba(62,123,250,0.08)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#3E7BFA" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Priority Distribution">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={byLevel}
                  dataKey="value"
                  nameKey="level"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                >
                  {byLevel.map((d) => (
                    <Cell key={d.level} fill={LEVEL_COLORS[d.level]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-4">
              {byLevel.map((d) => (
                <div key={d.level} className="flex items-center gap-1.5 text-xs text-ink-500">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: LEVEL_COLORS[d.level] }} />
                  {d.level} · {d.value}
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Most Targeted Assets">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byAsset} margin={{ left: -20 }}>
                <CartesianGrid stroke="#1A2131" vertical={false} />
                <XAxis dataKey="asset" tick={{ fill: "#7C879E", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fill: "#7C879E", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(62,123,250,0.08)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#3DD9E8" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Priority Trend">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid stroke="#1A2131" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: "#7C879E", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#7C879E", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="v" stroke="#3E7BFA" strokeWidth={2.5} dot={{ fill: "#3E7BFA", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-base-600/60 bg-base-850/50 p-5">
      <h3 className="mb-3 font-display text-sm font-semibold text-ink-100">{title}</h3>
      {children}
    </div>
  );
}
