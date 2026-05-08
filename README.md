# API Key Vault Manager

A GitHub-hostable static app for maintaining API keys, logins, OAuth clients, service accounts, ad and analytics connections, and other developer credentials with rich metadata.

The app is designed so the source code can live in a public GitHub repository while the actual vault contents remain encrypted in the browser or in private encrypted export files.

## What It Tracks

- Provider, connection name, type, category, purpose, and use case.
- Secret value, username/email, account ID, dashboard URL, docs URL, and service URL.
- Environment, status, risk level, scopes, allowed origins/IPs, rate limits, storage path, owner, project, tags, blockers, and notes.
- Rotation cadence, expiration date, last verified date, and audit events for major vault actions.
- ISO-aligned implementation evidence for security, infrastructure, architecture, privacy, software quality, continuity, AI governance, policy, and human-centred design.
- Operational physics vectors for pressure, drag, resilience, exposure, momentum, gravity, and stability across the vault.

## Security Model

- The vault is encrypted client-side with Web Crypto AES-GCM.
- The encryption key is derived from the master password using PBKDF2-SHA-256.
- The master password is never stored.
- Encrypted vault data is stored in browser `localStorage`.
- Secret values are redacted by default in list and detail views.
- The app supports auto-lock, clipboard clear attempts, redacted inventory export, and audit logging.
- No backend, cookies, third-party scripts, or analytics are required.
- ISO standards evidence is stored inside the encrypted vault, and redacted exports remove evidence text by default.

Important: this is a lightweight developer vault, not a replacement for an enterprise password manager. A compromised browser, weak master password, malicious browser extension, or modified hosted source can still expose secrets.

## Run Locally

```powershell
npm run doctor
npm run check
npm run quality
npm run smoke:breaktest
npm run smoke:tooling
npm run smoke:security
npm run smoke:bottlenecks
npm run smoke:deadzones
npm run smoke:design
npm run smoke:playtest-index
npm run smoke:playtest
npm run smoke:core
npm run smoke:dashboard-panels
npm run smoke:dashboard
npm run smoke:domain
npm run smoke:policy
npm run smoke:provider
npm run smoke:standards
npm run smoke:state
npm run smoke:ui
npm run smoke:optimization
npm run smoke:workflow
npm run test:fast
npm run test:full
npm run serve
```

Then open:

```text
http://localhost:4173
```

Because the app uses browser crypto modules, serve it over `http://localhost` or HTTPS instead of opening `index.html` directly from the filesystem.

## Host On GitHub Pages

1. Create a new GitHub repository for this project.
2. Commit the files in this folder.
3. Push to the `main` branch.
4. In GitHub, enable Pages with GitHub Actions as the source.
5. The included `.github/workflows/pages.yml` workflow publishes the static app.

Do not commit exported vault files, `.env` files, service account JSON, PEM files, or raw key material. The `.gitignore` blocks common secret-bearing filenames.

## Recommended Workflow

1. Create the vault with a long unique master password.
2. Add entries as provider accounts, API keys, ad platforms, analytics tools, and application logins are created.
3. Use purpose, risk, environment, scopes, and rotation cadence fields to make each credential auditable later.
4. Export an encrypted vault backup and store it somewhere private.
5. Use redacted exports for planning, team discussions, or GitHub issues.
6. Use the `ISO standards` panel to record status, owner, due date, and evidence for the implementation controls.
7. Use `npm run verify` or `npm run test:full` before publishing changes; it runs tooling preparation, syntax, quality, breaktest prevention, tooling readiness, security smoke, bottleneck smoke, deadzone smoke, design smoke, play-test index smoke, play-test audit, core smoke, dashboard panels smoke, dashboard smoke, domain smoke, policy smoke, provider smoke, standards smoke, state smoke, UI smoke, optimization smoke, browser smoke, and lab checks.
8. Use `npm run smoke:workflow` or `npm run test:fast` when you only need the dependency/tooling/workflow gate: doctor, quality, breaktest prevention, tooling readiness, security, bottlenecks, deadzones, design, play-test index, play-test audit, and optimization smoke.

## Files

