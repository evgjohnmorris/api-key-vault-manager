# Next Stage Optimization Plan

## Objective

Evolve API Key Vault Manager from a local encrypted credential list into a static-hostable developer operations control plane. The next version should manage credentials, provider onboarding, standards evidence, risk decisions, policy readiness, and release confidence without compromising the current local-only encryption model.

## Planning Update: 2026-05-07

The current verified baseline is stronger than the original plan assumed:

- Browser smoke passes for app shell, vault create/unlock, entry creation, encrypted storage, secret reveal, ISO evidence storage, and console/runtime health.
- Lab passes for edit flow, search/filter, settings persistence, wrong-password rejection, correct unlock recovery, and encrypted storage after mutations.
- `npm run test:fast` and `npm run test:full` now provide clear fast/full workflow aliases.
- Dependency research confirms no runtime dependency should be added yet; the next useful tools are GitHub security features and development-only proof tools.
- Tooling connectivity planning defines a safe path for connection inventory, launchpad links, redacted artifacts, and future optional adapters without adding default runtime network calls.
- Aesthetic analysis confirms the current visual direction is distinctive and trustworthy, but the next UI work should reduce density, style filters, add reduced-motion support, and improve guided remediation.
- 2026 aesthetic research refresh confirms the next UI slice should prioritize expressive-but-restrained depth, progressive cockpit disclosure, AI/tool transparency, command/search ergonomics, and accessibility-forward visual quality.
- Breaktest prevention now guards the regression mesh itself by checking smoke script wiring, release ordering, deploy verification, encrypted-storage assertions, lab recovery checks, and operator documentation.
- Completed design stabilization remains part of the plan contract: reduced-motion support, styled filters, guided remediation, and design/contrast smoke coverage must stay enforced before new screens are added.

Updated critical path:

1. Harden the current interface before adding new persistent records: reduced motion, styled filters, clearer focus, and contrast/design-token checks.
2. Upgrade command-center actions from filter-only diagnostics into guided remediation that opens, scrolls, or focuses the exact repair target.
3. Add a static connection catalog and launchpad using pure domain/UI seams, still with no runtime network calls.
4. Add versioned vault migrations before adding durable new record families such as risks, evidence records, policy registers, or report-builder state.
5. Add redacted report/export builders after migrations so SoA, provider inventory, risk register, policy register, and audit packets can evolve safely.
6. Split the browser harness before adding scenario-heavy labs, screenshots, accessibility scanning, or Playwright.

## Reanalysis Summary

Current strengths:

