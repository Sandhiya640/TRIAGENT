package com.triagent.backend.controller;

import com.triagent.backend.dto.*;
import com.triagent.backend.entity.IncidentStatus;
import com.triagent.backend.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@Tag(name = "Cyber Incident Prioritization APIs", description = "Endpoints for loading, manual creation, batch triage scoring, priority queue retrieval, factor breakdown, and explainable comparisons.")
public class IncidentController {

    private final IncidentService incidentService;

    @Autowired
    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    @Operation(summary = "Get all incidents", description = "Fetch all cyber incidents currently stored in the database.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all incidents",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = IncidentResponse.class))))
    })
    public ResponseEntity<List<IncidentResponse>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/incoming")
    @Operation(summary = "Get incoming untriaged incidents", description = "Fetch all incidents with status AWAITING_TRIAGE.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved incoming incidents",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = IncidentResponse.class))))
    })
    public ResponseEntity<List<IncidentResponse>> getIncomingIncidents() {
        return ResponseEntity.ok(incidentService.getIncomingIncidents());
    }

    @GetMapping("/queue")
    @Operation(summary = "Get triaged priority queue", description = "Fetch all triaged incidents ordered by rank (1..N).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved ranked priority queue",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = IncidentResponse.class))))
    })
    public ResponseEntity<List<IncidentResponse>> getTriagedQueue() {
        return ResponseEntity.ok(incidentService.getTriagedQueue());
    }

    @PostMapping
    @Operation(summary = "Create manual incident", description = "Add a new incident with raw metrics (severity, impact, sensitivity, asset importance, confidence, users count) into the persistent database with status AWAITING_TRIAGE.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Incident created successfully",
                    content = @Content(schema = @Schema(implementation = IncidentResponse.class)))
    })
    public ResponseEntity<IncidentResponse> createIncident(@RequestBody IncidentCreateRequest req) {
        return ResponseEntity.ok(incidentService.createIncident(req));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Automated bulk alert ingestion", description = "Receives multiple cyber alerts (100+ items) in one request array, validates input, performs duplicate detection, calculates priority score automatically using existing formula, persists to DB, and returns summary stats and breakdown.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bulk alert ingestion completed successfully",
                    content = @Content(schema = @Schema(implementation = BulkIngestionResponse.class)))
    })
    public ResponseEntity<BulkIngestionResponse> createIncidentsBulk(@RequestBody List<IncidentBulkItemDto> items) {
        return ResponseEntity.ok(incidentService.bulkIngestIncidents(items));
    }

    @PostMapping("/triage")
    @Operation(summary = "Run batch triage engine", description = "Executes factor normalization, fixed-weight scoring (Severity 25%, Business Impact 20%, Data Sensitivity 15%, Asset Importance 15%, Attack Confidence 15%, Affected Users 10%), 8-level tie-breaking, assigns priority levels & ranks, persists status TRIAGED to database, and returns ranked queue.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Batch triage analysis completed successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = IncidentResponse.class))))
    })
    public ResponseEntity<List<IncidentResponse>> runTriage() {
        return ResponseEntity.ok(incidentService.runTriage());
    }

    @PostMapping("/demo")
    @Operation(summary = "Load batch demo incidents", description = "Seeds/resets database with 12 realistic cybersecurity incidents with status AWAITING_TRIAGE.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Demo dataset loaded successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = IncidentResponse.class))))
    })
    public ResponseEntity<List<IncidentResponse>> loadDemoIncidentsDemo() {
        return ResponseEntity.ok(incidentService.loadDemoIncidents());
    }

    @PostMapping("/demo/load")
    @Operation(summary = "Load batch demo incidents (alias)", description = "Alias endpoint for loading 12 demo incidents into the database.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Demo dataset loaded successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = IncidentResponse.class))))
    })
    public ResponseEntity<List<IncidentResponse>> loadDemoIncidents() {
        return ResponseEntity.ok(incidentService.loadDemoIncidents());
    }

    @GetMapping("/compare")
    @Operation(summary = "Explainable incident comparison (Query parameters)", description = "Returns side-by-side factor differentials, advantage tags, and deterministic text explaining why incident #1 outranks #2 based strictly on mathematical calculations.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comparison calculated successfully",
                    content = @Content(schema = @Schema(implementation = ComparisonResponse.class))),
            @ApiResponse(responseCode = "400", description = "Missing required query parameters id1 and id2"),
            @ApiResponse(responseCode = "404", description = "One or both incident IDs not found")
    })
    public ResponseEntity<ComparisonResponse> compareIncidentsQuery(
            @Parameter(description = "First incident ID", example = "INC-2401") @RequestParam(name = "id1", required = false) String id1,
            @Parameter(description = "Second incident ID", example = "INC-2402") @RequestParam(name = "id2", required = false) String id2,
            @RequestParam(name = "idA", required = false) String idA,
            @RequestParam(name = "idB", required = false) String idB) {

        String firstId = id1 != null ? id1 : idA;
        String secondId = id2 != null ? id2 : idB;

        if (firstId == null || secondId == null) {
            return ResponseEntity.badRequest().build();
        }

        ComparisonResponse resp = incidentService.compareIncidents(firstId, secondId);
        if (resp == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/compare/{idA}/{idB}")
    @Operation(summary = "Explainable incident comparison (Path variables)", description = "Path variable alternative for explainable comparison between two incidents.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comparison calculated successfully",
                    content = @Content(schema = @Schema(implementation = ComparisonResponse.class))),
            @ApiResponse(responseCode = "404", description = "One or both incident IDs not found")
    })
    public ResponseEntity<ComparisonResponse> compareIncidentsPath(
            @Parameter(description = "First incident ID", example = "INC-2401") @PathVariable String idA,
            @Parameter(description = "Second incident ID", example = "INC-2402") @PathVariable String idB) {
        ComparisonResponse resp = incidentService.compareIncidents(idA, idB);
        if (resp == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get incident details", description = "Returns full details for a specific incident including 4-step factor contributions and mathematical sum verification.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Incident details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = IncidentResponse.class))),
            @ApiResponse(responseCode = "404", description = "Incident ID not found")
    })
    public ResponseEntity<IncidentResponse> getIncidentDetails(
            @Parameter(description = "Incident ID", example = "INC-2401") @PathVariable String id) {
        IncidentResponse resp = incidentService.getIncidentDetails(id);
        if (resp == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resp);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update incident status", description = "Updates status of an incident (e.g. AWAITING_TRIAGE, TRIAGED, INVESTIGATING, RESOLVED).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status updated successfully",
                    content = @Content(schema = @Schema(implementation = IncidentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid status parameter"),
            @ApiResponse(responseCode = "404", description = "Incident ID not found")
    })
    public ResponseEntity<IncidentResponse> updateStatus(
            @Parameter(description = "Incident ID", example = "INC-2401") @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            IncidentStatus status = IncidentStatus.valueOf(statusStr.toUpperCase());
            IncidentResponse resp = incidentService.updateStatus(id, status);
            if (resp == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/feedback")
    @Operation(summary = "Update incident feedback / investigation outcome", description = "Record analyst feedback outcome (TRUE_POSITIVE, FALSE_POSITIVE, NEEDS_INVESTIGATION) and optional reason without altering priority score.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Feedback updated successfully",
                    content = @Content(schema = @Schema(implementation = IncidentResponse.class))),
            @ApiResponse(responseCode = "404", description = "Incident ID not found")
    })
    public ResponseEntity<IncidentResponse> updateFeedback(
            @Parameter(description = "Incident ID", example = "INC-2401") @PathVariable String id,
            @RequestBody FeedbackRequest req) {
        IncidentResponse resp = incidentService.updateFeedback(id, req);
        if (resp == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resp);
    }
}
