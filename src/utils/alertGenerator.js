// Utility to generate realistic, varied cybersecurity alerts for bulk simulation

const INCIDENT_TYPES = [
  { type: "Ransomware Detection", defaultAsset: "Core Storage & File Server", desc: "Endpoint flagged ransomware encryption behavior on network shares." },
  { type: "Phishing Campaign", defaultAsset: "Corporate Email Gateway", desc: "Spear-phishing email containing malicious OAuth consent link delivered to staff." },
  { type: "Malware Detection", defaultAsset: "Executive Workstation Node", desc: "InfoStealer Trojan executed attempting credential extraction from memory." },
  { type: "Suspicious Login", defaultAsset: "Identity Provider (SSO)", desc: "Multiple concurrent logins detected from geographically impossible locations." },
  { type: "Data Exfiltration", defaultAsset: "Customer PII Database", desc: "Unusual high-volume outbound data transfer detected to suspicious external IP." },
  { type: "DDoS Activity", defaultAsset: "Edge Ingress Firewall", desc: "Volumetric SYN flood saturating primary edge firewall bandwidth." },
  { type: "SQL Injection", defaultAsset: "Public E-Commerce Gateway", desc: "Automated SQL injection payload detected in HTTP parameter query strings." },
  { type: "Brute Force Attack", defaultAsset: "Corporate VPN Concentrator", desc: "Distributed credential stuffing attack targeting employee authentication portal." },
  { type: "Privilege Escalation", defaultAsset: "Active Directory DC-01", desc: "Kerberoasting exploit attempt aiming for SYSTEM privilege escalation on DC." },
  { type: "Unauthorized Access", defaultAsset: "Payment API Gateway", desc: "Anomalous API key invocation pattern detected targeting billing microservice." },
  { type: "Zero-Day Exploit", defaultAsset: "DMZ Web Application Server", desc: "Unpatched RCE vulnerability exploitation attempt detected via WAF logs." },
  { type: "Insider Threat", defaultAsset: "HR & Payroll Vault", desc: "Departing employee downloaded abnormally high volume of confidential HR files." },
];

const ASSET_NAMES = [
  "DB-PROD-CUSTOMER-01",
  "SSO-GATEWAY-AUTH",
  "FIN-SRV-PAYROLL",
  "K8S-CLUSTER-INGRESS",
  "EDGE-FIREWALL-MAIN",
  "EXEC-LAPTOP-CEO",
  "LEGAL-DOCS-S3-BUCKET",
  "ENG-SANDBOX-NODE-04",
  "LEGACY-PROXY-NODE",
  "DNS-SECONDARY-NS",
  "BUILD-JENKINS-WORKER-02",
  "API-GATEWAY-PAYMENTS",
];

export function generateAlerts(count = 100) {
  const alerts = [];
  const baseTimestamp = Date.now();

  for (let i = 1; i <= count; i++) {
    const typeObj = INCIDENT_TYPES[(i - 1) % INCIDENT_TYPES.length];
    const asset = ASSET_NAMES[(i - 1) % ASSET_NAMES.length] + `-${Math.floor(i / 10) + 1}`;
    const id = `INC-${3000 + i}`;

    // Create varied factor distribution so scores span Critical, High, Medium, Low
    let severity, businessImpact, dataSensitivity, assetImportance, attackConfidence, affectedUsers;

    if (i % 4 === 1) {
      // Critical profile (Score >= 90)
      severity = 9 + (i % 2);
      businessImpact = 9 + (i % 2);
      dataSensitivity = 8 + (i % 3);
      assetImportance = 9 + (i % 2);
      attackConfidence = 85 + (i % 15);
      affectedUsers = 1500 + i * 40;
    } else if (i % 4 === 2) {
      // High profile (70 <= Score < 90)
      severity = 7 + (i % 2);
      businessImpact = 7 + (i % 2);
      dataSensitivity = 6 + (i % 3);
      assetImportance = 7 + (i % 2);
      attackConfidence = 75 + (i % 20);
      affectedUsers = 300 + i * 15;
    } else if (i % 4 === 3) {
      // Medium profile (40 <= Score < 70)
      severity = 4 + (i % 3);
      businessImpact = 4 + (i % 3);
      dataSensitivity = 4 + (i % 3);
      assetImportance = 5 + (i % 2);
      attackConfidence = 50 + (i % 30);
      affectedUsers = 20 + i * 5;
    } else {
      // Low profile (Score < 40)
      severity = 1 + (i % 3);
      businessImpact = 1 + (i % 3);
      dataSensitivity = 1 + (i % 3);
      assetImportance = 2 + (i % 2);
      attackConfidence = 20 + (i % 30);
      affectedUsers = i % 5;
    }

    alerts.push({
      incidentId: id,
      incidentType: typeObj.type,
      title: `${typeObj.type} on ${asset}`,
      affectedAsset: asset,
      severity,
      businessImpact,
      dataSensitivity,
      assetImportance,
      attackConfidence,
      affectedUsers,
      description: `${typeObj.desc} (Alert batch simulation sequence #${i})`,
      recommendedAction: "Review factor metrics and follow incident response playbook.",
      detectedAt: new Date(baseTimestamp - i * 60000).toISOString(),
    });
  }

  return alerts;
}
