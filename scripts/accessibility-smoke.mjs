import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skippedDirectories = new Set([".git", "node_modules", "dist", "build", "coverage", "vault-exports"]);
const results = [];

try {
  const packageJson = JSON.parse(await read("package.json"));
  const indexHtml = await read("index.html");
  const appJs = await read("src/app.js");
  const styles = await read("src/styles.css");
  const htmlJs = await read("src/ui/html.js");
  const vaultViews = await read("src/ui/vaultViews.js");
  const dashboardPanels = await read("src/ui/dashboardPanels.js");
  const sourceFiles = (await listProjectFiles(join(projectRoot, "src")))
    .filter((file) => [".js", ".css", ".html"].includes(extname(file)));
  const sourceText = [indexHtml, await readMany(sourceFiles)].join("\n");

  check("Accessibility smoke is wired", packageJson.scripts?.["smoke:accessibility"] === "node scripts/accessibility-smoke.mjs", packageJson.scripts?.["smoke:accessibility"] || "missing");
  check("Accessibility smoke participates in workflow", packageJson.scripts?.["smoke:workflow"]?.includes("smoke:accessibility"), packageJson.scripts?.["smoke:workflow"] || "missing workflow");
  check("Accessibility smoke participates in verify", packageJson.scripts?.verify?.includes("smoke:accessibility"), packageJson.scripts?.verify || "missing verify");
  check("Accessibility smoke participates in syntax gate", packageJson.scripts?.check?.includes("scripts/accessibility-smoke.mjs"), "syntax gate includes accessibility smoke");
  check("App root announces state changes politely", indexHtml.includes('id="app"') && indexHtml.includes('aria-live="polite"'), "app shell has polite live region");
  check("Generated fields have explicit labels", allIncluded(htmlJs, ['<label for="${escapeAttr(name)}"', '<input id="${escapeAttr(name)}"', '<textarea id="${escapeAttr(name)}"', '<select id="${escapeAttr(id)}"']), "inputs, textareas, and selects share label/id contract");
  check("Select controls expose labels to assistive tech", htmlJs.includes('aria-label="${escapeAttr(label)}"'), "select renderer emits aria-label");
  check("Dialog surfaces are announced", countMatches(vaultViews, /role="dialog"/g) >= 4 && countMatches(vaultViews, /aria-modal="true"/g) >= 4 && vaultViews.includes("aria-labelledby"), "entry, settings, standards, and template dialogs");
  check("Quick views have distinct accessible names", vaultViews.includes('aria-label="Quick view: ${escapeAttr(view.label)} (${view.count})"'), "quick filters include label and count");
  check("Readiness meters are named", vaultViews.includes('aria-label="Entry readiness ${readiness.percent}%"'), "readiness meter has explicit name");
  check("Command actions use real buttons", !/<button(?![^>]*\btype=)/i.test(appJs + vaultViews + dashboardPanels), "all buttons declare type");
  check("External links protect browser context", !/target="_blank"(?![^>]*rel="noreferrer noopener")/i.test(sourceText), "target blank links include rel");
  check("No positive tabindex traps", !/tabindex\s*=\s*["']?(?!0|-1)\d/i.test(sourceText), "no positive tabindex values");
  check("Focus states remain visible", allIncluded(styles, [":focus", "outline:", "box-shadow"]), "focus outline and halo are present");
  check("Reduced motion is honored", styles.includes("@media (prefers-reduced-motion: reduce)") && styles.includes("scroll-behavior: auto"), "reduced-motion query disables smooth motion");
  check("Hidden content is intentional", displayNoneRules(styles).every((rule) => /notice|hidden/.test(rule.selector)), "only notice/hidden utility uses display none");

  printResults("ACCESSIBILITY SMOKE PASSED");
} catch (error) {
  results.push(["Accessibility smoke failure", false, error.message]);
  printResults("ACCESSIBILITY SMOKE FAILED");
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

async function readMany(files) {
  const parts = [];
  for (const file of files) {
    parts.push(await read(file));
  }
  return parts.join("\n");
}

function allIncluded(text, fragments) {
  return fragments.every((fragment) => String(text || "").includes(fragment));
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
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
