# Play-Test Lab Plan

## Objective

Maximize development efficiency, user productivity, and outcome possibility by turning the lab into a decision engine. The lab should not only prove that the vault works; it should reveal which change creates the most leverage next.

Definitions of done:

- The fastest loop catches syntax, runtime, dead-zone, and security regressions in under one minute on a normal local machine.
- The full lab proves the user can create, edit, search, secure, recover, and govern credentials without plaintext leakage.
- The live play-test produces implementation decisions, not vague impressions.
- Every failed or awkward moment becomes a ranked backlog item with a proof surface.

Unacceptable regressions:

- Plaintext secrets, evidence, or master passwords in persistent storage.
- Any feature that requires external network access in the static local mode.
- Command-center actions that look clickable but do not change state or guide the user.
- UI growth that pushes `src/app.js`, `src/styles.css`, or `scripts/smoke-test.mjs` past split ceilings without extraction.

## Lab Tiers

### Tier 0: Fast Guard

Goal: catch obvious breakage before thinking.

Command:

```powershell
npm run check
npm run smoke:deadzones
npm run smoke:state
```

Pass criteria:

- No syntax errors.
- No unwired command actions, modal controls, hidden traps, or pointer-event dead zones.
- Search, quick filters, and selected-entry fallback still work.

Use this after small edits, CSS changes, event wiring changes, or renderer changes.

### Tier 1: Functional Lab

Goal: prove the core user journey.

Command:

```powershell
npm run lab
```

Pass criteria:

- Vault create/unlock works.
- Entry creation and edit flows work.
- Search/filter works.
- Settings persist.
- ISO evidence saves without plaintext evidence in storage.
- Wrong password is rejected and correct password restores the vault.
- No browser console/runtime errors.

Use this after entry form, storage, crypto, settings, ISO, or lock/unlock changes.

### Tier 2: Product Play-Test

Goal: determine whether the app helps a real builder move faster.

Command:

```powershell
npm run smoke:playtest-index
npm run smoke:playtest
```

Possibility selection:

- Use `docs/play-test-possibilities-index.md` to choose the mission that best matches the current code change.
- Prefer the highest-value indexed possibility when multiple missions apply.
- Do not add a feature until the matching possibility has a clear proof method and failure trigger.

Manual live missions:

- First credential: create a Google Ads or analytics credential from scratch and judge time-to-useful-entry.
- Repair mission: click the top cockpit warning and verify whether the app guides the user to the exact field or evidence needed.
- Governance mission: open ISO standards, add owner/status/evidence, and judge whether the next control is obvious.
- Recovery mission: lock, unlock, search, reveal, and copy a fake secret while watching for confusion or dead ends.
- Handoff mission: export redacted data and judge whether it is useful for sharing without leaking secrets.

Record:

- Time to complete each mission.
- Number of hesitations or unclear labels.
- Number of clicks that do not visibly advance the task.
- Missing fields, missing defaults, or missing guidance.
- Screens or panels that feel dense, unstyled, or redundant.

### Tier 3: Outcome Expansion Lab

Goal: test possibilities beyond the current happy path.

Scenarios:

- Scale: 25, 100, and 500 fake credentials with mixed providers, risks, statuses, tags, and policy issues.
- Governance: 20 ISO controls with mixed owner, evidence, due-date, and assurance states.
- Recovery: malformed imports, wrong passwords, missing fields, invalid URLs, and empty vaults.
- Productivity: template-created entries versus manual entries, measured by readiness score and time saved.
- Privacy: ad and analytics entries with missing privacy purpose, retention notes, or processor/controller notes.
- Accessibility: keyboard-only navigation, visible focus, unique accessible names, dialog close path, and readable empty states.
- Mobile: small viewport create/edit/search/settings/standards flows.

Outcome possibilities to evaluate:

- Credential vault: does it replace a spreadsheet for one developer?
- SaaS launch cockpit: does it tell a builder what blocks shipping?
- Ads and analytics readiness: does it help set up monetization safely?
- Governance pack: can it create evidence for policies, risk, ISO controls, and release readiness?
- Team handoff: can a redacted export explain the system without exposing secrets?

## Measurement Model

Use these scores after each lab:

