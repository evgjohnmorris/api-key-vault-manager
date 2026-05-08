import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skippedDirectories = new Set([".git", "node_modules", "dist", "build", "coverage", "vault-exports"]);
const scannedExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".toml", ".yml", ".yaml"]);
const requiredFiles = [
  "index.html",
  "src/app.js",
  "src/schema.js",
  "src/standards.js",
  "src/core/audit.js",
  "src/core/storage.js",
  "src/core/vault.js",
  "src/domain/connections.js",
  "src/domain/dashboard.js",
  "src/domain/policies.js",
  "src/domain/providers.js",
  "src/domain/readiness.js",
  "src/domain/reports.js",
  "src/domain/toolingIntegrations.js",
  "src/state/filters.js",
  "src/state/formPayloads.js",
  "src/state/session.js",
  "src/ui/dashboardPanels.js",
  "src/ui/events.js",
  "src/ui/html.js",
  "src/ui/vaultViews.js",
  "src/operationalPhysics.js",
  "src/vaultCrypto.js",
  "scripts/doctor.mjs",
  "scripts/accessibility-smoke.mjs",
  "scripts/security-smoke.mjs",
  "scripts/bottleneck-smoke.mjs",
  "scripts/deadzone-smoke.mjs",
  "scripts/design-smoke.mjs",
  "scripts/breaktest-prevention-smoke.mjs",
  "scripts/tooling-readiness-smoke.mjs",
  "scripts/connectivity-smoke.mjs",
  "scripts/playtest-audit.mjs",
  "scripts/playtest-index-smoke.mjs",
  "scripts/core-smoke.mjs",
  "scripts/dashboard-panels-smoke.mjs",
  "scripts/dashboard-smoke.mjs",
  "scripts/domain-smoke.mjs",
  "scripts/policy-smoke.mjs",
  "scripts/provider-smoke.mjs",
  "scripts/standards-smoke.mjs",
  "scripts/state-smoke.mjs",
  "scripts/ui-smoke.mjs",
  "scripts/smoke-test.mjs",
  "scripts/browser/static-server.mjs",
  "scripts/browser/chrome-runtime.mjs",
  "scripts/browser/cdp-client.mjs",
  "scripts/browser/page-driver.mjs",
  "scripts/browser/lab-flow.mjs",
  "scripts/optimization-smoke.mjs",
  "scripts/quality-report.mjs",
  "docs/architecture.md",
  "docs/aesthetic-standards-and-trends-analysis.md",
  "docs/breaktest-prevention.md",
  "docs/tooling-integration-readiness.md",
  "docs/threat-model.md",
  "docs/next-stage-optimization-plan.md",
  "docs/play-test-possibilities-index.md",
  "docs/project-outline-restructure-plan.md",
  "docs/tooling-research.md"
];
const secretPatterns = [
  { name: "AWS access key", regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { name: "Google API key", regex: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { name: "GitHub token", regex: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/g },
  { name: "OpenAI-style token", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { name: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g },
  { name: "Private key block", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g }
];

const results = [];
const files = await listProjectFiles(projectRoot);
const textFiles = files.filter((file) => scannedExtensions.has(extensionOf(file)));
const packageJson = JSON.parse(await read("package.json"));
const indexHtml = await read("index.html");

for (const file of requiredFiles) {
  results.push({
    name: `Required file: ${file}`,
    status: files.includes(toNativePath(file)) ? "pass" : "fail",
    detail: "architecture boundary present"
  });
}

results.push({
  name: "Strict CSP",
  status: hasStrictCsp(indexHtml) ? "pass" : "fail",
  detail: "script/style self, connect-src none, object-src none"
});

results.push({
  name: "Verify script",
  status: packageJson.scripts?.verify?.includes("npm run doctor")
    && packageJson.scripts.verify.includes("npm run check")
    && packageJson.scripts.verify.includes("npm run smoke:security")
    && packageJson.scripts.verify.includes("npm run smoke:breaktest")
    && packageJson.scripts.verify.includes("npm run smoke:tooling")
    && packageJson.scripts.verify.includes("npm run smoke:bottlenecks")
    && packageJson.scripts.verify.includes("npm run smoke:deadzones")
    && packageJson.scripts.verify.includes("npm run smoke:design")
    && packageJson.scripts.verify.includes("npm run smoke:accessibility")
    && packageJson.scripts.verify.includes("npm run smoke:playtest-index")
    && packageJson.scripts.verify.includes("npm run smoke:playtest")
    && packageJson.scripts.verify.includes("npm run smoke:core")
    && packageJson.scripts.verify.includes("npm run smoke:dashboard-panels")
    && packageJson.scripts.verify.includes("npm run smoke:dashboard")
    && packageJson.scripts.verify.includes("npm run smoke:domain")
    && packageJson.scripts.verify.includes("npm run smoke:policy")
    && packageJson.scripts.verify.includes("npm run smoke:provider")
    && packageJson.scripts.verify.includes("npm run smoke:standards")
    && packageJson.scripts.verify.includes("npm run smoke:state")
    && packageJson.scripts.verify.includes("npm run smoke:ui")
    && packageJson.scripts.verify.includes("npm run smoke:optimization")
    && packageJson.scripts.verify.includes("npm run lab") ? "pass" : "fail",
  detail: packageJson.scripts?.verify || "missing"
});

results.push({
  name: "Tooling doctor script",
  status: packageJson.scripts?.doctor === "node scripts/doctor.mjs" ? "pass" : "fail",
  detail: packageJson.scripts?.doctor || "missing"
});

results.push({
  name: "Workflow smoke shortcut",
  status: allIncluded(packageJson.scripts?.["smoke:workflow"] || "", ["npm run doctor", "npm run quality", "npm run smoke:breaktest", "npm run smoke:tooling", "npm run smoke:connectivity", "npm run smoke:security", "npm run smoke:bottlenecks", "npm run smoke:deadzones", "npm run smoke:design", "npm run smoke:accessibility", "npm run smoke:playtest-index", "npm run smoke:playtest", "npm run smoke:optimization"]) ? "pass" : "fail",
  detail: packageJson.scripts?.["smoke:workflow"] || "missing"
});

results.push({
  name: "Operational physics seam",
  status: packageJson.scripts?.check?.includes("src/operationalPhysics.js") ? "pass" : "fail",
  detail: "domain model participates in syntax gate"
});

const inlineStyleHits = await scan(textFiles, /\sstyle\s*=/gi);
results.push({
  name: "No inline styles",
  status: inlineStyleHits.length ? "fail" : "pass",
  detail: summarizeHits(inlineStyleHits)
});

const inlineHandlerHits = await scan(textFiles, /\son[a-z]+\s*=/gi);
results.push({
  name: "No inline event handlers",
  status: inlineHandlerHits.length ? "fail" : "pass",
  detail: summarizeHits(inlineHandlerHits)
});

const secretHits = [];
for (const pattern of secretPatterns) {
  const hits = await scan(textFiles, pattern.regex, pattern.name);
  secretHits.push(...hits);
}
results.push({
  name: "No common secret signatures",
  status: secretHits.length ? "fail" : "pass",
  detail: summarizeHits(secretHits)
});

const appStats = await stat(join(projectRoot, "src", "app.js"));
results.push({
  name: "App module size",
  status: appStats.size > 65000 ? "warn" : "pass",
  detail: `${formatKb(appStats.size)}; next expansion target is reports and accessibility lab`
});

const smokeStats = await stat(join(projectRoot, "scripts", "smoke-test.mjs"));
results.push({
  name: "Browser test harness size",
  status: smokeStats.size > 28000 ? "warn" : "pass",
  detail: `${formatKb(smokeStats.size)}; split CDP utilities if it grows again`
});

const docs = files.filter((file) => file.startsWith(`docs${separator()}`) && file.endsWith(".md"));
results.push({
  name: "Architecture documentation coverage",
  status: docs.length >= 6 ? "pass" : "warn",
  detail: `${docs.length} docs tracked`
});

printResults(results);

if (results.some((result) => result.status === "fail")) {
  process.exitCode = 1;
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

async function scan(candidateFiles, regex, label = "match") {
  const hits = [];

  for (const file of candidateFiles) {
    const text = await read(file);
    const lines = text.split(/\r?\n/);

    lines.forEach((line, index) => {
      regex.lastIndex = 0;
      if (regex.test(line)) {
        hits.push({ file, line: index + 1, label });
      }
    });
  }

  return hits;
}

async function read(file) {
  return readFile(join(projectRoot, file), "utf8");
}

function hasStrictCsp(html) {
  return html.includes("default-src 'self'")
    && html.includes("script-src 'self'")
    && html.includes("style-src 'self'")
    && html.includes("connect-src 'none'")
    && html.includes("object-src 'none'")
    && !html.includes("'unsafe-inline'")
    && !html.includes("'unsafe-eval'");
}

function allIncluded(text, fragments) {
  return fragments.every((fragment) => String(text || "").includes(fragment));
}

function summarizeHits(hits) {
  if (!hits.length) return "none found";
  return hits
    .slice(0, 5)
    .map((hit) => `${hit.file}:${hit.line}${hit.label ? ` ${hit.label}` : ""}`)
    .join(", ");
}

function printResults(items) {
  const failures = items.filter((item) => item.status === "fail").length;
  const warnings = items.filter((item) => item.status === "warn").length;
  const passed = items.filter((item) => item.status === "pass").length;
  const title = failures ? "QUALITY REPORT FAILED" : "QUALITY REPORT PASSED";

  console.log(`\n${title}`);
  for (const item of items) {
    const marker = item.status.toUpperCase().padEnd(4, " ");
    console.log(`${marker} ${item.name} - ${item.detail}`);
  }
  console.log(`\nSummary: ${passed} pass, ${warnings} warn, ${failures} fail`);
}

function extensionOf(file) {
  const index = file.lastIndexOf(".");
  return index === -1 ? "" : file.slice(index);
}

function toNativePath(file) {
  return file.replaceAll("/", separator());
}

function separator() {
  return process.platform === "win32" ? "\\" : "/";
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
