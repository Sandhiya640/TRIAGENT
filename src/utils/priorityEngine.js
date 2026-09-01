// TRIAGENT PRIORITIZATION ENGINE
// Centralized configuration and scoring model for incident triage.

export const FACTORS = [
  { key: "severity", label: "Severity", weight: 0.25, type: "scale10" },
  { key: "businessImpact", label: "Business Impact", weight: 0.20, type: "scale10" },
  { key: "dataSensitivity", label: "Data Sensitivity", weight: 0.15, type: "scale10" },
  { key: "assetImportance", label: "Asset Importance", weight: 0.15, type: "scale10" },
  { key: "attackConfidence", label: "Attack Confidence", weight: 0.15, type: "scale100" },
  { key: "affectedUsers", label: "Affected Users", weight: 0.10, type: "users" },
];

export const WEIGHTS = FACTORS.reduce((acc, f) => {
  acc[f.key] = f.weight;
  return acc;
}, {});

// Affected Users normalization exact scale:
// 0 = 0, 1-10 = 20, 11-100 = 40, 101-500 = 60, 501-1000 = 80, 1000+ = 100
export function normalizeAffectedUsers(count) {
  const num = Number(count) || 0;
  if (num <= 0) return 0;
  if (num <= 10) return 20;
  if (num <= 100) return 40;
  if (num <= 500) return 60;
  if (num <= 1000) return 80;
  return 100;
}

// Convert raw input factors into normalized 0-100 values
export function normalizeRawFactors(rawFactors = {}) {
  const severityRaw = Number(rawFactors.severity ?? 5);
  const businessImpactRaw = Number(rawFactors.businessImpact ?? 5);
  const dataSensitivityRaw = Number(rawFactors.dataSensitivity ?? 5);
  const assetImportanceRaw = Number(rawFactors.assetImportance ?? 5);
  const attackConfidenceRaw = Number(rawFactors.attackConfidence ?? 50);
  const affectedUsersCountRaw = Number(rawFactors.affectedUsersCount ?? 0);

  return {
    raw: {
      severity: severityRaw,
      businessImpact: businessImpactRaw,
      dataSensitivity: dataSensitivityRaw,
      assetImportance: assetImportanceRaw,
      attackConfidence: attackConfidenceRaw,
      affectedUsers: affectedUsersCountRaw,
    },
    normalized: {
      severity: Math.min(100, Math.max(0, severityRaw * 10)),
      businessImpact: Math.min(100, Math.max(0, businessImpactRaw * 10)),
      dataSensitivity: Math.min(100, Math.max(0, dataSensitivityRaw * 10)),
      assetImportance: Math.min(100, Math.max(0, assetImportanceRaw * 10)),
      attackConfidence: Math.min(100, Math.max(0, attackConfidenceRaw)),
      affectedUsers: normalizeAffectedUsers(affectedUsersCountRaw),
    },
  };
}

// Round to 1 decimal place safely
function round1(n) {
  return Math.round(n * 10) / 10;
}

// Compute the weighted priority score and per-factor contributions from raw factors or pre-normalized values
export function computeScore(factorsInput) {
  // If factorsInput already has raw properties (1-10 scales or count), normalize them first
  let rawMap = {};
  let normalizedMap = {};

  if (factorsInput.raw && factorsInput.normalized) {
    rawMap = factorsInput.raw;
    normalizedMap = factorsInput.normalized;
  } else {
    // Determine if input is raw factors or already normalized
    const isRaw =
      "severity" in factorsInput &&
      (factorsInput.severity <= 10 || "affectedUsersCount" in factorsInput);

    if (isRaw) {
      const norm = normalizeRawFactors(factorsInput);
      rawMap = norm.raw;
      normalizedMap = norm.normalized;
    } else {
      normalizedMap = { ...factorsInput };
      rawMap = {
        severity: (factorsInput.severity ?? 50) / 10,
        businessImpact: (factorsInput.businessImpact ?? 50) / 10,
        dataSensitivity: (factorsInput.dataSensitivity ?? 50) / 10,
        assetImportance: (factorsInput.assetImportance ?? 50) / 10,
        attackConfidence: factorsInput.attackConfidence ?? 50,
        affectedUsers: factorsInput.affectedUsersCount ?? 0,
      };
    }
  }

  const contributions = {};
  let rawTotalSum = 0;

  FACTORS.forEach(({ key, weight }) => {
    const normValue = Math.max(0, Math.min(100, normalizedMap[key] ?? 0));
    const rawVal = rawMap[key] ?? (key === "attackConfidence" || key === "affectedUsers" ? normValue : normValue / 10);
    const contribution = round1(normValue * weight);

    contributions[key] = {
      raw: rawVal,
      normalized: normValue,
      weight,
      weightPercent: Math.round(weight * 100),
      contribution,
      max: round1(weight * 100),
    };

    rawTotalSum += contribution;
  });

  const finalScore = round1(rawTotalSum);

  return {
    total: Math.round(finalScore),
    exactTotal: finalScore,
    contributions,
    normalizedFactors: normalizedMap,
    rawFactors: rawMap,
  };
}

