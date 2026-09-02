package com.triagent.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for analyst investigation outcome feedback")
public class FeedbackRequest {

    @Schema(description = "Investigation outcome status (TRUE_POSITIVE, FALSE_POSITIVE, NEEDS_INVESTIGATION)", example = "FALSE_POSITIVE")
    private String investigationOutcome;

    @Schema(description = "Reason for feedback / false positive classification", example = "Expected Activity")
    private String feedbackReason;

    public FeedbackRequest() {
    }

    public FeedbackRequest(String investigationOutcome, String feedbackReason) {
        this.investigationOutcome = investigationOutcome;
        this.feedbackReason = feedbackReason;
    }

    public String getInvestigationOutcome() {
        return investigationOutcome;
    }

    public void setInvestigationOutcome(String investigationOutcome) {
        this.investigationOutcome = investigationOutcome;
    }

    public String getFeedbackReason() {
        return feedbackReason;
    }

    public void setFeedbackReason(String feedbackReason) {
        this.feedbackReason = feedbackReason;
    }
}