- `index.html` is the static app shell with a strict meta-delivered Content Security Policy.
- `src/app.js` manages vault UI, forms, filters, import/export, and audit events.
- `src/vaultCrypto.js` handles encryption, decryption, key derivation, and export downloads.
- `src/schema.js` defines entry types, categories, statuses, settings, and validation.
- `src/standards.js` defines ISO standard families, implementation controls, progress scoring, and redaction behavior.
- `src/core/audit.js` creates and redacts audit events.
- `src/core/storage.js` reads, writes, parses, and forgets encrypted vault payloads through a storage adapter.
- `src/core/vault.js` validates encrypted vault files and normalizes vault records.
- `src/domain/dashboard.js` builds vault statistics and operations-cockpit action recommendations.
- `src/domain/policies.js` evaluates local policy rules for production ownership, rotation, restrictions, verification, ad/analytics privacy notes, blockers, and unknown classifications.
- `src/domain/providers.js` defines starter templates for high-value developer providers across ads, analytics, AI, cloud, hosting, auth, email, payments, observability, and infrastructure.
- `src/domain/readiness.js` defines the shared credential readiness contract used by UI views and operational physics.
- `src/domain/toolingIntegrations.js` defines integration-readiness metadata for Google Cloud, n8n, Pipedream, Playwright, Cloudflare, Supabase, Codex, Antigravity, Cursor, VS Code, Notion, ClickUp, and adjacent tooling.
- `src/state/filters.js` provides pure search, quick-filter, and selected-entry resolution behavior.
- `src/ui/dashboardPanels.js` renders the operations cockpit, operational physics panel, and policy gate panel.
- `src/ui/html.js` provides escaped HTML rendering utilities, shared form controls, pills, links, status classes, and score buckets.
- `src/operationalPhysics.js` calculates vault pressure, drag, resilience, exposure, momentum, gravity, and stability.
- `src/sampleData.js` provides safe placeholder entries with no secrets.
- `scripts/doctor.mjs` verifies local preparation for Node, npm, browser smoke tests, CSP, Python serving, and GitHub deploy gates.
- `scripts/security-smoke.mjs` verifies CSP, privacy headers, no network/cookie storage paths, crypto settings, encrypted-storage boundaries, redaction, security docs, ISO gap docs, and verification wiring.
- `scripts/bottleneck-smoke.mjs` scans every project text/code file for line-count pressure, orphan modules, unwired scripts, dead-end markers, and browser side-effect hotspots.
- `scripts/deadzone-smoke.mjs` verifies command actions, quick filters, modal controls, hidden surfaces, pointer-event traps, and dead-end markers.
- `scripts/design-smoke.mjs` verifies reduced-motion support, visible focus states, styled filters, design tokens, and guided-remediation wiring.
- `scripts/breaktest-prevention-smoke.mjs` verifies the regression mesh itself: smoke script wiring, verify ordering, deploy gating, encrypted-storage assertions, lab recovery checks, and documented breaktest prevention rules.
- `scripts/tooling-readiness-smoke.mjs` verifies integration-readiness catalogs, editor tasks, Cursor rules, agent instructions, safe environment placeholders, and disabled-by-default connector posture.
- `scripts/playtest-audit.mjs` audits design, infrastructure, functionality, architecture, mechanics, tooling efficiency, tooling research, and implementation needs.
- `scripts/core-smoke.mjs` verifies audit redaction, vault creation, vault normalization, and encrypted-vault shape checks.
- `scripts/dashboard-panels-smoke.mjs` verifies pure cockpit, operational-physics, and policy-panel rendering.
- `scripts/dashboard-smoke.mjs` verifies vault statistics, command-center prioritization, policy totals, and physics model wiring.
- `scripts/domain-smoke.mjs` verifies readiness fixtures and the physics model without opening a browser.
- `scripts/policy-smoke.mjs` verifies policy rules and vault-level policy scoring.
- `scripts/provider-smoke.mjs` verifies the provider catalog, template-generated entries, readiness, and policy guardrails.
- `scripts/standards-smoke.mjs` verifies ISO control coverage, assurance scoring, phase progress, overdue controls, and standards redaction.
- `scripts/state-smoke.mjs` verifies search, filters, quick views, sorting, and selected-entry fallback behavior.
- `scripts/ui-smoke.mjs` verifies shared rendering helpers for escaping, form controls, links, status classes, and score buckets.
- `scripts/quality-report.mjs` checks architecture files, CSP posture, inline-handler/style drift, secret signatures, docs coverage, and module size pressure.
- `scripts/optimization-smoke.mjs` checks the next-stage plan, architecture seams, optimization pressure, and deterministic physics fixtures.
- `AGENTS.md`, `.env.example`, `.vscode/tasks.json`, `.vscode/extensions.json`, `.cursor/rules/api-key-vault-manager.mdc`, `SECURITY.md`, `docs/threat-model.md`, `docs/iso-standards-implementation.md`, `docs/iso-readiness-analysis.md`, `docs/operational-physics-and-tooling.md`, `docs/tooling-research.md`, `docs/dependency-and-platform-research.md`, `docs/tooling-connectivity-plan.md`, `docs/tooling-integration-readiness.md`, `docs/aesthetic-standards-and-trends-analysis.md`, `docs/breaktest-prevention.md`, `docs/next-stage-optimization-plan.md`, and `docs/project-outline-restructure-plan.md` describe the security posture, limits, standards mapping, implementation gaps, tooling model, dependency and platform research, tooling connectivity path, integration readiness, aesthetic direction, breaktest prevention workflow, and forward restructure plan.
