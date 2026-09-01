import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { api } from "../services/api";

const IncidentsContext = createContext(null);

export function IncidentsProvider({ children }) {
  const [incomingIncidents, setIncomingIncidents] = useState([]);
  const [triagedIncidents, setTriagedIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isTriaging, setIsTriaging] = useState(false);
  const [hasRunOnce, setHasRunOnce] = useState(false);

  // Fetch current state from backend persistent database
  const refreshState = useCallback(async () => {
    try {
      setError(null);
      const [incoming, queue] = await Promise.all([
        api.getIncomingIncidents(),
        api.getTriagedQueue(),
      ]);

      // If backend database is completely empty on first load, seed demo incidents automatically
      if (incoming.length === 0 && queue.length === 0) {
        const seeded = await api.loadDemoIncidents();
        setIncomingIncidents(seeded);
        setTriagedIncidents([]);
      } else {
        setIncomingIncidents(incoming);
        setTriagedIncidents(queue);
        if (queue.length > 0) {
          setHasRunOnce(true);
        }
      }
    } catch (err) {
      console.error("[TRIAGENT API] Error fetching incidents from backend:", err);
      setError(err.message || "Failed to connect to TRIAGENT Spring Boot backend.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Load / reset demo incidents via POST /api/incidents/demo
  const loadDemoIncidents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const seeded = await api.loadDemoIncidents();
      setIncomingIncidents(seeded);
      setTriagedIncidents([]);
      setHasRunOnce(false);
    } catch (err) {
      console.error("[TRIAGENT API] Error loading demo dataset:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run triage trigger (shows animation)
  const runTriage = useCallback(() => {
    if (incomingIncidents.length === 0 && triagedIncidents.length === 0) return;
    setIsTriaging(true);
  }, [incomingIncidents.length, triagedIncidents.length]);

  // Finish triage process after animation -> POST /api/incidents/triage
  const finishTriage = useCallback(async () => {
    try {
      setError(null);
      const rankedQueue = await api.runTriage();
      setTriagedIncidents(rankedQueue);
      setIncomingIncidents([]);
      setHasRunOnce(true);
    } catch (err) {
      console.error("[TRIAGENT API] Error executing triage:", err);
      setError(err.message);
    } finally {
      setIsTriaging(false);
    }
  }, []);

  // Add incident manually -> POST /api/incidents
  const addIncident = useCallback(async (form) => {
    try {
      setError(null);
      const created = await api.createIncident(form);
      setIncomingIncidents((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error("[TRIAGENT API] Error creating manual incident:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Find incident across both triaged and incoming
  const getIncident = useCallback(
    (id) => {
      const foundInTriaged = triagedIncidents.find((i) => i.id === id);
      if (foundInTriaged) return foundInTriaged;
      const foundInIncoming = incomingIncidents.find((i) => i.id === id);
      if (foundInIncoming) return foundInIncoming;
      return null;
    },
    [triagedIncidents, incomingIncidents]
  );

  // Update status -> PATCH /api/incidents/{id}/status
  const markInvestigating = useCallback(async (id) => {
    try {
      const updated = await api.updateStatus(id, "INVESTIGATING");
      setTriagedIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? updated : inc))
      );
      setIncomingIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? updated : inc))
      );
    } catch (err) {
      console.error("[TRIAGENT API] Error marking status as investigating:", err);
    }
  }, []);

  const value = {
    incidents: triagedIncidents,
    incomingIncidents,
    getIncident,
    isTriaging,
    runTriage,
    finishTriage,
    hasRunOnce,
    loadDemoIncidents,
    addIncident,
    markInvestigating,
    isLoading,
    error,
    refreshState,
  };

  return <IncidentsContext.Provider value={value}>{children}</IncidentsContext.Provider>;
}

export function useIncidents() {
  const ctx = useContext(IncidentsContext);
  if (!ctx) throw new Error("useIncidents must be used within IncidentsProvider");
  return ctx;
}
