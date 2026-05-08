# Tooling Connectivity Plan

## Objective

Turn API Key Vault Manager into a local-first control plane that can organize, launch, audit, and eventually connect developer tooling without weakening the current encrypted, static-hostable security model.

Connectivity does not mean every service gets a live OAuth integration immediately. For this project, connectivity should advance in controlled tiers:

1. Know what tool exists, why it exists, who owns it, where it is configured, and what risk it creates.
2. Help the user open the right dashboard, docs, setup flow, billing page, analytics view, or policy page quickly.
3. Store credential and connection metadata in the encrypted vault.
4. Produce redacted reports, setup packets, and release evidence for GitHub, issues, audits, and team handoff.
5. Add optional live adapters only when the app has the right boundaries, permission model, tests, and revocation story.

## Expanded Tooling Readiness Targets

The integration catalog now explicitly prepares the project for Google Cloud, Cloudflare, Supabase, n8n, Pipedream, Playwright, Codex, Antigravity, Cursor, VS Code, Notion, and ClickUp while keeping runtime networking disabled. These targets are readiness records first: dashboards, docs, auth model, secret storage, owner metadata, smoke signals, and setup checklist. Live adapters should be added only after a specific proof gap, secret boundary, and smoke gate exist.

Adjacent tooling that should stay available in the planning layer: GitHub Actions, Sentry, PostHog, Docker, OpenTofu/Terraform posture, and 1Password/Bitwarden handoff.

## Non-Negotiable Constraints

- Keep the default mode static-hostable on GitHub Pages.
- Keep secrets, access tokens, service account JSON, evidence text, and private notes encrypted locally.
- Do not introduce network calls in the default app runtime.
- Do not add third-party scripts, analytics, or remote telemetry to the vault itself.
- Do not export raw secrets by default. Redacted inventory and evidence exports stay the safe sharing path.
- Treat live OAuth, API polling, webhook dispatch, and team sync as optional future modes, not baseline behavior.

## Connectivity Model

Every connected tool should be represented as a `connection` with explicit fields:

- `Provider`: Google Ads, Google Analytics, GitHub, Cloudflare, Netlify, Stripe, OpenAI, Slack, Notion, email, auth, hosting, observability, database, storage, AI, ads, analytics, or custom.
- `Connection type`: API key, OAuth client, service account, webhook, CLI token, dashboard login, browser-only account, SSH key, certificate, database URL, or environment variable.
- `Purpose`: why this connection exists and what workflow it supports.
- `Launch surfaces`: dashboard URL, docs URL, setup URL, billing URL, privacy URL, console URL, support URL, and status page URL.
- `Access scope`: scopes, allowed origins, allowed IPs, environments, rate limits, and data classes touched.
- `Ownership`: owner, project, team, business purpose, reviewer, and rotation approver.
- `Operational state`: active, setup, blocked, deprecated, needs verification, needs rotation, or ready for production.
- `Evidence`: ISO controls, privacy notes, policy findings, risk treatment, audit events, and last verification.
- `Automation readiness`: manual only, link launch, exportable artifact, CLI-assisted, OAuth-ready, API-ready, or disabled.

## Tiered Rollout

### Tier 0: Connectivity Inventory

Goal: make every important tool visible before building risky live integrations.

Implementation:

- Extend provider templates into a connection catalog with auth type, setup URLs, docs URLs, status URLs, privacy URLs, and common scopes.
- Add connection categories for ads, analytics, AI, cloud, hosting, auth, payments, email, storage, databases, observability, collaboration, CI/CD, and security.
- Add filters for `OAuth`, `Service account`, `Webhook`, `CLI token`, `Dashboard login`, `Production`, `Blocked`, and `Needs verification`.

Proof:

- Provider smoke verifies every catalog item has required URLs, category, auth type, and redaction guidance.
- Play-test index includes first-run setup for Google Ads, analytics, GitHub Pages, and at least one deployment provider.

### Tier 1: Launchpad Connectivity