- `src/vaultCrypto.js` isolates Web Crypto, export download, and secret-strength utility behavior.
- `src/schema.js` owns entry constants, normalization, validation, and redaction.
- `src/standards.js` owns ISO families, controls, assurance, progress, and standards redaction.
- `src/core/audit.js` owns audit event creation, metadata redaction, and audit-log prepending.
- `src/core/storage.js` owns encrypted-vault parsing and browser storage adapter reads/writes/removal.
- `src/core/vault.js` owns encrypted-vault shape validation, vault creation, and vault normalization.
- `src/domain/dashboard.js` owns vault statistics and operations-cockpit action prioritization.
- `src/domain/policies.js` owns the local release policy gate for production ownership, rotation, restrictions, verification, ad/analytics privacy notes, blockers, and unknown classifications.
- `src/domain/providers.js` owns the starter provider catalog and turns high-value provider templates into normalized vault entries.
- `src/domain/connections.js` owns local-only connection launchpad records, catalog matching, required-field gaps, and adapter-disabled posture.
- `src/domain/readiness.js` owns the shared credential readiness contract for UI views, filters, lifecycle steps, and operational physics.
- `src/domain/reports.js` owns redacted inventory export construction so future SoA, audit packet, policy register, and risk register reports have a safe report-domain seam.
- `src/state/filters.js` owns pure search, quick-filter, sort, and selected-entry fallback behavior.
- `src/state/formPayloads.js` owns entry, settings, and standards form-to-domain payload construction.
- `src/state/session.js` owns initial session shape and unlocked-session reset behavior.
- `src/ui/dashboardPanels.js` owns pure operations cockpit, operational physics, and policy gate panel rendering.
- `src/ui/events.js` owns DOM event binding for vault controls, modals, filters, command actions, and template entry creation.
- `src/ui/html.js` owns shared escaped markup helpers, form controls, pill rendering, status classes, link rendering, date formatting, and score buckets.
- `src/ui/vaultViews.js` owns entry list, detail, modal, standards, template, quick-view, and audit-log rendering.
- `src/operationalPhysics.js` provides a pure posture model for pressure, drag, resilience, exposure, momentum, gravity, and stability.
- `scripts/doctor.mjs` verifies local preparation for Node, npm, smoke-test browser support, strict CSP, Python serving, zero dependency install, and GitHub deploy gates.
- `scripts/security-smoke.mjs` verifies security implementation posture directly: CSP, privacy headers, no source network/cookie paths, Web Crypto settings, encrypted-storage boundaries, audit/redaction defaults, documented limits, ISO gap docs, and verification wiring.
- `scripts/bottleneck-smoke.mjs` scans the project inventory for bottleneck ceilings, orphan modules, unwired scripts, dead-end markers, and browser side-effect hotspots.
- `scripts/playtest-audit.mjs` audits product quality across design, infrastructure, functionality, architecture, operational mechanics, tooling efficiency, tooling research, and implementation needs.
- `scripts/smoke-test.mjs` verifies the browser flow against real Web Crypto in a temporary profile.
- `scripts/quality-report.mjs` verifies CSP, no inline style/handler drift, no common secret signatures, required architecture files, and documentation coverage.
- `scripts/standards-smoke.mjs` verifies ISO control coverage, assurance scoring, phase buckets, overdue controls, and standards redaction without opening a browser.
- `scripts/deadzone-smoke.mjs` verifies command actions, quick filters, modal controls, hidden surfaces, pointer-event traps, and dead-end markers.
- `scripts/playtest-index-smoke.mjs` verifies the indexed play-test possibilities and keeps product experiments wired into the workflow.
- `scripts/breaktest-prevention-smoke.mjs` verifies that the prevention mesh itself cannot silently drift: every smoke script is in verify, every script is syntax-checked, deploy still runs verify, and browser/lab assertions still protect encrypted storage and recovery.
- `scripts/tooling-readiness-smoke.mjs` verifies that Google Cloud, n8n, Pipedream, Playwright, Cloudflare, Supabase, Codex, Antigravity, Cursor, VS Code, Notion, ClickUp, and adjacent tooling stay cataloged, documented, disabled by default, and wired into the workflow.
- `docs/dependency-and-platform-research.md` records the current no-runtime-dependency decision and staged adoption order for GitHub security features, axe-core, Playwright, Node test runner, Vitest, Lighthouse CI, and supply-chain tools.
- `docs/tooling-connectivity-plan.md` defines the safe connectivity rollout from local inventory to launchpad, redacted artifacts, optional adapters, and future live connector mode.
- `docs/aesthetic-standards-and-trends-analysis.md` defines the current design direction and the next aesthetic standards for hierarchy, color, typography, layout, motion, accessibility, and trend fit.
- `npm run smoke:workflow` provides the fast dependency/tooling/workflow gate by chaining doctor, quality, breaktest prevention, tooling readiness, security, bottleneck, deadzone, design, play-test index, play-test audit, and optimization smoke.
- `npm run test:fast` aliases the fast workflow gate, and `npm run test:full` aliases the full verification path.
- `.github/workflows/pages.yml` now runs `npm run verify` before publishing the static app to GitHub Pages.

Current constraints:

- `src/app.js` is no longer the main render/event bottleneck. It remains the flow orchestrator for authentication, persistence, imports, command routing, encryption, and vault mutations.
- Entry readiness, audit creation, vault normalization, encrypted-vault storage, dashboard scoring, dashboard panel rendering, policy scoring, provider templates, filters, form payloads, session reset, report export construction, event binding, vault views, and shared HTML utilities are now contracts. The next extraction pressure is versioned migrations and connection records.
- GitHub Pages deployment currently uploads the whole repository path, including docs and scripts. That is acceptable for a public static project, but a dedicated publish directory would tighten the release boundary.
- The test harness is strong for end-to-end behavior and now has focused form/session/report smoke coverage, but there are not yet migration fixtures or deeper accessibility labs.
- The current aesthetic is strong but dense. Cockpit panels still compete for equal attention even though filters, focus, and reduced motion are now stabilized.
- Command-center actions now open and focus common entry repairs, but ISO-control deep links and connection-launchpad actions still need richer destinations.
- Connectivity is implemented as a local-only launchpad. The next connectivity risk is live adapter design, which should remain disabled until report exports, accessibility coverage, and explicit backend boundaries are stronger.

