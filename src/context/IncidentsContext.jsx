import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { mockIncidents } from "../data/mockIncidents";
import { rankIncidents } from "../utils/priorityEngine";

const IncidentsContext = createContext(null);

export function IncidentsProvider({ children }) {
  // Incoming incidents awaiting triage
  const [incomingIncidents, setIncomingIncidents] = useState(mockIncidents);

  // Incidents that have been triaged and ranked into the Priority Queue
  const [triagedIncidents, setTriagedIncidents] = useState([]);

  const [statusMap, setStatusMap] = useState({});
  const [isTriaging, setIsTriaging] = useState(false);
  const [hasRunOnce, setHasRunOnce] = useState(false);

  // Load / reset demo incidents into Incoming Incidents
  const loadDemoIncidents = useCallback(() => {
    setIncomingIncidents(mockIncidents);
  }, []);

  // Run triage trigger (shows animation)
  const runTriage = useCallback(() => {
    if (incomingIncidents.length === 0 && triagedIncidents.length === 0) return;
    setIsTriaging(true);
  }, [incomingIncidents.length, triagedIncidents.length]);

  // Finish triage process after animation
  const finishTriage = useCallback(() => {
    setIsTriaging(false);
    setHasRunOnce(true);

    // Combine all incoming and existing triaged incidents to rank them together
    const allToTriage = [...triagedIncidents, ...incomingIncidents];

    if (allToTriage.length > 0) {
      const ranked = rankIncidents(allToTriage);
      setTriagedIncidents(ranked);
      setIncomingIncidents([]);
    }
  }, [incomingIncidents, triagedIncidents]);

  // Add incident manually into Incoming Incidents
  const addIncident = useCallback((form) => {
    const id = `INC-24${Math.floor(10 + Math.random() * 89)}`;
    const rawFactors = {
      severity: Number(form.severity),
      businessImpact: Number(form.businessImpact),
      dataSensitivity: Number(form.dataSensitivity),
      assetImportance: Number(form.assetImportance),
      attackConfidence: Number(form.attackConfidence),
      affectedUsersCount: Number(form.affectedUsersCount) || 0,
    };

    const newIncident = {
      id,
      type: form.type,
      title: form.title || form.type,
      asset: form.asset || "Unspecified Asset",
      detectedAt: new Date().toISOString(),
      affectedUsersCount: Number(form.affectedUsersCount) || 0,
      description: form.description || "No additional description provided by the reporting analyst.",
      recommendedAction: "Review raw factor inputs, verify compromised asset boundaries, and execute containment procedures.",
      status: "Awaiting Triage",
      rawFactors,
    };

    setIncomingIncidents((prev) => [newIncident, ...prev]);
    return newIncident;
  }, []);

  // Find incident across both triaged and incoming
  const getIncident = useCallback(
    (id) => {
      const foundInTriaged = triagedIncidents.find((i) => i.id === id);
      if (foundInTriaged) {
        return {
          ...foundInTriaged,
          status: statusMap[id] || foundInTriaged.status || "Triaged",
        };
      }
      const foundInIncoming = incomingIncidents.find((i) => i.id === id);
      if (foundInIncoming) {
        const tempRanked = rankIncidents([foundInIncoming])[0];
        return {
          ...tempRanked,
          status: statusMap[id] || "Awaiting Triage",
        };
      }
      return null;
    },
    [triagedIncidents, incomingIncidents, statusMap]
  );

  const markInvestigating = useCallback((id) => {
    setStatusMap((prev) => ({ ...prev, [id]: "Investigating" }));
  }, []);

  // Incidents list for components (with status overrides applied)
  const rankedWithStatus = useMemo(() => {
    return triagedIncidents.map((inc) => ({
      ...inc,
      status: statusMap[inc.id] || "Triaged",
    }));
  }, [triagedIncidents, statusMap]);

  const value = {
    incidents: rankedWithStatus,
    incomingIncidents,
    getIncident,
    isTriaging,
    runTriage,
    finishTriage,
    hasRunOnce,
    loadDemoIncidents,
    addIncident,
    markInvestigating,
  };

  return <IncidentsContext.Provider value={value}>{children}</IncidentsContext.Provider>;
}

export function useIncidents() {
  const ctx = useContext(IncidentsContext);
  if (!ctx) throw new Error("useIncidents must be used within IncidentsProvider");
  return ctx;
}

