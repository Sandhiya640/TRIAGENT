package com.triagent.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Deterministic explainable comparison response comparing two incidents")
public class ComparisonResponse {

    @Schema(description = "Higher ranking incident details")
    private IncidentResponse incidentA;

    @Schema(description = "Lower ranking incident details")
    private IncidentResponse incidentB;

    @Schema(description = "Absolute score difference", example = "4.7")
    private double scoreDifference;

    @Schema(description = "Deterministic plain-language explanation of why incident #1 outranks #2")
    private String explanation;

    @Schema(description = "List of factor advantages for incident #1", example = "[\"+2.0 pts Business Impact\", \"+1.5 pts Asset Importance\"]")
    private List<String> advantageTags;

    public ComparisonResponse() {
    }

    public ComparisonResponse(IncidentResponse incidentA, IncidentResponse incidentB,
                              double scoreDifference, String explanation, List<String> advantageTags) {
        this.incidentA = incidentA;
        this.incidentB = incidentB;
        this.scoreDifference = scoreDifference;
        this.explanation = explanation;
        this.advantageTags = advantageTags;
    }

    public IncidentResponse getIncidentA() {
        return incidentA;
    }

    public void setIncidentA(IncidentResponse incidentA) {
        this.incidentA = incidentA;
    }

    public IncidentResponse getIncidentB() {
        return incidentB;
    }

    public void setIncidentB(IncidentResponse incidentB) {
        this.incidentB = incidentB;
    }

    public double getScoreDifference() {
        return scoreDifference;
    }

    public void setScoreDifference(double scoreDifference) {
        this.scoreDifference = scoreDifference;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public List<String> getAdvantageTags() {
        return advantageTags;
    }

    public void setAdvantageTags(List<String> advantageTags) {
        this.advantageTags = advantageTags;
    }
}
