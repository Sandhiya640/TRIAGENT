package com.triagent.backend.service;

import com.triagent.backend.dto.FactorContributionDto;
import com.triagent.backend.dto.IncidentResponse;
import com.triagent.backend.entity.Incident;
import com.triagent.backend.entity.PriorityLevel;
import org.springframework.stereotype.Service;

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
        response.setLevel(calculatePriorityLevel(totalScore));
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

        return response;
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
