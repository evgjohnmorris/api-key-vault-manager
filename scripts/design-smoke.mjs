import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const results = [];

try {
  const packageJson = JSON.parse(await read("package.json"));
  const styles = await read("src/styles.css");
  const appJs = await read("src/app.js");
  const aestheticPlan = await read("docs/aesthetic-standards-and-trends-analysis.md");
  const optimizationPlan = await read("docs/next-stage-optimization-plan.md");

  check("Design smoke is wired", packageJson.scripts?.["smoke:design"] === "node scripts/design-smoke.mjs", packageJson.scripts?.["smoke:design"] || "missing");
  check("Design smoke participates in check", packageJson.scripts?.check?.includes("scripts/design-smoke.mjs"), "syntax gate includes design smoke");
  check("Design smoke participates in verify", packageJson.scripts?.verify?.includes("npm run smoke:design"), packageJson.scripts?.verify || "missing verify script");
  check("Design smoke participates in workflow", packageJson.scripts?.["smoke:workflow"]?.includes("npm run smoke:design"), packageJson.scripts?.["smoke:workflow"] || "missing workflow script");
  check("Aesthetic plan is tracked", allIncluded(aestheticPlan, ["Secure operations cockpit", "Color Standard", "Motion Standard", "Accessibility Standard"]), "visual standards documented");
  check("Aesthetic trend refresh is tracked", allIncluded(aestheticPlan, ["2026 Trend Refresh", "Expressive Trust", "Progressive cockpit density", "AI/tool transparency", "Accessibility is aesthetic quality"]), "current UI/UX trend refresh documented");
  check("Optimization plan names design stabilization", allIncluded(optimizationPlan, ["reduced-motion", "styled filters", "guided remediation", "design/contrast smoke"]), "next implementation slice represented");
  check("Optimization plan names trend-driven UI direction", allIncluded(optimizationPlan, ["expressive-but-restrained depth", "progressive cockpit disclosure", "AI/tool transparency", "command/search ergonomics", "accessibility-forward visual quality"]), "trend refresh is wired into next implementation plan");
  check("Core visual tokens exist", allIncluded(styles, ["--bg", "--panel", "--text", "--muted", "--accent", "--accent-2", "--danger", "--warning", "--font-display", "--font-body"]), "semantic color and type tokens");
  check("Reduced motion is supported", allIncluded(styles, ["@media (prefers-reduced-motion: reduce)", "animation-duration", "transition-duration", "scroll-behavior: auto", ".button:hover"]), "motion can be reduced");
  check("Focus states are visible", countMatches(styles, /:focus-visible/g) >= 8 && styles.includes("outline-offset") && styles.includes("box-shadow"), "keyboard focus has outline and halo");
  check("Filter selects are styled", /\.filters select\s*\{[\s\S]*?appearance:\s*none/.test(styles) && styles.includes(".filters select:hover"), "native selects match cockpit surface");
  check("Focus-driven remediation exists", allIncluded(appJs, ["REPAIR_FIELD_BY_ACTION", "openRepairForAction", "scrollIntoView", ".focus("]), "command actions can focus exact repair fields");
  check("Reduced-motion focus respects user preference", appJs.includes("prefers-reduced-motion: reduce") && appJs.includes('behavior: prefersReducedMotion ? "auto" : "smooth"'), "guided scroll respects motion preference");

  printResults("DESIGN SMOKE PASSED");
} catch (error) {
  results.push(["Design smoke failure", false, error.message]);
  printResults("DESIGN SMOKE FAILED");
  throw error;
}

async function read(file) {
  return readFile(join(projectRoot, file), "utf8");
}

function allIncluded(text, fragments) {
  return fragments.every((fragment) => text.includes(fragment));
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function check(name, pass, detail) {
  results.push([name, Boolean(pass), detail]);
  if (!pass) {
    throw new Error(`${name}: ${detail}`);
  }
}

function printResults(title) {
  console.log(`\n${title}`);
  for (const [name, pass, detail] of results) {
    console.log(`${pass ? "PASS" : "FAIL"} ${name} - ${detail}`);
  }
}
