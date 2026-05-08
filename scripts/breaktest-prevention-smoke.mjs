import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skippedDirectories = new Set([".git", "node_modules", "dist", "build", "coverage", "vault-exports"]);
const results = [];
const fastWorkflowSteps = [
  "npm run doctor",
  "npm run quality",
  "npm run smoke:breaktest",
  "npm run smoke:tooling",
  "npm run smoke:connectivity",
  "npm run smoke:security",
  "npm run smoke:bottlenecks",
  "npm run smoke:deadzones",
  "npm run smoke:design",
  "npm run smoke:accessibility",
  "npm run smoke:playtest-index",
  "npm run smoke:playtest",
  "npm run smoke:optimization"
];
const fullVerifySteps = [
  "npm run doctor",
  "npm run check",
  "npm run quality",
  "npm run smoke:breaktest",
  "npm run smoke:tooling",
  "npm run smoke:connectivity",
  "npm run smoke:security",
  "npm run smoke:bottlenecks",
  "npm run smoke:deadzones",
  "npm run smoke:design",
  "npm run smoke:accessibility",
  "npm run smoke:playtest-index",
  "npm run smoke:playtest",
  "npm run smoke:core",
  "npm run smoke:dashboard-panels",
  "npm run smoke:dashboard",
  "npm run smoke:domain",
  "npm run smoke:policy",
  "npm run smoke:provider",
  "npm run smoke:standards",
  "npm run smoke:state",
  "npm run smoke:ui",
  "npm run smoke:optimization",
  "npm run smoke",
  "npm run lab"
];

