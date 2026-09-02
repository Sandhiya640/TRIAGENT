package com.triagent.backend.service;

import com.triagent.backend.dto.FactorContributionDto;
import com.triagent.backend.dto.IncidentResponse;
import com.triagent.backend.entity.Incident;
import com.triagent.backend.entity.PriorityLevel;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PriorityEngineService {

    public static final double WEIGHT_SEVERITY = 0.25;
    public static final double WEIGHT_BUSINESS_IMPACT = 0.20;
    public static final double WEIGHT_DATA_SENSITIVITY = 0.15;
    public static final double WEIGHT_ASSET_IMPORTANCE = 0.15;
    public static final double WEIGHT_ATTACK_CONFIDENCE = 0.15;
    public static final double WEIGHT_AFFECTED_USERS = 0.10;

    public int normalizeAffectedUsers(int count) {
        if (count <= 0) return 0;
        if (count <= 10) return 20;
        if (count <= 100) return 40;
        if (count <= 500) return 60;
        if (count <= 1000) return 80;
        return 100;
    }

    public double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    public PriorityLevel calculatePriorityLevel(double score) {
        if (score >= 90.0) return PriorityLevel.CRITICAL;
        if (score >= 70.0) return PriorityLevel.HIGH;
        if (score >= 40.0) return PriorityLevel.MEDIUM;
        return PriorityLevel.LOW;
    }

    public IncidentResponse computeAndBuildResponse(Incident incident) {
        IncidentResponse response = new IncidentResponse();
        response.setId(incident.getId());
        response.setType(incident.getType());
        response.setTitle(incident.getTitle());
        response.setAsset(incident.getAsset());
        response.setDetectedAt(incident.getDetectedAt());
        response.setAffectedUsersCount(incident.getAffectedUsersCount());
        response.setDescription(incident.getDescription());
        response.setRecommendedAction(incident.getRecommendedAction());
        response.setStatus(incident.getStatus());

        response.setSeverityRaw(incident.getSeverityRaw());
        response.setBusinessImpactRaw(incident.getBusinessImpactRaw());
        response.setDataSensitivityRaw(incident.getDataSensitivityRaw());
        response.setAssetImportanceRaw(incident.getAssetImportanceRaw());
        response.setAttackConfidenceRaw(incident.getAttackConfidenceRaw());

        // Factor Normalization (0-100)
        double normSeverity = Math.min(100.0, Math.max(0.0, incident.getSeverityRaw() * 10.0));
        double normBusinessImpact = Math.min(100.0, Math.max(0.0, incident.getBusinessImpactRaw() * 10.0));
        double normDataSensitivity = Math.min(100.0, Math.max(0.0, incident.getDataSensitivityRaw() * 10.0));
        double normAssetImportance = Math.min(100.0, Math.max(0.0, incident.getAssetImportanceRaw() * 10.0));
        double normAttackConfidence = Math.min(100.0, Math.max(0.0, incident.getAttackConfidenceRaw()));
        double normAffectedUsers = normalizeAffectedUsers(incident.getAffectedUsersCount());

        // Weighted Contributions
        double contribSeverity = round1(normSeverity * WEIGHT_SEVERITY);
        double contribBusinessImpact = round1(normBusinessImpact * WEIGHT_BUSINESS_IMPACT);
        double contribDataSensitivity = round1(normDataSensitivity * WEIGHT_DATA_SENSITIVITY);
        double contribAssetImportance = round1(normAssetImportance * WEIGHT_ASSET_IMPORTANCE);
        double contribAttackConfidence = round1(normAttackConfidence * WEIGHT_ATTACK_CONFIDENCE);
        double contribAffectedUsers = round1(normAffectedUsers * WEIGHT_AFFECTED_USERS);

        double totalScore = round1(contribSeverity + contribBusinessImpact + contribDataSensitivity +
                contribAssetImportance + contribAttackConfidence + contribAffectedUsers);

        response.setScore(totalScore);
        PriorityLevel level = calculatePriorityLevel(totalScore);
        response.setLevel(level);
        response.setRank(incident.getTriageRank());

        Map<String, FactorContributionDto> contributions = new LinkedHashMap<>();
        contributions.put("severity", new FactorContributionDto("severity", "Severity", incident.getSeverityRaw(), normSeverity, WEIGHT_SEVERITY, contribSeverity, round1(WEIGHT_SEVERITY * 100)));
        contributions.put("businessImpact", new FactorContributionDto("businessImpact", "Business Impact", incident.getBusinessImpactRaw(), normBusinessImpact, WEIGHT_BUSINESS_IMPACT, contribBusinessImpact, round1(WEIGHT_BUSINESS_IMPACT * 100)));
        contributions.put("dataSensitivity", new FactorContributionDto("dataSensitivity", "Data Sensitivity", incident.getDataSensitivityRaw(), normDataSensitivity, WEIGHT_DATA_SENSITIVITY, contribDataSensitivity, round1(WEIGHT_DATA_SENSITIVITY * 100)));
        contributions.put("assetImportance", new FactorContributionDto("assetImportance", "Asset Importance", incident.getAssetImportanceRaw(), normAssetImportance, WEIGHT_ASSET_IMPORTANCE, contribAssetImportance, round1(WEIGHT_ASSET_IMPORTANCE * 100)));
        contributions.put("attackConfidence", new FactorContributionDto("attackConfidence", "Attack Confidence", incident.getAttackConfidenceRaw(), normAttackConfidence, WEIGHT_ATTACK_CONFIDENCE, contribAttackConfidence, round1(WEIGHT_ATTACK_CONFIDENCE * 100)));
        contributions.put("affectedUsers", new FactorContributionDto("affectedUsers", "Affected Users", incident.getAffectedUsersCount(), normAffectedUsers, WEIGHT_AFFECTED_USERS, contribAffectedUsers, round1(WEIGHT_AFFECTED_USERS * 100)));

        response.setContributions(contributions);
        response.setExplanation(explainRanking(response));

        // Analyst Feedback / Outcome
        response.setInvestigationOutcome(incident.getInvestigationOutcome());
        response.setFeedbackReason(incident.getFeedbackReason());
        response.setReviewedAt(incident.getReviewedAt());

        // SLA Tracking & Metrics
        Instant created = incident.getCreatedAt() != null ? incident.getCreatedAt() : Instant.now();
        response.setCreatedAt(created);

        long targetMins = incident.getResolutionTargetMinutes() != null
                ? incident.getResolutionTargetMinutes()
                : getSlaTargetMinutes(level);
        response.setResolutionTargetMinutes(targetMins);

        Instant deadline = incident.getResolutionDeadline() != null
                ? incident.getResolutionDeadline()
                : created.plus(java.time.Duration.ofMinutes(targetMins));
        response.setResolutionDeadline(deadline);

        Instant resolved = incident.getResolvedAt();
        response.setResolvedAt(resolved);

        String slaStatus = calculateSlaStatus(created, deadline, resolved);
        response.setSlaStatus(slaStatus);

        if (resolved != null) {
            long actualMins = Math.max(1, java.time.Duration.between(created, resolved).toMinutes());
            response.setActualResolutionMinutes(actualMins);
        } else {
            response.setActualResolutionMinutes(null);
        }

        // Response Recommendations & Urgency
        response.setPlaybook(getPlaybookForType(incident.getType()));
        response.setUrgencyIndicator(getUrgencyIndicator(level));

        return response;
    }

    public long getSlaTargetMinutes(PriorityLevel level) {
        if (level == PriorityLevel.CRITICAL) return 60L;       // 1 hour
        if (level == PriorityLevel.HIGH) return 240L;         // 4 hours
        if (level == PriorityLevel.MEDIUM) return 1440L;      // 24 hours
        return 4320L;                                         // 72 hours
    }

    public String calculateSlaStatus(Instant createdAt, Instant deadline, Instant resolvedAt) {
        if (resolvedAt != null) {
            if (deadline != null && resolvedAt.isAfter(deadline)) {
                return "SLA_BREACHED";
            }
            return "RESOLVED_WITHIN_SLA";
        }
        if (deadline == null) return "ON_TRACK";
        Instant now = Instant.now();
        if (now.isAfter(deadline)) {
            return "BREACHED";
        }
        Instant start = createdAt != null ? createdAt : now.minusSeconds(60);
        long totalSeconds = Math.max(1, java.time.Duration.between(start, deadline).getSeconds());
        long elapsedSeconds = Math.max(0, java.time.Duration.between(start, now).getSeconds());
        double fraction = (double) elapsedSeconds / totalSeconds;
        if (fraction >= 0.75) {
            return "AT_RISK";
        }
        return "ON_TRACK";
    }

    public List<String> getPlaybookForType(String type) {
        if (type == null) return getGenericPlaybook();
        String normalized = type.toUpperCase().replace(" ", "_");
        if (normalized.contains("RANSOMWARE")) {
            return Arrays.asList(
                    "1. Isolate the affected asset from the network.",
                    "2. Preserve forensic evidence.",
                    "3. Disable potentially compromised accounts.",
                    "4. Check for lateral movement.",
                    "5. Escalate to the incident response team.",
                    "6. Verify backup availability and integrity."
            );
        } else if (normalized.contains("PHISHING")) {
            return Arrays.asList(
                    "1. Quarantine the malicious message.",
                    "2. Block the malicious sender or domain.",
                    "3. Identify affected users.",
                    "4. Check for credential compromise.",
                    "5. Reset credentials when compromise is suspected.",
                    "6. Search for similar phishing messages."
            );
        } else if (normalized.contains("MALWARE") || normalized.contains("TROJAN") || normalized.contains("STEALER")) {
            return Arrays.asList(
                    "1. Isolate the affected endpoint.",
                    "2. Run a full endpoint security scan.",
                    "3. Preserve relevant evidence.",
                    "4. Identify other potentially affected systems.",
                    "5. Remove or contain malicious artifacts.",
                    "6. Monitor for persistence or lateral movement."
            );
        } else if (normalized.contains("EXFILTRATION") || normalized.contains("DATA_LEAK")) {
            return Arrays.asList(
                    "1. Investigate the outbound transfer.",
                    "2. Preserve relevant network and system logs.",
                    "3. Identify the source and destination.",
                    "4. Determine what data may have been exposed.",
                    "5. Restrict suspicious transfers when appropriate.",
                    "6. Escalate according to incident response procedures."
            );
        } else if (normalized.contains("SUSPICIOUS_LOGIN") || normalized.contains("LOGIN") || normalized.contains("CREDENTIAL")) {
            return Arrays.asList(
                    "1. Review authentication and login history.",
                    "2. Verify whether the activity was legitimate.",
                    "3. Review the source location or IP.",
                    "4. Reset credentials if compromise is suspected.",
                    "5. Review MFA status.",
                    "6. Monitor for additional suspicious activity."
            );
        } else if (normalized.contains("DDOS") || normalized.contains("FLOOD")) {
            return Arrays.asList(
                    "1. Analyze attack traffic.",
                    "2. Activate available DDoS mitigation controls.",
                    "3. Monitor service availability.",
                    "4. Rate-limit suspicious traffic where appropriate.",
                    "5. Preserve traffic and infrastructure logs.",
                    "6. Escalate if critical services are unavailable."
            );
        } else if (normalized.contains("SQL_INJECTION") || normalized.contains("SQL")) {
            return Arrays.asList(
                    "1. Preserve relevant application and database logs.",
                    "2. Investigate the vulnerable request or input.",
                    "3. Block or mitigate malicious traffic where appropriate.",
                    "4. Check for database compromise.",
                    "5. Review affected application security controls.",
                    "6. Verify the application is patched."
            );
        } else if (normalized.contains("BRUTE_FORCE") || normalized.contains("STUFFING")) {
            return Arrays.asList(
                    "1. Review repeated authentication attempts.",
                    "2. Identify targeted accounts.",
                    "3. Check whether any login attempts succeeded.",
                    "4. Apply rate limiting or account protection controls.",
                    "5. Reset compromised credentials if necessary.",
                    "6. Monitor for additional attempts."
            );
        } else if (normalized.contains("UNAUTHORIZED_ACCESS") || normalized.contains("INSIDER") || normalized.contains("PRIVILEGE")) {
            return Arrays.asList(
                    "1. Verify whether the access was authorized.",
                    "2. Review affected accounts and resources.",
                    "3. Preserve access logs.",
                    "4. Revoke unauthorized access if appropriate.",
                    "5. Investigate potential data exposure.",
                    "6. Monitor for continued suspicious activity."
            );
        }
        return getGenericPlaybook();
    }

    private List<String> getGenericPlaybook() {
        return Arrays.asList(
                "1. Triage raw alert data and verify scope.",
                "2. Preserve volatile forensic evidence and logs.",
                "3. Assess business impact and system criticalities.",
                "4. Implement temporary network/system containment.",
                "5. Remediate root vulnerability and revoke access.",
                "6. Conduct post-incident verification and monitoring."
        );
    }

    public String getUrgencyIndicator(PriorityLevel level) {
        if (level == PriorityLevel.CRITICAL) {
            return "Immediate containment and escalation recommended.";
        } else if (level == PriorityLevel.HIGH) {
            return "High-priority response required. Initiate containment playbooks promptly.";
        } else if (level == PriorityLevel.MEDIUM) {
            return "Standard investigation and containment procedures.";
        } else {
            return "Continue investigation and monitor activity.";
        }
    }

    public List<IncidentResponse> rankIncidents(List<Incident> incidents) {
        List<IncidentResponse> responses = incidents.stream()
                .map(this::computeAndBuildResponse)
                .collect(Collectors.toList());

        // 8-Level Deterministic Tie-Breaking Comparator:
        // 1. Score (descending)
        // 2. Business Impact (descending)
        // 3. Data Sensitivity (descending)
        // 4. Asset Importance (descending)
        // 5. Severity (descending)
        // 6. Attack Confidence (descending)
        // 7. Affected Users (descending)
        // 8. Detected Time (ascending - earlier first)
        responses.sort((a, b) -> {
            if (Double.compare(b.getScore(), a.getScore()) != 0) {
                return Double.compare(b.getScore(), a.getScore());
            }
            if (b.getBusinessImpactRaw() != a.getBusinessImpactRaw()) {
                return Integer.compare(b.getBusinessImpactRaw(), a.getBusinessImpactRaw());
            }
            if (b.getDataSensitivityRaw() != a.getDataSensitivityRaw()) {
                return Integer.compare(b.getDataSensitivityRaw(), a.getDataSensitivityRaw());
            }
            if (b.getAssetImportanceRaw() != a.getAssetImportanceRaw()) {
                return Integer.compare(b.getAssetImportanceRaw(), a.getAssetImportanceRaw());
            }
            if (b.getSeverityRaw() != a.getSeverityRaw()) {
                return Integer.compare(b.getSeverityRaw(), a.getSeverityRaw());
            }
            if (b.getAttackConfidenceRaw() != a.getAttackConfidenceRaw()) {
                return Integer.compare(b.getAttackConfidenceRaw(), a.getAttackConfidenceRaw());
            }
            if (b.getAffectedUsersCount() != a.getAffectedUsersCount()) {
                return Integer.compare(b.getAffectedUsersCount(), a.getAffectedUsersCount());
            }
            if (a.getDetectedAt() != null && b.getDetectedAt() != null) {
                return a.getDetectedAt().compareTo(b.getDetectedAt());
            }
            return 0;
        });

        for (int i = 0; i < responses.size(); i++) {
            IncidentResponse r = responses.get(i);
            r.setRank(i + 1);
            r.setExplanation(explainRanking(r));
        }

        return responses;
    }

    public String explainRanking(IncidentResponse incident) {
        if (incident.getContributions() == null || incident.getContributions().isEmpty()) {
            return "TRIAGENT calculated a final priority score of " + incident.getScore() + "/100.";
        }

        List<FactorContributionDto> sorted = new ArrayList<>(incident.getContributions().values());
        sorted.sort((a, b) -> Double.compare(b.getContribution(), a.getContribution()));

        FactorContributionDto f1 = sorted.get(0);
        FactorContributionDto f2 = sorted.get(1);
        FactorContributionDto f3 = sorted.get(2);

        String assetPhrase = incident.getAsset() != null ? " targeting " + incident.getAsset() : "";
        String levelPhrase;
        if (incident.getLevel() == PriorityLevel.CRITICAL) {
            levelPhrase = "demands immediate investigation and containment response";
        } else if (incident.getLevel() == PriorityLevel.HIGH) {
            levelPhrase = "should be investigated ahead of standard open alerts";
        } else if (incident.getLevel() == PriorityLevel.MEDIUM) {
            levelPhrase = "warrants investigation once critical threats are mitigated";
        } else {
            levelPhrase = "can be queued behind higher-priority alerts";
        }

        return String.format("TRIAGENT ranked this incident #%s%s primarily because of its %s (%d/100, contributing %.1f pts) and %s (%d/100, contributing %.1f pts), compounded by %s (%d/100, contributing %.1f pts). Together these factors calculate a final score of %.1f/100 which %s.",
                incident.getRank() != null ? incident.getRank().toString() : "N/A",
                assetPhrase,
                f1.getLabel(), (int) f1.getNormalized(), f1.getContribution(),
                f2.getLabel(), (int) f2.getNormalized(), f2.getContribution(),
                f3.getLabel(), (int) f3.getNormalized(), f3.getContribution(),
                incident.getScore(), levelPhrase);
    }

    public String explainComparison(IncidentResponse first, IncidentResponse second) {
        Map<String, FactorContributionDto> map1 = first.getContributions();
        Map<String, FactorContributionDto> map2 = second.getContributions();

        List<String> advantages = new ArrayList<>();
        List<String> disadvantages = new ArrayList<>();

        if (map1 != null && map2 != null) {
            for (String key : map1.keySet()) {
                FactorContributionDto c1 = map1.get(key);
                FactorContributionDto c2 = map2.get(key);
                if (c1 != null && c2 != null) {
                    double diff = round1(c1.getContribution() - c2.getContribution());
                    if (diff > 0) {
                        advantages.add(c1.getLabel());
                    } else if (diff < 0) {
                        disadvantages.add(c2.getLabel());
                    }
                }
            }
        }

        String advText;
        if (advantages.isEmpty()) {
            advText = "overall weighted risk profile";
        } else if (advantages.size() == 1) {
            advText = advantages.get(0);
        } else if (advantages.size() == 2) {
            advText = advantages.get(0) + " and " + advantages.get(1);
        } else {
            advText = String.join(", ", advantages.subList(0, advantages.size() - 1)) + ", and " + advantages.get(advantages.size() - 1);
        }

        String counterText = "";
        if (!disadvantages.isEmpty()) {
            counterText = String.format(" Although Incident #%d has higher %s, that advantage is not sufficient to overcome the greater business risk of Incident #%d.",
                    second.getRank() != null ? second.getRank() : 2,
                    String.join(" and ", disadvantages),
                    first.getRank() != null ? first.getRank() : 1);
        }

        return String.format("Incident #%d outranks Incident #%d because higher %s contribute more to its final score.%s",
                first.getRank() != null ? first.getRank() : 1,
                second.getRank() != null ? second.getRank() : 2,
                advText,
                counterText);
    }
}