Goal: reduce user friction without storing more power than necessary.

Implementation:

- Add a connection launchpad panel for selected entries.
- Show safe buttons for dashboard, docs, setup, billing, status, privacy, and support links.
- Add setup checklist prompts that tell the user what to paste into the vault after account creation.
- Add command-center actions that open the exact missing field, checklist, or standards control instead of only filtering.

Proof:

- Deadzone smoke verifies launchpad buttons resolve to real destinations.
- Browser lab opens a provider setup checklist without console errors or broken routes.
- Accessibility smoke verifies launchpad buttons have distinct labels and keyboard focus order.

### Tier 2: Local Artifact Connectivity

Goal: connect the vault to engineering workflows through files and reports, not remote calls.

Implementation:

- Add redacted provider inventory export.
- Add redacted `.env.example` generation that never includes live secrets.
- Add release readiness packet export for GitHub issues or pull requests.
- Add ISO evidence packet export with evidence text redacted by default.
- Add risk register and policy register exports.
- Add import validation for provider templates, redacted inventories, and encrypted vault backups.

Proof:

- Security smoke verifies exports do not include raw secrets, master passwords, plaintext evidence, or service account JSON.
- Standards smoke verifies Statement of Applicability and evidence exports preserve non-secret assurance fields.
- Browser lab imports a redacted inventory and rejects unsafe plaintext secret imports unless explicitly encrypted.

### Tier 3: Toolchain Automation

Goal: make project maintenance repeatable and observable.

Implementation:

- Add `npm run test:fast` as an alias for syntax, quality, security, bottleneck, deadzone, play-test index, product audit, and optimization gates.
- Add `npm run test:full` as an alias for full verification, browser smoke, and lab.
- Add GitHub Actions artifacts for smoke/lab summaries.
- Add optional generated reports under an ignored `reports/` folder.
- Add a connectivity smoke test that verifies package scripts, docs, provider catalog fields, export builders, and GitHub workflow wiring.

Proof:

- Doctor verifies all workflow scripts exist and remain wired.
- Quality report verifies connectivity docs and report output boundaries.
- GitHub Pages deploy remains gated by `npm run verify`.

### Tier 4: Optional Local Adapter Layer

Goal: prepare for live integrations without making the browser app unsafe.

Implementation:

- Define adapter contracts in docs before implementation:
  - `manual`: user opens link and pastes metadata.
  - `import`: user imports a file from a provider.
  - `export`: app generates a redacted or encrypted artifact.
  - `cli-assisted`: local script reads user-provided env vars outside the browser app.
  - `oauth`: future backend or extension mode handles OAuth safely.
  - `api`: future backend mode makes provider API requests.
- Keep adapters disabled by default.
- Require every adapter to declare scopes, data classes, token storage, revocation URL, audit events, redaction behavior, and test fixtures.
- Separate static-browser mode from any future backend, extension, or local-agent mode.

Proof:

- Connectivity smoke rejects adapters without scopes, revocation URL, redaction notes, and disabled-by-default posture.
- Security smoke continues to reject network APIs in the default browser runtime.
- Architecture docs identify backend or extension mode as separate from static GitHub Pages mode.

### Tier 5: Live Connector Mode

Goal: only add live connectivity when the project is mature enough to protect the user.

Implementation:

- Choose one narrow first connector, preferably GitHub release evidence or provider import, not broad write access.
- Implement a permission screen that shows scopes, storage behavior, expiry, revocation, and audit impact.
- Store tokens only inside the encrypted vault or in a separate local agent store.
- Add revoke, rotate, disconnect, and export-redacted-history flows.
- Add a strict network allowlist by connector.

Proof:

- Browser lab verifies connect, disconnect, revoke instructions, lock/unlock, and encrypted storage.
- Security smoke verifies no token is stored outside encrypted storage.
- Policy smoke flags stale, broad-scope, production, and no-expiration connector tokens.

## Priority Provider Groups

Start with providers that unlock the most developer value:

