import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import IncidentDetails from "./pages/IncidentDetails";
import IncidentComparison from "./pages/IncidentComparison";
import Analytics from "./pages/Analytics";
import Layout from "./components/Layout";
import { IncidentsProvider } from "./context/IncidentsContext";

export default function App() {
  return (
    <IncidentsProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="incident/:id" element={<IncidentDetails />} />
          <Route path="compare/:idA/:idB" element={<IncidentComparison />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </IncidentsProvider>
  );
}
