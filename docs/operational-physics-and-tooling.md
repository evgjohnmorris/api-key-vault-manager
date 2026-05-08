# Operational Physics And Tooling

This project now treats vault operations as a measurable system instead of a flat list of credentials. The physics model is not real-world mechanics; it is a compact way to describe forces that make a credential program easier or harder to control.

## Architecture Position

`src/operationalPhysics.js` is a pure domain module. It receives normalized vault entries, ISO standards progress, and audit events, then returns a deterministic posture model for the UI. Keeping the calculation outside `src/app.js` creates a seam for future unit tests, alternate dashboards, export reports, or server-side policy checks.

`src/core/audit.js` centralizes audit-event creation and sensitive metadata redaction. `src/core/vault.js` centralizes encrypted-vault shape validation and vault normalization. `src/core/storage.js` centralizes encrypted-vault storage parsing, writes, reads, and removal. These seams let future storage adapters reuse the same contracts.

`src/domain/readiness.js` is the shared readiness contract used by operational physics and UI rendering. This keeps score calculations, missing-field labels, and lifecycle checkpoints from drifting apart.

`src/domain/policies.js` provides the local policy gate. It turns unsafe credential states into visible release findings before the vault is used for production work.

`src/domain/providers.js` provides provider onboarding templates. It lets the app generate normalized starter entries for common developer services before a secret is pasted into the vault.

`src/domain/dashboard.js` combines standards progress, policy findings, operational physics, and entry readiness into vault statistics and cockpit actions.

`scripts/standards-smoke.mjs` gives ISO work a direct gate for control coverage, assurance scoring, phase progress, overdue controls, and redaction rather than relying only on browser lab coverage.

`scripts/security-smoke.mjs` gives security work a direct gate for CSP, privacy headers, no network/cookie paths in source, Web Crypto settings, encrypted-storage boundaries, redaction defaults, documented limits, ISO gap docs, and release verification wiring.

`scripts/playtest-audit.mjs` ties design, infrastructure, functionality, architecture, operational mechanics, tooling efficiency, and tooling research into one product play-test gate. It also prints explicit implementation needs so the next work is visible.

`src/state/filters.js` provides pure search, quick-filter, sorting, and selected-entry fallback behavior. This makes saved views and future report filters easier to add without changing the render loop.

`src/ui/dashboardPanels.js` provides pure cockpit, physics, and policy panel renderers. It consumes already-derived dashboard state and does not touch browser APIs.

`src/ui/html.js` provides escaped markup helpers and common form/view primitives. This gives the app a small UI safety layer before the larger renderer split.

The current dependency direction is:

```text
schema.js + standards.js + core/audit.js + core/storage.js + core/vault.js + domain/readiness.js + domain/policies.js + domain/providers.js + domain/dashboard.js + state/filters.js + vaultCrypto.js + operationalPhysics.js
  -> ui/html.js + ui/dashboardPanels.js + app.js
  -> index.html + styles.css
```

The next restructure should split `app.js` into view renderers, event handlers, persistence/session handling, and import/export workflows. The physics module is intentionally ready for that split.

## Force Vectors

- `Pressure` increases when entries are critical, blocked, stale, unsafe for rotation, or operationally incomplete.
- `Drag` increases when ISO controls lack evidence, owners, due dates, or assurance.
- `Resilience` increases when entries are complete and standards evidence is assured.
- `Exposure` increases when high-risk or critical credentials are production-facing or have unsafe no-expiration settings.
- `Momentum` increases with recent audit activity, entry readiness, and standards progress.
- `Stability` combines the positive and negative vectors into a single operating-state score.
- `Gravity` highlights heavy items that can pull the system into rework, incidents, or governance debt.

## Tooling Gate

`scripts/quality-report.mjs` adds a zero-dependency local quality gate. It checks required architecture files, CSP posture, inline-style and inline-handler drift, common secret signatures, npm verification wiring, documentation coverage, and size pressure on large modules.

Recommended local verification:

```powershell
npm run verify
```

This runs syntax checks, the quality report, the optimization smoke test, the headless browser smoke test, and the deeper lab test.

For dependency, tooling, and workflow readiness without the full browser/lab path:

```powershell
npm run smoke:workflow
```

This runs the tooling doctor, quality report, and optimization smoke as a fast workflow gate.

For explicit security and ISO implementation posture checks:

```powershell
npm run smoke:security
npm run smoke:standards
```

For product-level play-testing across design, infrastructure, functionality, architecture, mechanics, tooling efficiency, and tooling research:

```powershell
npm run smoke:playtest
```

For bottleneck and dead-end checks after a broad code read-through:

```powershell
npm run smoke:bottlenecks
```

This scans the project inventory for line-count pressure, orphan modules, unwired scripts, dead-end markers, and browser side-effect hotspots.

## Foreknowledge Notes

The app should stay static-hostable for GitHub Pages. That means new complexity should prefer pure modules, browser-native APIs, deterministic tests, and encrypted client-side storage. If the project later needs teams, sharing, or server-side policy enforcement, that should be a separate backend mode rather than weakening the current local-only security model.
