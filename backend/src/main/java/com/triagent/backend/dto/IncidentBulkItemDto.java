package com.triagent.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Bulk ingestion item DTO supporting flexible input field aliases")
public class IncidentBulkItemDto {

    @JsonAlias({"id", "incidentId"})
    private String incidentId;

    @JsonAlias({"type", "incidentType"})
    private String incidentType;

    private String title;

    @JsonAlias({"asset", "affectedAsset"})
    private String affectedAsset;

    private Integer severity;

    private Integer businessImpact;

    private Integer dataSensitivity;

    private Integer assetImportance;

    private Integer attackConfidence;

    @JsonAlias({"affectedUsersCount", "affectedUsers"})
    private Integer affectedUsers;

    private String description;

    private String recommendedAction;

    private String status;

    private String detectedAt;

    public IncidentBulkItemDto() {
    }

    public String getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(String incidentId) {
        this.incidentId = incidentId;
    }

    public String getIncidentType() {
        return incidentType;
    }

    public void setIncidentType(String incidentType) {
        this.incidentType = incidentType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAffectedAsset() {
        return affectedAsset;
    }

    public void setAffectedAsset(String affectedAsset) {
        this.affectedAsset = affectedAsset;
    }

    public Integer getSeverity() {
        return severity;
    }

    public void setSeverity(Integer severity) {
        this.severity = severity;
    }

    public Integer getBusinessImpact() {
        return businessImpact;
    }

    public void setBusinessImpact(Integer businessImpact) {
        this.businessImpact = businessImpact;
    }

    public Integer getDataSensitivity() {
        return dataSensitivity;
    }

    public void setDataSensitivity(Integer dataSensitivity) {
        this.dataSensitivity = dataSensitivity;
    }

    public Integer getAssetImportance() {
        return assetImportance;
    }

    public void setAssetImportance(Integer assetImportance) {
        this.assetImportance = assetImportance;
    }

    public Integer getAttackConfidence() {
        return attackConfidence;
    }

    public void setAttackConfidence(Integer attackConfidence) {
        this.attackConfidence = attackConfidence;
    }

    public Integer getAffectedUsers() {
        return affectedUsers;
    }

    public void setAffectedUsers(Integer affectedUsers) {
        this.affectedUsers = affectedUsers;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(String detectedAt) {
        this.detectedAt = detectedAt;
    }
}
