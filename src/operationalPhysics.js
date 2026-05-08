import { calculateEntryReadiness, hasText } from "./domain/readiness.js";

export function calculateOperationalPhysics({ entries = [], standardsProgress = {}, auditLog = [], now = Date.now() } = {}) {
  const inventory = entries.map((entry) => ({
    entry,
    readiness: calculateEntryReadiness(entry)
  }));
  const total = Math.max(entries.length, 1);
  const critical = count(entries, (entry) => entry.riskLevel === "Critical");
  const high = count(entries, (entry) => entry.riskLevel === "High");
  const blocked = count(entries, (entry) => entry.status === "Blocked");
  const production = count(entries, (entry) => entry.environment === "Production");
  const needsVerification = count(entries, (entry) => entry.status === "Needs verification" || !hasText(entry.lastVerifiedAt));
  const riskyNoExpiration = count(entries, (entry) => entry.rotationCadence === "No expiration" && entry.riskLevel !== "Low");
  const incomplete = inventory.filter((item) => item.readiness < 75).length;
  const averageReadiness = inventory.length
    ? Math.round(inventory.reduce((sum, item) => sum + item.readiness, 0) / inventory.length)
    : 0;
  const recentActivity = auditLog.filter((event) => isRecent(event.at, now)).length;
  const exposure = clampPercent(Math.round(((critical * 22) + (high * 12) + (production * 7) + (riskyNoExpiration * 16)) / total));
  const pressure = clampPercent(Math.round(((critical * 18) + (blocked * 22) + (riskyNoExpiration * 14) + (needsVerification * 7) + (incomplete * 6)) / total));
  const drag = clampPercent(Math.round(
    ((standardsProgress.missingEvidence || 0) * 4)
      + ((standardsProgress.missingOwner || 0) * 3)
      + ((standardsProgress.overdue || 0) * 9)
      + ((100 - (standardsProgress.assurancePercent || 0)) * 0.38)
  ));
  const resilience = clampPercent(Math.round((averageReadiness * 0.48) + ((standardsProgress.assurancePercent || 0) * 0.52)));
  const momentum = clampPercent(Math.round(
    (averageReadiness * 0.34)
      + ((standardsProgress.percent || 0) * 0.34)
      + (Math.min(recentActivity, 12) * 2.6)
      - (blocked * 5)
  ));
  const stability = clampPercent(Math.round(
    58
      + (resilience * 0.34)
      + (momentum * 0.18)
      - (pressure * 0.28)
      - (drag * 0.18)
      - (exposure * 0.16)
  ));
  const gravity = clampPercent(Math.round(
    ((critical + high + blocked + riskyNoExpiration + (standardsProgress.overdue || 0)) / (total + 4)) * 100
  ));

  return {
    averageReadiness,
    pressure,
    drag,
    resilience,
    exposure,
    momentum,
    stability,
    gravity,
    state: describeStability(stability),
    summary: summarizePhysics({ pressure, drag, resilience, stability, exposure }),
    counts: {
      blocked,
      critical,
      high,
      incomplete,
      needsVerification,
      production,
      recentActivity,
      riskyNoExpiration
    },
    vectors: [
      {
        key: "pressure",
        label: "Pressure",
        value: pressure,
        direction: "lower",
        detail: "Risk, blocked work, stale verification, incomplete metadata."
      },
      {
        key: "drag",
        label: "Drag",
        value: drag,
        direction: "lower",
        detail: "Standards evidence, owner, assurance, and due-date gaps."
      },
      {
        key: "resilience",
        label: "Resilience",
        value: resilience,
        direction: "higher",
        detail: "Entry completeness plus assured ISO control evidence."
      },
      {
        key: "exposure",
        label: "Exposure",
        value: exposure,
        direction: "lower",
        detail: "Critical/high production credentials and unsafe no-expiration keys."
      },
      {
        key: "momentum",
        label: "Momentum",
        value: momentum,
        direction: "higher",
        detail: "Recent maintenance activity, readiness, and standards progress."
      },
      {
        key: "stability",
        label: "Stability",
        value: stability,
        direction: "higher",
        detail: "Composite posture after pressure, drag, exposure, and resilience."
      }
    ]
  };
}

function summarizePhysics({ pressure, drag, resilience, stability, exposure }) {
  if (stability >= 80 && pressure <= 30 && drag <= 35) {
    return "Stable orbit: governance and credential posture are reinforcing each other.";
  }

  if (pressure >= 70 || exposure >= 70) {
    return "High-force zone: reduce critical exposure and unsafe rotation gaps first.";
  }

  if (drag >= 65) {
    return "Governance drag is slowing the system; owners and evidence are the next leverage point.";
  }

  if (resilience < 45) {
    return "Low resilience: add verification, references, restrictions, and assured control evidence.";
  }

  return "Transitional state: the vault is usable, but a few forces still need balancing.";
}

function describeStability(stability) {
  if (stability >= 85) return "Controlled";
  if (stability >= 70) return "Balanced";
  if (stability >= 50) return "Transitional";
  if (stability >= 30) return "Turbulent";
  return "Unstable";
}

function count(items, predicate) {
  return items.filter(predicate).length;
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

function isRecent(value, now) {
  if (!value) return false;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return false;
  const days = (now - timestamp) / 86400000;
  return days >= 0 && days <= 14;
}