## Product Direction

Target product shape:

- Credential vault: encrypted entries, login/API metadata, rotation, scopes, verification, and audit history.
- Provider onboarding: templates for Google, analytics, ad platforms, AI APIs, hosting, email, auth, storage, payments, and observability providers.
- Policy gate: local rules that make unsafe shipping states visible before credentials are used in production.
- Evidence graph: link credentials, provider accounts, standards controls, policies, risks, architecture decisions, and release checks.
- Policy engine: classify entries against local requirements such as no production key without owner, no high-risk no-expiration key, no ad/analytics platform without privacy purpose.
- Risk register: convert operational physics signals into risk records, decisions, owners, due dates, and treatment states.
- Release cockpit: one place to see what blocks shipping, what is safe to share redacted, and what needs evidence before public deployment.
- Optional future backend mode: team sync, shared evidence, approval workflows, and audit integrity, without weakening local encrypted-vault mode.

## Architecture Phases

### Phase 1: Contract Extraction

Goal: reduce duplicated logic and make domain behavior testable without the browser.

Implementation:

- Keep `src/domain/readiness.js` as the single source for entry readiness checkpoints.
- Import readiness from both `src/app.js` and `src/operationalPhysics.js`.
- Keep `src/core/audit.js` as the single source for audit event creation and metadata sanitization.
- Keep `src/core/vault.js` as the single source for vault normalization and import/export shape checks.

Proof:

- Add unit-style fixture tests for readiness, audit metadata redaction, vault normalization, and operational physics.
- Keep `npm run smoke:core`, `npm run smoke:domain`, `npm run smoke`, `npm run lab`, and `npm run smoke:optimization` passing.
- Keep `npm run doctor` passing so dependency/tooling prerequisites are explicit before refactors.

### Phase 2: State And View Separation

Goal: make UI growth possible without making render logic brittle.

Implementation:

- Add low-risk visual hardening first: reduced motion, styled filters, stronger focus states, and clearer compact cockpit hierarchy.
- Split `src/app.js` into `ui/renderers.js`, `ui/events.js`, `ui/forms.js`, `state/session.js`, and `state/filters.js`.
- Keep `src/state/filters.js` as the filtering and selection state seam.
- Keep `src/ui/html.js` as the base view utility layer instead of duplicating escaping and form control rendering.
- Keep the current no-build ES module model.
- Use event delegation for high-frequency list/filter controls to reduce repeated event wiring after every render.

Proof:

- Browser smoke still creates, edits, filters, reveals, standards-updates, locks, and unlocks a vault.
- Optimization smoke reports lower `app.js` size and fewer direct browser side-effect calls in the app orchestrator.
- Deadzone smoke verifies styled filters and guided command actions do not create dead zones.
- Product play-test verifies `PTX-004` cockpit remediation and `PTX-015` visual trust/density.

### Phase 3: Provider And Policy System

Goal: become useful before keys exist, not only after keys are created.

Implementation:

- Keep `src/domain/providers.js` as the source for provider templates across analytics, ads, AI, cloud, hosting, auth, email, payments, monitoring, and infrastructure.
- Add `src/domain/connections.js` as the connection catalog for auth type, launch surfaces, setup URLs, status URLs, privacy URLs, billing URLs, and common scopes.
- Add a launchpad UI for dashboard, docs, setup, billing, status, privacy, support, and evidence prompts.
- Add local policy rules that inspect entries and standards state.
- Add evidence prompts generated from provider category, risk level, environment, and ISO control mapping.

Proof:

- Smoke fixture creates one provider template entry and verifies generated policy warnings without storing real secrets.
- Connectivity smoke verifies every catalog item has useful launch surfaces and disabled-by-default adapter posture.
- Browser lab opens a provider setup checklist without broken routes or console errors.
- Redacted exports include policy status without raw evidence or secrets.

### Phase 4: Evidence Graph And Reports

Goal: connect credentials to the wider engineering system.

Implementation:

- Add versioned vault payload migrations before introducing durable new report, policy, risk, or evidence records.
- Add records for policies, risks, evidence, architecture decisions, release checks, and corrective actions.
- Add redacted report builders for Statement of Applicability, provider inventory, risk treatment, and release readiness.
- Keep raw evidence encrypted and redacted by default.

Proof:

- Redacted export smoke verifies no plaintext secret, no plaintext evidence, and no master password.
- Domain tests verify record references do not point to missing entries or controls.

### Phase 5: Release Boundary Optimization

