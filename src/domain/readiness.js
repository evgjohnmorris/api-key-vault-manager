export const ENTRY_READINESS_CHECKS = [
  {
    label: "Identity",
    missing: "name or provider",
    test: (entry) => hasText(entry.name) && hasText(entry.provider)
  },
  {
    label: "Purpose",
    missing: "purpose",
    test: (entry) => hasText(entry.purpose) || hasText(entry.useCase)
  },
  {
    label: "Secret source",
    missing: "secret or storage path",
    test: (entry) => hasText(entry.secretValue) || hasText(entry.storagePath)
  },
  {
    label: "Restrictions",
    missing: "scopes or restrictions",
    test: (entry) => hasText(entry.scopes) || hasText(entry.allowedOrigins) || hasText(entry.allowedIps) || hasText(entry.rateLimit)
  },
  {
    label: "Rotation",
    missing: "safe rotation plan",
    test: (entry) => Boolean(entry.rotationCadence && (entry.rotationCadence !== "No expiration" || entry.riskLevel === "Low"))
  },
  {
    label: "Verification",
    missing: "verification date",
    test: (entry) => hasText(entry.lastVerifiedAt) || entry.status === "Active"
  },
  {
    label: "References",
    missing: "URL, docs, or notes",
    test: (entry) => hasText(entry.url) || hasText(entry.dashboardUrl) || hasText(entry.docsUrl) || hasText(entry.notes)
  }
];

export function getEntryReadiness(entry) {
  const checkpoints = ENTRY_READINESS_CHECKS.map((check) => ({
    label: check.label,
    done: check.test(entry || {}),
    missing: check.missing
  }));
  const doneCount = checkpoints.filter((checkpoint) => checkpoint.done).length;

  return {
    percent: Math.round((doneCount / checkpoints.length) * 100),
    missing: checkpoints.filter((checkpoint) => !checkpoint.done).map((checkpoint) => checkpoint.missing),
    checkpoints
  };
}

export function calculateEntryReadiness(entry) {
  return getEntryReadiness(entry).percent;
}

export function hasText(value) {
  return String(value || "").trim().length > 0;
}
