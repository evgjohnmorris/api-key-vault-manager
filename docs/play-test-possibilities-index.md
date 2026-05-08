# Play-Test Possibilities Index

## Purpose

This index turns broad play-test ideas into executable product experiments. Each possibility exists to answer one question: what next change would most improve user speed, safety, governance, or launch readiness?

Use this index after the fast guards pass and before choosing a new feature. A possibility is not ready to test unless it has a mission, outcome signal, proof method, failure trigger, and next implementation move.

## Selection Rules

- Run safety possibilities first when credentials, storage, imports, exports, or evidence handling changed.
- Run dead-zone and guidance possibilities before adding new screens.
- Run launch and monetization possibilities before expanding provider catalogs.
- Run scale and architecture possibilities before adding heavier UI panels.
- Run handoff and report possibilities before building export formats.

## Safety Anchors

- Plaintext secrets, evidence, and master passwords must never appear in persistent browser storage or shareable artifacts.
- The local-only static mode must preserve strict CSP, no runtime network send path, and no cookie/session storage dependency.
- Any export, handoff, report, screenshot, or lab artifact should prefer redacted fake data.
- A play-test possibility that touches secret material must include a proof method for encrypted storage or redacted output.

## Index

| ID | Possibility | Primary Outcome | Automation Level | Best Trigger |
| --- | --- | --- | --- | --- |
| PTX-001 | First credential success | Speed | Manual plus lab | New entry or onboarding changes |
| PTX-002 | Provider template acceleration | Productivity | Scripted domain smoke | Provider catalog changes |
| PTX-003 | Google Ads and analytics launch | Monetization | Manual plus future fixture | Ads, analytics, privacy, or launch work |
| PTX-004 | Cockpit remediation guidance | Guidance | Dead-zone smoke plus live click | Command-center changes |
| PTX-005 | ISO evidence completion | Governance | Standards smoke plus lab | Standards tracker changes |
| PTX-006 | Redacted handoff packet | Team handoff | Lab plus future report smoke | Export or sharing changes |
| PTX-007 | Wrong-password and recovery | Safety | Lab | Lock, unlock, import, or crypto changes |
| PTX-008 | Large vault operations | Scale | Future scenario fixture | Search, filters, rendering, or list changes |
| PTX-009 | Mobile credential workflow | Accessibility and reach | Manual plus future viewport lab | Layout or modal changes |
| PTX-010 | Keyboard-only secure workflow | Accessibility | Manual plus future axe/smoke | Focus, modal, or form changes |
| PTX-011 | Policy-gated production launch | Release confidence | Policy and dashboard smoke | Policy rules or release cockpit changes |
| PTX-012 | Privacy readiness for ads and analytics | Compliance | Policy smoke plus manual | Ad, analytics, data, or privacy changes |
| PTX-013 | Import/export resilience | Recovery | Future fixture | Import, export, schema, or migrations |
| PTX-014 | Standards-to-risk bridge | Governance | Future domain fixture | Risk register or operational physics work |
| PTX-015 | Visual trust and density | UX confidence | Manual plus screenshot future | Dashboard, filters, or standards UI changes |
| PTX-016 | Local-only static hosting safety | Infrastructure | Security and workflow smoke | CSP, hosting, deploy, or network changes |

## Possibilities

### PTX-001: First Credential Success

Mission: Create a fake but realistic developer credential from an empty vault.

Outcome signal: User reaches a useful entry with provider, purpose, environment, risk, secret source, URL, rotation, and notes in under 3 minutes.

Proof method: Run `npm run lab`, then perform one live create-entry pass using fake Google Ads or OpenAI-style data.

Failure trigger: The user hesitates on required fields, misses rotation/context, or cannot tell whether the credential is complete enough.

Next implementation move: Improve defaults, field grouping, helper text, and template entry points.

### PTX-002: Provider Template Acceleration

Mission: Compare creating a credential from a provider template versus manual entry.

Outcome signal: Template-created entries start at 80% or higher readiness with useful evidence prompts.

