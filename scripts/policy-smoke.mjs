import { evaluateEntryPolicies, evaluateVaultPolicies } from "../src/domain/policies.js";
import { createEmptyEntry } from "../src/schema.js";

const checks = [];

try {
  const riskyProduction = createEmptyEntry({
    id: "policy-risky",
    name: "Risky Production Ad Key",
    provider: "Ad Fixture",
    type: "Ad platform",
    category: "Ads and monetization",
    purpose: "Ad serving or monetization",
    environment: "Production",
    status: "Active",
    riskLevel: "Critical",
    rotationCadence: "No expiration"
  });
  const cleanTesting = createEmptyEntry({
    id: "policy-clean",
    name: "Clean Testing Key",
    provider: "Fixture Provider",
    type: "API key",
    category: "Developer platform",
    purpose: "Development and testing",
    environment: "Testing",
    status: "Active",
    riskLevel: "Low",
    owner: "QA",
    scopes: "read-only",
    rotationCadence: "90 days",
    lastVerifiedAt: "2026-05-07",
    docsUrl: "https://example.test/docs"
  });
  const blocked = createEmptyEntry({
    id: "policy-blocked",
    name: "Blocked Fixture",
    provider: "Fixture Provider",
    status: "Blocked",
    riskLevel: "Medium",
    environment: "Development",
    rotationCadence: "Manual"
  });

  const riskyViolations = evaluateEntryPolicies(riskyProduction);
  check("Risky production entry has policy findings", riskyViolations.length >= 5, `${riskyViolations.length} findings`);
  check("Risky production catches owner", hasPolicy(riskyViolations, "POL-PROD-OWNER"), riskyViolations.map((violation) => violation.id).join(", "));
  check("Risky production catches rotation", hasPolicy(riskyViolations, "POL-RISK-ROTATION"), riskyViolations.map((violation) => violation.id).join(", "));
  check("Risky production catches ad privacy", hasPolicy(riskyViolations, "POL-ADS-PRIVACY"), riskyViolations.map((violation) => violation.id).join(", "));

  const cleanViolations = evaluateEntryPolicies(cleanTesting);
  check("Clean testing entry passes policies", cleanViolations.length === 0, `${cleanViolations.length} findings`);

  const blockedViolations = evaluateEntryPolicies(blocked);
  check("Blocked entry requires blockers", hasPolicy(blockedViolations, "POL-BLOCKED-REASON"), blockedViolations.map((violation) => violation.id).join(", "));

  const vaultPolicy = evaluateVaultPolicies([riskyProduction, cleanTesting, blocked]);
  check("Vault policy counts entries", vaultPolicy.entriesWithViolations === 2, `${vaultPolicy.entriesWithViolations} entries`);
  check("Vault policy score is reduced", vaultPolicy.score < 70, `score=${vaultPolicy.score}`);
  check("Vault policy severity counts", vaultPolicy.bySeverity.Critical >= 1 && vaultPolicy.bySeverity.High >= 2, JSON.stringify(vaultPolicy.bySeverity));

  printResults("POLICY SMOKE PASSED");
} catch (error) {
  checks.push(["Policy smoke failure", false, error.message]);
  printResults("POLICY SMOKE FAILED");
  throw error;
}

function hasPolicy(violations, policyId) {
  return violations.some((violation) => violation.id === policyId);
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
