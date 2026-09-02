package com.triagent.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.ArrayList;
import java.util.List;

@Schema(description = "Response summary for bulk alert ingestion")
public class BulkIngestionResponse {

    private int totalProcessed;
    private int createdCount;
    private int skippedCount;
    private int failedCount;

    private int criticalCount;
    private int highCount;
    private int mediumCount;
    private int lowCount;

    private List<String> errors = new ArrayList<>();
    private List<IncidentResponse> incidents = new ArrayList<>();

    public BulkIngestionResponse() {
    }

    public BulkIngestionResponse(int totalProcessed, int createdCount, int skippedCount, int failedCount,
                                 int criticalCount, int highCount, int mediumCount, int lowCount,
                                 List<String> errors, List<IncidentResponse> incidents) {
        this.totalProcessed = totalProcessed;
        this.createdCount = createdCount;
        this.skippedCount = skippedCount;
        this.failedCount = failedCount;
        this.criticalCount = criticalCount;
        this.highCount = highCount;
        this.mediumCount = mediumCount;
        this.lowCount = lowCount;
        this.errors = errors != null ? errors : new ArrayList<>();
        this.incidents = incidents != null ? incidents : new ArrayList<>();
    }

    public int getTotalProcessed() {
        return totalProcessed;
    }

    public void setTotalProcessed(int totalProcessed) {
        this.totalProcessed = totalProcessed;
    }

    public int getCreatedCount() {
        return createdCount;
    }

    public void setCreatedCount(int createdCount) {
        this.createdCount = createdCount;
    }

    public int getSkippedCount() {
        return skippedCount;
    }

    public void setSkippedCount(int skippedCount) {
        this.skippedCount = skippedCount;
    }

    public int getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(int failedCount) {
        this.failedCount = failedCount;
    }

    public int getCriticalCount() {
        return criticalCount;
    }

    public void setCriticalCount(int criticalCount) {
        this.criticalCount = criticalCount;
    }

    public int getHighCount() {
        return highCount;
    }

    public void setHighCount(int highCount) {
        this.highCount = highCount;
    }

    public int getMediumCount() {
        return mediumCount;
    }

    public void setMediumCount(int mediumCount) {
        this.mediumCount = mediumCount;
    }

    public int getLowCount() {
        return lowCount;
    }

    public void setLowCount(int lowCount) {
        this.lowCount = lowCount;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public List<IncidentResponse> getIncidents() {
        return incidents;
    }

    public void setIncidents(List<IncidentResponse> incidents) {
        this.incidents = incidents;
    }
}
