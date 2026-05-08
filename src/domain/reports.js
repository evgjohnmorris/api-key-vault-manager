import { redactEntry } from "../schema.js";
import {
  STANDARD_CONTROLS,
  getControlAssurance,
  getStandardsProgress,
  normalizeStandardsState,
  redactStandardsState
} from "../standards.js";
import { sanitizeAuditMetadata } from "../core/audit.js";
import { buildVaultStats } from "./dashboard.js";
import { evaluateEntryPolicies, evaluateVaultPolicies, POLICY_RULES } from "./policies.js";
import { getEntryReadiness } from "./readiness.js";

export const REPORT_TYPES = [
  "redacted-inventory",
  "statement-of-applicability",
  "audit-packet",
  "policy-register",
  "risk-register"
];

export function buildRedactedInventoryExport(vault, { exportedAt }) {
  return {
    exportedAt,
    redacted: true,
    reportType: "redacted-inventory",
    reportTypes: REPORT_TYPES,
    settings: {
      ...vault.settings,
      autoLockMinutes: undefined,
      clipboardClearSeconds: undefined
    },
    standards: redactStandardsState(vault.standards),
    entries: vault.entries.map(redactEntry)
  };
}

export function buildGovernanceReportBundle(vault, options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const now = options.now || Date.parse(generatedAt);

  return {
    generatedAt,
    redacted: true,
    reportTypes: REPORT_TYPES.filter((type) => type !== "redacted-inventory"),
    reports: {
      statementOfApplicability: buildStatementOfApplicability(vault, { generatedAt }),
      auditPacket: buildAuditPacket(vault, { generatedAt, now }),
      policyRegister: buildPolicyRegister(vault, { generatedAt }),
      riskRegister: buildRiskRegister(vault, { generatedAt, now })
    }
  };
}

export function buildStatementOfApplicability(vault, { generatedAt } = {}) {
  const standards = normalizeStandardsState(vault?.standards);
  const progress = getStandardsProgress(standards);

  return {
    reportType: "statement-of-applicability",
    generatedAt,
    redacted: true,
    summary: progress,
    controls: STANDARD_CONTROLS.map((control) => {
      const record = standards.controls[control.id];
      const assurance = getControlAssurance(control, record);

      return {
        id: control.id,
        title: control.title,
        domain: control.domain,
        phase: control.phase,
        priority: control.priority,
        standards: control.standards,
        applicable: record.status !== "Not applicable",
        status: record.status,
        owner: record.owner,
        dueDate: record.dueDate,
        ready: assurance.ready,
        evidenceBacked: assurance.evidenceBacked,
        assurance: {
          missingEvidence: assurance.missingEvidence,
          missingOwner: assurance.missingOwner,
          missingDueDate: assurance.missingDueDate,
          overdue: assurance.overdue
        },
        evidence: record.evidence ? "[redacted evidence]" : "",
        implementation: control.implementation
      };
    })
  };
}

export function buildAuditPacket(vault, { generatedAt, now } = {}) {
  const safeVault = normalizeVaultShape(vault);
  const stats = buildVaultStats(safeVault, { now });

  return {
    reportType: "audit-packet",
    generatedAt,
    redacted: true,
    summary: {
      totalEntries: stats.total,
      policyScore: stats.policyScore,
      policyViolations: stats.policyViolations,
      standardsReadyPercent: stats.standardsPercent,
      standardsAssurancePercent: stats.standardsAssurancePercent,
      auditEvents: safeVault.auditLog.length
    },
    recentEvents: safeVault.auditLog.slice(0, 100).map(redactAuditEvent)
  };
}

