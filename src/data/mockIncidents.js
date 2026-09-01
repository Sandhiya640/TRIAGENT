// Mock incident dataset for TRIAGENT demo purposes.
// Raw incident inputs:
// - Severity: 1-10
// - Data Sensitivity: 1-10
// - Asset Importance: 1-10
// - Business Impact: 1-10
// - Attack Confidence: 0-100
// - Affected Users: actual numeric count

const now = Date.now();
const minsAgo = (m) => new Date(now - m * 60 * 1000).toISOString();

export const mockIncidents = [
  {
    id: "INC-2401",
    type: "Data Exfiltration Attempt",
    asset: "Production Customer DB",
    detectedAt: minsAgo(4),
    affectedUsersCount: 2847,
    status: "Awaiting Triage",
    description:
      "Unusual outbound data transfer detected from the primary production customer database to an unrecognized external IP address. Exfiltration rate is escalating.",
    recommendedAction:
      "Immediately isolate host DB-PROD-01, revoke active token credentials, and terminate external egress sockets.",
    rawFactors: {
      severity: 10,
      businessImpact: 10,
      dataSensitivity: 9,
      assetImportance: 10,
      attackConfidence: 90,
      affectedUsersCount: 2847,
    },
  },
  {
    id: "INC-2402",
    type: "Ransomware Detection",
    asset: "Finance & Payroll Server",
    detectedAt: minsAgo(11),
    affectedUsersCount: 612,
    status: "Awaiting Triage",
    description:
      "Endpoint detection flagged active file encryption behavior matching LockBit ransomware family executing on finance network file shares.",
    recommendedAction:
      "Quarantine server FIN-SRV-04 from the local subnet, isolate backup volumes, and invoke incident response playbook.",
    rawFactors: {
      severity: 10,
      businessImpact: 9,
      dataSensitivity: 9,
      assetImportance: 9,
      attackConfidence: 95,
      affectedUsersCount: 612,
    },
  },
  {
    id: "INC-2403",
    type: "Brute Force Attack",
    asset: "Identity Gateway (SSO)",
    detectedAt: minsAgo(18),
    affectedUsersCount: 340,
    status: "Awaiting Triage",
    description:
      "Distributed brute-force attack originating from 120+ residential proxies targeting corporate SSO accounts and administrative credentials.",
    recommendedAction:
      "Enforce IP rate limiting on endpoint /auth/v1/login, enforce STEP-UP MFA for privileged roles, and block proxy IP block.",
    rawFactors: {
      severity: 9,
      businessImpact: 8,
      dataSensitivity: 6,
      assetImportance: 9,
      attackConfidence: 92,
      affectedUsersCount: 340,
    },
  },
  {
    id: "INC-2404",
    type: "Phishing Campaign",
    asset: "Corporate Email Server",
    detectedAt: minsAgo(26),
    affectedUsersCount: 1240,
    status: "Awaiting Triage",
    description:
      "Spear-phishing email containing malicious OAuth application consent URL sent to 1,200+ employees impersonating IT HR portal.",
    recommendedAction:
      "Purge malicious messages from exchange server, revoke compromised OAuth grants, and reset impacted employee sessions.",
    rawFactors: {
      severity: 8,
      businessImpact: 7,
      dataSensitivity: 6,
      assetImportance: 6,
      attackConfidence: 80,
      affectedUsersCount: 1240,
    },
  },
  {
    id: "INC-2405",
    type: "Privilege Escalation",
    asset: "Internal Admin Node",
    detectedAt: minsAgo(34),
    affectedUsersCount: 8,
    status: "Awaiting Triage",
    description:
      "Local exploit observed on admin management host elevating service account token to SYSTEM privileges via Kernel vulnerability.",
    recommendedAction:
      "Isolate host ADM-NODE-02, audit recently spawned processes, and deploy security patch KB-9021.",
    rawFactors: {
      severity: 7,
      businessImpact: 6,
      dataSensitivity: 5,
      assetImportance: 8,
      attackConfidence: 75,
      affectedUsersCount: 8,
    },
  },
  {
    id: "INC-2406",
    type: "Suspicious Network Traffic",
    asset: "Core API Gateway",
    detectedAt: minsAgo(39),
    affectedUsersCount: 450,
    status: "Awaiting Triage",
    description:
      "Anomalous UDP traffic spike targeting core API endpoints from unrecognized ASN, causing minor latency degraded performance.",
    recommendedAction:
      "Activate Cloudflare DDoS mitigation mode, analyze traffic payload samples, and block origin subnet.",
    rawFactors: {
      severity: 6,
      businessImpact: 6,
      dataSensitivity: 4,
      assetImportance: 7,
      attackConfidence: 65,
      affectedUsersCount: 450,
    },
  },
  {
    id: "INC-2407",
    type: "DDoS Activity",
    asset: "Edge Firewall Load Balancer",
    detectedAt: minsAgo(45),
    affectedUsersCount: 1500,
    status: "Awaiting Triage",
    description:
      "Volumetric SYN flood attack saturating 85% bandwidth capacity on edge load balancers for external web services.",
    rawFactors: {
      severity: 8,
      businessImpact: 8,
      dataSensitivity: 3,
      assetImportance: 8,
      attackConfidence: 98,
      affectedUsersCount: 1500,
    },
    recommendedAction: "Reroute incoming edge traffic through scrubber network.",
  },
  {
    id: "INC-2408",
    type: "Port Scan",
    asset: "Public Web Server",
    detectedAt: minsAgo(52),
    affectedUsersCount: 0,
    status: "Awaiting Triage",
    description:
      "Sequential TCP SYN port sweep across all ports detected from external IP range, indicative of reconnaissance scanner.",
    recommendedAction:
      "Verify edge firewall policy denies all unmapped ports; add scanner IP to automatic threat intelligence blocklist.",
    rawFactors: {
      severity: 4,
      businessImpact: 3,
      dataSensitivity: 2,
      assetImportance: 4,
      attackConfidence: 50,
      affectedUsersCount: 0,
    },
  },
  {
    id: "INC-2409",
    type: "Failed Login Burst",
    asset: "VPN Concentrator",
    detectedAt: minsAgo(61),
    affectedUsersCount: 15,
    status: "Awaiting Triage",
    description:
      "Burst of 45 failed authentication attempts recorded for 3 active user accounts from single remote worker IP.",
    recommendedAction:
      "Contact account holders to verify password reset status; no escalation needed unless geo-anomaly detected.",
    rawFactors: {
      severity: 2,
      businessImpact: 2,
      dataSensitivity: 1,
      assetImportance: 3,
      attackConfidence: 35,
      affectedUsersCount: 15,
    },
  },
  {
    id: "INC-2410",
    type: "Insider Threat Alert",
    asset: "HR & Legal Records Repository",
    detectedAt: minsAgo(68),
    affectedUsersCount: 150,
    status: "Awaiting Triage",
    description:
      "A departing contractor account downloaded 4.2 GB of confidential executive compensation and legal documents after working hours.",
    recommendedAction:
      "Immediately revoke IAM role permissions, place legal hold on account logs, and notify CISO & legal team.",
    rawFactors: {
      severity: 8,
      businessImpact: 9,
      dataSensitivity: 10,
      assetImportance: 8,
      attackConfidence: 88,
      affectedUsersCount: 150,
    },
  },
  {
    id: "INC-2411",
    type: "Unauthorized API Access",
    asset: "Partner Integration Service",
    detectedAt: minsAgo(75),
    affectedUsersCount: 85,
    status: "Awaiting Triage",
    description:
      "API request burst using expired partner key detected attempting to query customer telemetry logs.",
    recommendedAction:
      "Invalidate key pair immediately, return HTTP 403 Forbidden, and notify partner technical contact.",
    rawFactors: {
      severity: 5,
      businessImpact: 5,
      dataSensitivity: 6,
      assetImportance: 5,
      attackConfidence: 70,
      affectedUsersCount: 85,
    },
  },
  {
    id: "INC-2412",
    type: "Malware Detection",
    asset: "Engineering Workstation",
    detectedAt: minsAgo(84),
    affectedUsersCount: 3,
    status: "Awaiting Triage",
    description:
      "Defender flagged suspicious PowerShell script execution attempting memory dump on engineering workstation.",
    recommendedAction:
      "Isolate host ENG-LAP-91, perform full EDR threat sweep, and collect memory dump for malware analysis.",
    rawFactors: {
      severity: 6,
      businessImpact: 4,
      dataSensitivity: 5,
      assetImportance: 5,
      attackConfidence: 80,
      affectedUsersCount: 3,
    },
  },
];

export const INCIDENT_TYPES = [
  "Data Exfiltration Attempt",
  "Ransomware Detection",
  "Malware Detection",
  "Brute Force Attack",
  "Phishing Campaign",
  "Privilege Escalation",
  "Suspicious Network Traffic",
  "DDoS Activity",
  "Port Scan",
  "Failed Login Burst",
  "Insider Threat Alert",
  "Unauthorized API Access",
];

