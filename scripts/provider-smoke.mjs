import { PROVIDER_TEMPLATES, createEntryFromProviderTemplate, getProviderTemplate } from "../src/domain/providers.js";
import { evaluateEntryPolicies } from "../src/domain/policies.js";
import { getEntryReadiness } from "../src/domain/readiness.js";

const checks = [];

try {
  check("Provider catalog has broad coverage", PROVIDER_TEMPLATES.length >= 12, `${PROVIDER_TEMPLATES.length} templates`);
  check("Provider IDs are unique", new Set(PROVIDER_TEMPLATES.map((template) => template.id)).size === PROVIDER_TEMPLATES.length, "unique template IDs");
  check("Google Ads template exists", Boolean(getProviderTemplate("google-ads")), "google-ads found");
  check("Google Cloud template exists", Boolean(getProviderTemplate("google-cloud")), "google-cloud found");
  check("Cloudflare template exists", Boolean(getProviderTemplate("cloudflare")), "cloudflare found");
  check("Supabase template exists", Boolean(getProviderTemplate("supabase")), "supabase found");
  check("n8n template exists", Boolean(getProviderTemplate("n8n")), "n8n found");
  check("Pipedream template exists", Boolean(getProviderTemplate("pipedream")), "pipedream found");
  check("Playwright template exists", Boolean(getProviderTemplate("playwright")), "playwright found");
  check("Codex template exists", Boolean(getProviderTemplate("codex")), "codex found");
  check("Antigravity template exists", Boolean(getProviderTemplate("antigravity")), "antigravity found");
  check("Cursor template exists", Boolean(getProviderTemplate("cursor")), "cursor found");
  check("VS Code template exists", Boolean(getProviderTemplate("vscode")), "vscode found");
  check("Notion template exists", Boolean(getProviderTemplate("notion")), "notion found");
  check("ClickUp template exists", Boolean(getProviderTemplate("clickup")), "clickup found");
  check("OpenAI template exists", Boolean(getProviderTemplate("openai")), "openai found");
  check("Stripe template exists", Boolean(getProviderTemplate("stripe")), "stripe found");

  const googleAds = createEntryFromProviderTemplate("google-ads", {
    owner: "Marketing Owner",
    allowedOrigins: "https://example.test",
    lastVerifiedAt: "2026-05-07"
  });
  const readiness = getEntryReadiness(googleAds);
  const policyFindings = evaluateEntryPolicies(googleAds);

  check("Template creates entry identity", googleAds.name === "Google Ads" && googleAds.provider === "Google", `${googleAds.name}/${googleAds.provider}`);
  check("Template applies metadata", googleAds.category === "Ads and monetization" && googleAds.riskLevel === "Critical", `${googleAds.category}/${googleAds.riskLevel}`);
  check("Template includes evidence prompts", googleAds.notes.includes("privacy purpose") && googleAds.scopes.includes("Developer token"), "notes and scopes populated");
  check("Template produces useful readiness", readiness.percent >= 85, `readiness=${readiness.percent}`);
  check("Production template clears basic policy gates", policyFindings.length === 0, policyFindings.map((finding) => finding.id).join(", ") || "no findings");

  const unsafeCritical = createEntryFromProviderTemplate("openai", {
    environment: "Production",
    owner: "AI Platform Owner",
    allowedOrigins: "server-side only",
    lastVerifiedAt: "2026-05-07",
    rotationCadence: "No expiration"
  });
  const unsafeFindings = evaluateEntryPolicies(unsafeCritical);
  check("Templates still enforce critical rotation policy", unsafeFindings.some((finding) => finding.id === "POL-RISK-ROTATION"), unsafeFindings.map((finding) => finding.id).join(", "));

  let rejected = false;
  try {
    createEntryFromProviderTemplate("missing-template");
  } catch {
    rejected = true;
  }
  check("Unknown template is rejected", rejected, "missing template rejected");

  printResults("PROVIDER SMOKE PASSED");
} catch (error) {
  checks.push(["Provider smoke failure", false, error.message]);
  printResults("PROVIDER SMOKE FAILED");
  throw error;
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
