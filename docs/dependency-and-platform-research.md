# Dependency And Platform Research

Research date: 2026-05-07

## Decision

Do not add runtime dependencies right now.

The current project is strongest as a zero-dependency, static-hostable, local-encrypted vault. The dependency strategy should stay conservative: add tools only when they close a specific proof gap that the existing handwritten smoke, lab, security, ISO, bottleneck, deadzone, provider, policy, state, UI, and play-test gates cannot cover.

The next needed additions are not app runtime libraries. They are free or open-source development, security, accessibility, and CI tools that can run outside the browser app.

## Immediate Implementation Needs

These should be implemented before any broad live connector or dependency-heavy rewrite.

| Need | Recommended Tool Or Platform | Type | Why It Matters | Implementation Timing |
| --- | --- | --- | --- | --- |
| Secret leak prevention | GitHub secret scanning push protection and/or Gitleaks | GitHub platform + OSS scanner | This project manages credentials, so accidental secret commits are the highest external workflow risk. | Immediate when repository is on GitHub |
| Static code security | GitHub CodeQL default setup | GitHub platform | Adds JavaScript security scanning without changing app runtime. | Immediate when repository is on GitHub |
| Dependency drift control | Dependabot for GitHub Actions and npm when dependencies exist | GitHub platform | Keeps workflow actions and future dev dependencies updated. | Enable after first dependency or additional action is added |
| Accessibility proof | axe-core | Dev dependency | The current product audit already identifies accessibility play-testing as a need; axe-core gives rule-based WCAG scanning. | First npm dev dependency after browser harness split or launchpad UI grows |
| Browser artifacts | Playwright | Dev dependency | Current browser lab is strong but does not produce screenshots, traces, videos, or HTML reports. | Add when visual regression or richer CI artifacts are needed |
| Domain fixtures and coverage | Node test runner first, Vitest later | Built-in first, dev dependency later | Node has a built-in test runner; Vitest becomes useful when fixtures, watch mode, and coverage reports outgrow smoke scripts. | Start with `node:test`; add Vitest after migrations/report builders expand |
| Performance budgets | Lighthouse CI | Dev dependency or CI tool | Provides repeatable performance, accessibility, best-practices, and SEO budget artifacts. | Add after a stable hosted URL or release boundary exists |
| Supply-chain visibility | npm audit, OSV-Scanner, OpenSSF Scorecard, optional SBOM via Syft | CLI/CI tools | Useful once the project accepts third-party packages or publishes releases. | After dev dependencies or release artifacts are introduced |

## Tools To Add Now

No npm package needs to be installed immediately.

Near-term implementation should focus on configuration and project structure:

- Add GitHub secret scanning push protection after the project is pushed to GitHub.
- Add GitHub CodeQL default setup for JavaScript after the repository is created.
- Add Dependabot for GitHub Actions after workflow action versions are finalized.
- Add `test:fast` and `test:full` script aliases to clarify the local workflow.
- Add `scripts/connectivity-smoke.mjs` before implementing live connectors.
- Keep app runtime free of third-party scripts, analytics, CDN code, or telemetry.

## Tools To Add Next

### axe-core

Adopt first if the next work expands the connection launchpad, modals, forms, keyboard paths, or dashboard panels.

Use it as a dev-only accessibility check. Do not load axe-core in the production browser runtime.

Expected proof:

- Keyboard-only setup flow remains navigable.
- Buttons and quick filters have distinct accessible names.
- Modals expose appropriate labels and focus behavior.
- Color, landmark, and form-label issues are reported before release.

### Playwright

Adopt when the current custom browser harness needs:

- Screenshots.
- Trace artifacts.
- HTML reports.
- Cross-browser coverage.
- Sharding.
- Easier CI debugging.

Do not add Playwright before splitting `scripts/smoke-test.mjs` into static-server, browser-client, smoke-flow, and lab-flow modules. Otherwise the project will have two overlapping browser harnesses.

### Node Test Runner, Then Vitest

Use the built-in Node test runner first for pure domain modules:

- `src/domain/readiness.js`
- `src/domain/policies.js`
- `src/domain/providers.js`
- `src/domain/dashboard.js`
- `src/domain/connections.js`
- `src/domain/reportBuilders.js`
- `src/operationalPhysics.js`
- `src/standards.js`

Adopt Vitest later if coverage reports, watch mode, fixture organization, or test filtering become more important than preserving zero-dependency tooling.

### Lighthouse CI

Add after the app has either:

- A stable GitHub Pages URL.
- A dedicated `public/` or `dist/` release boundary.
- Performance and accessibility budgets worth enforcing.

Until then, the current smoke and lab flows give better product-specific signal.

## Tools Not Needed Yet

