package com.triagent.backend.service;

import com.triagent.backend.dto.*;
import com.triagent.backend.entity.Incident;
import com.triagent.backend.entity.IncidentStatus;
import com.triagent.backend.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final PriorityEngineService priorityEngineService;

    @Autowired
    public IncidentService(IncidentRepository incidentRepository, PriorityEngineService priorityEngineService) {
        this.incidentRepository = incidentRepository;
        this.priorityEngineService = priorityEngineService;
    }

    public List<IncidentResponse> getAllIncidents() {
        List<Incident> list = incidentRepository.findAll();
        return priorityEngineService.rankIncidents(list);
    }

    public List<IncidentResponse> getIncomingIncidents() {
        List<Incident> list = incidentRepository.findByStatus(IncidentStatus.AWAITING_TRIAGE);
        return list.stream()
                .map(priorityEngineService::computeAndBuildResponse)
                .collect(Collectors.toList());
    }

    public List<IncidentResponse> getTriagedQueue() {
        List<Incident> list = incidentRepository.findByStatusNot(IncidentStatus.AWAITING_TRIAGE);
        List<IncidentResponse> ranked = priorityEngineService.rankIncidents(list);
        return ranked;
    }

    @Transactional
    public IncidentResponse createIncident(IncidentCreateRequest req) {
        String id = "INC-24" + (10 + new Random().nextInt(89));
        Incident incident = new Incident(
                id,
                req.getType() != null ? req.getType() : "Security Alert",
                req.getTitle() != null ? req.getTitle() : req.getType(),
                req.getAsset() != null ? req.getAsset() : "Unspecified Asset",
                LocalDateTime.now(),
                req.getAffectedUsersCount(),
                req.getDescription() != null ? req.getDescription() : "No additional description provided.",
                "Review raw metrics and execute security containment procedures.",
                req.getSeverity(),
                req.getBusinessImpact(),
                req.getDataSensitivity(),
                req.getAssetImportance(),
                req.getAttackConfidence()
        );

        Incident saved = incidentRepository.save(incident);
        return priorityEngineService.computeAndBuildResponse(saved);
    }

    @Transactional
    public List<IncidentResponse> runTriage() {
        List<Incident> all = incidentRepository.findAll();
        if (all.isEmpty()) {
            return Collections.emptyList();
        }

        List<IncidentResponse> rankedResponses = priorityEngineService.rankIncidents(all);

        // Update persistence state
        Map<String, IncidentResponse> respMap = rankedResponses.stream()
                .collect(Collectors.toMap(IncidentResponse::getId, r -> r));

        for (Incident inc : all) {
            IncidentResponse r = respMap.get(inc.getId());
            if (r != null) {
                inc.setPriorityScore(r.getScore());
                inc.setPriorityLevel(r.getLevel());
                inc.setTriageRank(r.getRank());
                inc.setStatus(IncidentStatus.TRIAGED);
                inc.setTriagedAt(LocalDateTime.now());
            }
        }

        incidentRepository.saveAll(all);
        return rankedResponses;
    }

    @Transactional
    public List<IncidentResponse> loadDemoIncidents() {
        incidentRepository.deleteAll();

        LocalDateTime now = LocalDateTime.now();
        List<Incident> demoList = Arrays.asList(
                new Incident("INC-2401", "Data Exfiltration Attempt", "Exfiltration from Production DB", "Production Customer DB", now.minusMinutes(4), 2847, "Unusual outbound data transfer detected to unrecognized IP.", "Isolate host DB-PROD-01 and terminate sockets.", 10, 10, 9, 10, 90),
                new Incident("INC-2402", "Ransomware Detection", "LockBit Ransomware Activity", "Finance & Payroll Server", now.minusMinutes(11), 612, "Endpoint flagged ransomware encryption behavior on file shares.", "Quarantine FIN-SRV-04 and isolate backups.", 10, 9, 9, 9, 95),
                new Incident("INC-2403", "Brute Force Attack", "Credential Stuffing Campaign", "Identity Gateway (SSO)", now.minusMinutes(18), 340, "Distributed brute force attack targeting corporate SSO accounts.", "Enforce IP rate limiting and step-up MFA.", 9, 8, 6, 9, 92),
                new Incident("INC-2404", "Phishing Campaign", "Spear-phishing OAuth Campaign", "Corporate Email Server", now.minusMinutes(26), 1240, "Phishing email with malicious OAuth grant URL sent to employees.", "Purge messages and revoke OAuth tokens.", 8, 7, 6, 6, 80),
                new Incident("INC-2405", "Privilege Escalation", "Admin Account Escalation", "Internal Admin Node", now.minusMinutes(34), 8, "Local exploit observed elevating service token to SYSTEM.", "Isolate host ADM-NODE-02 and patch vulnerability.", 7, 6, 5, 8, 75),
                new Incident("INC-2406", "Suspicious Network Traffic", "UDP Traffic Anomaly", "Core API Gateway", now.minusMinutes(39), 450, "Anomalous UDP traffic spike targeting core API endpoints.", "Activate Cloudflare DDoS mitigation.", 6, 6, 4, 7, 65),
                new Incident("INC-2407", "DDoS Activity", "Volumetric SYN Flood", "Edge Firewall Load Balancer", now.minusMinutes(45), 1500, "Volumetric SYN flood saturating load balancer capacity.", "Reroute incoming edge traffic to scrubber network.", 8, 8, 3, 8, 98),
                new Incident("INC-2408", "Port Scan", "TCP Port Reconnaissance", "Public Web Server", now.minusMinutes(52), 0, "Sequential TCP SYN sweep across all ports.", "Verify edge firewall policies block unused ports.", 4, 3, 2, 4, 50),
                new Incident("INC-2409", "Failed Login Burst", "VPN Authentication Failures", "VPN Concentrator", now.minusMinutes(61), 15, "Burst of failed login attempts for active VPN accounts.", "Verify password reset status; monitor attempts.", 2, 2, 1, 3, 35),
                new Incident("INC-2410", "Insider Threat Alert", "Unauthorized Data Download", "HR & Legal Records Repository", now.minusMinutes(68), 150, "Departing contractor downloaded 4.2 GB of confidential records.", "Revoke IAM role and place legal hold on logs.", 8, 9, 10, 8, 88),
                new Incident("INC-2411", "Unauthorized API Access", "Expired Key API Burst", "Partner Integration Service", now.minusMinutes(75), 85, "API request burst using expired partner key.", "Invalidate key pair immediately.", 5, 5, 6, 5, 70),
                new Incident("INC-2412", "Malware Detection", "PowerShell Memory Dump", "Engineering Workstation", now.minusMinutes(84), 3, "Suspicious PowerShell execution attempting memory dump.", "Isolate ENG-LAP-91 and perform EDR sweep.", 6, 4, 5, 5, 80)
        );

        incidentRepository.saveAll(demoList);
        return getIncomingIncidents();
    }

    public IncidentResponse getIncidentDetails(String id) {
        Optional<Incident> opt = incidentRepository.findById(id);
        if (opt.isEmpty()) {
            return null;
        }

        List<Incident> all = incidentRepository.findAll();
        List<IncidentResponse> ranked = priorityEngineService.rankIncidents(all);

        return ranked.stream()
                .filter(r -> r.getId().equals(id))
                .findFirst()
                .orElse(priorityEngineService.computeAndBuildResponse(opt.get()));
    }

    public ComparisonResponse compareIncidents(String idA, String idB) {
        IncidentResponse first = getIncidentDetails(idA);
        IncidentResponse second = getIncidentDetails(idB);

        if (first == null || second == null) {
            return null;
        }

        IncidentResponse incA = (first.getRank() != null ? first.getRank() : 99) <= (second.getRank() != null ? second.getRank() : 99) ? first : second;
        IncidentResponse incB = (first.getRank() != null ? first.getRank() : 99) <= (second.getRank() != null ? second.getRank() : 99) ? second : first;

        double diff = priorityEngineService.round1(incA.getScore() - incB.getScore());
        String explanation = priorityEngineService.explainComparison(incA, incB);

        List<String> advantages = new ArrayList<>();
        if (incA.getContributions() != null && incB.getContributions() != null) {
            for (String key : incA.getContributions().keySet()) {
                FactorContributionDto c1 = incA.getContributions().get(key);
                FactorContributionDto c2 = incB.getContributions().get(key);
                if (c1 != null && c2 != null && c1.getContribution() > c2.getContribution()) {
                    advantages.add("+" + priorityEngineService.round1(c1.getContribution() - c2.getContribution()) + " pts " + c1.getLabel());
                }
            }
        }

        return new ComparisonResponse(incA, incB, diff, explanation, advantages);
    }

    @Transactional
    public IncidentResponse updateStatus(String id, IncidentStatus status) {
        Optional<Incident> opt = incidentRepository.findById(id);
        if (opt.isPresent()) {
            Incident inc = opt.get();
            inc.setStatus(status);
            incidentRepository.save(inc);
            return getIncidentDetails(id);
        }
        return null;
    }
}
