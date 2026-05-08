import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CRYPTO_VERSION, DEFAULT_ITERATIONS } from "../src/vaultCrypto.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const skippedDirectories = new Set([".git", "node_modules", "dist", "build", "coverage", "vault-exports"]);
const checks = [];

try {
  const packageJson = JSON.parse(await read("package.json"));
  const indexHtml = await read("index.html");
  const vaultCrypto = await read("src/vaultCrypto.js");
  const appJs = await read("src/app.js");
  const schemaJs = await read("src/schema.js");
  const reportsJs = await read("src/domain/reports.js");
  const auditJs = await read("src/core/audit.js");
  const storageJs = await read("src/core/storage.js");
  const gitignore = await read(".gitignore");
  const securityPolicy = await read("SECURITY.md");
  const threatModel = await read("docs/threat-model.md");
  const isoReadiness = await read("docs/iso-readiness-analysis.md");
  const restructurePlan = await read("docs/project-outline-restructure-plan.md");
  const optimizationPlan = await read("docs/next-stage-optimization-plan.md");
  const sourceFiles = (await listProjectFiles(join(projectRoot, "src")))
    .filter((file) => [".js", ".html", ".css"].includes(extname(file)));
  const sourceText = await readMany(sourceFiles);
  const csp = getCsp(indexHtml);

  check("CSP is present", Boolean(csp), csp || "missing");
  check("CSP blocks script injection", hasDirective(csp, "script-src 'self'") && !csp.includes("'unsafe-inline'") && !csp.includes("'unsafe-eval'"), csp);
  check("CSP blocks runtime exfiltration", hasDirective(csp, "connect-src 'none'") && hasDirective(csp, "form-action 'none'"), csp);
  check("CSP blocks object/base abuse", hasDirective(csp, "object-src 'none'") && hasDirective(csp, "base-uri 'self'"), csp);
  check("Referrer policy is private", /name="referrer"\s+content="no-referrer"/i.test(indexHtml), "no-referrer meta tag");
  check("Source has no network APIs", !/\bfetch\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket\(/.test(sourceText), "no src network send path");
  check("Source has no cookie/session storage path", !/document\.cookie|sessionStorage/.test(sourceText), "no cookies or sessionStorage");
  check("Storage writes go through encrypted adapter", !/localStorage\.setItem|localStorage\.removeItem|getItem\(/.test(appJs) && storageJs.includes("assertEncryptedVault(encryptedVault)"), "app delegates storage and storage asserts encrypted shape");
  check("Crypto version is stable", CRYPTO_VERSION === 1, `version=${CRYPTO_VERSION}`);
  check("KDF iterations meet current floor", DEFAULT_ITERATIONS >= 600000, `iterations=${DEFAULT_ITERATIONS}`);
  check("AES-GCM/PBKDF2/SHA-256 contract is explicit", allIncluded(vaultCrypto, ["AES-GCM", "PBKDF2", "SHA-256", "length: 256"]), "crypto algorithm contract");
  check("Random salt and IV sizes are explicit", vaultCrypto.includes("randomBytes(16)") && vaultCrypto.includes("randomBytes(12)"), "16-byte salt, 12-byte GCM IV");
  check("Derived keys are non-extractable", /deriveKey\([\s\S]+false,[\s\S]+\["encrypt", "decrypt"\]/.test(vaultCrypto), "deriveKey non-extractable");
  check("Audit metadata redaction covers secret fields", /secret\|token\|password\|key/i.test(auditJs) && auditJs.includes("[redacted]"), "audit key-name redaction");
  check("Audit log is bounded", auditJs.includes("MAX_AUDIT_EVENTS = 300") && auditJs.includes(".slice(0, maxEvents)"), "audit retention bound");
  check("Default sharing posture is redacted", schemaJs.includes("redactedExportsOnly: true") && appJs.includes("buildRedactedInventoryExport") && reportsJs.includes("redactEntry") && reportsJs.includes("redactStandardsState"), "redacted entry and standards exports");
  check("Reveal and copy actions are auditable", appJs.includes("secret_copied") && appJs.includes("secret_revealed") && appJs.includes("auditCopyEvents") && appJs.includes("auditRevealEvents"), "copy/reveal audit events");
  check("Secret-bearing files are ignored", allIncluded(gitignore, [".env", "*.vault.json", "*.secrets.json", "*.key", "*.pem", "*.p12", "*.pfx", "service-account*.json", "credentials*.json"]), ".gitignore secret guards");
  check("Security limits are documented", allIncluded(securityPolicy, ["What The App Does Not Protect Against", "weak or reused master password", "malicious change", "browser extension"]), "explicit non-goals");
  check("Threat model names assets, risks, and controls", allIncluded(threatModel, ["## Assets", "## Primary Risks", "## Controls In This App", "## Operational Controls To Add Outside The App"]), "threat model sections");
  check("ISO gap backlog is documented", allIncluded(isoReadiness, ["Statement of Applicability", "corrective-action", "policy register", "management-review", "evidence-link"]), "ISO next implementation phase");
  check("Implementation needs remain explicit", allIncluded(restructurePlan, ["Add Vault Schema Versioning", "Add SoA export", "Split Test Harness", "Split `src/app.js`", "migrations"]), "architecture implementation backlog");
  check("Optimization plan keeps local encryption boundary", optimizationPlan.includes("without compromising the current local-only encryption model"), "local-only encryption preserved");
  check("Verify runs breaktest, tooling, security, ISO, bottleneck, playtest, and lab gates", allIncluded(packageJson.scripts?.verify || "", ["smoke:breaktest", "smoke:tooling", "smoke:security", "smoke:standards", "smoke:bottlenecks", "smoke:playtest", "npm run lab"]), packageJson.scripts?.verify || "missing");
  check("Workflow smoke includes breaktest, tooling, fast security, and playtest gates", allIncluded(packageJson.scripts?.["smoke:workflow"] || "", ["npm run doctor", "npm run quality", "smoke:breaktest", "smoke:tooling", "smoke:security", "smoke:bottlenecks", "smoke:playtest", "smoke:optimization"]), packageJson.scripts?.["smoke:workflow"] || "missing");

  printResults("SECURITY SMOKE PASSED");
} catch (error) {
  checks.push(["Security smoke failure", false, error.message]);
  printResults("SECURITY SMOKE FAILED");
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

function getCsp(html) {
  return html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i)?.[1] || "";
}

function hasDirective(csp, directive) {
  return csp.split(";").map((part) => part.trim()).includes(directive);
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