| Tool | Decision | Reason |
| --- | --- | --- |
| TypeScript | Defer | Useful later, but migration cost is high while the app is still pure ES modules and well covered by smoke tests. Prefer stronger domain seams first. |
| Prettier | Optional | Helpful for formatting consistency, but it does not close a current correctness or security proof gap. |
| ESLint | Defer but likely useful | Add when app/module count grows enough that static lint rules would catch real bugs beyond `node --check` and custom quality scans. |
| DOMPurify | Not needed now | The app does not intentionally render user-authored rich HTML; current escaped HTML helpers are the safer minimal surface. Reconsider if Markdown or rich text is introduced. |
| Ajv or Zod | Defer | Current schema normalization is local and explicit. Reconsider when import/export formats, migrations, or external adapter contracts become larger. |
| OWASP ZAP | Defer | Valuable for server/API surfaces, but the current app has no backend and no default runtime network path. Reconsider for live connector or backend mode. |
| Supabase | Not for default mode | Useful for a future team/backend mode, but it adds account, database, auth, and network complexity that conflicts with the current local-only vault. |
| Cloudflare Workers or Netlify Functions | Not for default mode | Good future backend/adapter options, but static GitHub Pages remains the right baseline. |
| Infisical, Bitwarden, KeePassXC | Interoperability, not dependency | These are useful external secret-management destinations or references. The vault should export/import metadata safely rather than depend on them. |

## Platform Recommendations

### GitHub

GitHub should remain the primary project platform:

- GitHub Pages for static hosting.
- GitHub Actions for verification before deploy.
- CodeQL default setup for code scanning.
- Secret scanning push protection for accidental credential leaks.
- Dependabot for future Actions and npm dependency updates.

This fits the current app because it improves the engineering perimeter without adding runtime code to the vault.

### Cloudflare

Use only if the project later needs a separate backend mode:

- Cloudflare Workers can serve static assets and Worker logic together.
- D1 can provide serverless SQLite-style storage for a future team or audit backend.
- This should be a separate mode, never a silent replacement for local-only encryption.

### Netlify

Use only if the project later needs static hosting plus simple serverless functions:

- Netlify Functions can provide API endpoints deployed with the site.
- This is useful for future connector callbacks, but not needed for the current static vault.

### Supabase

Use only for a future collaborative backend mode:

- Local development requires Docker and the Supabase CLI.
- Supabase is powerful for auth, Postgres, and team data, but it is too much infrastructure for the current default product.

### Infisical, Bitwarden, KeePassXC

Treat these as external secret-management ecosystems:

- Add export templates and setup notes later.
- Do not store their tokens outside the encrypted vault.
- Do not make them required for the static app.

## Implementation Order

1. Keep zero runtime dependencies.
2. Add `test:fast` and `test:full` aliases for workflow clarity.
3. Add `scripts/connectivity-smoke.mjs` before live connector work.
4. Push to GitHub and enable secret scanning push protection.
5. Enable GitHub CodeQL default setup.
6. Add Dependabot for GitHub Actions.
7. Split the current browser harness.
8. Add axe-core for accessibility smoke.
9. Add Playwright only when screenshots, traces, reports, or cross-browser testing become necessary.
10. Add Node test-runner fixtures for pure domain modules.
11. Add Vitest only if fixture/coverage scale demands it.
12. Add Lighthouse CI after a stable hosted URL and budget thresholds exist.
13. Add OSV-Scanner, OpenSSF Scorecard, and SBOM generation once dependencies or public release packaging justify supply-chain reporting.

## Validation Gates To Add

| Future Gate | Purpose |
| --- | --- |
| `npm run smoke:connectivity` | Verifies connection catalog, adapter contracts, launch URLs, redaction posture, and workflow wiring. |
| `npm run smoke:a11y` | Runs accessibility checks against the app shell, vault flow, launchpad, forms, modals, and keyboard paths. |
| `npm run test:domain` | Runs pure domain fixtures without a browser. |
| `npm run perf` | Runs Lighthouse CI or equivalent performance budgets once hosted. |
| `npm run supply-chain` | Runs dependency, secret, and SBOM checks once third-party packages exist. |

## Source Links

- Playwright CI: https://playwright.dev/docs/ci
- axe-core package and docs: https://www.npmjs.com/package/axe-core
- Vitest coverage: https://main.vitest.dev/guide/coverage
- Lighthouse CI getting started: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md
- ESLint getting started: https://eslint.org/docs/latest/use/getting-started
- Prettier install docs: https://prettier.io/docs/install.html
- Node.js test runner: https://nodejs.org/api/test.html
- GitHub CodeQL default setup: https://docs.github.com/en/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning
- GitHub secret scanning push protection: https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection
- GitHub Dependabot version updates: https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates
- Gitleaks: https://github.com/gitleaks/gitleaks
- OSV-Scanner GitHub Action: https://google.github.io/osv-scanner/github-action/
- OpenSSF Scorecard: https://openssf.org/scorecard/
- Syft SBOM GitHub Action: https://github.com/anchore/sbom-action
- Cloudflare Workers static assets: https://developers.cloudflare.com/workers/static-assets/
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Netlify Functions: https://docs.netlify.com/build/functions/overview/
- Supabase local development: https://supabase.com/docs/guides/local-development
- Infisical overview: https://infisical.com/docs
- Bitwarden open source: https://bitwarden.com/open-source/
- KeePassXC documentation: https://keepassxc.org/docs/
