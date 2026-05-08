# Tooling Research

## Current Decision

Keep the project zero-dependency and no-build for now. The current handwritten smoke, lab, security, ISO, bottleneck, domain, UI, and workflow scripts are fast, inspectable, and aligned with the static GitHub Pages security model.

The 2026-05-07 dependency and platform research refresh is tracked in `docs/dependency-and-platform-research.md`. Its main conclusion is that no runtime dependency is needed yet; the next valuable additions are development-only proof tools, GitHub security platform features, and optional future adapters.

The next tooling additions should only happen when they solve a specific proof gap:

- Add Playwright test runner when the browser lab needs screenshots, trace artifacts, sharding, or richer CI reports.
- Add axe-core when accessibility checks need rule-based WCAG scanning instead of static label and focus checks.
- Add Vitest when pure domain modules need coverage reports, fixture organization, watch mode, or test filtering beyond one-file smoke scripts.
- Add Lighthouse CI when performance, accessibility, best-practices, and static-hosting budgets need repeatable report artifacts.

## Research Notes

- Playwright CI documentation supports GitHub Actions workflows that install dependencies, install browsers, run tests, upload HTML reports, shard large suites, and optionally use containers for consistent screenshot or visual-regression environments.
- Deque documents axe-core as the accessibility rules engine with API documentation and integrations, making it a good candidate once the UI needs automated accessibility regression checks.
- Vitest coverage documentation supports `vitest run --coverage`, configurable include/exclude coverage rules, HTML/LCOV reporting, and concise agent-friendly terminal output.
- Lighthouse CI architecture separates local and CI commands such as healthcheck, collect, assert, and upload, which fits a future release-quality budget gate.

## Adoption Order

1. Keep current scripts while the app remains zero-dependency and small.
2. Use `npm run test:fast` for the fast workflow gate and `npm run test:full` for full verification.
3. Split `scripts/smoke-test.mjs` into reusable static-server, browser-client, smoke-flow, and lab-flow modules before adding a new runner.
4. Add GitHub secret scanning push protection and CodeQL default setup once the repository is hosted on GitHub.
5. Add axe-core first if accessibility becomes the next product risk.
6. Add Playwright runner first if visual regression, screenshots, traces, or CI reports become the next product risk.
7. Add Node test-runner fixtures first, then Vitest when migrations, reports, policies, risks, and evidence records need larger fixture suites.
8. Add Lighthouse CI after there is a stable hosted URL and performance budgets worth enforcing.
9. Add supply-chain tools such as OSV-Scanner, OpenSSF Scorecard, and SBOM generation after the project accepts third-party packages or release packaging.

## Source Links

- Playwright CI: https://playwright.dev/docs/ci
- Deque axe-core documentation: https://www.deque.com/axe/core-documentation/
- Vitest coverage: https://main.vitest.dev/guide/coverage
- Lighthouse CI architecture: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/architecture.md
- Dependency and platform research: docs/dependency-and-platform-research.md
