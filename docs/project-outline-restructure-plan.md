# Project Outline And Restructure Plan

## Executive Direction

API Key Vault Manager is currently a GitHub Pages-compatible, browser-only encrypted vault for API keys, logins, provider accounts, ISO evidence, and operational credential metadata.

The next engineering goal should not be "add more screens." The next goal should be to turn the app from a working prototype into a maintainable local-first governance product:

- Keep the no-backend, no-plaintext-secrets, strict-CSP posture.
- Split the growing single-page implementation into stable modules.
- Add explicit data versioning and migrations before the vault schema gets larger.
- Make ISO readiness, policy control, corrective action, and evidence handling first-class domains.
- Keep GitHub Pages hosting as the default, while designing seams that could later support a private backend or team sync without rewriting the app.

## Current Project Outline

### Runtime Shape

- `index.html`: static app shell, CSP, module entrypoint.
- `src/app.js`: state container, rendering, event binding, form handlers, vault persistence, filters, UX metrics, entry readiness, standards UI, and exports.
- `src/vaultCrypto.js`: Web Crypto encryption/decryption, PBKDF2 key derivation, base64 helpers, secret strength, JSON download.
- `src/schema.js`: credential entry options, defaults, normalization, validation, redaction.
- `src/standards.js`: ISO standard references, implementation controls, standards state, redaction, readiness and assurance scoring.
- `src/sampleData.js`: safe placeholder entries.
- `src/styles.css`: complete visual system and layout.
- `scripts/smoke-test.mjs`: local server, headless browser driver, smoke flow, lab flow, CDP helpers.
- `scripts/breaktest-prevention-smoke.mjs`: meta-regression guard for test wiring, verify ordering, deploy gating, encrypted-storage assertions, and lab recovery coverage.
- `docs/`: architecture, deployment, threat model, ISO standards, ISO readiness, and now this restructure plan.
- `.github/workflows/pages.yml`: static GitHub Pages deployment.

### Current Capabilities

- Create and unlock an encrypted vault.
- Add, edit, delete, reveal, and copy credential entries.
- Store rich metadata: provider, purpose, URLs, scopes, allowed origins/IPs, risk, environment, rotation, owner, project, tags, blockers, and notes.
- Filter and search credentials.
- Export encrypted vaults and redacted inventories.
- Track audit events.
- Track ISO-aligned controls with status, owner, due date, evidence, phase, priority, readiness, and assurance.
- Run `npm run check`, `npm run smoke`, and `npm run lab`.

## Critical Findings

### Strengths

- The core security posture is good for a static app: no backend, encrypted local storage, Web Crypto, strict CSP, redacted exports, and `.gitignore` secret guards.
- The lab test is unusually valuable because it checks encrypted storage and browser console/runtime errors.
- The ISO implementation is now more mature than a generic checklist because it separates status readiness from evidence-backed assurance.
- The app is deployable without a build tool, which reduces supply-chain risk.

### Pressure Points

- `src/app.js` is too large and too mixed. Rendering, state, persistence, validation orchestration, UX scoring, and domain workflows are all in one file.
- `scripts/smoke-test.mjs` mixes test scenarios with browser/CDP infrastructure. It will become harder to extend without accidental brittleness.
- There is no explicit vault schema version migration layer. This is the biggest future-risk item because the data model is already expanding.
- Standards controls are useful, but policy register, Statement of Applicability, corrective actions, management review, evidence links, and risk register are not yet first-class entities.
- The UI has grown into an operations cockpit, but it still lacks navigation architecture. Modals will become cramped if every future domain goes into one modal pattern.
- Redacted export exists, but export types are not yet modeled as a formal reporting layer.

## Forecast Assumptions

The restructure should assume these future needs are likely:

