export const REQUIRED_TOOLING_IDS = [
  "google-cloud",
  "n8n",
  "pipedream",
  "playwright",
  "cloudflare",
  "supabase",
  "codex",
  "antigravity",
  "cursor",
  "vscode",
  "notion",
  "clickup"
];

export const TOOLING_INTEGRATIONS = [
  {
    id: "google-cloud",
    name: "Google Cloud",
    category: "Cloud runtime",
    readinessTier: "Production target",
    benefit: "Cloud Run, Secret Manager, IAM, storage, analytics, and managed production infrastructure.",
    dashboardUrl: "https://console.cloud.google.com/",
    docsUrl: "https://cloud.google.com/docs",
    authModel: "IAM, service accounts, workload identity, and project-scoped API enablement.",
    secretStorage: "Google Secret Manager or workload identity. Avoid long-lived downloaded service account keys where possible.",
    localCommand: "gcloud auth login",
    connectionMode: "Disabled by default; record project IDs, IAM owners, APIs, and secret references in the encrypted vault.",
    requiredVaultFields: ["project", "owner", "accountId", "scopes", "storagePath", "notes"],
    setupChecklist: [
      "Record project ID, billing owner, IAM owner, and enabled APIs.",
      "Prefer workload identity or Secret Manager references over local JSON key files.",
      "Store any unavoidable key file path only as metadata, not as committed content.",
      "Add deployment notes only after migrations and report exports exist."
    ],
    smokeSignals: ["no plaintext service-account JSON", "project owner recorded", "Secret Manager path captured"],
    tags: ["google", "cloud", "iam", "secrets", "deployment"]
  },
  {
    id: "n8n",
    name: "n8n",
    category: "Workflow automation",
    readinessTier: "Automation target",
    benefit: "Low-code workflows, webhooks, credential-backed automations, and self-hosted or cloud orchestration.",
    dashboardUrl: "https://app.n8n.cloud/",
    docsUrl: "https://docs.n8n.io/",
    authModel: "n8n credentials, webhook secrets, API credentials, and optional self-hosted environment variables.",
    secretStorage: "n8n credential store or private deployment secrets. Vault records should store purpose and secret location, not raw shared webhook secrets in docs.",
    localCommand: "n8n start",
    connectionMode: "Webhook and credential inventory only until explicit adapter work exists.",
    requiredVaultFields: ["url", "dashboardUrl", "scopes", "owner", "notes"],
    setupChecklist: [
      "Create a workflow inventory entry for each webhook.",
      "Record webhook purpose, owner, retry behavior, and downstream systems.",
      "Keep production webhook URLs out of public docs and logs.",
      "Use redacted exports for workflow handoff packets."
    ],
    smokeSignals: ["webhook owner recorded", "retry path documented", "no production URL in public docs"],
    tags: ["n8n", "webhook", "automation", "workflow"]
  },
  {
    id: "pipedream",
    name: "Pipedream",
    category: "Workflow automation",
    readinessTier: "Automation target",
    benefit: "Event-driven workflows, HTTP triggers, OAuth app connections, and quick integration prototypes.",
    dashboardUrl: "https://pipedream.com/workflows",
    docsUrl: "https://pipedream.com/docs/",
    authModel: "Connected accounts, HTTP endpoints, environment variables, and app-scoped OAuth.",
    secretStorage: "Pipedream connected accounts and private environment variables. Store only redacted endpoint purpose in repo docs.",
    localCommand: "pd workflows",
    connectionMode: "Disabled by default; ready for webhook cataloging and redacted launchpad links.",
    requiredVaultFields: ["url", "dashboardUrl", "owner", "purpose", "notes"],
    setupChecklist: [
      "Record workflow URL, trigger type, owner, and connected apps.",
      "Separate dev and production triggers.",
      "Document replay and failure notification behavior.",
      "Keep endpoint secrets private."
    ],
    smokeSignals: ["trigger purpose recorded", "environment separation planned", "connected accounts inventoried"],
    tags: ["pipedream", "webhook", "automation", "oauth"]
  },
  {
    id: "playwright",
    name: "Playwright",
    category: "Testing",
    readinessTier: "Developer tool",
    benefit: "Browser automation, E2E regression tests, screenshots, traces, and accessibility smoke expansion.",
    dashboardUrl: "https://playwright.dev/",
    docsUrl: "https://playwright.dev/docs/intro",
    authModel: "Local dev dependency when adopted; no production credential needed for this static app.",
    secretStorage: "Use test fixtures and temporary browser profiles. Never store real vault passwords in traces.",
    localCommand: "npm run smoke && npm run lab",
    connectionMode: "Current browser smoke uses local Chrome/CDP without adding Playwright as a dependency yet.",
    requiredVaultFields: ["notes", "tags"],
    setupChecklist: [
      "Keep current smoke/lab passing before adding Playwright.",
      "Adopt Playwright only when screenshots, traces, or independent click coverage are needed.",
      "Redact test artifacts before sharing.",
      "Add accessibility smoke after navigation expands."
    ],
    smokeSignals: ["browser smoke passes", "lab passes", "no real secrets in artifacts"],
    tags: ["playwright", "testing", "browser", "qa"]
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "Edge platform",
    readinessTier: "Production target",
    benefit: "Pages, Workers, DNS, R2, D1, KV, Turnstile, WAF, analytics, and edge deployment.",
    dashboardUrl: "https://dash.cloudflare.com/",
    docsUrl: "https://developers.cloudflare.com/",
    authModel: "Scoped API tokens, account IDs, zone IDs, Pages project tokens, and Wrangler authentication.",
    secretStorage: "Cloudflare secrets, Pages/Workers environment variables, or local Wrangler auth. Avoid global API keys.",
    localCommand: "wrangler login",
    connectionMode: "Prepared for Pages deployment and future Worker adapter, but runtime remains local-only.",
    requiredVaultFields: ["accountId", "owner", "scopes", "dashboardUrl", "notes"],
    setupChecklist: [
      "Record account ID, zone ID, Pages project, token scopes, and DNS owner.",
      "Keep GitHub Pages as the current default until Cloudflare deployment is intentional.",
      "Use scoped API tokens for automation.",
      "Preserve strict CSP and local-only encryption unless a separate backend mode is designed."
    ],
    smokeSignals: ["scoped token posture", "account and zone owner recorded", "no runtime network path"],
    tags: ["cloudflare", "pages", "workers", "dns", "edge"]
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "Backend platform",
    readinessTier: "Optional backend target",
    benefit: "Postgres, Auth, Storage, Edge Functions, realtime, and optional future team-sync backend.",
    dashboardUrl: "https://supabase.com/dashboard",
    docsUrl: "https://supabase.com/docs",
    authModel: "Project URL, anon key for public clients, service role key only in server-side contexts, and Edge Function secrets.",
    secretStorage: "Supabase project settings, Edge Function secrets, or private server environment variables. Never expose service role keys in the static app.",
    localCommand: "supabase start",
    connectionMode: "Design-only until migrations, backend boundary, and encryption model are explicit.",
    requiredVaultFields: ["url", "accountId", "owner", "scopes", "notes"],
    setupChecklist: [
      "Record project URL, region, owner, and intended data domains.",
      "Keep service role keys out of client-side code.",
      "Design conflict resolution before any sync feature.",
      "Add migrations before persistent backend records."
    ],
    smokeSignals: ["service role key banned from client", "project owner recorded", "sync boundary documented"],
    tags: ["supabase", "postgres", "auth", "storage", "backend"]
  },
  {
    id: "codex",
    name: "Codex",
    category: "AI development agent",
    readinessTier: "Developer tool",
    benefit: "Repo-aware coding, local verification, smoke-test execution, and implementation planning.",
    dashboardUrl: "https://chatgpt.com/codex",
    docsUrl: "https://platform.openai.com/docs",
    authModel: "User account and local workspace permissions. Project instructions live in AGENTS.md.",
    secretStorage: "Do not paste real API keys into prompts. Store keys only in the encrypted vault or private provider secret stores.",
    localCommand: "npm run test:fast",
    connectionMode: "Ready through AGENTS.md, deterministic scripts, and zero-dependency smoke gates.",
    requiredVaultFields: ["purpose", "owner", "notes"],
    setupChecklist: [
      "Keep AGENTS.md aligned with no-secret and no-runtime-network rules.",
      "Use smoke gates after every code change.",
      "Prefer redacted exports when asking agents to reason about vault contents.",
      "Do not grant agent tools access to real keys without an explicit narrow task."
    ],
    smokeSignals: ["AGENTS.md present", "test:fast passes", "redacted export posture"],
    tags: ["codex", "ai", "agent", "coding"]
  },
  {
    id: "antigravity",
    name: "Google Antigravity",
    category: "AI development agent",
    readinessTier: "Developer tool",
    benefit: "Agent-first coding workflow preparation, task handoffs, browser-style inspection, and repo instruction reuse.",
    dashboardUrl: "https://antigravity.google/",
    docsUrl: "https://developers.googleblog.com/en/build-with-google-antigravity-our-new-agentic-development-platform/",
    authModel: "User account and workspace access. Use AGENTS.md and repo docs as the safe operating contract.",
    secretStorage: "Never put real vault exports or provider tokens into agent context. Use redacted inventory when collaboration is needed.",
    localCommand: "npm run smoke:workflow",
    connectionMode: "Prepared through repo instructions and explicit test scripts; no live adapter needed.",
    requiredVaultFields: ["purpose", "owner", "notes"],
    setupChecklist: [
      "Use AGENTS.md as the shared agent contract.",
      "Keep project docs concise and test commands stable.",
      "Route all secret discussion through redacted exports.",
      "Require smoke/lab evidence after agent changes."
    ],
    smokeSignals: ["agent instructions present", "workflow gate passes", "no secrets in context"],
    tags: ["antigravity", "google", "ai", "agent"]
  },
  {
    id: "cursor",
    name: "Cursor",
    category: "AI editor",
    readinessTier: "Developer tool",
    benefit: "AI-assisted editing, rules, MCP connector planning, and local command execution inside an editor.",
    dashboardUrl: "https://cursor.com/",
    docsUrl: "https://docs.cursor.com/",
    authModel: "User account, workspace trust, rules files, and optional MCP configuration.",
    secretStorage: "Keep MCP server credentials out of repo. Use example config only and store real values in private editor settings.",
    localCommand: "npm run test:fast",
    connectionMode: "Ready through .cursor rules and documented MCP posture.",
    requiredVaultFields: ["purpose", "owner", "notes"],
    setupChecklist: [
      "Use .cursor/rules for project constraints.",
      "Do not commit real MCP config with tokens.",
      "Run test:fast after generated edits.",
      "Use redacted exports for large-context planning."
    ],
    smokeSignals: ["cursor rules present", "no committed MCP secrets", "fast gate passes"],
    tags: ["cursor", "editor", "mcp", "ai"]
  },
  {
    id: "vscode",
    name: "Visual Studio Code",
    category: "Editor",
    readinessTier: "Developer tool",
    benefit: "Tasks, recommended extensions, GitHub workflow editing, static server commands, and local smoke execution.",
    dashboardUrl: "https://code.visualstudio.com/",
    docsUrl: "https://code.visualstudio.com/docs",
    authModel: "Local editor workspace trust and optional extension sign-ins.",
    secretStorage: "Do not store credentials in workspace settings. Use .env files only locally and keep them ignored.",
    localCommand: "npm run test:full",
    connectionMode: "Ready through .vscode tasks and extension recommendations.",
    requiredVaultFields: ["notes", "tags"],
    setupChecklist: [
      "Use VS Code tasks for doctor, check, smoke, lab, and full verification.",
      "Keep real environment variables outside committed settings.",
      "Use recommended extensions only as optional developer tooling.",
      "Keep the no-build static path working."
    ],
    smokeSignals: ["tasks file present", "extensions file present", "full gate passes"],
    tags: ["vscode", "editor", "tasks", "extensions"]
  },
  {
    id: "notion",
    name: "Notion",
    category: "Knowledge and planning",
    readinessTier: "Operations target",
    benefit: "Docs, task databases, implementation notes, audit prep, and product planning records.",
    dashboardUrl: "https://www.notion.so/",
    docsUrl: "https://developers.notion.com/",
    authModel: "Internal integration token, OAuth integration, database/page permissions, and webhook-style sync through adapters.",
    secretStorage: "Notion integration tokens belong in private automation secrets, not committed docs.",
    localCommand: "npm run smoke:tooling",
    connectionMode: "Prepared for redacted report handoff and future connector adapter.",
    requiredVaultFields: ["url", "owner", "purpose", "notes"],
    setupChecklist: [
      "Record target workspace, database IDs, owner, and sync purpose.",
      "Use redacted exports for Notion planning pages.",
      "Keep raw evidence encrypted unless explicitly moved to a private workspace.",
      "Map Notion pages to policies, risks, and reports after migrations exist."
    ],
    smokeSignals: ["workspace owner recorded", "redacted handoff path", "no token in repo"],
    tags: ["notion", "docs", "planning", "knowledge"]
  },
  {
    id: "clickup",
    name: "ClickUp",
    category: "Project management",
    readinessTier: "Operations target",
    benefit: "Tasks, implementation plans, issue tracking, status reporting, and workflow handoffs.",
    dashboardUrl: "https://app.clickup.com/",
    docsUrl: "https://developer.clickup.com/",
    authModel: "API token or OAuth, workspace/list/folder IDs, webhook secrets, and automation owner permissions.",
    secretStorage: "ClickUp tokens and webhook secrets belong in private automation settings.",
    localCommand: "npm run smoke:workflow",
    connectionMode: "Prepared for redacted task creation and future connector adapter.",
    requiredVaultFields: ["url", "accountId", "owner", "purpose", "notes"],
    setupChecklist: [
      "Record workspace, space, folder, list, and automation owner.",
      "Separate public task summaries from private evidence.",
      "Use webhook signing where available.",
      "Keep API token scopes narrow."
    ],
    smokeSignals: ["workspace/list metadata captured", "webhook owner recorded", "no token in repo"],
    tags: ["clickup", "tasks", "project-management", "webhook"]
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    category: "CI/CD",
    readinessTier: "Release gate",
    benefit: "Static deploy verification, branch checks, Pages deployment, and future provider deployment jobs.",
    dashboardUrl: "https://github.com/features/actions",
    docsUrl: "https://docs.github.com/actions",
    authModel: "Repository permissions, OIDC, environment secrets, workflow permissions, and branch protections.",
    secretStorage: "GitHub Actions secrets or OIDC. Prefer OIDC over long-lived cloud deployment keys.",
    localCommand: "npm run verify",
    connectionMode: "Active for GitHub Pages verification; future cloud deploy workflows should stay gated.",
    requiredVaultFields: ["url", "owner", "scopes", "notes"],
    setupChecklist: [
      "Keep npm run verify before deploy.",
      "Use environment protection for production deploys.",
      "Prefer OIDC cloud auth where available.",
      "Do not print secrets in workflow logs."
    ],
    smokeSignals: ["verify before deploy", "least-privilege permissions", "secret log avoidance"],
    tags: ["github", "actions", "ci", "deploy"]
  },
  {
    id: "sentry",
    name: "Sentry",
    category: "Observability",
    readinessTier: "Production support",
    benefit: "Error monitoring, release health, performance traces, and production incident visibility.",
    dashboardUrl: "https://sentry.io/",
    docsUrl: "https://docs.sentry.io/",
    authModel: "DSN, org/project tokens, release auth token, and PII scrubbing settings.",
    secretStorage: "DSN can be public depending on usage, but auth tokens must stay private.",
    localCommand: "npm run smoke:security",
    connectionMode: "Catalog-ready; no runtime monitoring script added to preserve current CSP and no-third-party posture.",
    requiredVaultFields: ["dashboardUrl", "owner", "notes"],
    setupChecklist: [
      "Record org, project, DSN exposure expectation, and alert owner.",
      "Enable PII scrubbing before production event collection.",
      "Do not add client script until analytics/monitoring policy is approved.",
      "Keep CSP changes explicit."
    ],
    smokeSignals: ["PII policy recorded", "alert owner captured", "CSP unchanged"],
    tags: ["sentry", "monitoring", "errors", "observability"]
  },
  {
    id: "posthog",
    name: "PostHog",
    category: "Analytics",
    readinessTier: "Optional product analytics",
    benefit: "Product analytics, feature flags, funnels, session replay, and event tracking.",
    dashboardUrl: "https://app.posthog.com/",
    docsUrl: "https://posthog.com/docs",
    authModel: "Project API key, personal API key, feature flag keys, and event ingestion endpoint.",
    secretStorage: "Project public keys may be client-visible, but personal API keys must stay private.",
    localCommand: "npm run smoke:security",
    connectionMode: "Catalog-ready; runtime analytics remains off by default.",
    requiredVaultFields: ["purpose", "owner", "notes"],
    setupChecklist: [
      "Record analytics purpose, consent posture, retention, and owner.",
      "Keep tracking disabled until privacy policy and CSP changes are approved.",
      "Avoid session replay until explicit consent handling exists.",
      "Use redacted exports for analytics planning."
    ],
    smokeSignals: ["privacy purpose recorded", "tracking disabled by default", "CSP unchanged"],
    tags: ["posthog", "analytics", "privacy", "feature-flags"]
  },
  {
    id: "docker",
    name: "Docker",
    category: "Local runtime",
    readinessTier: "Developer tool",
    benefit: "Optional local services for future Supabase, n8n, database, and integration testing.",
    dashboardUrl: "https://www.docker.com/",
    docsUrl: "https://docs.docker.com/",
    authModel: "Local Docker context and optional registry credentials.",
    secretStorage: "Use local .env files and Docker secrets where needed. Do not commit generated compose secrets.",
    localCommand: "docker version",
    connectionMode: "Optional local tooling only; no runtime dependency for the static app.",
    requiredVaultFields: ["notes", "tags"],
    setupChecklist: [
      "Use only when local services are needed.",
      "Keep compose files free of real secrets.",
      "Document ports and data volumes.",
      "Keep npm run serve as the default static path."
    ],
    smokeSignals: ["optional only", "no committed compose secrets", "static path preserved"],
    tags: ["docker", "local", "containers", "dev"]
  },
  {
    id: "opentofu",
    name: "OpenTofu / Terraform posture",
    category: "Infrastructure as code",
    readinessTier: "Infrastructure planning",
    benefit: "Repeatable cloud resources, environment drift control, and auditable infrastructure changes.",
    dashboardUrl: "https://opentofu.org/",
    docsUrl: "https://opentofu.org/docs/",
    authModel: "Provider credentials through private environment variables, OIDC, or cloud-specific auth.",
    secretStorage: "Remote state and provider secrets must be private. Do not commit state files or plan output with secrets.",
    localCommand: "tofu plan",
    connectionMode: "Planning-ready; add only after deployment targets are chosen.",
    requiredVaultFields: ["project", "owner", "storagePath", "notes"],
    setupChecklist: [
      "Pick one target cloud before writing IaC.",
      "Keep state backend private and encrypted.",
      "Prefer OIDC or short-lived credentials.",
      "Scan plans for secret exposure before sharing."
    ],
    smokeSignals: ["private state planned", "provider owner recorded", "OIDC preferred"],
    tags: ["iac", "opentofu", "terraform", "infrastructure"]
  },
  {
    id: "password-manager",
    name: "1Password / Bitwarden handoff",
    category: "Secrets operations",
    readinessTier: "Security companion",
    benefit: "Team credential sharing, recovery, MFA, emergency access, and managed secret lifecycle outside the static app.",
    dashboardUrl: "https://1password.com/",
    docsUrl: "https://developer.1password.com/docs/",
    authModel: "Vault membership, item permissions, service account tokens, and CLI sessions.",
    secretStorage: "Use enterprise password manager vaults for shared secrets. This app should store metadata and encrypted local backups.",
    localCommand: "op --version",
    connectionMode: "Companion posture only; do not sync secrets automatically without a reviewed adapter.",
    requiredVaultFields: ["storagePath", "owner", "notes"],
    setupChecklist: [
      "Record private vault path or item reference, not raw values.",
      "Define emergency access owner.",
      "Keep MFA and recovery policy documented.",
      "Use redacted inventory for team planning."
    ],
    smokeSignals: ["private item path recorded", "emergency owner captured", "no automatic sync"],
    tags: ["1password", "bitwarden", "secrets", "mfa"]
  }
];

export function getToolingIntegration(id) {
  return TOOLING_INTEGRATIONS.find((integration) => integration.id === id) || null;
}

export function getToolingReadinessSummary(integrations = TOOLING_INTEGRATIONS) {
  const byTier = {};
  const byCategory = {};

  for (const integration of integrations) {
    byTier[integration.readinessTier] = (byTier[integration.readinessTier] || 0) + 1;
    byCategory[integration.category] = (byCategory[integration.category] || 0) + 1;
  }

  return {
    total: integrations.length,
    requiredReady: REQUIRED_TOOLING_IDS.every((id) => Boolean(getToolingIntegration(id))),
    disabledByDefault: integrations.filter((integration) => /disabled by default|off by default|no runtime|optional|prepared|catalog-ready|planning-ready|companion posture|current browser smoke/i.test(integration.connectionMode)).length,
    categories: Object.keys(byCategory).length,
    byTier,
    byCategory
  };
}