export function buildPolicyRegister(vault, { generatedAt } = {}) {
  const entries = normalizeEntries(vault);
  const summary = evaluateVaultPolicies(entries);

  return {
    reportType: "policy-register",
    generatedAt,
    redacted: true,
    summary,
    rules: POLICY_RULES.map((rule) => ({
      id: rule.id,
      severity: rule.severity,
      title: rule.title,
      detail: rule.detail
    })),
    entries: entries
      .map((entry) => ({
        entry: summarizeEntry(entry),
        violations: evaluateEntryPolicies(entry)
      }))
      .filter((item) => item.violations.length)
  };
}

export function buildRiskRegister(vault, { generatedAt, now } = {}) {
  const entries = normalizeEntries(vault);

  return {
    reportType: "risk-register",
    generatedAt,
    redacted: true,
    generatedFor: "operational-risk-review",
    risks: entries
      .map((entry) => buildEntryRisk(entry, now))
      .sort((left, right) => right.riskScore - left.riskScore)
  };
}

function normalizeVaultShape(vault) {
  return {
    entries: normalizeEntries(vault),
    standards: vault?.standards,
    auditLog: Array.isArray(vault?.auditLog) ? vault.auditLog : []
  };
}

function normalizeEntries(vault) {
  return Array.isArray(vault?.entries) ? vault.entries : [];
}

function summarizeEntry(entry) {
  const redacted = redactEntry(entry);

  return {
    id: redacted.id,
    name: redacted.name,
    provider: redacted.provider,
    type: redacted.type,
    category: redacted.category,
    purpose: redacted.purpose,
    environment: redacted.environment,
    status: redacted.status,
    riskLevel: redacted.riskLevel,
    rotationCadence: redacted.rotationCadence,
    owner: redacted.owner,
    project: redacted.project,
    tags: redacted.tags,
    docsUrl: redacted.docsUrl,
    dashboardUrl: redacted.dashboardUrl,
    secretValue: redacted.secretValue
  };
}

function buildEntryRisk(entry, now) {
  const readiness = getEntryReadiness(entry);
  const violations = evaluateEntryPolicies(entry);
  const baseRisk = riskWeight(entry.riskLevel);
  const productionPressure = entry.environment === "Production" ? 12 : 0;
  const blockedPressure = entry.status === "Blocked" ? 12 : 0;
  const stalePressure = entry.status === "Needs verification" || !entry.lastVerifiedAt ? 10 : 0;
  const noExpirationPressure = entry.rotationCadence === "No expiration" && entry.riskLevel !== "Low" ? 14 : 0;
  const policyPressure = violations.reduce((total, violation) => total + severityWeight(violation.severity), 0);
  const readinessDrag = Math.max(0, 100 - readiness.percent) / 4;

  return {
    entry: summarizeEntry(entry),
    riskScore: clamp(Math.round(baseRisk + productionPressure + blockedPressure + stalePressure + noExpirationPressure + policyPressure + readinessDrag), 0, 100),
    reviewAt: now ? new Date(now).toISOString() : "",
    readinessPercent: readiness.percent,
    missingReadiness: readiness.missing,
    policyViolations: violations,
    drivers: [
      entry.environment === "Production" ? "production" : "",
      entry.status === "Blocked" ? "blocked" : "",
      entry.status === "Needs verification" || !entry.lastVerifiedAt ? "verification" : "",
      entry.rotationCadence === "No expiration" && entry.riskLevel !== "Low" ? "rotation" : "",
      violations.length ? "policy" : "",
      readiness.percent < 75 ? "readiness" : ""
    ].filter(Boolean)
  };
}

function redactAuditEvent(event) {
  return {
    ...event,
    metadata: sanitizeAuditMetadata(event?.metadata || {})
  };
}

function riskWeight(riskLevel) {
  if (riskLevel === "Critical") return 60;
  if (riskLevel === "High") return 44;
  if (riskLevel === "Medium") return 26;
  if (riskLevel === "Low") return 10;
  return 20;
}

function severityWeight(severity) {
  if (severity === "Critical") return 14;
  if (severity === "High") return 9;
  if (severity === "Medium") return 5;
  return 2;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