- Confidence: how safe the app feels for real credential tracking.
- Speed: how fast a user reaches a useful completed entry.
- Guidance: how clearly the app tells the user the next repair.
- Coverage: how many SaaS/API/ad/analytics/provider needs are supported.
- Governance: how well standards, policies, risks, and audit evidence connect.
- Friction: how many clicks, labels, or panels slow the user down.

Recommended scoring:

```text
5 = strong enough to keep
4 = useful with minor polish
3 = workable but confusing
2 = blocks productive use
1 = broken or unsafe
```

Decision rule:

- Fix any security or data-loss issue immediately.
- Fix any repeated dead-zone or unclear command action before adding new screens.
- Improve any mission with a score below 4 before expanding feature scope.
- If two improvements compete, choose the one that improves both speed and governance.

## Evidence Artifacts

The lab should eventually produce:

- Console error summary.
- Screenshot set for locked, dashboard, entry modal, detail panel, standards modal, and exports.
- JSON lab report with pass/fail checks, timings, control counts, and open needs.
- Redacted sample export.
- Backlog recommendations ranked by impact and implementation size.

Artifact rules:

- Never store real secrets in artifacts.
- Use generated fake data only.
- Keep redacted exports as the default shareable evidence.
- Store future artifacts under an ignored `artifacts/` or `lab-reports/` folder.

## Implementation Roadmap

### Phase 0: Current Active Plan

The latest smoke and lab runs pass. The lab should now drive the next implementation slice instead of only confirming existing behavior.

Active priorities:

- Stabilize aesthetics first: reduced motion, styled filters, stronger focus states, and calmer cockpit hierarchy.
- Improve guidance next: command-center actions should route to exact repair destinations rather than only filtering.
- Add static connectivity next: connection catalog, launchpad links, setup checklists, and connectivity smoke without runtime network calls.
- Add migrations before durable new governance records, reports, or large import/export expansion.
- Add report/export builders after migrations.

Use these current proof commands:

```powershell
npm run test:fast
npm run smoke
npm run lab
```

### Phase 1: Make Current Lab More Efficient

- Keep `npm run smoke:workflow` as the fast workflow gate.
- Keep `npm run test:fast` as the short readable alias for the fast workflow gate.
- Keep `npm run lab` as the functional proof.
- Add mission names and timing output to `scripts/smoke-test.mjs`.
- Add explicit checks for command-center actions opening or focusing the relevant repair area.
- Add styled filter-control checks after the filter UI is improved.

### Phase 2: Split The Harness

- Extract static server utilities.
- Extract browser/CDP utilities.
- Extract smoke flow.
- Extract lab flow.
- Add scenario fixtures for empty vault, ad/analytics setup, production launch, ISO audit, and large vault.

This should happen before the browser harness grows much beyond the current split ceiling.

### Phase 3: Add Product Learning Reports

- Add `npm run lab:report` once artifacts are useful.
- Output mission timings, action counts, console issues, and ranked needs.
- Keep reports redacted and fake-data-only.
- Summarize the next three highest-leverage implementation moves.

### Phase 4: Adopt External Tools Only For Proof Gaps

- Keep app runtime zero-dependency unless a specific security or product proof gap justifies a change.
- Enable GitHub secret scanning push protection and CodeQL after the repository is hosted on GitHub.
- Add axe-core first if accessibility becomes the highest risk.
- Add Playwright runner first if screenshots, traces, visual regression, or CI reports become the highest risk.
- Add Node test-runner fixtures first, then Vitest when migrations, reports, policies, risks, and evidence records need larger fixture suites.
- Add Lighthouse CI after there is a stable hosted URL and performance budgets worth enforcing.

## Next Highest-Leverage Lab Improvements

1. Reduced-motion and focus hardening: protect the strong visual system with accessibility-safe motion and visible keyboard focus.
2. Styled filters: sidebar filters should match the cockpit visual system and remain accessible.
3. Guided remediation: cockpit actions should scroll, focus, open edit, or open standards evidence for the exact repair.
4. Connectivity launchpad: provider entries should expose dashboard, docs, setup, billing, status, privacy, and support destinations without live API calls.
5. Connectivity smoke: verify catalog fields, launch surfaces, redaction posture, and disabled-by-default adapter contracts.
6. Harness split: separate static server, browser client, smoke flow, and lab flow.
7. Scenario fixtures: add ad/analytics launch, ISO audit, and large-vault scenarios.
8. Lab reports: generate a concise fake-data-only report with timings, outcomes, and next actions.
