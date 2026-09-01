const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export function formatIncident(inc) {
  if (!inc) return null;
  const statusStr = typeof inc.status === "string" ? inc.status.toUpperCase() : "";

  let detectedAt = inc.detectedAt;
  if (typeof detectedAt === "string" && !detectedAt.endsWith("Z") && !detectedAt.includes("+") && !detectedAt.includes("-", 10)) {
    detectedAt = detectedAt + "Z";
  }

  return {
    ...inc,
    id: inc.id,
    type: inc.type,
    title: inc.title || inc.type,
    asset: inc.asset,
    detectedAt: detectedAt,
    affectedUsersCount: inc.affectedUsersCount ?? 0,
    description: inc.description || "No description provided.",
    recommendedAction: inc.recommendedAction || "Review raw factor metrics and execute containment procedures.",
    status: statusStr === "AWAITING_TRIAGE" ? "Awaiting Triage"
          : statusStr === "TRIAGED" ? "Triaged"
          : statusStr === "INVESTIGATING" ? "Investigating"
          : statusStr === "RESOLVED" ? "Resolved"
          : inc.status || "Awaiting Triage",
    rawStatus: statusStr || "AWAITING_TRIAGE",
    score: inc.score ?? 0,
    displayScore: inc.displayScore ?? Math.round(inc.score ?? 0),
    level: inc.level || "LOW",
    rank: inc.rank || null,
    rawFactors: {
      severity: inc.severityRaw ?? 5,
      businessImpact: inc.businessImpactRaw ?? 5,
      dataSensitivity: inc.dataSensitivityRaw ?? 5,
      assetImportance: inc.assetImportanceRaw ?? 5,
      attackConfidence: inc.attackConfidenceRaw ?? 50,
      affectedUsersCount: inc.affectedUsersCount ?? 0,
    },
    contributions: inc.contributions || {},
    explanation: inc.explanation || "",
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`API Error ${res.status}: ${errText || res.statusText}`);
  }
  return res.json();
}

export const api = {
  async getIncomingIncidents() {
    const data = await fetch(`${API_BASE_URL}/incidents/incoming`).then(handleResponse);
    return data.map(formatIncident);
  },

  async getTriagedQueue() {
    const data = await fetch(`${API_BASE_URL}/incidents/queue`).then(handleResponse);
    return data.map(formatIncident);
  },

  async getAllIncidents() {
    const data = await fetch(`${API_BASE_URL}/incidents`).then(handleResponse);
    return data.map(formatIncident);
  },

  async loadDemoIncidents() {
    const data = await fetch(`${API_BASE_URL}/incidents/demo`, { method: "POST" }).then(handleResponse);
    return data.map(formatIncident);
  },

  async createIncident(form) {
    const payload = {
      type: form.type,
      title: form.title || form.type,
      asset: form.asset || "Unspecified Asset",
      severity: Number(form.severity) || 5,
      businessImpact: Number(form.businessImpact) || 5,
      dataSensitivity: Number(form.dataSensitivity) || 5,
      assetImportance: Number(form.assetImportance) || 5,
      attackConfidence: Number(form.attackConfidence) || 50,
      affectedUsersCount: Number(form.affectedUsersCount) || 0,
      description: form.description || "No additional description provided.",
    };

    const data = await fetch(`${API_BASE_URL}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handleResponse);

    return formatIncident(data);
  },

  async runTriage() {
    const data = await fetch(`${API_BASE_URL}/incidents/triage`, { method: "POST" }).then(handleResponse);
    return data.map(formatIncident);
  },

  async getIncidentDetails(id) {
    const data = await fetch(`${API_BASE_URL}/incidents/${id}`).then(handleResponse);
    return formatIncident(data);
  },

  async updateStatus(id, status) {
    const data = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(handleResponse);

    return formatIncident(data);
  },

  async compareIncidents(id1, id2) {
    const data = await fetch(`${API_BASE_URL}/incidents/compare?id1=${id1}&id2=${id2}`).then(handleResponse);
    return {
      incidentA: formatIncident(data.incidentA),
      incidentB: formatIncident(data.incidentB),
      scoreDifference: data.scoreDifference,
      explanation: data.explanation,
      advantageTags: data.advantageTags || [],
    };
  },
};
