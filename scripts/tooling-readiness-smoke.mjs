import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REQUIRED_TOOLING_IDS,
  TOOLING_INTEGRATIONS,
  getToolingIntegration,
  getToolingReadinessSummary
} from "../src/domain/toolingIntegrations.js";
import { PROVIDER_TEMPLATES, getProviderTemplate } from "../src/domain/providers.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const checks = [];

try {
  const packageJson = JSON.parse(await read("package.json"));
  const indexHtml = await read("index.html");
  const gitignore = await read(".gitignore");
  const envExample = await read(".env.example");
  const vscodeTasks = JSON.parse(await read(".vscode/tasks.json"));
  const vscodeExtensions = JSON.parse(await read(".vscode/extensions.json"));
  const cursorRules = await read(".cursor/rules/api-key-vault-manager.mdc");
  const agentInstructions = await read("AGENTS.md");
  const readinessDoc = await read("docs/tooling-integration-readiness.md");
  const connectivityPlan = await read("docs/tooling-connectivity-plan.md");
  const summary = getToolingReadinessSummary();

  check("Tooling readiness smoke is wired", packageJson.scripts?.["smoke:tooling"] === "node scripts/tooling-readiness-smoke.mjs", packageJson.scripts?.["smoke:tooling"] || "missing");
  check("Tooling readiness participates in check", packageJson.scripts?.check?.includes("scripts/tooling-readiness-smoke.mjs"), "syntax gate includes tooling readiness smoke");
  check("Tooling readiness participates in workflow", packageJson.scripts?.["smoke:workflow"]?.includes("npm run smoke:tooling"), packageJson.scripts?.["smoke:workflow"] || "missing workflow");
  check("Tooling readiness participates in verify", packageJson.scripts?.verify?.includes("npm run smoke:tooling"), packageJson.scripts?.verify || "missing verify");
  check("Required tools are cataloged", REQUIRED_TOOLING_IDS.every((id) => Boolean(getToolingIntegration(id))), REQUIRED_TOOLING_IDS.join(", "));
  check("Catalog covers adjacent engineering tools", summary.total >= 18 && summary.categories >= 10, `${summary.total} tools across ${summary.categories} categories`);
  check("Runtime network stays disabled", hasStrictLocalCsp(indexHtml), "connect-src none and no unsafe inline/eval");
  check("Adapters are disabled by default", summary.disabledByDefault >= 8, `${summary.disabledByDefault} disabled or no-runtime postures`);
  check("Catalog uses official HTTPS references", TOOLING_INTEGRATIONS.every((item) => item.docsUrl.startsWith("https://") && item.dashboardUrl.startsWith("https://")), "docs and dashboards are HTTPS");
  check("Catalog records secret posture", TOOLING_INTEGRATIONS.every((item) => item.secretStorage && item.secretStorage.length > 35), "every tool names where secrets belong");
  check("Catalog records setup steps", TOOLING_INTEGRATIONS.every((item) => item.setupChecklist.length >= 4), "every tool has actionable setup checklist");
  check("Provider templates mirror requested tools", REQUIRED_TOOLING_IDS.every((id) => Boolean(getProviderTemplate(id))), "provider templates cover requested tools");
  check("Provider catalog still has broad coverage", PROVIDER_TEMPLATES.length >= 20, `${PROVIDER_TEMPLATES.length} provider templates`);
  check("Environment example is secret-safe", secretSafeEnvExample(envExample), ".env.example has placeholders only");
  check("Ignored local secret files remain ignored", allIncluded(gitignore, [".env", ".env.*", "credentials*.json", "service-account*.json", "*.vault.json"]), "secret-bearing files ignored");
  check("VS Code tasks cover local loops", taskLabels(vscodeTasks).includes("test:full") && taskLabels(vscodeTasks).includes("smoke:tooling") && taskLabels(vscodeTasks).includes("serve"), taskLabels(vscodeTasks).join(", "));
  check("VS Code recommendations are present", Array.isArray(vscodeExtensions.recommendations) && vscodeExtensions.recommendations.includes("ms-playwright.playwright"), "Playwright extension recommended");
  check("Cursor rules enforce no-secret posture", allIncluded(cursorRules, ["alwaysApply: true", "Do not paste real API keys", "npm run smoke:tooling"]), "Cursor rule has safety and tooling gate");
  check("Agent instructions support Codex and Antigravity", allIncluded(agentInstructions, ["Codex", "Antigravity", "Do not store plaintext secrets", "npm run test:fast"]), "shared agent contract present");
  check("Readiness documentation covers named platforms", REQUIRED_TOOLING_IDS.every((id) => readinessDoc.includes(id)), "named platforms covered in readiness doc");
  check("Connectivity plan names staged adapters", allIncluded(connectivityPlan, ["Google Cloud", "Cloudflare", "Supabase", "n8n", "Pipedream", "Notion", "ClickUp"]), "connectivity plan includes target adapters");

  printResults("TOOLING READINESS SMOKE PASSED");
} catch (error) {
  checks.push(["Tooling readiness failure", false, error.message]);
  printResults("TOOLING READINESS SMOKE FAILED");
  throw error;
}

async function read(file) {
  return readFile(join(projectRoot, file), "utf8");
}

function hasStrictLocalCsp(html) {
  return html.includes("connect-src 'none'")
    && html.includes("script-src 'self'")
    && html.includes("style-src 'self'")
    && !html.includes("'unsafe-inline'")
    && !html.includes("'unsafe-eval'");
}

function secretSafeEnvExample(text) {
  return !/\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/.test(text)
    && !/\bAIza[0-9A-Za-z_-]{35}\b/.test(text)
    && !/\bgh[pousr]_[A-Za-z0-9_]{36,}\b/.test(text)
    && !/\bsk-[A-Za-z0-9_-]{20,}\b/.test(text)
    && !/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)
    && text.includes("<set-in-private-secret-store>");
}

function taskLabels(tasksJson) {
  return (tasksJson.tasks || []).map((task) => task.label).sort();
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
