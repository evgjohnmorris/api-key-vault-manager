import { hasText } from "./readiness.js";

export const POLICY_RULES = [
  {
    id: "POL-PROD-OWNER",
    severity: "High",
    title: "Production credentials require an owner",
    detail: "Production entries need an accountable owner before they are safe to operate.",
    test: (entry) => entry.environment !== "Production" || hasText(entry.owner)
  },
  {
    id: "POL-RISK-ROTATION",
    severity: "Critical",
    title: "High-risk credentials need rotation",
    detail: "High or critical credentials cannot rely on no-expiration rotation.",
    test: (entry) => !["High", "Critical"].includes(entry.riskLevel) || entry.rotationCadence !== "No expiration"
  },
  {
    id: "POL-PROD-RESTRICT",
    severity: "High",
    title: "Production credentials need restrictions",
    detail: "Production keys should document scopes, origins, allowed IPs, or rate limits.",
    test: (entry) => entry.environment !== "Production" || hasRestrictions(entry)
  },
  {
    id: "POL-ACTIVE-VERIFY",
    severity: "Medium",
    title: "Active credentials need verification evidence",
    detail: "Active credentials should include a last verified date.",
    test: (entry) => entry.status !== "Active" || hasText(entry.lastVerifiedAt)
  },
  {
    id: "POL-ADS-PRIVACY",
    severity: "High",
    title: "Ad and analytics providers need privacy purpose",
    detail: "Ads, analytics, attribution, and tag-manager entries should document purpose and privacy/evidence notes.",
    test: (entry) => !isAdOrAnalytics(entry) || ((hasText(entry.purpose) || hasText(entry.useCase)) && (hasText(entry.notes) || hasText(entry.docsUrl)))
  },
  {
    id: "POL-BLOCKED-REASON",
    severity: "Medium",
    title: "Blocked entries need blockers",
    detail: "Blocked entries should explain what is blocking setup or safe use.",
    test: (entry) => entry.status !== "Blocked" || hasText(entry.blockers)
  },
  {
    id: "POL-UNKNOWN-CLASSIFICATION",
    severity: "Low",
    title: "Unknown classifications need cleanup",
    detail: "Unknown risk or environment weakens filtering, reporting, and release decisions.",
    test: (entry) => entry.riskLevel !== "Unknown" && entry.environment !== "Unknown"
  }
];

export function evaluateEntryPolicies(entry) {
  return POLICY_RULES
    .filter((rule) => !rule.test(entry || {}))
    .map((rule) => ({
      id: rule.id,
      severity: rule.severity,
      title: rule.title,
      detail: rule.detail,
      entryId: entry?.id || "",
      entryName: entry?.name || entry?.provider || "Untitled entry"
    }));
}

export function evaluateVaultPolicies(entries = []) {
  const violations = entries.flatMap((entry) => evaluateEntryPolicies(entry));
  const bySeverity = countBySeverity(violations);
  const entriesWithViolations = new Set(violations.map((violation) => violation.entryId).filter(Boolean)).size;
  const weightedImpact = (bySeverity.Critical * 18) + (bySeverity.High * 10) + (bySeverity.Medium * 5) + (bySeverity.Low * 2);
  const score = clampPercent(100 - weightedImpact);

  return {
    score,
    violations,
    bySeverity,
    entriesWithViolations,
    rulesEvaluated: POLICY_RULES.length,
    total: violations.length
  };
}

export function policySeverityClass(severity = "") {
  return String(severity).toLowerCase();
}

function countBySeverity(violations) {
  return violations.reduce((counts, violation) => {
    counts[violation.severity] = (counts[violation.severity] || 0) + 1;
    return counts;
  }, {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0
  });
}

function hasRestrictions(entry) {
  return hasText(entry.scopes) || hasText(entry.allowedOrigins) || hasText(entry.allowedIps) || hasText(entry.rateLimit);
}

function isAdOrAnalytics(entry) {
  return [
    entry.type,
    entry.category,
    entry.purpose
  ].some((value) => /ad|ads|analytics|attribution|tag manager|monetization/i.test(String(value || "")));
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}
