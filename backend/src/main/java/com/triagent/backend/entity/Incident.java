package com.triagent.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "title")
    private String title;

    @Column(name = "asset", nullable = false)
    private String asset;

    @Column(name = "detected_at")
    private LocalDateTime detectedAt;

    @Column(name = "affected_users_count")
    private int affectedUsersCount;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "recommended_action", length = 2000)
    private String recommendedAction;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private IncidentStatus status = IncidentStatus.AWAITING_TRIAGE;

    // Raw factor inputs
    @Column(name = "severity_raw")
    private int severityRaw = 5;

    @Column(name = "business_impact_raw")
    private int businessImpactRaw = 5;

    @Column(name = "data_sensitivity_raw")
    private int dataSensitivityRaw = 5;

    @Column(name = "asset_importance_raw")
    private int assetImportanceRaw = 5;

    @Column(name = "attack_confidence_raw")
    private int attackConfidenceRaw = 50;

    // Calculated fields
    @Column(name = "priority_score")
    private Double priorityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority_level")
    private PriorityLevel priorityLevel;

    @Column(name = "triage_rank")
    private Integer triageRank;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "triaged_at")
    private LocalDateTime triagedAt;

    public Incident() {
    }

    public Incident(String id, String type, String title, String asset, LocalDateTime detectedAt,
                    int affectedUsersCount, String description, String recommendedAction,
                    int severityRaw, int businessImpactRaw, int dataSensitivityRaw,
                    int assetImportanceRaw, int attackConfidenceRaw) {
        this.id = id;
        this.type = type;
        this.title = title != null ? title : type;
        this.asset = asset;
        this.detectedAt = detectedAt != null ? detectedAt : LocalDateTime.now();
        this.affectedUsersCount = affectedUsersCount;
        this.description = description;
        this.recommendedAction = recommendedAction;
        this.severityRaw = severityRaw;
        this.businessImpactRaw = businessImpactRaw;
        this.dataSensitivityRaw = dataSensitivityRaw;
        this.assetImportanceRaw = assetImportanceRaw;
        this.attackConfidenceRaw = attackConfidenceRaw;
        this.status = IncidentStatus.AWAITING_TRIAGE;
    }

    // Getters and Setters
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

    public Double getPriorityScore() {
        return priorityScore;
    }

    public void setPriorityScore(Double priorityScore) {
        this.priorityScore = priorityScore;
    }

    public PriorityLevel getPriorityLevel() {
        return priorityLevel;
    }

    public void setPriorityLevel(PriorityLevel priorityLevel) {
        this.priorityLevel = priorityLevel;
    }

    public Integer getTriageRank() {
        return triageRank;
    }

    public void setTriageRank(Integer triageRank) {
        this.triageRank = triageRank;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getTriagedAt() {
        return triagedAt;
    }

    public void setTriagedAt(LocalDateTime triagedAt) {
        this.triagedAt = triagedAt;
    }
}
