import { calculateOperationalPhysics } from "../operationalPhysics.js";
import { getStandardsProgress } from "../standards.js";
import { evaluateVaultPolicies } from "./policies.js";
import { getEntryReadiness } from "./readiness.js";

export function buildVaultStats(vault = {}, options = {}) {
  const entries = Array.isArray(vault.entries) ? vault.entries : [];
  const standards = getStandardsProgress(vault.standards);
  const policy = evaluateVaultPolicies(entries);
  const physics = calculateOperationalPhysics({
    entries,
    standardsProgress: standards,
    auditLog: Array.isArray(vault.auditLog) ? vault.auditLog : [],
    now: options.now
  });

  return {
    total: entries.length,
    critical: entries.filter((entry) => entry.riskLevel === "Critical").length,
    blocked: entries.filter((entry) => entry.status === "Blocked").length,
    noExpiration: entries.filter((entry) => entry.rotationCadence === "No expiration").length,
    standardsReady: standards.ready,
    standardsPercent: standards.percent,
    standardsAssurancePercent: standards.assurancePercent,
    standardsMissingEvidence: standards.missingEvidence,
    standardsMissingOwner: standards.missingOwner,
    standardsOverdue: standards.overdue,
    policyScore: policy.score,
    policyViolations: policy.total,
    policyCritical: policy.bySeverity.Critical,
    policyHigh: policy.bySeverity.High,
    policy,
    physics
  };
}

export function buildCommandCenter(entries = [], stats = {}) {
  const readinessScores = entries.map((entry) => getEntryReadiness(entry).percent);
  const averageReadiness = readinessScores.length
    ? Math.round(readinessScores.reduce((total, score) => total + score, 0) / readinessScores.length)
    : 0;
  const incomplete = entries.filter((entry) => getEntryReadiness(entry).percent < 75).length;
  const riskyNoExpiration = entries.filter((entry) => entry.rotationCadence === "No expiration" && entry.riskLevel !== "Low").length;
  const needsVerification = entries.filter((entry) => entry.status === "Needs verification" || !entry.lastVerifiedAt).length;
  const production = entries.filter((entry) => entry.environment === "Production").length;
  const deductions = ((stats.critical || 0) * 10)
    + ((stats.blocked || 0) * 12)
    + (riskyNoExpiration * 7)
    + (incomplete * 4)
    + Math.round((100 - Number(stats.standardsPercent || 0)) / 5);
  const healthScore = Math.max(0, Math.min(100, 100 - deductions + Math.round(averageReadiness / 10)));
  const actions = [];

  if (!entries.length) {
    actions.push({ label: "Create first credential", detail: "Start the vault with a real provider entry.", action: "new-entry" });
  }

  if (stats.critical) {
    actions.push({ label: "Review critical risk", detail: `${stats.critical} credential${stats.critical === 1 ? "" : "s"} marked critical.`, action: "Critical" });
  }

  if (riskyNoExpiration) {
    actions.push({
      label: "Fix no-expiration risk",
      detail: riskyNoExpiration === 1
        ? "1 non-low-risk credential lacks rotation pressure."
        : `${riskyNoExpiration} non-low-risk credentials lack rotation pressure.`,
      action: "No expiration"
    });
  }

  if (needsVerification) {
    actions.push({ label: "Verify stale entries", detail: `${needsVerification} credential${needsVerification === 1 ? "" : "s"} need verification evidence.`, action: "Needs verification" });
  }

  if (incomplete) {
    actions.push({
      label: "Complete metadata",
      detail: incomplete === 1
        ? "1 entry needs more operational context."
        : `${incomplete} entries need more operational context.`,
      action: "Incomplete"
    });
  }

  if (stats.standardsPercent < 60) {
    actions.push({ label: "Raise ISO evidence", detail: `Standards readiness is ${stats.standardsPercent}%.`, action: "standards" });
  } else if (stats.standardsAssurancePercent < stats.standardsPercent) {
    actions.push({
      label: "Assure ISO controls",
      detail: `${stats.standardsMissingEvidence} evidence gap${stats.standardsMissingEvidence === 1 ? "" : "s"} and ${stats.standardsMissingOwner} owner gap${stats.standardsMissingOwner === 1 ? "" : "s"}.`,
      action: "standards"
    });
  }

  if (stats.policy?.total) {
    actions.push({
      label: "Resolve policy gaps",
      detail: `${stats.policy.total} policy issue${stats.policy.total === 1 ? "" : "s"} across ${stats.policy.entriesWithViolations} entr${stats.policy.entriesWithViolations === 1 ? "y" : "ies"}.`,
      action: "Policy issues"
    });
  }

  return {
    healthScore,
    averageReadiness,
    incomplete,
    riskyNoExpiration,
    needsVerification,
    production,
    physics: stats.physics,
    policy: stats.policy,
    actions: actions.slice(0, 4)
  };
}
