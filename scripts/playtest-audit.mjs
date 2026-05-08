import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCommandCenter, buildVaultStats } from "../src/domain/dashboard.js";
import { calculateOperationalPhysics } from "../src/operationalPhysics.js";
import { createEmptyEntry } from "../src/schema.js";
import { createStandardsState, getStandardsProgress } from "../src/standards.js";
import { REQUIRED_TOOLING_IDS, getToolingReadinessSummary } from "../src/domain/toolingIntegrations.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skippedDirectories = new Set([".git", "node_modules", "dist", "build", "coverage", "vault-exports"]);
const results = [];

try {
  const packageJson = JSON.parse(await read("package.json"));
  const indexHtml = await read("index.html");
  const appJs = await read("src/app.js");
  const styles = await read("src/styles.css");
  const dashboardDomain = await read("src/domain/dashboard.js");
  const policiesDomain = await read("src/domain/policies.js");
  const providersDomain = await read("src/domain/providers.js");
  const connectionsDomain = await read("src/domain/connections.js");
  const readinessDomain = await read("src/domain/readiness.js");
  const reportsDomain = await read("src/domain/reports.js");
  const formPayloads = await read("src/state/formPayloads.js");
  const sessionState = await read("src/state/session.js");
  const dashboardPanels = await read("src/ui/dashboardPanels.js");
  const uiEvents = await read("src/ui/events.js");
  const uiHtml = await read("src/ui/html.js");
  const vaultViews = await read("src/ui/vaultViews.js");
  const smokeHarness = await read("scripts/smoke-test.mjs");
  const browserStaticServer = await read("scripts/browser/static-server.mjs");
  const browserRuntime = await read("scripts/browser/chrome-runtime.mjs");
  const browserCdpClient = await read("scripts/browser/cdp-client.mjs");
  const browserPageDriver = await read("scripts/browser/page-driver.mjs");
  const browserLabFlow = await read("scripts/browser/lab-flow.mjs");
  const deadzoneSmoke = await read("scripts/deadzone-smoke.mjs");
  const designSmoke = await read("scripts/design-smoke.mjs");
  const accessibilitySmoke = await read("scripts/accessibility-smoke.mjs");
  const breaktestPrevention = await read("scripts/breaktest-prevention-smoke.mjs");
  const toolingReadinessSmoke = await read("scripts/tooling-readiness-smoke.mjs");
  const playtestIndex = await read("docs/play-test-possibilities-index.md");
  const architecture = await read("docs/architecture.md");
  const restructurePlan = await read("docs/project-outline-restructure-plan.md");
  const optimizationPlan = await read("docs/next-stage-optimization-plan.md");
  const toolingResearch = await read("docs/tooling-research.md");
  const workflow = await read(".github/workflows/pages.yml");
  const files = await listProjectFiles(projectRoot);
  const appStats = await stat(join(projectRoot, "src", "app.js"));
  const smokeStats = await stat(join(projectRoot, "scripts", "smoke-test.mjs"));
  const toolingSummary = getToolingReadinessSummary();
  const accessibilityCovered = packageJson.scripts?.verify?.includes("smoke:accessibility")
    && allIncluded(accessibilitySmoke, ["Dialog surfaces are announced", "No positive tabindex traps", "Generated fields have explicit labels"]);
  const reportLayerCovered = allIncluded(reportsDomain, ["buildGovernanceReportBundle", "buildStatementOfApplicability", "buildAuditPacket", "buildPolicyRegister", "buildRiskRegister"])
    && appJs.includes("handleExportReports")
    && uiEvents.includes("#export-reports-button")
    && packageJson.scripts?.verify?.includes("smoke:domain");
  const browserHarnessSplit = allIncluded(smokeHarness, ["./browser/static-server.mjs", "./browser/chrome-runtime.mjs", "./browser/cdp-client.mjs", "./browser/page-driver.mjs", "./browser/lab-flow.mjs"])
    && allIncluded(browserStaticServer, ["export async function startStaticServer", "export async function getFreePort"])
    && allIncluded(browserRuntime, ["export async function launchBrowserRuntime", "export async function closeBrowserRuntime"])
    && allIncluded(browserCdpClient, ["export async function waitForTarget", "export async function createCdpClient"])
    && browserPageDriver.includes("export function createPageDriver")
    && browserLabFlow.includes("export async function runLabChecks");

  const standards = createStandardsState({
    controls: {
      "GOV-ISMS-01": {
        status: "Implemented",
        evidence: "Playtest fixture evidence",
        owner: "Playtest Owner",
        dueDate: "2026-12-31"
      },
      "RISK-REG-02": {
        status: "Planned",
        owner: "Risk Owner",
        dueDate: "2026-09-30"
      }
    }
  });
  const entries = [
    createEmptyEntry({
      name: "Playtest Critical Production Key",
      provider: "Playtest Provider",
      purpose: "Production application",
      useCase: "Release gate fixture",
      environment: "Production",
      status: "Needs verification",
      riskLevel: "Critical",
      rotationCadence: "No expiration",
      scopes: "admin",
      owner: "",
      docsUrl: "https://example.test/docs",
      notes: "Fixture only"
    }),
    createEmptyEntry({
      name: "Playtest Healthy Key",
      provider: "Playtest Provider",
      purpose: "Development and testing",
      environment: "Testing",
      status: "Active",
      riskLevel: "Low",
      rotationCadence: "Manual",
      lastVerifiedAt: "2026-05-01",
      scopes: "read",
      owner: "QA",
      docsUrl: "https://example.test/docs",
      notes: "Fixture only"
    })
  ];
  const vault = {
    entries,
    standards,
    auditLog: [{ at: "2026-05-06T12:00:00.000Z", action: "playtest_fixture" }]
  };
  const stats = buildVaultStats(vault, { now: Date.parse("2026-05-07T12:00:00.000Z") });
  const commandCenter = buildCommandCenter(entries, stats);
  const physics = calculateOperationalPhysics({
    entries,
    standardsProgress: getStandardsProgress(standards),
    auditLog: vault.auditLog,
    now: Date.parse("2026-05-07T12:00:00.000Z")
  });

  pass("Design has intentional visual language", allIncluded(styles, [":root", "--font-display", "--accent", "radial-gradient", "backdrop-filter", "@keyframes rise"]), "tokens, texture, depth, and motion");
  pass("Design has responsive layout gates", countMatches(styles, /@media \(max-width:/g) >= 2 && allIncluded(styles, [".vault-grid", ".standards-reference-grid", ".template-grid"]), "desktop and mobile breakpoints");
  pass("Design has visible interaction states", allIncluded(styles, [":focus", "button:disabled", ".button:hover", ".notice.is-visible", ".empty-state"]), "focus, disabled, hover, notice, empty states");
  pass("Design has semantic app shell", indexHtml.includes('aria-live="polite"') && indexHtml.includes('id="app"'), "live app region");
  pass("Design avoids inline-style drift", !/\sstyle\s*=/.test(indexHtml + appJs + dashboardPanels), "no inline style attributes");
  pass("Design has motion and focus guardrails", packageJson.scripts?.verify?.includes("smoke:design") && allIncluded(designSmoke, ["Reduced motion is supported", "Focus states are visible", "Filter selects are styled"]), "design smoke guards reduced motion, focus, and filters");
  pass("Design has accessibility guardrails", accessibilityCovered, "accessibility smoke guards labels, dialogs, tabindex, and reduced motion");

  pass("Infrastructure stays static-hostable", allIncluded(indexHtml, ["script-src 'self'", "style-src 'self'", "connect-src 'none'"]) && !packageJson.dependencies && !packageJson.devDependencies, "strict CSP and zero external dependencies");
  pass("Infrastructure release is gated", workflow.includes("npm run verify") && workflow.includes("upload-pages-artifact"), "GitHub Pages runs verify before deploy");
  pass("Infrastructure protects secret-bearing files", files.includes(".gitignore") && (await read(".gitignore")).includes("*.vault.json"), ".gitignore includes vault export guard");
  pass("Infrastructure has local prep checks", packageJson.scripts?.doctor === "node scripts/doctor.mjs" && packageJson.scripts?.serve?.includes("http.server"), "doctor and static server commands");

  pass("Functionality lab covers critical user flows", allIncluded(smokeHarness + browserLabFlow, ["Vault create/unlock flow", "Entry edit flow", "Search/filter behavior", "Settings flow", "Lock/unlock security flow"]), "create, edit, filter, settings, lock/unlock");
  pass("Functionality covers security storage behavior", allIncluded(smokeHarness + browserLabFlow, ["Encrypted localStorage", "hasPlainSecret", "hasPlainEvidence", "wrong password rejected"]), "encrypted storage and wrong-password lab checks");
  pass("Functionality has provider onboarding coverage", allIncluded(providersDomain, ["google-ads", "openai", "stripe"]) && packageJson.scripts?.verify?.includes("smoke:provider"), "provider templates and smoke gate");
  pass("Functionality has connection launchpad coverage", allIncluded(connectionsDomain, ["buildConnectionLaunchpad", "disabled-by-default", "getConnectionReadinessSummary"]) && packageJson.scripts?.verify?.includes("smoke:connectivity"), "connection catalog and launchpad smoke gate");
  pass("Functionality has policy and ISO gates", packageJson.scripts?.verify?.includes("smoke:policy") && packageJson.scripts.verify.includes("smoke:standards"), "policy and standards checks in verify");
  pass("Functionality has report/export layer", reportLayerCovered, "SoA, audit packet, policy register, and risk register export bundle");
  pass("Functionality has deadzone coverage", packageJson.scripts?.verify?.includes("smoke:deadzones") && allIncluded(deadzoneSmoke, ["Command actions resolve to a destination", "Quick filters reach matching entries", "No pointer-event dead zones"]), "deadzone smoke checks command, filter, and CSS traps");
  pass("Functionality has indexed play-test possibilities", packageJson.scripts?.verify?.includes("smoke:playtest-index") && allIncluded(playtestIndex, ["PTX-001", "PTX-008", "PTX-016", "Play-Test Selection Matrix"]), "indexed missions cover core, scale, and infrastructure possibilities");

  const appOrchestrationSplit = appStats.size < 26000
    && allIncluded(appJs, ["./core/audit.js", "./core/storage.js", "./domain/dashboard.js", "./domain/reports.js", "./state/filters.js", "./state/formPayloads.js", "./state/session.js", "./ui/events.js", "./ui/html.js", "./ui/vaultViews.js"])
    && allIncluded(uiEvents, ["export function bindVaultEvents", "actions.handleCommandAction", "actions.handleEntrySubmit"])
    && allIncluded(vaultViews, ["export function renderDetail", "export function renderModal", "export function renderAuditItems"])
    && allIncluded(formPayloads, ["export function buildEntryFromForm", "export function buildSettingsFromForm", "export function buildStandardsFromForm"])
    && allIncluded(sessionState, ["export function createInitialState", "export function clearUnlockedSession"])
    && reportsDomain.includes("buildRedactedInventoryExport");

  pass("Architecture separates core/domain/state/UI seams", appOrchestrationSplit, "app imports extracted render, event, form, session, and report seams");
  pass("Architecture docs define future boundaries", allIncluded(restructurePlan, ["Target Architecture", "Domain Boundaries", "Add Vault Schema Versioning", "Do-Not-Break Rules"]), "future boundary plan");
  pass("Architecture has pure render and domain contracts", allIncluded(dashboardPanels, ["export function renderCommandCenter", "export function renderOperationalPhysics", "export function renderPolicyPanel"]) && allIncluded(vaultViews, ["export function renderEntryCard", "export function renderQuickViews"]) && allIncluded(readinessDomain, ["ENTRY_READINESS_CHECKS", "calculateEntryReadiness"]), "pure UI/domain contracts");
  pass("Architecture bottlenecks remain visible", appStats.size < 55000 && smokeStats.size < 22000, `app=${formatKb(appStats.size)}, lab=${formatKb(smokeStats.size)}`);

  pass("Mechanics model produces actionable vectors", physics.vectors.length === 6 && physics.vectors.every((vector) => ["lower", "higher"].includes(vector.direction)), `${physics.vectors.length} vectors`);
  pass("Mechanics connect physics to cockpit", allIncluded(dashboardDomain, ["calculateOperationalPhysics", "buildCommandCenter"]) && commandCenter.actions.length > 0, `${commandCenter.actions.length} cockpit actions`);
  pass("Mechanics detect unsafe operating forces", physics.pressure > 0 && physics.exposure > 0 && stats.policyViolations > 0, `pressure=${physics.pressure}, exposure=${physics.exposure}, policy=${stats.policyViolations}`);
  pass("Mechanics keep policy rules explicit", allIncluded(policiesDomain, ["POL-PROD-OWNER", "POL-RISK-ROTATION", "POL-PROD-RESTRICT", "POL-ADS-PRIVACY"]), "release policy rules");

  pass("Tooling loop has fast and full paths", allIncluded(packageJson.scripts || {}, ["smoke:workflow", "verify", "lab", "smoke:breaktest", "smoke:security", "smoke:bottlenecks", "smoke:deadzones", "smoke:design", "smoke:playtest-index"]), "workflow and full verification commands");
  pass("Breaktest prevention guards the test mesh", packageJson.scripts?.verify?.includes("smoke:breaktest") && allIncluded(breaktestPrevention, ["Every smoke script participates in verify", "Deploy cannot bypass verify", "Browser lab keeps mutation and recovery assertions"]), "smoke:breaktest catches workflow drift before release");
  pass("Tooling readiness covers requested platforms", packageJson.scripts?.verify?.includes("smoke:tooling") && toolingSummary.requiredReady && REQUIRED_TOOLING_IDS.length >= 12, `${toolingSummary.total} tools cataloged`);
  pass("Tooling readiness stays local-first", allIncluded(toolingReadinessSmoke, ["Runtime network stays disabled", "Adapters are disabled by default", "Environment example is secret-safe"]), "tooling smoke guards local-only integration posture");
  pass("Tooling efficiency stays zero-install", !packageJson.dependencies && !packageJson.devDependencies, "no dependency install needed");
  pass("Tooling research is captured", allIncluded(toolingResearch, ["Playwright", "axe-core", "Vitest", "Lighthouse CI", "Adoption Order"]), "local tooling decision note");
  pass("Tooling research prefers staged adoption", allIncluded(toolingResearch, ["Keep the project zero-dependency", "specific proof gap", "Split `scripts/smoke-test.mjs`"]), "research does not add tools casually");
  pass("Tooling browser harness is split", browserHarnessSplit, "static server, browser runtime, CDP client, page driver, and lab flow are separate modules");

  need("Split app orchestration", !appOrchestrationSplit, "Extract render, event, session, and export modules before adding more screens.");
  need("Add migrations", !allIncluded(await read("src/core/vault.js"), ["VAULT_SCHEMA_VERSION", "migrateVault", "normalizeVaultRecords"]) || !allIncluded(await read("scripts/core-smoke.mjs"), ["Migrate vault preserves known record families", "Migrate vault rejects newer schemas"]), "Introduce versioned vault payload migrations before expanding governance records.");
  need("Add accessibility play-test", !accessibilityCovered, "Add axe-core or a local accessibility smoke once navigation expands.");
  need("Add report/export layer", !reportLayerCovered, "Make SoA, audit packet, policy register, and risk register exports first-class.");
  need("Split browser harness", !browserHarnessSplit, "Separate static server, CDP client, smoke flow, and lab flow before the lab grows again.");

  printResults();
} catch (error) {
  results.push({ name: "Playtest audit failure", status: "fail", detail: error.message });
  printResults();
  throw error;
}

async function listProjectFiles(directory, base = projectRoot) {
  const entries = await readdir(directory, { withFileTypes: true });
  const collected = [];

  for (const entry of entries) {
    if (entry.isDirectory() && skippedDirectories.has(entry.name)) {
      continue;
    }

    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      collected.push(...await listProjectFiles(absolute, base));
      continue;
    }

    if (entry.isFile()) {
      collected.push(relative(base, absolute).replaceAll("\\", "/"));
    }
  }

  return collected.sort();
}

async function read(file) {
  return readFile(join(projectRoot, file), "utf8");
}

function allIncluded(value, fragments) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return fragments.every((fragment) => text.includes(fragment));
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function pass(name, condition, detail) {
  results.push({ name, status: condition ? "pass" : "fail", detail });
  if (!condition) {
    throw new Error(`${name}: ${detail}`);
  }
}

function need(name, condition, detail) {
  results.push({ name, status: condition ? "need" : "pass", detail: condition ? detail : "covered" });
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function printResults() {
  const failures = results.filter((item) => item.status === "fail").length;
  const needs = results.filter((item) => item.status === "need").length;
  const passed = results.filter((item) => item.status === "pass").length;
  const title = failures ? "PRODUCT PLAYTEST AUDIT FAILED" : "PRODUCT PLAYTEST AUDIT PASSED";

  console.log(`\n${title}`);
  for (const result of results) {
    console.log(`${result.status.toUpperCase().padEnd(4, " ")} ${result.name} - ${result.detail}`);
  }
  console.log(`\nSummary: ${passed} pass, ${needs} needs, ${failures} fail`);
}