- More governance domains: policies, risks, corrective actions, evidence links, incidents, vendors, services, and Statement of Applicability.
- More exports: SoA, audit packet, policy register, risk register, service catalog, credential inventory, and redacted board report.
- Optional private backend later, but not required now.
- Larger vaults with hundreds or thousands of entries.
- Continued GitHub Pages hosting.
- Continued strict CSP without inline styles or third-party scripts.
- Need for test fixtures and deterministic data migrations.
- Need to keep secrets encrypted even if metadata becomes more complex.

## Target Architecture

### Proposed Folder Structure

```text
src/
  app/
    bootstrap.js
    state.js
    events.js
    render.js
  core/
    crypto.js
    storage.js
    migrations.js
    audit.js
    export.js
  domain/
    entries/
      entry.schema.js
      entry.validation.js
      entry.readiness.js
      entry.redaction.js
    standards/
      standards.catalog.js
      standards.controls.js
      standards.assurance.js
      standards.redaction.js
    policies/
      policy.schema.js
      policy.validation.js
    risks/
      risk.schema.js
      risk.scoring.js
    evidence/
      evidence.schema.js
      evidence.redaction.js
  ui/
    components/
      buttons.js
      fields.js
      pills.js
      meters.js
      modals.js
    views/
      locked.view.js
      vault.view.js
      entry-detail.view.js
      standards.view.js
      settings.view.js
      reports.view.js
  data/
    sampleData.js
styles/
  tokens.css
  layout.css
  components.css
  views.css
scripts/
  test/
    smoke.mjs
    lab.mjs
    cdp-client.mjs
    static-server.mjs
```

### Domain Boundaries

- `core` should know about encryption, storage, migrations, audit events, and exports.
- `domain` should know about business rules and redaction for entries, standards, policies, risks, and evidence.
- `ui` should render state and emit events, but should not decide security or compliance rules.
- `app` should wire everything together.
- `scripts/test` should reuse browser infrastructure across smoke, lab, and future regression tests.

## Data Model Plan

### Add Vault Schema Versioning

Current encrypted payloads should be normalized into a versioned model:

```js
{
  version: 2,
  createdAt,
  updatedAt,
  settings,
  entries,
  standards,
  policies,
  risks,
  evidence,
  correctiveActions,
  auditLog
}
```

Add:

- `CURRENT_VAULT_SCHEMA_VERSION`.
- `migrateVaultPayload(payload)`.
- One migration file per version jump.
- Tests that load v1 fixtures and verify v2 output.

### Add First-Class Future Records

- `policies`: title, owner, version, status, approval date, next review, linked controls, evidence links.
- `risks`: asset/service, threat, likelihood, impact, treatment, owner, review date, linked controls.
- `evidence`: title, type, private location, linked controls, linked entries, collection date, owner, redaction level.
- `correctiveActions`: issue, source, severity, owner, due date, status, closure evidence.
- `services`: app/service name, environment, owner, provider dependencies, RTO/RPO, support path.

## UX Restructure Plan

### Navigation Model

Move from one dense unlocked layout to a small set of workspace views:

- `Vault`: credential inventory, detail panel, readiness.
- `Standards`: ISO tracker, assurance gaps, phase view.
- `Policies`: document register and review status.
- `Risks`: risk register and treatment decisions.
- `Evidence`: evidence links and redaction posture.
- `Reports`: encrypted export, redacted export, SoA, audit packet.
- `Settings`: security settings, defaults, import/export.

### Interaction Principles

- Keep critical actions visible: lock, export encrypted, export redacted, new entry.
- Make "what needs attention" visible before raw tables.
- Separate "ready" from "assured" everywhere.
- Preserve fast keyboard/tab navigation.
- Avoid hidden destructive actions.
- Keep the locked screen simple and reassuring.

### UI Complexity That Is Worth Adding

- Dashboard cards that route to filtered views.
- Assurance gap queue.
- Timeline/audit view.
- Evidence-link chips on entries and controls.
- Report builder for SoA and audit packets.
- Guided setup wizard for first vault creation.

### UI Complexity To Avoid

