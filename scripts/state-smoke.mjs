import { createEmptyEntry } from "../src/schema.js";
import { filterEntries, matchesQuickFilter, resolveSelectedEntry } from "../src/state/filters.js";
import { buildEntryFromForm, buildSettingsFromForm, buildStandardsFromForm } from "../src/state/formPayloads.js";
import { clearUnlockedSession, createInitialState } from "../src/state/session.js";
import { STANDARD_CONTROLS } from "../src/standards.js";

const checks = [];

try {
  const entries = [
    fixture({
      id: "critical-prod",
      name: "Critical production ads token",
      provider: "Google",
      category: "Ads and monetization",
      environment: "Production",
      riskLevel: "Critical",
      status: "Active",
      rotationCadence: "No expiration",
      tags: ["revenue"],
      updatedAt: "2026-05-01T10:00:00.000Z"
    }),
    fixture({
      id: "analytics",
      name: "Analytics reporting key",
      provider: "Google Analytics",
      category: "Analytics",
      riskLevel: "Medium",
      status: "Needs verification",
      tags: ["taggy", "metrics"],
      updatedAt: "2026-05-03T10:00:00.000Z"
    }),
    fixture({
      id: "hosting",
      name: "Hosting deploy token",
      provider: "Netlify",
      category: "Hosting and deployment",
      status: "Active",
      riskLevel: "Low",
      rotationCadence: "Quarterly",
      lastVerifiedAt: "2026-05-07",
      updatedAt: "2026-05-05T10:00:00.000Z"
    })
  ];

  check("Search includes tags and sorts newest first", filterEntries(entries, baseFilters({ query: "taggy" })).map((entry) => entry.id).join(",") === "analytics", "tag query");
  check("Category filter works", filterEntries(entries, baseFilters({ category: "Hosting and deployment" }))[0]?.id === "hosting", "hosting category");
  check("Critical quick filter works", filterEntries(entries, baseFilters({ quick: "Critical" })).map((entry) => entry.id).join(",") === "critical-prod", "critical only");
  check("Needs verification quick filter works", matchesQuickFilter(entries[1], "Needs verification"), "needs verification");
  check("Policy issues quick filter works", filterEntries(entries, baseFilters({ quick: "Policy issues" })).some((entry) => entry.id === "critical-prod"), "policy issue included");
  check("Sort order is newest first", filterEntries(entries, baseFilters()).map((entry) => entry.id).join(",") === "hosting,analytics,critical-prod", "updatedAt descending");
  check("Selection preserves visible entry", resolveSelectedEntry(entries, "analytics").selectedEntryId === "analytics", "selected kept");
  check("Selection falls back to first visible entry", resolveSelectedEntry(entries, "missing").selectedEntryId === "critical-prod", "fallback first");
  check("Empty selection is explicit", resolveSelectedEntry([], "missing").entry === null && resolveSelectedEntry([], "missing").selectedEntryId === "", "empty selection");
  check("Entry form payload normalizes tags and timestamps", formEntry().tags.join(",") === "alpha,beta,alpha" && formEntry().updatedAt === "2026-05-08T12:00:00.000Z", "entry form contract");
  check("Settings form payload parses numbers and booleans", formSettings().autoLockMinutes === 7 && formSettings().auditCopyEvents === true && formSettings().auditRevealEvents === false, "settings form contract");
  check("Standards form payload maps control evidence", formStandards().controls[STANDARD_CONTROLS[0].id].owner === "Control Owner" && formStandards().updatedAt === "2026-05-08T12:00:00.000Z", "standards form contract");
  check("Initial session has safe defaults", createInitialState().filters.quick === "All" && createInitialState().revealedSecrets.size === 0, "session defaults");
  check("Unlocked session reset preserves encrypted vault slot", sessionResetFixture().encryptedVault?.version === 1 && sessionResetFixture().vault === null && sessionResetFixture().message === "locked", "session reset contract");

  printResults("STATE SMOKE PASSED");
} catch (error) {
  checks.push(["State smoke failure", false, error.message]);
  printResults("STATE SMOKE FAILED");
  throw error;
}

function fixture(overrides) {
  return createEmptyEntry({
    purpose: "Smoke fixture",
    useCase: "State filtering",
    ...overrides
  });
}

function baseFilters(overrides = {}) {
  return {
    query: "",
    quick: "All",
    category: "All",
    type: "All",
    status: "All",
    riskLevel: "All",
    ...overrides
  };
}

function formEntry() {
  const form = new FormData();
  form.set("name", "Smoke entry");
  form.set("provider", "Provider");
  form.set("purpose", "Operations");
  form.set("tags", "alpha, beta, alpha");
  return buildEntryFromForm(form, {
    idFactory: () => "generated-id",
    now: () => "2026-05-08T12:00:00.000Z"
  });
}

function formSettings() {
  const form = new FormData();
  form.set("autoLockMinutes", "7");
  form.set("clipboardClearSeconds", "15");
  form.set("auditCopyEvents", "on");
  return buildSettingsFromForm(form);
}

function formStandards() {
  const form = new FormData();
  const control = STANDARD_CONTROLS[0];
  form.set(`status__${control.id}`, "Implemented");
  form.set(`owner__${control.id}`, "Control Owner");
  form.set(`evidence__${control.id}`, "Smoke evidence");
  return buildStandardsFromForm(form, {
    now: () => "2026-05-08T12:00:00.000Z"
  });
}

function sessionResetFixture() {
  const state = createInitialState();
  state.encryptedVault = { version: 1 };
  state.vault = { entries: [] };
  state.password = "secret";
  state.selectedEntryId = "entry";
  state.revealedSecrets.add("entry");
  clearUnlockedSession(state, { message: "locked" });
  return state;
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