Proof method: Run `npm run smoke:provider` and inspect the template entry readiness and policy results.

Failure trigger: A template lacks category, risk, evidence prompts, docs URL, scopes, or policy-safe defaults.

Next implementation move: Add or revise provider templates and generated evidence prompts.

### PTX-003: Google Ads And Analytics Launch

Mission: Prepare fake Google Ads, Google Analytics, tag manager, and privacy-purpose entries for monetized app/post launch.

Outcome signal: The vault shows what is ready, what privacy evidence is missing, and what blocks launch.

Proof method: Live mission with fake entries plus policy and standards smoke.

Failure trigger: The app stores credentials but does not expose privacy, retention, billing, dashboard, or evidence needs.

Next implementation move: Add ad/analytics launch fixture, privacy prompts, and launch readiness panel.

### PTX-004: Cockpit Remediation Guidance

Mission: Click the top cockpit warning and follow the app to the exact repair.

Outcome signal: The action filters, scrolls, opens edit or standards, and focuses the field or control that fixes the issue.

Proof method: Run `npm run smoke:deadzones` and perform one live click on each visible command action.

Failure trigger: The click only filters or appears to do nothing without a clear next step.

Next implementation move: Add guided remediation intents for no-expiration, verification, metadata, policy, and standards actions.

### PTX-005: ISO Evidence Completion

Mission: Move one ISO control from not started to assured.

Outcome signal: Owner, status, due date, and evidence produce updated ready and assured metrics without plaintext evidence leakage.

Proof method: Run `npm run lab` and `npm run smoke:standards`.

Failure trigger: The next needed control is unclear, dense, or difficult to locate.

Next implementation move: Add standards filters, next-control recommendations, and evidence templates.

### PTX-006: Redacted Handoff Packet

Mission: Produce a shareable fake-data packet for a teammate or auditor without exposing secrets.

Outcome signal: Redacted export explains providers, risks, policies, standards status, and missing work.

Proof method: Run lab export checks and inspect a redacted fake export.

Failure trigger: The export hides too much to be useful or leaks secret/evidence/master-password material.

Next implementation move: Build first-class SoA, policy register, risk register, and audit packet exports.

### PTX-007: Wrong-Password And Recovery

Mission: Lock the vault, reject a wrong password, unlock correctly, and confirm the selected work is restored.

Outcome signal: User trusts the vault after a mistake and no plaintext data appears in browser storage.

Proof method: Run `npm run lab`.

Failure trigger: Error messages are unclear, unlock flow loses context, or storage contains plaintext.

Next implementation move: Improve recovery messaging, import validation, and migration-safe unlock paths.

### PTX-008: Large Vault Operations

Mission: Manage 25, 100, and 500 fake entries with mixed providers, tags, risks, statuses, and policies.

Outcome signal: Search, filters, selection, readiness, and cockpit stats remain fast and understandable.

Proof method: Future scenario fixture and performance timing report.

Failure trigger: Lists feel slow, filters confuse selection, or dashboard stats become noisy.

Next implementation move: Add large-vault fixture, list virtualization decision point, and stats grouping.

### PTX-009: Mobile Credential Workflow

Mission: Create, edit, search, view details, and open standards on a small viewport.

Outcome signal: Primary actions remain visible, forms are usable, and modals do not trap content.

Proof method: Manual viewport play-test, future browser viewport fixture.

Failure trigger: Important controls require awkward scrolling or overflow hides content.

Next implementation move: Improve responsive layout, sticky modal actions, and compact dashboard states.

### PTX-010: Keyboard-Only Secure Workflow

Mission: Create and manage a fake credential without using the mouse.

Outcome signal: Focus order is logical, controls have unique accessible names, dialogs close predictably, and reveal/copy are reachable.

Proof method: Manual keyboard pass, future axe-core or local accessibility smoke.

Failure trigger: Focus disappears, labels are duplicated, modals trap incorrectly, or keyboard users cannot complete the task.

Next implementation move: Add accessibility smoke, focus management, and keyboard navigation checks.

