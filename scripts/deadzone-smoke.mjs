import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCommandCenter, buildVaultStats } from "../src/domain/dashboard.js";
import { filterEntries } from "../src/state/filters.js";
import { createEmptyEntry } from "../src/schema.js";
import { createStandardsState } from "../src/standards.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const results = [];
const quickFilters = ["All", "Critical", "Needs verification", "No expiration", "Incomplete", "Production", "Policy issues"];
const modalActions = new Set(["new-entry", "standards"]);

try {
  const packageJson = JSON.parse(await read("package.json"));
  const appJs = await read("src/app.js");
  const styles = await read("src/styles.css");
  const dashboardPanels = await read("src/ui/dashboardPanels.js");
  const eventsJs = await read("src/ui/events.js");
  const vaultViews = await read("src/ui/vaultViews.js");
  const stateFilters = await read("src/state/filters.js");

  const entries = [
    createEmptyEntry({
      name: "Critical production fixture",
      provider: "Fixture Cloud",
      purpose: "Production application",
      environment: "Production",
      status: "Needs verification",
      riskLevel: "Critical",
      rotationCadence: "No expiration",
      secretValue: "fixture-only",
      scopes: "",
      owner: "",
      docsUrl: "",
      notes: ""
    }),
    createEmptyEntry({
      name: "Healthy testing fixture",
      provider: "Fixture Analytics",
      purpose: "Development and testing",
      environment: "Testing",
      status: "Active",
      riskLevel: "Low",
      rotationCadence: "Manual",
      lastVerifiedAt: "2026-05-01",
      scopes: "read-only",
      owner: "QA",
      docsUrl: "https://example.test/docs",
      notes: "Fixture only"
    })
  ];
  const vault = {
    entries,
    standards: createStandardsState(),
    auditLog: [{ at: "2026-05-07T12:00:00.000Z", action: "deadzone_fixture" }]
  };
  const stats = buildVaultStats(vault, { now: Date.parse("2026-05-07T12:00:00.000Z") });
  const commandCenter = buildCommandCenter(entries, stats);
  const emptyCommandCenter = buildCommandCenter([], buildVaultStats({ entries: [], standards: createStandardsState(), auditLog: [] }));
  const observedActions = new Set([
    ...commandCenter.actions.map((action) => action.action),
    ...emptyCommandCenter.actions.map((action) => action.action),
    "Policy issues",
    "Production",
    "standards",
    "new-entry"
  ]);
  const unresolvedActions = [...observedActions].filter((action) => !modalActions.has(action) && !quickFilters.includes(action));
  const filterCounts = Object.fromEntries(quickFilters.map((filter) => [filter, filterEntries(entries, { quick: filter }).length]));
  const hiddenRules = displayNoneRules(styles);

  pass("Deadzone smoke is wired", packageJson.scripts?.["smoke:deadzones"] === "node scripts/deadzone-smoke.mjs", packageJson.scripts?.["smoke:deadzones"] || "missing");
  pass("Deadzone smoke participates in workflow", packageJson.scripts?.["smoke:workflow"]?.includes("smoke:deadzones"), packageJson.scripts?.["smoke:workflow"] || "missing");
  pass("Deadzone smoke participates in verify", packageJson.scripts?.verify?.includes("smoke:deadzones"), packageJson.scripts?.verify || "missing");
  pass("Command buttons have an event binding", allIncluded(eventsJs, ["[data-command-action]", "actions.handleCommandAction(button.dataset.commandAction)"]), "dashboard command buttons route through handler");
  pass("Quick view buttons have an event binding", allIncluded(eventsJs, ["[data-quick-filter]", "actions.applyQuickFilter(button.dataset.quickFilter)"]), "quick filters route through handler");
  pass("Command actions resolve to a destination", unresolvedActions.length === 0, unresolvedActions.join(", ") || [...observedActions].sort().join(", "));
  pass("Standards action opens a real modal", allIncluded(appJs, ['action === "standards"', 'state.modal = { type: "standards" }']) && vaultViews.includes("renderStandardsModal"), "standards command has modal destination");
  pass("New-entry action opens a real modal", allIncluded(appJs, ['action === "new-entry"', 'state.modal = { type: "entry", entry: createEmptyEntry() }']), "entry command has modal destination");
  pass("Fallback command action becomes a quick filter", allIncluded(appJs, ["applyQuickFilter(action)", "state.filters.quick = filter || \"All\""]), "diagnostic commands filter the entry list");
  pass("Visible quick filters are implemented", quickFilters.every((filter) => stateFilters.includes(`filter === "${filter}"`) || filter === "All"), quickFilters.join(", "));
  pass("Quick filters reach matching entries", filterCounts.All === 2
    && filterCounts.Critical === 1
    && filterCounts["Needs verification"] === 1
    && filterCounts["No expiration"] === 1
    && filterCounts.Incomplete >= 1
    && filterCounts.Production === 1
    && filterCounts["Policy issues"] === 1, JSON.stringify(filterCounts));
  pass("Policy panel has a live action", dashboardPanels.includes('data-command-action="Policy issues"'), "policy findings can route to filtered entries");
  pass("Quick views have distinct accessible labels", vaultViews.includes('aria-label="Quick view: ${escapeAttr(view.label)} (${view.count})"'), "quick filter buttons avoid duplicate spoken names");
  pass("Modal controls are bound", allIncluded(eventsJs, ["#modal-close", "#modal-cancel", "#entry-form", "#settings-form", "#standards-form"]), "close, cancel, entry, settings, and standards handlers present");
  pass("No pointer-event dead zones", !/pointer-events\s*:\s*none/i.test(styles), "no pointer-events:none rules");
  pass("Only intentional hidden surfaces", hiddenRules.every((rule) => /notice|hidden/.test(rule.selector)), hiddenRules.map((rule) => `${rule.selector}:${rule.line}`).join(", ") || "none");
  pass("Modal overlay stays above app shell", /\.modal-backdrop\s*\{[\s\S]*?z-index:\s*20/.test(styles), "modal backdrop z-index 20");
  pass("No explicit dead-end markers", !/\bTODO\b|\bFIXME\b|\bHACK\b|\bXXX\b|not implemented|coming soon/iu.test(appJs + dashboardPanels + eventsJs + vaultViews), "source has no dead-end markers");

  need("Command remediation is still filter-first", !appJs.includes("scrollIntoView") && !appJs.includes(".focus("), "Cockpit repair actions filter entries but do not yet scroll, focus, or open the exact repair field.");
  need("Filter selects need full cockpit styling", !/\.filters\s+select/.test(styles), "Sidebar filters function, but native select styling weakens the polished cockpit surface.");
  need("Deadzone browser harness should become independent", !packageJson.scripts?.lab?.includes("deadzone"), "Add live click assertions for command actions when the browser harness is split.");

  printResults();
} catch (error) {
  results.push({ name: "Deadzone smoke failure", status: "fail", detail: error.message });
  printResults();
  throw error;
}

async function read(file) {
  return readFile(join(projectRoot, file), "utf8");
}

function allIncluded(text, fragments) {
  return fragments.every((fragment) => text.includes(fragment));
}

function displayNoneRules(css) {
  const lines = css.split(/\r?\n/);
  const rules = [];
  let selector = "";

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.endsWith("{")) {
      selector = trimmed.slice(0, -1).trim();
    }
    if (/display\s*:\s*none/i.test(trimmed)) {
      rules.push({ selector, line: index + 1 });
    }
  });

  return rules;
}

function pass(name, condition, detail) {
  results.push({ name, status: condition ? "pass" : "fail", detail });
  if (!condition) {
    throw new Error(`${name}: ${detail}`);
  }
}

function need(name, condition, detail) {
  if (condition) {
    results.push({ name, status: "need", detail });
  } else {
    results.push({ name, status: "pass", detail: "covered" });
  }
}

function printResults() {
  const failures = results.filter((item) => item.status === "fail").length;
  const needs = results.filter((item) => item.status === "need").length;
  const passed = results.filter((item) => item.status === "pass").length;
  const title = failures ? "DEADZONE SMOKE FAILED" : "DEADZONE SMOKE PASSED";

  console.log(`\n${title}`);
  for (const result of results) {
    console.log(`${result.status.toUpperCase().padEnd(4, " ")} ${result.name} - ${result.detail}`);
  }
  console.log(`\nSummary: ${passed} pass, ${needs} needs, ${failures} fail`);
}
