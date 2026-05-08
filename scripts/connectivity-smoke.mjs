import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildConnectionLaunchpad,
  getConnectionCatalog,
  getConnectionReadinessSummary,
  getConnectionRecord
} from "../src/domain/connections.js";
import { REQUIRED_TOOLING_IDS } from "../src/domain/toolingIntegrations.js";
import { createEntryFromProviderTemplate } from "../src/domain/providers.js";
import { createEmptyEntry } from "../src/schema.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const checks = [];

try {
  const packageJson = JSON.parse(await read("package.json"));
  const indexHtml = await read("index.html");
  const styles = await read("src/styles.css");
  const vaultViews = await read("src/ui/vaultViews.js");
  const catalog = getConnectionCatalog();

  const googleCloudLaunchpad = buildConnectionLaunchpad(createEntryFromProviderTemplate("google-cloud", {
    environment: "Production",
    status: "Needs verification"
  }));
  const customLaunchpad = buildConnectionLaunchpad(createEmptyEntry({
    name: "Custom billing portal",
    provider: "Internal",
    dashboardUrl: "https://example.test/dashboard",
    docsUrl: "https://example.test/docs"
  }));
  const summary = getConnectionReadinessSummary([
    createEntryFromProviderTemplate("google-cloud"),
    createEntryFromProviderTemplate("cloudflare"),
    createEmptyEntry({ provider: "Internal" })
  ]);

  check("Connectivity smoke is wired", packageJson.scripts?.["smoke:connectivity"] === "node scripts/connectivity-smoke.mjs", packageJson.scripts?.["smoke:connectivity"] || "missing");
  check("Connectivity smoke participates in check", packageJson.scripts?.check?.includes("scripts/connectivity-smoke.mjs"), "syntax gate includes connectivity smoke");
  check("Connectivity smoke participates in workflow", packageJson.scripts?.["smoke:workflow"]?.includes("npm run smoke:connectivity"), packageJson.scripts?.["smoke:workflow"] || "missing workflow");
  check("Connectivity smoke participates in verify", packageJson.scripts?.verify?.includes("npm run smoke:connectivity"), packageJson.scripts?.verify || "missing verify");
  check("Required tools have connection records", REQUIRED_TOOLING_IDS.every((id) => Boolean(getConnectionRecord(id))), REQUIRED_TOOLING_IDS.join(", "));
  check("Connection catalog is local-only", catalog.every((connection) => connection.adapterStatus === "disabled-by-default"), "live adapters disabled by default");
  check("Connection catalog has launch surfaces", catalog.every((connection) => connection.surfaces.length >= 2 && connection.surfaces.every((surface) => surface.url.startsWith("https://"))), "dashboard and docs links available");
  check("Connection catalog has setup guidance", catalog.every((connection) => connection.requiredVaultFields.length > 0 && connection.setupChecklist.length >= 4), "required fields and checklist present");
  check("Google Cloud launchpad matches catalog", googleCloudLaunchpad.matched && googleCloudLaunchpad.connection.id === "google-cloud", JSON.stringify(googleCloudLaunchpad.connection));
  check("Google Cloud launchpad exposes field gaps", googleCloudLaunchpad.missingFields.includes("owner") && googleCloudLaunchpad.missingFields.includes("accountId"), googleCloudLaunchpad.missingFields.join(", "));
  check("Custom launchpad keeps manual surfaces", !customLaunchpad.matched && customLaunchpad.surfaces.length === 2, JSON.stringify(customLaunchpad.surfaces));
  check("Connection readiness summarizes mixed entries", summary.total === 3 && summary.matched === 2 && summary.requiredCatalogReady, JSON.stringify(summary));
  check("Connection UI is rendered from vault views", allIncluded(vaultViews, ["Connection launchpad", "buildConnectionLaunchpad", "connection-surface-grid"]), "detail panel includes launchpad");
  check("Connection UI is styled", allIncluded(styles, [".connection-launchpad", ".connection-surface-grid", ".connection-checklist"]), "launchpad styling present");
  check("Runtime network stays disabled", indexHtml.includes("connect-src 'none'"), "links only, no runtime adapters");

  printResults("CONNECTIVITY SMOKE PASSED");
} catch (error) {
  checks.push(["Connectivity smoke failure", false, error.message]);
  printResults("CONNECTIVITY SMOKE FAILED");
  throw error;
}

async function read(file) {
  return readFile(join(projectRoot, file), "utf8");
}

function allIncluded(text, fragments) {
  return fragments.every((fragment) => String(text || "").includes(fragment));
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
