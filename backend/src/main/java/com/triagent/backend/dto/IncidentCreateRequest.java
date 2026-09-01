package com.triagent.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for creating a new cyber incident with raw metrics")
public class IncidentCreateRequest {

    @Schema(description = "Incident classification type", example = "Data Exfiltration Attempt")
    private String type;

    @Schema(description = "Short descriptive title", example = "Exfiltration from Production DB")
    private String title;

    @Schema(description = "Targeted asset name", example = "Production Customer DB")
    private String asset;

    @Schema(description = "Severity metric (scale 1-10)", example = "10")
    private int severity = 5;

    @Schema(description = "Business Impact metric (scale 1-10)", example = "10")
    private int businessImpact = 5;

    @Schema(description = "Data Sensitivity metric (scale 1-10)", example = "9")
    private int dataSensitivity = 5;

    @Schema(description = "Asset Importance metric (scale 1-10)", example = "10")
    private int assetImportance = 5;

    @Schema(description = "Attack Confidence metric (scale 0-100)", example = "90")
    private int attackConfidence = 50;

    @Schema(description = "Numeric count of affected users", example = "2847")
    private int affectedUsersCount = 0;

    @Schema(description = "Detailed incident observation", example = "Unusual outbound data transfer detected to unrecognized IP.")
    private String description;

    public IncidentCreateRequest() {
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

    public int getSeverity() {
        return severity;
    }

    public void setSeverity(int severity) {
        this.severity = severity;
    }

    public int getBusinessImpact() {
        return businessImpact;
    }

    public void setBusinessImpact(int businessImpact) {
        this.businessImpact = businessImpact;
    }

    public int getDataSensitivity() {
        return dataSensitivity;
    }

    public void setDataSensitivity(int dataSensitivity) {
        this.dataSensitivity = dataSensitivity;
    }

    public int getAssetImportance() {
        return assetImportance;
    }

    public void setAssetImportance(int assetImportance) {
        this.assetImportance = assetImportance;
    }

    public int getAttackConfidence() {
        return attackConfidence;
    }

    public void setAttackConfidence(int attackConfidence) {
        this.attackConfidence = attackConfidence;
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
}
