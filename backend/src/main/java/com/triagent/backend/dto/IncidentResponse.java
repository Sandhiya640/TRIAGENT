package com.triagent.backend.dto;

import com.triagent.backend.entity.IncidentStatus;
import com.triagent.backend.entity.PriorityLevel;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.Map;

@Schema(description = "Full response payload for an incident including raw metrics, computed weighted score, priority level, rank, and 4-step factor contributions")
public class IncidentResponse {

    @Schema(description = "Unique incident identifier", example = "INC-2401")
    private String id;

    @Schema(description = "Incident type classification", example = "Data Exfiltration Attempt")
    private String type;

    @Schema(description = "Title description", example = "Exfiltration from Production DB")
    private String title;

    @Schema(description = "Targeted asset name", example = "Production Customer DB")
    private String asset;

    @Schema(description = "Timestamp when alert was detected")
    private LocalDateTime detectedAt;

    @Schema(description = "Numeric count of affected users", example = "2847")
    private int affectedUsersCount;

    @Schema(description = "Detailed incident observation")
    private String description;

    @Schema(description = "Analyst recommended remediation action")
    private String recommendedAction;

    @Schema(description = "Current lifecycle status")
    private IncidentStatus status;

    @Schema(description = "Raw Severity (1-10)", example = "10")
    private int severityRaw;

    @Schema(description = "Raw Business Impact (1-10)", example = "10")
    private int businessImpactRaw;

    @Schema(description = "Raw Data Sensitivity (1-10)", example = "9")
    private int dataSensitivityRaw;

    @Schema(description = "Raw Asset Importance (1-10)", example = "10")
    private int assetImportanceRaw;

    @Schema(description = "Raw Attack Confidence (0-100)", example = "90")
    private int attackConfidenceRaw;

    @Schema(description = "Calculated total priority score (0.0 - 100.0)", example = "97.0")
    private double score;

    @Schema(description = "Display rounded priority score", example = "97")
    private int displayScore;

    @Schema(description = "Assigned priority level (CRITICAL, HIGH, MEDIUM, LOW)")
    private PriorityLevel level;

    @Schema(description = "Assigned triage rank in queue (1..N)", example = "1")
    private Integer rank;

    @Schema(description = "Map of 4-step factor contribution details")
    private Map<String, FactorContributionDto> contributions;

    @Schema(description = "Deterministic plain-language explanation of triage decision")
    private String explanation;

    public IncidentResponse() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAsset() {
        return asset;
    }

    public void setAsset(String asset) {
        this.asset = asset;
    }

    public LocalDateTime getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(LocalDateTime detectedAt) {
        this.detectedAt = detectedAt;
    }

    public int getAffectedUsersCount() {
        return affectedUsersCount;
    }

    public void setAffectedUsersCount(int affectedUsersCount) {
        this.affectedUsersCount = affectedUsersCount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }

    public int getSeverityRaw() {
        return severityRaw;
    }

    public void setSeverityRaw(int severityRaw) {
        this.severityRaw = severityRaw;
    }

    public int getBusinessImpactRaw() {
        return businessImpactRaw;
    }

    public void setBusinessImpactRaw(int businessImpactRaw) {
        this.businessImpactRaw = businessImpactRaw;
    }

    public int getDataSensitivityRaw() {
        return dataSensitivityRaw;
    }

    public void setDataSensitivityRaw(int dataSensitivityRaw) {
        this.dataSensitivityRaw = dataSensitivityRaw;
    }

    public int getAssetImportanceRaw() {
        return assetImportanceRaw;
    }

    public void setAssetImportanceRaw(int assetImportanceRaw) {
        this.assetImportanceRaw = assetImportanceRaw;
    }

    public int getAttackConfidenceRaw() {
        return attackConfidenceRaw;
    }

    public void setAttackConfidenceRaw(int attackConfidenceRaw) {
        this.attackConfidenceRaw = attackConfidenceRaw;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
        this.displayScore = (int) Math.round(score);
    }

    public int getDisplayScore() {
        return displayScore;
    }

    public void setDisplayScore(int displayScore) {
        this.displayScore = displayScore;
    }

    public PriorityLevel getLevel() {
        return level;
    }

    public void setLevel(PriorityLevel level) {
        this.level = level;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public Map<String, FactorContributionDto> getContributions() {
        return contributions;
    }

    public void setContributions(Map<String, FactorContributionDto> contributions) {
        this.contributions = contributions;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