// Priority Levels:
// 90-100 = CRITICAL, 70-89 = HIGH, 40-69 = MEDIUM, 0-39 = LOW
export function priorityLevel(score) {
  if (score >= 90) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

export const LEVEL_ORDER = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };

// Rank a list of incidents with deterministic tie-breaking:
// 1. Higher Priority Score
// 2. Higher Business Impact
// 3. Higher Data Sensitivity
// 4. Higher Asset Importance
// 5. Higher Severity
// 6. Higher Attack Confidence
// 7. Higher Affected Users count
// 8. Earlier detected time
export function rankIncidents(incidents) {
  const scored = incidents.map((incident) => {
    const rawInputs = incident.rawFactors || {
      severity: incident.factors?.severity ? incident.factors.severity / 10 : 5,
      businessImpact: incident.factors?.businessImpact ? incident.factors.businessImpact / 10 : 5,
      dataSensitivity: incident.factors?.dataSensitivity ? incident.factors.dataSensitivity / 10 : 5,
      assetImportance: incident.factors?.assetImportance ? incident.factors.assetImportance / 10 : 5,
      attackConfidence: incident.factors?.attackConfidence ?? 50,
      affectedUsersCount: incident.affectedUsersCount ?? 0,
    };

    const { total, exactTotal, contributions, normalizedFactors } = computeScore(rawInputs);

    return {
      ...incident,
      rawFactors: rawInputs,
      factors: normalizedFactors,
      score: exactTotal,
      displayScore: total,
      level: priorityLevel(exactTotal),
      contributions,
    };
  });

  scored.sort((a, b) => {
    // 1. Higher Priority Score
    if (b.score !== a.score) return b.score - a.score;

    // 2. Higher Business Impact
    if (b.contributions.businessImpact.normalized !== a.contributions.businessImpact.normalized)
      return b.contributions.businessImpact.normalized - a.contributions.businessImpact.normalized;

    // 3. Higher Data Sensitivity
    if (b.contributions.dataSensitivity.normalized !== a.contributions.dataSensitivity.normalized)
      return b.contributions.dataSensitivity.normalized - a.contributions.dataSensitivity.normalized;

    // 4. Higher Asset Importance
    if (b.contributions.assetImportance.normalized !== a.contributions.assetImportance.normalized)
      return b.contributions.assetImportance.normalized - a.contributions.assetImportance.normalized;

    // 5. Higher Severity
    if (b.contributions.severity.normalized !== a.contributions.severity.normalized)
      return b.contributions.severity.normalized - a.contributions.severity.normalized;

    // 6. Higher Attack Confidence
    if (b.contributions.attackConfidence.normalized !== a.contributions.attackConfidence.normalized)
      return b.contributions.attackConfidence.normalized - a.contributions.attackConfidence.normalized;

    // 7. Higher Affected Users count
    const usersA = Number(a.affectedUsersCount ?? 0);
    const usersB = Number(b.affectedUsersCount ?? 0);
    if (usersB !== usersA) return usersB - usersA;

    // 8. Earlier detected time
    return new Date(a.detectedAt || 0) - new Date(b.detectedAt || 0);
  });

  return scored.map((incident, i) => ({ ...incident, rank: i + 1 }));
}