### PTX-011: Policy-Gated Production Launch

Mission: Prepare a fake production app credential set and verify launch blockers are obvious.

Outcome signal: Critical/high risks, missing owners, missing restrictions, privacy gaps, and blocked credentials are visible before launch.

Proof method: Run `npm run smoke:policy`, `npm run smoke:dashboard`, and a live launch mission.

Failure trigger: A risky production key looks acceptable or policy wording does not explain the fix.

Next implementation move: Strengthen policy rules, severity display, and remediation copy.

### PTX-012: Privacy Readiness For Ads And Analytics

Mission: Check whether ad and analytics entries carry purpose, privacy, retention, and data-processing context.

Outcome signal: The user knows what data is collected, why, where it goes, and what evidence is missing.

Proof method: Policy smoke plus manual ad/analytics launch play-test.

Failure trigger: Ad or analytics credentials can be marked ready without privacy context.

Next implementation move: Add privacy-specific fields, policy checks, and provider prompts.

### PTX-013: Import/Export Resilience

Mission: Import malformed, old, redacted, and encrypted fixture files without losing the current vault.

Outcome signal: Invalid imports fail safely, valid imports normalize, and future schema versions migrate predictably.

Proof method: Future import/export fixture smoke.

Failure trigger: Import errors are vague, destructive, or schema-dependent.

Next implementation move: Add versioned migrations, import dry-run, and import report UI.

### PTX-014: Standards-To-Risk Bridge

Mission: Convert standards gaps and operational physics pressure into actionable risk decisions.

Outcome signal: Risk records have owner, treatment, due date, status, linked entries, and linked controls.

Proof method: Future domain fixture for risk-register generation.

Failure trigger: Standards and risk remain separate dashboards without operational connection.

Next implementation move: Add risk register records and cross-reference checks.

### PTX-015: Visual Trust And Density

Mission: Judge whether the dashboard looks secure, understandable, and calm under real workload.

Outcome signal: Users can identify status, risk, next action, and safe controls without visual fatigue.

Proof method: Manual screenshot review across empty, normal, warning-heavy, and standards-heavy states.

Failure trigger: Native controls, dense panels, or repeated metrics weaken the trust feel.

Next implementation move: Style filters, add progressive disclosure, and simplify dense standards sections.

### PTX-016: Local-Only Static Hosting Safety

Mission: Prove the app remains safe to host as static files.

Outcome signal: CSP stays strict, no network send path exists, deploy runs verification, and secret-bearing files are ignored.

Proof method: Run `npm run smoke:security`, `npm run smoke:workflow`, and GitHub Pages workflow checks.

Failure trigger: Any new feature adds runtime network, cookies, session storage, unsafe CSP, or secret-bearing publish output.

Next implementation move: Add release-boundary scan and publish-only static asset directory if needed.

## Play-Test Selection Matrix

| If the next change touches... | Run these possibilities |
| --- | --- |
| Entry form or templates | PTX-001, PTX-002, PTX-004 |
| Ads, analytics, monetization | PTX-003, PTX-012, PTX-011 |
| Standards or ISO evidence | PTX-005, PTX-014, PTX-006 |
| Exports or sharing | PTX-006, PTX-016, PTX-013 |
| Lock, unlock, storage, crypto | PTX-007, PTX-013, PTX-016 |
| Dashboard or cockpit | PTX-004, PTX-011, PTX-015 |
| Filters, search, large lists | PTX-008, PTX-015, PTX-001 |
| Mobile or accessibility | PTX-009, PTX-010, PTX-015 |

## Current Highest-Value Tests

1. PTX-004 because cockpit actions already diagnose issues but still need stronger remediation guidance.
2. PTX-015 because native filter controls break the otherwise polished cockpit surface.
3. PTX-003 because ads and analytics launch readiness is a high-value use case for the user.
4. PTX-006 because redacted handoff exports turn the vault into a team/audit artifact.
5. PTX-013 because migrations and import resilience should exist before governance records expand.
