import { calculateOperationalPhysics } from "../src/operationalPhysics.js";
import { getEntryReadiness } from "../src/domain/readiness.js";
import { buildGovernanceReportBundle, buildRedactedInventoryExport } from "../src/domain/reports.js";
import { createEmptyEntry } from "../src/schema.js";
import { createStandardsState, getStandardsProgress } from "../src/standards.js";

const checks = [];

try {
  const incompleteEntry = createEmptyEntry({
    name: "Critical Production Fixture",
    provider: "Fixture Provider",
    purpose: "Exercise readiness scoring",
    environment: "Production",
    status: "Needs verification",
    riskLevel: "Critical",
    rotationCadence: "No expiration"
  });
  const completeEntry = createEmptyEntry({
    name: "Complete Fixture",
    provider: "Fixture Provider",
    purpose: "Exercise readiness scoring",
    environment: "Testing",
    status: "Active",
    riskLevel: "Low",
    storagePath: "local encrypted vault",
    docsUrl: "https://example.test/docs",
    scopes: "read-only",
    rotationCadence: "Quarterly",
    lastVerifiedAt: "2026-05-07"
  });
  const incompleteReadiness = getEntryReadiness(incompleteEntry);
  const completeReadiness = getEntryReadiness(completeEntry);

  check("Incomplete readiness percent", incompleteReadiness.percent === 29, `percent=${incompleteReadiness.percent}`);
  check("Incomplete readiness missing list", incompleteReadiness.missing.includes("safe rotation plan") && incompleteReadiness.missing.includes("verification date"), incompleteReadiness.missing.join(", "));
  check("Complete readiness percent", completeReadiness.percent === 100, `percent=${completeReadiness.percent}`);
  check("Complete readiness has checkpoints", completeReadiness.checkpoints.length === 7, `${completeReadiness.checkpoints.length} checkpoints`);

  const physics = calculateOperationalPhysics({
    entries: [incompleteEntry, completeEntry],
    standardsProgress: getStandardsProgress(createStandardsState()),
    auditLog: [{ at: "2026-05-07T10:00:00.000Z", action: "domain_smoke" }],
    now: Date.parse("2026-05-07T12:00:00.000Z")
  });

  check("Physics uses shared readiness average", physics.averageReadiness === 65, `average=${physics.averageReadiness}`);
  check("Physics pressure stays deterministic", physics.pressure === 23, `pressure=${physics.pressure}`);
  check("Physics vector contract", physics.vectors.length === 6 && physics.vectors.every((vector) => Number.isFinite(vector.value)), `${physics.vectors.length} vectors`);

  const redactedExport = buildRedactedInventoryExport({
    settings: { autoLockMinutes: 10, clipboardClearSeconds: 20, redactedExportsOnly: true },
    standards: createStandardsState({ notes: "Sensitive standards note" }),
    entries: [createEmptyEntry({ name: "Secret fixture", secretValue: "real-secret-value" })]
  }, { exportedAt: "2026-05-08T12:00:00.000Z" });

  check("Redacted inventory export removes live secret", redactedExport.redacted && redactedExport.entries[0].secretValue !== "real-secret-value", "secret redacted");
  check("Redacted inventory export removes volatile settings", !("autoLockMinutes" in JSON.parse(JSON.stringify(redactedExport.settings))) && !("clipboardClearSeconds" in JSON.parse(JSON.stringify(redactedExport.settings))), "volatile settings omitted");

  const governanceBundle = buildGovernanceReportBundle({
    settings: { redactedExportsOnly: true },
    standards: createStandardsState({
      notes: "Sensitive standards note",
      controls: {
        "GOV-ISMS-01": {
          status: "Implemented",
          owner: "Compliance Owner",
          dueDate: "2026-12-31",
          evidence: "sensitive evidence body"
        }
      }
    }),
    entries: [
      createEmptyEntry({
        name: "Report fixture",
        provider: "Report Provider",
        environment: "Production",
        riskLevel: "Critical",
        rotationCadence: "No expiration",
        secretValue: "report-real-secret",
        purpose: "Production application"
      })
    ],
    auditLog: [
      { at: "2026-05-08T11:00:00.000Z", action: "report_fixture", metadata: { secretToken: "report-token-value" } }
    ]
  }, { generatedAt: "2026-05-08T12:00:00.000Z", now: Date.parse("2026-05-08T12:00:00.000Z") });
  const bundleText = JSON.stringify(governanceBundle);

  check("Governance report bundle has first-class report sections", Boolean(governanceBundle.reports.statementOfApplicability && governanceBundle.reports.auditPacket && governanceBundle.reports.policyRegister && governanceBundle.reports.riskRegister), Object.keys(governanceBundle.reports).join(", "));
  check("Statement of Applicability redacts evidence", governanceBundle.reports.statementOfApplicability.controls.some((control) => control.evidence === "[redacted evidence]") && !bundleText.includes("sensitive evidence body"), "evidence redacted");
  check("Audit packet redacts sensitive metadata", governanceBundle.reports.auditPacket.recentEvents[0].metadata.secretToken === "[redacted]" && !bundleText.includes("report-token-value"), "audit metadata redacted");
  check("Policy register captures violations", governanceBundle.reports.policyRegister.summary.total > 0 && governanceBundle.reports.policyRegister.entries.length === 1, `${governanceBundle.reports.policyRegister.summary.total} violations`);
  check("Risk register orders actionable risks", governanceBundle.reports.riskRegister.risks[0].riskScore >= 90 && governanceBundle.reports.riskRegister.risks[0].drivers.includes("rotation"), `risk=${governanceBundle.reports.riskRegister.risks[0].riskScore}`);
  check("Governance reports remove live secrets", !bundleText.includes("report-real-secret"), "secret absent from report bundle");

  printResults("DOMAIN SMOKE PASSED");
} catch (error) {
  checks.push(["Domain smoke failure", false, error.message]);
  printResults("DOMAIN SMOKE FAILED");
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
