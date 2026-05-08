import { buildCommandCenter, buildVaultStats } from "../src/domain/dashboard.js";
import { createEmptyEntry } from "../src/schema.js";
import { createStandardsState } from "../src/standards.js";

const checks = [];

try {
  const entries = [
    createEmptyEntry({
      id: "critical-prod",
      name: "Critical production ads key",
      provider: "Google Ads",
      category: "Ads and monetization",
      purpose: "Ad campaign management",
      environment: "Production",
      status: "Active",
      riskLevel: "Critical",
      rotationCadence: "No expiration"
    }),
    createEmptyEntry({
      id: "blocked-test",
      name: "Blocked testing mail key",
      provider: "SendGrid",
      category: "Email delivery",
      purpose: "Transactional email",
      environment: "Testing",
      status: "Blocked",
      riskLevel: "Medium",
      rotationCadence: "Quarterly",
      blockers: "Vendor approval pending"
    })
  ];
  const vault = {
    entries,
    standards: createStandardsState(),
    auditLog: [{ at: "2026-05-07T12:00:00.000Z", action: "dashboard_smoke" }]
  };
  const stats = buildVaultStats(vault, { now: Date.parse("2026-05-07T12:30:00.000Z") });
  const commandCenter = buildCommandCenter(entries, stats);

  check("Stats count entries", stats.total === 2, `${stats.total} entries`);
  check("Stats count critical credentials", stats.critical === 1, `${stats.critical} critical`);
  check("Stats count blocked credentials", stats.blocked === 1, `${stats.blocked} blocked`);
  check("Stats include policy model", stats.policyViolations === stats.policy.total && stats.policy.total > 0, `${stats.policy.total} policy issues`);
  check("Stats include physics model", typeof stats.physics.stability === "number" && stats.physics.vectors.length === 6, `stability=${stats.physics.stability}`);
  check("Command center computes readiness", commandCenter.averageReadiness > 0 && commandCenter.averageReadiness < 100, `average=${commandCenter.averageReadiness}`);
  check("Command center detects no-expiration risk", commandCenter.riskyNoExpiration === 1, `${commandCenter.riskyNoExpiration} risky`);
  check("Command center detects verification work", commandCenter.needsVerification === 2, `${commandCenter.needsVerification} verify`);
  check("Command center caps actions", commandCenter.actions.length === 4, `${commandCenter.actions.length} actions`);
  check("Command center prioritizes critical risk", commandCenter.actions[0].action === "Critical", commandCenter.actions.map((action) => action.action).join(", "));

  const emptyCommandCenter = buildCommandCenter([], buildVaultStats({ entries: [], standards: createStandardsState(), auditLog: [] }));
  check("Empty command center suggests first credential", emptyCommandCenter.actions[0].action === "new-entry", emptyCommandCenter.actions[0].action);

  printResults("DASHBOARD SMOKE PASSED");
} catch (error) {
  checks.push(["Dashboard smoke failure", false, error.message]);
  printResults("DASHBOARD SMOKE FAILED");
  throw error;
}

function check(name, pass, detail) {
  checks.push([name, Boolean(pass), detail]);
  if (!pass) {
    throw new Error(`${name}: ${detail}`);
  }
}

function printResults(title) {
  console.log(`\n${title}`);
  for (const [name, pass, detail] of checks) {
    console.log(`${pass ? "PASS" : "FAIL"} ${name} - ${detail}`);
  }
}
