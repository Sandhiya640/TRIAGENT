# TRIAGENT

**From alert overload to clear action.**

An intelligent Cyber Incident Prioritization Engine for SOC teams — built for a 6-hour hackathon.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. The landing page is at `/`, the Command Center at `/app`.

## Architecture

- **React + Vite** for the app shell and dev/build tooling.
- **Tailwind CSS** for styling, with a custom dark cybersecurity token set defined in `tailwind.config.js` (base surfaces, signal/accent colors, threat-level colors).
- **React Router** for navigation between the landing page, dashboard, incident detail, comparison, and analytics views.
- **Framer Motion** for the queue re-ranking animation, the "Run Triage" analysis overlay, and page-level entrance motion.
- **Recharts** for the Analytics page.
- **Lucide React** for icons.

## The prioritization engine

All scoring logic lives in `src/utils/priorityEngine.js` and is intentionally decoupled from the UI:

- `computeScore(factors)` — applies fixed weights (Severity 25%, Data Sensitivity 20%, Asset Importance 20%, Business Impact 20%, Attack Confidence 10%, Affected Users 5%) to six 0–100 factor scores and returns a total plus per-factor contributions.
- `rankIncidents(incidents)` — sorts by total score, then breaks ties by severity → data sensitivity → asset importance → detection time.
- `explainRanking(incident)` and `explainComparison(a, b)` — generate the plain-language explanations shown in the Incident Detail and Comparison pages, driven entirely by whichever factors actually contributed most. Nothing is hand-written per incident, so newly added incidents get real, computed explanations too.
- `riskTags(factors)` — derives the small "Sensitive Customer Data" / "Critical Production Asset" style tags from factor thresholds.

## Where things live

```
src/
  components/   Sidebar, Topbar, PriorityQueue, IncidentRow, PriorityScore,
                FactorContribution, TriageAnimation, AddIncidentModal, ...
  pages/        LandingPage, Dashboard, IncidentDetails, IncidentComparison, Analytics
  context/      IncidentsContext — shared incident state across routes
  data/         mockIncidents.js — seed data for the demo
  utils/        priorityEngine.js — the scoring engine
```

## Demo flow

1. Land on `/` → **Launch TRIAGE** into the Command Center.
2. Click **Run Triage** to watch the six-factor analysis animation, then see the queue confirm its ranking.
3. Click any incident to open its full breakdown — circular score, weighted factor bars, and a generated explanation.
4. Click **View Comparison** (or **Why #1 outranks #2?** on the dashboard) to see a side-by-side, factor-level explanation of the ranking decision, including an expandable scoring calculation.
5. Click **Add Incident**, adjust the sliders to watch the live priority preview update, then submit — the new incident is scored and takes its place in the queue.
