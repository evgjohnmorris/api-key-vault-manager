import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const results = [];
const requiredSections = [
  "Mission:",
  "Outcome signal:",
  "Proof method:",
  "Failure trigger:",
  "Next implementation move:"
];
const requiredOutcomeTerms = [
  "Speed",
  "Productivity",
  "Monetization",
  "Guidance",
  "Governance",
  "Team handoff",
  "Safety",
  "Scale",
  "Accessibility",
  "Release confidence",
  "Compliance",
  "Recovery",
  "Infrastructure"
];
const requiredPossibilities = [
  "PTX-001",
  "PTX-002",
  "PTX-003",
  "PTX-004",
  "PTX-005",
  "PTX-006",
  "PTX-007",
  "PTX-008",
  "PTX-009",
  "PTX-010",
  "PTX-011",
  "PTX-012",
  "PTX-013",
  "PTX-014",
  "PTX-015",
  "PTX-016"
];

try {
  const packageJson = JSON.parse(await read("package.json"));
  const index = await read("docs/play-test-possibilities-index.md");
  const labPlan = await read("docs/play-test-lab-plan.md");
  const playtestAudit = await read("scripts/playtest-audit.mjs");
  const cards = parseCards(index);
  const ids = cards.map((card) => card.id);
  const duplicateIds = ids.filter((id, indexOfId) => ids.indexOf(id) !== indexOfId);
  const incompleteCards = cards.filter((card) => requiredSections.some((section) => !card.body.includes(section)));
  const weakCards = cards.filter((card) => requiredSections.some((section) => valueAfter(card.body, section).split(/\s+/).filter(Boolean).length < 4));
  const uncitedIds = requiredPossibilities.filter((id) => !index.includes(id));

  pass("Play-test possibility index exists", index.includes("# Play-Test Possibilities Index"), "index document found");
  pass("Index smoke is wired", packageJson.scripts?.["smoke:playtest-index"] === "node scripts/playtest-index-smoke.mjs", packageJson.scripts?.["smoke:playtest-index"] || "missing");
  pass("Index smoke participates in check", packageJson.scripts?.check?.includes("scripts/playtest-index-smoke.mjs"), "syntax gate includes index smoke");
  pass("Index smoke participates in verify", packageJson.scripts?.verify?.includes("smoke:playtest-index"), packageJson.scripts?.verify || "missing");
  pass("Index smoke participates in workflow", packageJson.scripts?.["smoke:workflow"]?.includes("smoke:playtest-index"), packageJson.scripts?.["smoke:workflow"] || "missing");
  pass("Index has enough possibility cards", cards.length >= 16, `${cards.length} cards`);
  pass("Possibility IDs are unique", duplicateIds.length === 0, duplicateIds.join(", ") || "unique IDs");
  pass("Required possibility IDs are present", uncitedIds.length === 0, uncitedIds.join(", ") || "PTX-001 through PTX-016");
  pass("Every possibility has execution fields", incompleteCards.length === 0, incompleteCards.map((card) => card.id).join(", ") || "all cards complete");
  pass("Execution fields have useful content", weakCards.length === 0, weakCards.map((card) => card.id).join(", ") || "all cards have meaningful detail");
  pass("Index covers broad outcome space", requiredOutcomeTerms.every((term) => index.includes(term)), "speed, safety, governance, scale, compliance, infrastructure, and handoff covered");
  pass("Index includes selection rules", allIncluded(index, ["## Selection Rules", "## Play-Test Selection Matrix", "## Current Highest-Value Tests"]), "rules, matrix, and priorities present");
  pass("Index protects security posture", allIncluded(index, ["Plaintext", "local-only", "CSP", "secret", "redacted"]), "security and redaction constraints represented");
  pass("Index links to current known gaps", allIncluded(index, ["guided remediation", "filter", "migrations", "redacted handoff", "ads and analytics"]), "current high-value gaps represented");
  pass("Lab plan references outcome expansion", allIncluded(labPlan, ["Outcome Expansion Lab", "Measurement Model", "Evidence Artifacts"]), "index aligns with lab plan");
  pass("Product audit covers possibility prerequisites", allIncluded(playtestAudit, ["Functionality has deadzone coverage", "Tooling research prefers staged adoption", "Architecture bottlenecks remain visible"]), "audit keeps prerequisites visible");

  printResults();
} catch (error) {
  results.push({ name: "Play-test index smoke failure", status: "fail", detail: error.message });
  printResults();
  throw error;
}

async function read(file) {
  return readFile(join(projectRoot, file), "utf8");
}

function parseCards(markdown) {
  const cardPattern = /^### (PTX-\d{3}): .+$/gm;
  const matches = [...markdown.matchAll(cardPattern)];

  return matches.map((match, index) => {
    const start = match.index;
    const end = matches[index + 1]?.index ?? markdown.indexOf("## Play-Test Selection Matrix");
    return {
      id: match[1],
      heading: match[0],
      body: markdown.slice(start, end === -1 ? markdown.length : end)
    };
  });
}

function valueAfter(text, label) {
  const pattern = new RegExp(`${escapeRegExp(label)}\\s*([^\\n]+)`, "i");
  return text.match(pattern)?.[1]?.trim() || "";
}

function allIncluded(text, fragments) {
  return fragments.every((fragment) => text.includes(fragment));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pass(name, condition, detail) {
  results.push({ name, status: condition ? "pass" : "fail", detail });
  if (!condition) {
    throw new Error(`${name}: ${detail}`);
  }
}

function printResults() {
  const failures = results.filter((item) => item.status === "fail").length;
  const passed = results.filter((item) => item.status === "pass").length;
  const title = failures ? "PLAY-TEST INDEX SMOKE FAILED" : "PLAY-TEST INDEX SMOKE PASSED";

  console.log(`\n${title}`);
  for (const result of results) {
    console.log(`${result.status.toUpperCase().padEnd(4, " ")} ${result.name} - ${result.detail}`);
  }
  console.log(`\nSummary: ${passed} pass, ${failures} fail`);
}
