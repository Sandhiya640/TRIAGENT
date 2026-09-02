package com.triagent.backend.dto;

import com.triagent.backend.entity.PredictedOutcome;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.ArrayList;
import java.util.List;

@Schema(description = "Automated outcome assessment DTO containing prediction, confidence score, explanation, and indicators")
public class OutcomeAssessmentDto {

    private PredictedOutcome predictedOutcome;
    private int confidence;
    private String explanation;
    private List<String> supportingIndicators = new ArrayList<>();
    private List<String> contradictingIndicators = new ArrayList<>();

    public OutcomeAssessmentDto() {
    }

    public OutcomeAssessmentDto(PredictedOutcome predictedOutcome, int confidence, String explanation,
                                List<String> supportingIndicators, List<String> contradictingIndicators) {
        this.predictedOutcome = predictedOutcome;
        this.confidence = confidence;
        this.explanation = explanation;
        this.supportingIndicators = supportingIndicators != null ? supportingIndicators : new ArrayList<>();
        this.contradictingIndicators = contradictingIndicators != null ? contradictingIndicators : new ArrayList<>();
    }

    public PredictedOutcome getPredictedOutcome() {
        return predictedOutcome;
    }

    public void setPredictedOutcome(PredictedOutcome predictedOutcome) {
        this.predictedOutcome = predictedOutcome;
    }

    public int getConfidence() {
        return confidence;
    }

    public void setConfidence(int confidence) {
        this.confidence = confidence;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public List<String> getSupportingIndicators() {
        return supportingIndicators;
    }

    public void setSupportingIndicators(List<String> supportingIndicators) {
        this.supportingIndicators = supportingIndicators;
    }

    public List<String> getContradictingIndicators() {
        return contradictingIndicators;
    }

    public void setContradictingIndicators(List<String> contradictingIndicators) {
        this.contradictingIndicators = contradictingIndicators;
    }
}