Goal: make GitHub hosting more deliberate.

Implementation:

- Add a `public/` or generated `dist/` release boundary only if the no-build path becomes too loose.
- Update GitHub Pages to publish only intended static files.
- Add release smoke that verifies CSP, asset references, docs links, and no secret-like strings in published assets.

Proof:

- `npm run verify` passes locally.
- GitHub Pages workflow runs verification before deploy.

## Optimization Smoke Contract

The optimization smoke test should stay fast and deterministic. It should verify:

- Required architecture seams exist.
- The plan document is present and names the future control-plane direction.
- Operational physics is deterministic with a frozen clock.
- Strict CSP and no inline handler/style posture remain intact.
- `src/app.js` remains below an emergency size ceiling while reporting pressure to split it.
- The all-in verification command includes syntax, quality, smoke, lab, and optimization smoke.

The bottleneck smoke test should stay close to the full-code read-through. It should verify:

- All project text/code files are readable and counted.
- `src/app.js`, `src/styles.css`, and `scripts/smoke-test.mjs` remain below split ceilings.
- No source module is orphaned and no smoke/tool script is unwired.
- No explicit `TODO`, `FIXME`, `HACK`, or `XXX` marker is left in source or scripts.
- Browser side-effect hotspots are measured every run.

The security smoke test should stay fast enough for workflow smoke. It should verify:

- Strict CSP, no runtime network send path, no cookies, and no session storage in source.
- Web Crypto posture remains AES-GCM, PBKDF2-SHA-256, 256-bit keys, 600000 or higher iterations, random salt, random IV, and non-extractable derived keys.
- Persistent storage remains behind encrypted-vault shape checks.
- Copy/reveal actions stay auditable and redacted exports remain the default sharing path.
- ISO implementation gaps and next implementation needs stay documented so dead ends are visible before feature work.

The product play-test audit should stay broad but not brittle. It should verify:

- Design language, responsive behavior, interaction states, semantic shell, and no inline-style drift.
- Static-hosted infrastructure, release gates, secret-file guards, and local prep commands.
- Functionality coverage through lab flow, provider onboarding, policy checks, and ISO checks.
- Architecture seams, pure contracts, known bottlenecks, and documented future boundaries.
- Operational mechanics through cockpit actions, policy pressure, and physics vectors.
- Tooling efficiency and staged tooling research without adding dependencies before a proof gap exists.
- Aesthetic direction through visual hierarchy, styled controls, reduced density, reduced-motion support, and accessibility-readiness checks.
- Connectivity readiness through a catalog and launchpad before any live connector or default runtime network path is introduced.

The breaktest prevention smoke test should stay meta-level and release-blocking. It should verify:

- Every `smoke:*` script except the aggregate workflow shortcut participates in `npm run verify`.
- Every `.mjs` script participates in `npm run check`.
- GitHub Pages deployment runs `npm run verify` before artifact upload.
- Browser smoke still asserts encrypted storage and plaintext-secret prevention.
- Lab still asserts edit, search/filter, settings, wrong-password, correct-unlock, and encrypted mutation recovery.
- Security, bottleneck, deadzone, design, and play-test gates still contain their core regression assertions.
- README and the breaktest prevention document stay aligned with the current workflow.

The tooling readiness smoke test should stay local-first and adapter-safe. It should verify:

- All required external platforms are present in `src/domain/toolingIntegrations.js`.
- Provider templates exist for the requested platforms.
- `.env.example` is placeholder-only and `.gitignore` protects real local environment files.
- VS Code tasks, Cursor rules, and AGENTS.md keep developer agents aligned.
- Runtime CSP still blocks default network calls.
- Every readiness expansion remains wired into `check`, `smoke:workflow`, and `verify`.

## Next Concrete Move

The app-orchestration split, migration seam, local-only connection launchpad, breaktest prevention mesh, and tooling readiness catalog are now implemented. Next, strengthen outcome artifacts and live-use confidence:

1. Build first-class redacted report exports for provider inventory, ISO Statement of Applicability, audit packet, policy register, and risk register.
2. Add an accessibility play-test gate for keyboard-only flow, focus order, target size, and contrast-sensitive surfaces.
3. Split the browser harness into static server, CDP client, smoke flow, and lab flow before adding screenshot or accessibility automation.
4. Only after those gates exist, choose one live adapter target and keep it disabled-by-default behind explicit user activation.

Do not add live connector network calls while the static local-only security model is the default.
