import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Upload, FileText, AlertTriangle, CheckCircle2, ShieldAlert, AlertCircle, FileCode, Layers } from "lucide-react";

export default function IngestAlertsModal({ onClose, onIngestSuccess, bulkIngestIncidents }) {
  const [activeTab, setActiveTab] = useState("file"); // "file" | "paste"
  const [fileType, setFileType] = useState("json"); // "json" | "csv"
  const [pastedContent, setPastedContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [ingestionSummary, setIngestionSummary] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // Helper to parse CSV cleanly handling quotes
  const parseCSVLine = (line) => {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const parseAndValidate = (content, format) => {
    setErrorMessage("");
    setValidationResult(null);
    setIngestionSummary(null);

    let parsedList = [];
    const errors = [];
    let validCount = 0;
    let invalidCount = 0;

    try {
      if (format === "json") {
        let raw;
        try {
          raw = JSON.parse(content);
        } catch (e) {
          throw new Error("Invalid JSON syntax: " + e.message);
        }

        if (Array.isArray(raw)) {
          parsedList = raw;
        } else if (raw && typeof raw === "object") {
          if (Array.isArray(raw.incidents)) parsedList = raw.incidents;
          else if (Array.isArray(raw.alerts)) parsedList = raw.alerts;
          else throw new Error("JSON must be an array of incident objects or contain an 'incidents' array.");
        } else {
          throw new Error("JSON must be an array of incident objects.");
        }
      } else {
        // CSV parsing
        const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error("CSV file must include a header row and at least one alert data row.");
        }

        const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, "").trim());

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]).map((v) => v.replace(/^["']|["']$/g, "").trim());
          const item = {};

          headers.forEach((header, colIdx) => {
            if (colIdx < values.length) {
              item[header] = values[colIdx];
            }
          });

          parsedList.push({ rawIndex: i, item });
        }
      }

      // Validate parsed items
      const validItems = [];
      parsedList.forEach((rawObj, index) => {
        const item = rawObj.item || rawObj;
        const rowNum = rawObj.rawIndex || index + 1;

        const type = item.incidentType || item.type;
        const asset = item.affectedAsset || item.asset;

        if (!type || String(type).trim().length === 0) {
          errors.push(`Record #${rowNum}: Missing required field 'incidentType' or 'type'`);
          invalidCount++;
          return;
        }

        const numericSeverity = Number(item.severity);
        if (item.severity !== undefined && item.severity !== null && (isNaN(numericSeverity) || numericSeverity < 1 || numericSeverity > 10)) {
          errors.push(`Record #${rowNum} (${type}): 'severity' must be a number between 1 and 10`);
          invalidCount++;
          return;
        }

        validCount++;
        validItems.push({
          incidentId: item.incidentId || item.id || undefined,
          incidentType: String(type).trim(),
          title: item.title || `${type} on ${asset || "Asset"}`,
          affectedAsset: item.affectedAsset || item.asset || "Unspecified Asset",
          severity: item.severity ? Number(item.severity) : 5,
          businessImpact: item.businessImpact ? Number(item.businessImpact) : 5,
          dataSensitivity: item.dataSensitivity ? Number(item.dataSensitivity) : 5,
          assetImportance: item.assetImportance ? Number(item.assetImportance) : 5,
          attackConfidence: item.attackConfidence ? Number(item.attackConfidence) : 50,
          affectedUsers: item.affectedUsers !== undefined ? Number(item.affectedUsers) : item.affectedUsersCount !== undefined ? Number(item.affectedUsersCount) : 0,
          description: item.description || "No description provided.",
          recommendedAction: item.recommendedAction || "Review raw metrics and execute containment procedures.",
          detectedAt: item.detectedAt || new Date().toISOString(),
        });
      });

      setValidationResult({
        total: parsedList.length,
        validCount,
        invalidCount,
        validItems,
        errors,
      });
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    const fmt = extension === "csv" ? "csv" : "json";
    setFileType(fmt);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      setPastedContent(text);
      parseAndValidate(text, fmt);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!validationResult || validationResult.validItems.length === 0) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const summary = await bulkIngestIncidents(validationResult.validItems);
      setIngestionSummary(summary);
      if (onIngestSuccess) {
        onIngestSuccess(summary);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit bulk ingestion request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleJSON = `[
  {
    "incidentId": "ALT-9001",
    "incidentType": "Ransomware Detection",
    "title": "LockBit activity on File Server",
    "affectedAsset": "FIN-STORAGE-SRV-01",
    "severity": 10,
    "businessImpact": 10,
    "dataSensitivity": 9,
    "assetImportance": 10,
    "attackConfidence": 95,
    "affectedUsers": 1200,
    "description": "Ransomware encryption activity detected on network shares."
  },
  {
    "incidentId": "ALT-9002",
    "incidentType": "Data Exfiltration",
    "title": "Exfiltration spike to external IP",
    "affectedAsset": "DB-CUSTOMER-PII",
    "severity": 9,
    "businessImpact": 9,
    "dataSensitivity": 10,
    "assetImportance": 9,
    "attackConfidence": 90,
    "affectedUsers": 5000,
    "description": "Unusual outbound 50GB transfer detected to unverified IP."
  }
]`;

  const sampleCSV = `incidentId,incidentType,title,affectedAsset,severity,businessImpact,dataSensitivity,assetImportance,attackConfidence,affectedUsers,description
ALT-9001,Ransomware Detection,LockBit activity,FIN-STORAGE-SRV-01,10,10,9,10,95,1200,Ransomware encryption activity on core SMB shares.
ALT-9002,Data Exfiltration,Exfiltration spike,DB-CUSTOMER-PII,9,9,10,9,90,5000,Unusual outbound data transfer to unverified IP.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/80 p-4 backdrop-blur-sm sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative my-8 w-full max-w-2xl rounded-xl border border-base-600/70 bg-base-850 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-600/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-cyan/10 text-signal-cyan">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink-100">
                Automated Bulk Alert Ingestion
              </h2>
              <p className="text-xs text-ink-500">
                Upload or paste CSV/JSON security alerts for automatic priority scoring & persistence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-500 hover:bg-base-800 hover:text-ink-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {ingestionSummary ? (
          /* Successful Ingestion Breakdown View */
          <div className="py-6">
            <div className="flex items-center gap-3 rounded-lg border border-signal-green/30 bg-signal-green/10 p-4 text-signal-green">
              <CheckCircle2 size={24} className="shrink-0" />
              <div>
                <h4 className="font-display text-base font-semibold">
                  {ingestionSummary.createdCount} alerts ingested successfully
                </h4>
                <p className="text-xs text-ink-300 mt-0.5">
                  Processed {ingestionSummary.totalProcessed} total alert records into backend database.
                </p>
              </div>
            </div>

            {/* Ingestion Breakdown Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-signal-red/30 bg-signal-red/10 p-3.5 text-center">
                <span className="font-mono text-xs uppercase text-signal-red font-semibold">Critical Risk</span>
                <p className="mt-1 font-mono text-2xl font-bold text-signal-red">{ingestionSummary.criticalCount || 0}</p>
              </div>
              <div className="rounded-lg border border-signal-orange/30 bg-signal-orange/10 p-3.5 text-center">
                <span className="font-mono text-xs uppercase text-signal-orange font-semibold">High Priority</span>
                <p className="mt-1 font-mono text-2xl font-bold text-signal-orange">{ingestionSummary.highCount || 0}</p>
              </div>
              <div className="rounded-lg border border-signal-yellow/30 bg-signal-yellow/10 p-3.5 text-center">
                <span className="font-mono text-xs uppercase text-signal-yellow font-semibold">Medium Priority</span>
                <p className="mt-1 font-mono text-2xl font-bold text-signal-yellow">{ingestionSummary.mediumCount || 0}</p>
              </div>
              <div className="rounded-lg border border-base-600 bg-base-800 p-3.5 text-center">
                <span className="font-mono text-xs uppercase text-ink-400 font-semibold">Low Priority</span>
                <p className="mt-1 font-mono text-2xl font-bold text-ink-200">{ingestionSummary.lowCount || 0}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-mono border-t border-base-600/40 pt-4 text-ink-400">
              <div>Created: <strong className="text-signal-cyan">{ingestionSummary.createdCount}</strong></div>
              <div>Skipped (Duplicates): <strong className="text-signal-yellow">{ingestionSummary.skippedCount}</strong></div>
              <div>Failed: <strong className="text-signal-red">{ingestionSummary.failedCount}</strong></div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-md bg-signal-blue px-5 py-2 text-xs font-semibold text-white shadow-glow hover:opacity-90 transition-opacity"
              >
                Close & View Incidents
              </button>
            </div>
          </div>
        ) : (
          /* File Upload / Paste Form */
          <div className="mt-4 space-y-4">
            {/* Format Picker */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFileType("json");
                    if (pastedContent) parseAndValidate(pastedContent, "json");
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border transition-colors ${
                    fileType === "json"
                      ? "border-signal-cyan bg-signal-cyan/10 text-signal-cyan"
                      : "border-base-600 bg-base-800 text-ink-400 hover:text-ink-200"
                  }`}
                >
                  <FileCode size={14} />
                  JSON Format
                </button>
                <button
                  onClick={() => {
                    setFileType("csv");
                    if (pastedContent) parseAndValidate(pastedContent, "csv");
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border transition-colors ${
                    fileType === "csv"
                      ? "border-signal-cyan bg-signal-cyan/10 text-signal-cyan"
                      : "border-base-600 bg-base-800 text-ink-400 hover:text-ink-200"
                  }`}
                >
                  <FileText size={14} />
                  CSV Format
                </button>
              </div>

              {/* Sample loader buttons */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    const sample = fileType === "json" ? sampleJSON : sampleCSV;
                    setPastedContent(sample);
                    parseAndValidate(sample, fileType);
                  }}
                  className="text-signal-cyan hover:underline font-mono text-[11px]"
                >
                  Load Sample {fileType.toUpperCase()}
                </button>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer flex flex-col items-center justify-center rounded-xl border border-dashed border-base-600 bg-base-900/50 p-6 text-center transition-colors hover:border-signal-cyan hover:bg-base-900/80"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-800 text-ink-400 group-hover:bg-signal-cyan/10 group-hover:text-signal-cyan transition-colors">
                <Upload size={20} />
              </div>
              <p className="mt-2 text-xs font-medium text-ink-200">
                Click to browse or drop your <strong className="text-signal-cyan">{fileType.toUpperCase()}</strong> alert file
              </p>
              <p className="mt-0.5 text-[11px] text-ink-500">Supports up to 100+ alert records per batch</p>
            </div>

            {/* Raw Content Textarea */}
            <div>
              <label className="block text-xs font-medium text-ink-400 mb-1">
                Or Paste Alert Payload ({fileType.toUpperCase()})
              </label>
              <textarea
                value={pastedContent}
                onChange={(e) => {
                  setPastedContent(e.target.value);
                  parseAndValidate(e.target.value, fileType);
                }}
                rows={4}
                placeholder={`Paste your ${fileType.toUpperCase()} alerts array here...`}
                className="w-full rounded-lg border border-base-600 bg-base-900 p-3 font-mono text-xs text-ink-100 placeholder:text-ink-600 focus:border-signal-cyan focus:outline-none"
              />
            </div>

            {/* Error Message if parsing failed */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-signal-red/30 bg-signal-red/10 p-3 text-xs text-signal-red">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Validation Results Box */}
            {validationResult && (
              <div className="rounded-lg border border-base-600 bg-base-900/70 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-ink-300">Validation Status:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-signal-green font-semibold">Valid: {validationResult.validCount}</span>
                    {validationResult.invalidCount > 0 && (
                      <span className="text-signal-red font-semibold">Invalid: {validationResult.invalidCount}</span>
                    )}
                  </div>
                </div>

                {validationResult.errors.length > 0 && (
                  <div className="mt-2 max-h-24 overflow-y-auto rounded bg-base-950 p-2 text-[11px] font-mono text-signal-orange space-y-1">
                    {validationResult.errors.map((err, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <AlertCircle size={12} className="shrink-0 text-signal-orange" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-base-600/50 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-base-600 px-4 py-2 text-xs font-medium text-ink-300 hover:bg-base-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing || !validationResult || validationResult.validItems.length === 0}
                className="flex items-center gap-2 rounded-md bg-signal-blue px-4 py-2 text-xs font-semibold text-white shadow-glow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
              >
                {isProcessing ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Ingesting Alerts...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Ingest {validationResult?.validItems?.length || 0} Alerts
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
