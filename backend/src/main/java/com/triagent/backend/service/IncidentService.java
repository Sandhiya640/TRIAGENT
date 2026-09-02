package com.triagent.backend.service;

import com.triagent.backend.dto.*;
import com.triagent.backend.entity.Incident;
import com.triagent.backend.entity.IncidentStatus;
import com.triagent.backend.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
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
                Instant.now(),
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
    public BulkIngestionResponse bulkIngestIncidents(List<IncidentBulkItemDto> items) {
        if (items == null || items.isEmpty()) {
            return new BulkIngestionResponse(0, 0, 0, 0, 0, 0, 0, 0, Collections.emptyList(), Collections.emptyList());
        }

        Set<String> existingIds = new HashSet<>(incidentRepository.findAllIds());
        Set<String> batchIds = new HashSet<>();

        List<Incident> incidentsToSave = new ArrayList<>();
        List<IncidentResponse> responses = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        int totalProcessed = items.size();
        int createdCount = 0;
        int skippedCount = 0;
        int failedCount = 0;

        int criticalCount = 0;
        int highCount = 0;
        int mediumCount = 0;
        int lowCount = 0;

        int idCounter = 3001;

        for (int i = 0; i < items.size(); i++) {
            IncidentBulkItemDto item = items.get(i);
            int recordNum = i + 1;

            if (item == null) {
                errors.add("Record #" + recordNum + ": Item object is null");
                failedCount++;
                continue;
            }

            String type = item.getIncidentType();
            if (type == null || type.trim().isEmpty()) {
                errors.add("Record #" + recordNum + ": Missing required incidentType field");
                failedCount++;
                continue;
            }
            type = type.trim();

            String asset = item.getAffectedAsset();
            if (asset == null || asset.trim().isEmpty()) {
                asset = "Unspecified Asset";
            } else {
                asset = asset.trim();
            }

            String title = item.getTitle();
            if (title == null || title.trim().isEmpty()) {
                title = type;
            } else {
                title = title.trim();
            }

            String id = item.getIncidentId();
            if (id != null && !id.trim().isEmpty()) {
                id = id.trim();
                if (existingIds.contains(id) || batchIds.contains(id)) {
                    skippedCount++;
                    continue;
                }
            } else {
                while (true) {
                    String candidateId = "INC-" + (idCounter++);
                    if (!existingIds.contains(candidateId) && !batchIds.contains(candidateId)) {
                        id = candidateId;
                        break;
                    }
                }
            }

            batchIds.add(id);

            int severity = item.getSeverity() != null ? Math.min(10, Math.max(1, item.getSeverity())) : 5;
            int businessImpact = item.getBusinessImpact() != null ? Math.min(10, Math.max(1, item.getBusinessImpact())) : 5;
            int dataSensitivity = item.getDataSensitivity() != null ? Math.min(10, Math.max(1, item.getDataSensitivity())) : 5;
            int assetImportance = item.getAssetImportance() != null ? Math.min(10, Math.max(1, item.getAssetImportance())) : 5;
            int attackConfidence = item.getAttackConfidence() != null ? Math.min(100, Math.max(0, item.getAttackConfidence())) : 50;
            int affectedUsers = item.getAffectedUsers() != null ? Math.max(0, item.getAffectedUsers()) : 0;

            String description = item.getDescription() != null && !item.getDescription().trim().isEmpty()
                    ? item.getDescription().trim()
                    : "No additional description provided.";

            String action = item.getRecommendedAction() != null && !item.getRecommendedAction().trim().isEmpty()
                    ? item.getRecommendedAction().trim()
                    : "Review raw metrics and execute containment procedures.";

            Instant detectedAt = Instant.now();
            if (item.getDetectedAt() != null && !item.getDetectedAt().trim().isEmpty()) {
                try {
                    detectedAt = Instant.parse(item.getDetectedAt().trim());
                } catch (Exception ignored) {
                }
            }

            IncidentStatus initialStatus = IncidentStatus.AWAITING_TRIAGE;
            if (item.getStatus() != null && !item.getStatus().trim().isEmpty()) {
                try {
                    initialStatus = IncidentStatus.valueOf(item.getStatus().trim().toUpperCase());
                } catch (Exception ignored) {
                }
            }

            Incident incident = new Incident(
                    id, type, title, asset, detectedAt, affectedUsers,
                    description, action, severity, businessImpact,
                    dataSensitivity, assetImportance, attackConfidence
            );
            incident.setStatus(initialStatus);

            IncidentResponse resp = priorityEngineService.computeAndBuildResponse(incident);
            incident.setPriorityScore(resp.getScore());
            incident.setPriorityLevel(resp.getLevel());

            if (resp.getLevel() == com.triagent.backend.entity.PriorityLevel.CRITICAL) {
                criticalCount++;
            } else if (resp.getLevel() == com.triagent.backend.entity.PriorityLevel.HIGH) {
                highCount++;
            } else if (resp.getLevel() == com.triagent.backend.entity.PriorityLevel.MEDIUM) {
                mediumCount++;
            } else {
                lowCount++;
            }

            incidentsToSave.add(incident);
            responses.add(resp);
            createdCount++;
        }

        if (!incidentsToSave.isEmpty()) {
            incidentRepository.saveAll(incidentsToSave);
        }

        return new BulkIngestionResponse(
                totalProcessed, createdCount, skippedCount, failedCount,
                criticalCount, highCount, mediumCount, lowCount,
                errors, responses
        );
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
                if (inc.getStatus() == IncidentStatus.AWAITING_TRIAGE) {
                    inc.setStatus(IncidentStatus.TRIAGED);
                    inc.setTriagedAt(Instant.now());
                }
            }
        }

        incidentRepository.saveAll(all);
        return rankedResponses;
    }

    @Transactional
    public List<IncidentResponse> loadDemoIncidents() {
        incidentRepository.deleteAll();

        Instant now = Instant.now();
        List<Incident> demoList = Arrays.asList(
                new Incident("INC-2401", "Data Exfiltration", "Exfiltration from Production DB", "Production Customer PII Database", now.minus(Duration.ofMinutes(4)), 3500, "Unusual outbound data transfer detected to unrecognized IP address.", "Isolate host DB-PROD-01 and terminate sockets.", 8, 10, 10, 10, 95),
                new Incident("INC-2402", "Ransomware Detection", "LockBit Ransomware Activity", "Core Financial & Payroll System", now.minus(Duration.ofMinutes(9)), 1200, "Endpoint flagged ransomware encryption behavior on core SMB shares.", "Quarantine FIN-SRV-04 and isolate offline backups.", 10, 10, 9, 10, 98),
                new Incident("INC-2403", "Insider Threat", "Unauthorized Confidential Data Download", "HR & Legal Records Repository", now.minus(Duration.ofMinutes(14)), 450, "Departing contractor downloaded 50 GB of confidential HR records.", "Revoke IAM permissions and issue emergency legal hold.", 7, 10, 10, 9, 90),
                new Incident("INC-2404", "Brute Force Attack", "Credential Stuffing Campaign", "Identity Gateway (Corporate SSO)", now.minus(Duration.ofMinutes(19)), 2800, "Distributed brute force attack targeting corporate SSO login portal.", "Enforce IP rate limiting and activate step-up MFA.", 9, 8, 7, 9, 92),
                new Incident("INC-2405", "DDoS Activity", "Volumetric SYN Flood", "Edge Firewall Load Balancer", now.minus(Duration.ofMinutes(24)), 5000, "Volumetric SYN flood saturating primary edge ingress bandwidth.", "Reroute incoming edge traffic to cloud scrubber network.", 8, 8, 4, 8, 99),
                new Incident("INC-2406", "Phishing Campaign", "Spear-phishing OAuth Consent Spam", "Corporate Email Gateway", now.minus(Duration.ofMinutes(29)), 1500, "Phishing email containing malicious OAuth consent URL delivered to staff.", "Purge inbox messages and invalidate user OAuth grants.", 8, 7, 7, 7, 85),
                new Incident("INC-2407", "Privilege Escalation", "Domain Admin Token Impersonation", "Active Directory Domain Controller", now.minus(Duration.ofMinutes(34)), 800, "Kerberoasting exploit attempting SYSTEM privilege escalation on DC.", "Isolate AD-DC-01 and rotate Kerberos krbtgt account.", 9, 9, 8, 10, 88),
                new Incident("INC-2408", "Malware Detection", "InfoStealer Trojan Execution", "Executive Boardroom Workstation", now.minus(Duration.ofMinutes(39)), 12, "Trojan spyware observed harvesting browser passwords and tokens.", "Isolate EXEC-LAP-01 and revoke active session tokens.", 7, 8, 9, 8, 82),
                new Incident("INC-2409", "Unauthorized Access", "API Key Misuse Spike", "Payment Gateway Integration API", now.minus(Duration.ofMinutes(44)), 950, "Unauthenticated API request burst targeting payment endpoints.", "Invalidate API key pair and block origin subnet.", 8, 9, 8, 9, 87),
                new Incident("INC-2410", "Suspicious Network Traffic", "UDP Traffic Anomaly", "Core Kubernetes Ingress Cluster", now.minus(Duration.ofMinutes(49)), 600, "Anomalous UDP burst detected originating from compromised worker pod.", "Isolate namespace and apply network egress policy.", 6, 7, 5, 8, 70),
                new Incident("INC-2411", "Data Exfiltration", "Staging DB Export Spike", "Staging Test Database", now.minus(Duration.ofMinutes(54)), 0, "Staging database export attempt to external bucket.", "Verify staging firewall rules and block egress S3 bucket.", 9, 3, 2, 3, 80),
                new Incident("INC-2412", "Malware Detection", "PowerShell Memory Dump", "Engineering Sandbox Workstation", now.minus(Duration.ofMinutes(59)), 5, "Suspicious PowerShell command line attempting process LSASS dump.", "Isolate ENG-NODE-12 and run EDR quarantine scan.", 6, 4, 5, 5, 85),
                new Incident("INC-2413", "Unauthorized Access", "Expired Token Integration Burst", "Legacy Partner Proxy Node", now.minus(Duration.ofMinutes(64)), 80, "Burst of unauthorized API requests using expired partner token.", "Revoke legacy proxy credentials and notify partner security team.", 5, 5, 6, 5, 75),
                new Incident("INC-2414", "Phishing Campaign", "Spam Mailchimp Relay Attempt", "Marketing Relay Server", now.minus(Duration.ofMinutes(69)), 200, "Untrusted outbound SMTP relay attempts flagged by email security gateway.", "Block outbound port 25 and check relay authentication.", 5, 4, 3, 4, 65),
                new Incident("INC-2415", "Privilege Escalation", "Container Root Escape Exploit", "Isolated Jenkins Build Worker", now.minus(Duration.ofMinutes(74)), 2, "Local container breakout vulnerability exploited on isolated worker node.", "Terminate container instance and update Docker engine.", 8, 3, 2, 4, 60),
                new Incident("INC-2416", "Suspicious Network Traffic", "Guest Network Multicast Sweep", "Guest Wi-Fi Subnet Router", now.minus(Duration.ofMinutes(79)), 45, "High volume mDNS/LLMNR traffic sweep on guest wireless network.", "Isolate guest VLAN and block internal routing table.", 4, 2, 1, 2, 50),
                new Incident("INC-2417", "Port Scan", "TCP Port Sweep", "Public Web Application Firewall", now.minus(Duration.ofMinutes(84)), 0, "Sequential TCP port scan detected from external IP range.", "Verify cloud WAF auto-drop rules for scanning IPs.", 4, 3, 2, 4, 50),
                new Incident("INC-2418", "Failed Login Burst", "VPN Authentication Failure Spike", "Corporate Remote VPN Concentrator", now.minus(Duration.ofMinutes(89)), 18, "Burst of failed password attempts for remote employee VPN logins.", "Check user lockout status and monitor authentication log.", 3, 3, 2, 4, 40),
                new Incident("INC-2419", "Port Scan", "DNS Query Reconnaissance", "Public DNS Secondary Nameserver", now.minus(Duration.ofMinutes(94)), 0, "High rate of DNS ANY requests targeting public nameserver.", "Enforce response rate limiting (RRL) on DNS service.", 2, 2, 1, 3, 30),
                new Incident("INC-2420", "Failed Login Burst", "Internal Search Portal Failures", "Internal Wiki Portal", now.minus(Duration.ofMinutes(99)), 3, "Repeated failed logins recorded on internal intranet wiki.", "Reset internal account password if lock threshold reached.", 1, 1, 1, 2, 25)
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