try {
  const packageJson = JSON.parse(await read("package.json"));
  const workflow = await read(".github/workflows/pages.yml");
  const readme = await read("README.md");
  const preventionDoc = await read("docs/breaktest-prevention.md");
  const smokeHarness = await read("scripts/smoke-test.mjs");
  const browserLabFlow = await read("scripts/browser/lab-flow.mjs");
  const securitySmoke = await read("scripts/security-smoke.mjs");
  const bottleneckSmoke = await read("scripts/bottleneck-smoke.mjs");
  const deadzoneSmoke = await read("scripts/deadzone-smoke.mjs");
  const designSmoke = await read("scripts/design-smoke.mjs");
  const playtestAudit = await read("scripts/playtest-audit.mjs");
  const scripts = packageJson.scripts || {};
  const scriptFiles = (await listProjectFiles(join(projectRoot, "scripts")))
    .filter((file) => extname(file) === ".mjs")
    .map((file) => file.replaceAll("\\", "/"));
  const importedScriptFiles = new Set((await getImportEdges(scriptFiles))
    .map((edge) => edge.to)
    .filter((file) => file?.startsWith("scripts/")));
  const smokeScriptNames = Object.keys(scripts)
    .filter((name) => name.startsWith("smoke:") && name !== "smoke:workflow")
    .sort();
  const missingFromVerify = smokeScriptNames.filter((name) => !scripts.verify?.includes(`npm run ${name}`));
  const missingFromCheck = scriptFiles.filter((file) => !scripts.check?.includes(file));
  const unwiredScriptFiles = scriptFiles.filter((file) => !Object.values(scripts).some((script) => script.includes(file)) && !importedScriptFiles.has(file));

  check("Breaktest prevention smoke is wired", scripts["smoke:breaktest"] === "node scripts/breaktest-prevention-smoke.mjs", scripts["smoke:breaktest"] || "missing");
  check("Breaktest prevention participates in check", scripts.check?.includes("scripts/breaktest-prevention-smoke.mjs"), "syntax gate includes breaktest prevention");
  check("Fast workflow runs breaktest prevention early", orderedIncludes(scripts["smoke:workflow"] || "", fastWorkflowSteps), scripts["smoke:workflow"] || "missing workflow");
  check("Full verify runs every release gate in order", orderedIncludes(scripts.verify || "", fullVerifySteps), scripts.verify || "missing verify");
  check("Every smoke script participates in verify", missingFromVerify.length === 0, missingFromVerify.join(", ") || smokeScriptNames.join(", "));
  check("Every script file participates in syntax gate", missingFromCheck.length === 0, missingFromCheck.join(", ") || `${scriptFiles.length} scripts checked`);
  check("No smoke or tooling script is orphaned", unwiredScriptFiles.length === 0, unwiredScriptFiles.join(", ") || "all scripts addressable");
  check("Deploy cannot bypass verify", workflow.indexOf("npm run verify") > -1 && workflow.indexOf("npm run verify") < workflow.indexOf("actions/upload-pages-artifact"), "GitHub Pages verifies before artifact upload");
  check("No dependency drift before proof gap", !packageJson.dependencies && !packageJson.devDependencies, "zero runtime/dev dependency baseline preserved");
  check("Browser smoke keeps encrypted-storage assertions", allIncluded(smokeHarness, ["Encrypted localStorage", "AES-GCM/PBKDF2", "hasPlainSecret", "hasPlainEvidence"]), "secret and evidence plaintext checks remain in browser smoke");
  check("Browser lab keeps mutation and recovery assertions", allIncluded(smokeHarness + browserLabFlow, ["Entry edit flow", "Search/filter behavior", "Settings flow", "Lock/unlock security flow", "wrong password rejected"]), "lab still exercises edit, filter, settings, and recovery paths");
  check("Security smoke keeps exfiltration blockers", allIncluded(securitySmoke, ["connect-src 'none'", "Source has no network APIs", "Source has no cookie/session storage path", "Storage writes go through encrypted adapter"]), "security smoke still blocks network, cookies, and plaintext storage drift");
  check("Bottleneck smoke catches structural drift", allIncluded(bottleneckSmoke, ["No orphan source modules", "No unwired smoke/tool scripts", "No explicit dead-end markers", "App browser side-effect pressure remains bounded"]), "bottleneck smoke guards orphans, wiring, dead ends, and side effects");
  check("Deadzone smoke catches interaction drift", allIncluded(deadzoneSmoke, ["Command actions resolve to a destination", "Quick filters reach matching entries", "No pointer-event dead zones", "Modal controls are bound"]), "deadzone smoke guards broken routes and hidden traps");
  check("Design smoke catches UX regressions", allIncluded(designSmoke, ["Reduced motion is supported", "Focus states are visible", "Filter selects are styled", "Focus-driven remediation exists"]), "design smoke guards motion, focus, filters, and guided remediation");
  check("Accessibility smoke catches semantic drift", scripts["smoke:accessibility"] === "node scripts/accessibility-smoke.mjs" && scripts.verify?.includes("smoke:accessibility"), "accessibility smoke is wired into verify");
  check("Playtest audit reports prevention coverage", allIncluded(playtestAudit, ["Breaktest prevention", "smoke:breaktest", "Every smoke script participates in verify"]), "product playtest names the prevention gate");
  check("Breaktest prevention protocol is documented", allIncluded(preventionDoc, ["Regression Mesh", "Gate Inventory", "Do-Not-Break Rules", "Failure Response"]), "prevention doctrine is explicit");
  check("README exposes prevention workflow", readme.includes("smoke:breaktest") && readme.includes("breaktest prevention"), "operator docs name the gate");

  printResults("BREAKTEST PREVENTION SMOKE PASSED");
} catch (error) {
  results.push(["Breaktest prevention failure", false, error.message]);
  printResults("BREAKTEST PREVENTION SMOKE FAILED");
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
      collected.push(relative(base, absolute));
    }
  }

  return collected.sort();
}

async function read(file) {
  return readFile(join(projectRoot, file), "utf8");
}

async function getImportEdges(files) {
  const edges = [];

  for (const file of files) {
    const text = await read(file);
    for (const match of text.matchAll(/^import\s+(?:[\s\S]*?)\s+from\s+["'](.+?)["'];?/gm)) {
      edges.push({ from: file, to: resolveImport(file, match[1]) });
    }
  }

  return edges;
}

function resolveImport(from, specifier) {
  if (!specifier.startsWith(".")) return "";
  const base = normalize(join(dirname(from), specifier));
  const withExtension = extname(base) ? base : `${base}.js`;
  return withExtension.replaceAll("\\", "/");
}

function allIncluded(text, fragments) {
  return fragments.every((fragment) => String(text || "").includes(fragment));
}

function orderedIncludes(text, steps) {
  let cursor = -1;
  for (const step of steps) {
    const next = text.indexOf(step, cursor + 1);
    if (next === -1) return false;
    cursor = next;
  }
  return true;
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