- Core platform: GitHub, GitHub Pages, GitHub Actions, GitHub secrets, GitHub OAuth apps.
- Hosting and edge: Netlify, Cloudflare, Vercel, Render, Railway, Fly.io.
- Ads and analytics: Google Ads, Google Analytics, Google Tag Manager, AdSense, Microsoft Advertising, Meta Ads, TikTok Ads.
- AI and model platforms: OpenAI, Anthropic, Google AI Studio, Hugging Face, Replicate, Cohere.
- Payments and commerce: Stripe, PayPal, Paddle, Lemon Squeezy.
- Auth and identity: Clerk, Auth0, Firebase Auth, Supabase Auth, Microsoft Entra.
- Data and storage: Supabase, Neon, PlanetScale, MongoDB Atlas, Firebase, AWS S3, Cloudflare R2.
- Communications: SendGrid, Mailgun, Postmark, Twilio, Slack, Discord.
- Observability: Sentry, PostHog, Logtail, Better Stack, Grafana Cloud.
- Security and compliance: 1Password, Bitwarden, Doppler, Infisical, Snyk, GitGuardian.

## Architecture Impact

Connectivity should be added through new seams, not more weight in `src/app.js`.

Recommended modules:

- `src/domain/connections.js`: connection model, categories, auth types, launch surfaces, and readiness scoring.
- `src/domain/connectivityPolicies.js`: connector-specific policy findings.
- `src/domain/reportBuilders.js`: redacted inventories, `.env.example`, release packets, risk registers, and ISO packets.
- `src/ui/connectionLaunchpad.js`: pure launchpad and checklist rendering.
- `src/state/connectionFilters.js`: pure connectivity filters and selected-connection fallback behavior.
- `scripts/connectivity-smoke.mjs`: deterministic checks for catalog shape, report redaction, workflow wiring, and safe adapter posture.

## Implementation Order

1. Add the connection data model and normalize existing provider templates into connection records.
2. Build the launchpad UI for dashboard, docs, setup, status, privacy, billing, and support links.
3. Add redacted exports for provider inventory, `.env.example`, release packet, policy register, risk register, and ISO evidence packet.
4. Add `scripts/connectivity-smoke.mjs` and wire it into `check`, `verify`, `smoke:workflow`, `doctor`, `quality`, `playtest-audit`, and `optimization-smoke`.
5. Add accessibility checks for launchpad navigation and keyboard-only setup.
6. Add optional local artifact import flows with validation and migration guards.
7. Define adapter contracts for future CLI-assisted, OAuth, and API modes.
8. Pick one narrow live connector only after static-mode connectivity is reliable.

## Validation Matrix

| Requirement | Proof Surface | Gate |
| --- | --- | --- |
| Default runtime stays local-only | source scan for network APIs and strict CSP | `npm run smoke:security` |
| Provider connections have useful launch surfaces | catalog fixture checks | `npm run smoke:connectivity` |
| Launchpad has no dead buttons | action destination checks and browser click flow | `npm run smoke:deadzones`, `npm run lab` |
| Redacted exports do not leak sensitive material | string scan and fixture export checks | `npm run smoke:security` |
| Connectivity does not bloat app orchestration | size and side-effect pressure scan | `npm run smoke:bottlenecks` |
| Future adapters are disabled by default | adapter contract checks | `npm run smoke:connectivity` |
| Accessibility does not regress | keyboard and label checks | future `npm run smoke:a11y` |
| GitHub deployment remains safe | workflow runs full verify before publish | `npm run doctor` |

## First Build Slice

The first implementation slice should be `Tier 0 + Tier 1`:

- Add `src/domain/connections.js`.
- Add a connection launchpad section to the selected credential view.
- Convert provider templates into richer connection templates with launch URLs.
- Add quick filters for auth type and setup state.
- Add `scripts/connectivity-smoke.mjs`.

This gives the user real productivity gains immediately while preserving the strongest part of the current product: static hosting, local encryption, no third-party runtime calls, and redacted sharing.