- Drag-and-drop dashboards before the domain model stabilizes.
- Heavy charting libraries.
- Third-party UI frameworks unless the no-build static posture changes intentionally.
- Inline styles or dynamic script injection that weakens CSP.

## Security And Privacy Optimization

### Keep

- Web Crypto AES-GCM.
- PBKDF2-SHA-256 with high iterations.
- Master password never stored.
- Strict CSP.
- No third-party scripts.
- Redacted sharing/export path.
- Secret-pattern scans.

### Add

- Optional Argon2id only if a reviewed local dependency or WebAssembly strategy is accepted. Do not add casually.
- Vault backup reminder and recovery warnings.
- Export integrity hash.
- Key-rotation reminders based on entry metadata.
- Structured secret exposure checklist.
- Optional encrypted file import/export tests.

### Avoid

- Backend sync before local data migrations are robust.
- Storing secrets in query params, URLs, filenames, logs, console output, or audit metadata.
- Treating GitHub Pages as a secure secret store. It is only the app host.

## ISO And Governance Optimization

### Immediate Standards Upgrades

- Add Statement of Applicability export.
- Add per-control applicability, justification, and exclusion rationale.
- Add corrective-action workflow for missing evidence, overdue controls, and failed reviews.
- Add policy register.
- Add management-review summary.

### Future Standards Features

- Map credential entries to relevant controls.
- Map evidence records to controls and policies.
- Add risk/control traceability.
- Add audit packet export with redacted and private variants.
- Add control history, not just current status.

### Certification Boundary

The app should never claim certification. It can claim:

- ISO-aligned implementation tracker.
- Evidence organizer.
- Readiness support tool.
- Audit-preparation workspace.

It should not claim:

- Certified ISMS.
- Full ISO compliance.
- Complete Annex A coverage.
- Legal or audit approval.

## Performance Optimization

### Current Risk

Rendering uses full `innerHTML` replacement for most interactions. This is fine for small vaults, but it will become slow with hundreds of entries, many controls, and future evidence/risk records.

### Plan

- Keep full render for locked/unlocked top-level transitions.
- Introduce targeted render functions for list, detail, modal, and message areas.
- Cache derived metrics per render cycle.
- Debounce search input.
- Add simple pagination or virtualized sections if entries exceed 300.
- Avoid framework adoption until performance proves it is needed.

## Testing Optimization

### Split Test Harness

Current `scripts/smoke-test.mjs` should become:

- `scripts/test/static-server.mjs`.
- `scripts/test/cdp-client.mjs`.
- `scripts/test/flows/create-vault.mjs`.
- `scripts/test/flows/entry-crud.mjs`.
- `scripts/test/flows/standards.mjs`.
- `scripts/test/smoke.mjs`.
- `scripts/test/lab.mjs`.

### Add Test Types

- Migration fixture tests.
- Redaction tests.
- Standards assurance scoring tests.
- Export shape tests.
- CSP regression test that fails on inline styles.
- Accessibility smoke: labels, focusable controls, modal close/cancel, keyboard path.

## Phased Execution Plan

### Phase 1: Stabilize Before More Features

- Split `app.js` into state, render, events, handlers, and domain calculations.
- Split test harness infrastructure from test scenarios.
- Add schema version and migration framework.
- Add fixture-based tests for current v1 vault payloads.
- Keep UI and behavior identical during this phase.

Exit criteria:

- `npm run check`, `npm run smoke`, and `npm run lab` pass.
- No visual/behavior changes except internal maintainability.
- Existing encrypted vaults still open.

### Phase 2: Governance Domain Expansion

- Add policy register.
- Add risk register.
- Add evidence records.
- Add corrective actions.
- Add control history.
- Add SoA export.

Exit criteria:

- Redacted exports cover every new domain.
- Evidence fields are encrypted and never logged.
- SoA export can be generated from current vault state.

### Phase 3: UX Navigation Upgrade