const TAG_RULES = [
  { test: (c) => c.dataSensitivity.normalized >= 85, tag: "Sensitive Customer Data" },
  { test: (c) => c.assetImportance.normalized >= 90, tag: "Critical Production Asset" },
  { test: (c) => c.attackConfidence.normalized >= 90, tag: "Confirmed Attack Pattern" },
  { test: (c) => c.attackConfidence.normalized >= 75 && c.attackConfidence.normalized < 90, tag: "High Attack Confidence" },
  { test: (c) => c.dataSensitivity.normalized >= 70 && c.dataSensitivity.normalized < 85, tag: "Potential Data Exposure" },
  { test: (c) => c.businessImpact.normalized >= 85, tag: "Severe Business Impact" },
  { test: (c) => c.affectedUsers.normalized >= 70, tag: "Large-Scale User Impact" },
  { test: (c) => c.severity.normalized >= 90, tag: "High-Severity Indicators" },
];

export function riskTags(contributions) {
  if (!contributions) return [];
  const tags = TAG_RULES.filter((r) => r.test(contributions)).map((r) => r.tag);
  return tags.slice(0, 4);
}

// Build a plain-language explanation from highest weighted factor contributions
export function explainRanking(incident) {
  const { contributions, level } = incident;
  const ranked = FACTORS.map((f) => ({
    ...f,
    ...contributions[f.key],
  })).sort((a, b) => b.contribution - a.contribution);

  const [a, b, c] = ranked;

  const assetPhrase = incident.asset ? ` targeting ${incident.asset}` : "";
  const levelPhrase =
    level === "CRITICAL"
      ? "demands immediate investigation and incident response"
      : level === "HIGH"
      ? "should be investigated ahead of standard open alerts"
      : level === "MEDIUM"
      ? "warrants investigation once critical threats are mitigated"
      : "can be queued behind higher-priority alerts";

  return `TRIAGENT ranked this incident #${incident.rank}${assetPhrase} primarily because of its ${a.label} (${a.normalized}/100, contributing ${a.contribution} pts) and ${b.label} (${b.normalized}/100, contributing ${b.contribution} pts), compounded by ${c.label} (${c.normalized}/100, contributing ${c.contribution} pts). Together these factors calculate a final score of ${incident.score}/100 which ${levelPhrase}.`;
}

// Build a deterministic comparison explanation between two ranked incidents
export function explainComparison(first, second) {
  const diffs = FACTORS.map((f) => {
    const c1 = first.contributions[f.key];
    const c2 = second.contributions[f.key];
    const normDiff = c1.normalized - c2.normalized;
    const contribDiff = round1(c1.contribution - c2.contribution);
    return {
      key: f.key,
      label: f.label,
      c1,
      c2,
      normDiff,
      contribDiff,
    };
  });

  const advantages = diffs.filter((d) => d.contribDiff > 0).sort((a, b) => b.contribDiff - a.contribDiff);
  const disadvantages = diffs.filter((d) => d.contribDiff < 0).sort((a, b) => a.contribDiff - b.contribDiff);

  const advLabels = advantages.map((a) => a.label);
  let advText = "";
  if (advLabels.length === 1) {
    advText = advLabels[0];
  } else if (advLabels.length === 2) {
    advText = `${advLabels[0]} and ${advLabels[1]}`;
  } else if (advLabels.length >= 3) {
    advText = `${advLabels.slice(0, -1).join(", ")}, and ${advLabels[advLabels.length - 1]}`;
  } else {
    advText = "overall weighted risk profile";
  }

  let counterText = "";
  if (disadvantages.length > 0) {
    const disLabels = disadvantages.map((d) => d.label).join(" and ");
    counterText = ` Although Incident #${second.rank} has higher ${disLabels}, that advantage is not sufficient to overcome the greater business risk of Incident #${first.rank}.`;
  }

  return `Incident #${first.rank} outranks Incident #${second.rank} because higher ${advText} contribute more to its final score.${counterText}`;
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

