import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import IncidentsPage from "./pages/IncidentsPage";
import PriorityQueuePage from "./pages/PriorityQueuePage";
import IncidentDetails from "./pages/IncidentDetails";
import IncidentComparison from "./pages/IncidentComparison";
import Analytics from "./pages/Analytics";
import AnalystProfilePage from "./pages/AnalystProfilePage";
import SettingsPage from "./pages/SettingsPage";
import Layout from "./components/Layout";
import { IncidentsProvider } from "./context/IncidentsContext";

export default function App() {
  return (
    <IncidentsProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="priority-queue" element={<PriorityQueuePage />} />
          <Route path="incident/:id" element={<IncidentDetails />} />
          <Route path="compare/:idA/:idB" element={<IncidentComparison />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<AnalystProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </IncidentsProvider>
  );
}