- Add workspace navigation.
- Move standards, policies, risks, evidence, reports, settings into dedicated views.
- Add attention queues.
- Improve responsive/mobile layout for the expanded workspace.

Exit criteria:

- Users can answer "what needs attention next?" in under 10 seconds.
- Standards assurance gaps are visible without opening every control.
- Credential workflows remain fast.

### Phase 4: Reporting And Audit Packet

- Add report builder.
- Add SoA export.
- Add audit packet export.
- Add management review summary.
- Add redacted board summary.

Exit criteria:

- Reports can be produced without exposing raw secrets.
- Exported reports identify what is redacted.
- Audit packet references evidence locations without embedding secret material.

### Phase 5: Optional Backend Readiness

Do not build the backend yet. Prepare seams only:

- Storage adapter interface.
- Sync conflict model.
- User/team ownership model.
- Audit integrity model.
- Encryption boundary model.

Exit criteria:

- Local-only mode remains default.
- Backend design does not weaken client-side encryption.
- No backend-only dependency is required for GitHub Pages deployment.

## Specific Optimization Backlog

### High Priority

- Split `src/app.js`.
- Add migrations.
- Add SoA export.
- Split smoke/lab harness.
- Add standards scoring unit tests.
- Add CSP regression test for inline styles.

### Medium Priority

- Add policy register.
- Add risk register.
- Add evidence records.
- Add corrective actions.
- Add report builder.
- Add debounced search and derived-state caching.

### Low Priority

- Theme settings.
- Drag-and-drop dashboard arrangement.
- Optional encrypted file storage.
- Optional framework migration.
- Optional private backend.

## Recommended File Ownership After Restructure

- Security-critical code: `core/crypto`, `core/storage`, `core/migrations`, `domain/*/redaction`.
- Compliance-critical code: `domain/standards`, `domain/policies`, `domain/risks`, `domain/evidence`.
- UX code: `ui/views`, `ui/components`, `styles`.
- Test infrastructure: `scripts/test`.
- Public documentation: `README.md`, `SECURITY.md`, `docs/*`.

## Do-Not-Break Rules

- Do not weaken CSP to solve UI problems.
- Do not introduce inline styles.
- Do not store plaintext secrets outside encrypted payloads.
- Do not commit vault exports.
- Do not make certification claims.
- Do not add dependencies without a security reason.
- Do not remove the no-build GitHub Pages path unless intentionally replacing it.
- Do not ship a migration without fixture tests.
- Do not add, rename, or split smoke scripts without keeping `smoke:breaktest`, `check`, `verify`, and the deploy workflow aligned.

## Best Next Step

Start with Phase 1. It has the highest leverage and the lowest product risk. The operational physics work creates the first domain seam for that direction by moving cross-cutting posture calculations out of `src/app.js`.

The most important first pull should be:

1. Create `core/storage.js`, `core/audit.js`, and `core/migrations.js`.
2. Create `domain/readiness.js` and move the duplicate entry-readiness logic out of `app.js` and `operationalPhysics.js`.
3. Move vault normalization, persistence, audit creation, and migration logic out of `app.js`.
4. Create fixture tests for an existing v1 payload shape and physics vector outputs.
5. Keep UI behavior unchanged.
6. Run `npm run verify`.

After that, the project will be ready to add SoA, policies, risks, and evidence records without turning the app into a tangle.

## Current Architecture Improvement Checkpoint

Implemented now:

- `src/operationalPhysics.js` isolates system-force calculations for pressure, drag, resilience, exposure, momentum, gravity, and stability.
- The cockpit can display posture dynamics without embedding the calculations in render code.
- `scripts/quality-report.mjs` adds a no-dependency quality gate for CSP, inline style/handler drift, common secret signatures, required architecture files, documentation coverage, and size pressure.
- `npm run verify` chains syntax, quality, smoke, and lab checks for release confidence.

Next optimization target:

- Extract `getEntryReadiness` into a shared domain module so the UI and physics model use one readiness contract.
