package com.triagent.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "4-step factor contribution details including raw input, normalized value, weight percentage, and calculated contribution points.")
public class FactorContributionDto {

    @Schema(description = "Factor key identifier", example = "severity")
    private String key;

    @Schema(description = "Human readable factor label", example = "Severity")
    private String label;

    @Schema(description = "Raw metric value", example = "10.0")
    private double raw;

    @Schema(description = "Normalized score scale (0-100)", example = "100.0")
    private double normalized;

    @Schema(description = "Factor weight fraction", example = "0.25")
    private double weight;

    @Schema(description = "Factor weight percentage", example = "25")
    private int weightPercent;

    @Schema(description = "Calculated weighted contribution points (normalized * weight)", example = "25.0")
    private double contribution;

    @Schema(description = "Maximum possible points for this factor", example = "25.0")
    private double max;

    public FactorContributionDto() {
    }

    public FactorContributionDto(String key, String label, double raw, double normalized,
                                 double weight, double contribution, double max) {
        this.key = key;
        this.label = label;
        this.raw = raw;
        this.normalized = normalized;
        this.weight = weight;
        this.weightPercent = (int) Math.round(weight * 100);
        this.contribution = contribution;
        this.max = max;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public double getRaw() {
        return raw;
    }

    public void setRaw(double raw) {
        this.raw = raw;
    }

    public double getNormalized() {
        return normalized;
    }

    public void setNormalized(double normalized) {
        this.normalized = normalized;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public int getWeightPercent() {
        return weightPercent;
    }

    public void setWeightPercent(int weightPercent) {
        this.weightPercent = weightPercent;
    }

    public double getContribution() {
        return contribution;
    }

    public void setContribution(double contribution) {
        this.contribution = contribution;
    }

    public double getMax() {
        return max;
    }

    public void setMax(double max) {
        this.max = max;
    }
}
