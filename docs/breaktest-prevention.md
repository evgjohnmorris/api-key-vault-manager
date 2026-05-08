# Breaktest Prevention

## Regression Mesh

Breaktest prevention is the guardrail layer above the individual smoke tests. Its job is to catch failure modes where the app still has useful tests, but the tests stop protecting the release because a script was orphaned, a workflow was reordered, a lab assertion was weakened, or deployment bypassed verification.

The project keeps this prevention layer local, deterministic, and zero dependency so it can run before every larger change and inside GitHub Pages deployment.

## Gate Inventory

- `npm run doctor` proves the local runtime, browser, static server path, CSP, and deploy gate are ready.
- `npm run check` proves every JavaScript module and test script is syntax-valid.
- `npm run quality` proves required files, CSP posture, inline-style and inline-handler drift, secret signatures, and documentation coverage.
- `npm run smoke:breaktest` proves the test mesh itself is wired, ordered, documented, and still asserting encryption and recovery behavior.
- `npm run smoke:security` proves CSP, exfiltration blockers, crypto posture, encrypted storage, redaction, and documented limits.
- `npm run smoke:bottlenecks` proves source modules and scripts are not orphaned and pressure points remain visible.
- `npm run smoke:deadzones` proves command routes, quick filters, modal controls, hidden surfaces, and pointer behavior are not dead ends.
- `npm run smoke:design` proves reduced motion, focus states, styled filters, and guided remediation stay intact.
- `npm run smoke:playtest-index` and `npm run smoke:playtest` prove product play-test coverage and implementation needs remain visible.
- `npm run smoke` proves the core browser flow with encrypted storage.
- `npm run lab` proves the deeper edit, filter, settings, lock/unlock, and encrypted mutation flows.

## Do-Not-Break Rules

- Do not add a smoke script without wiring it into `check`, `verify`, and a package script.
- Do not remove `npm run verify` from the GitHub Pages deployment workflow.
- Do not allow `verify` to skip browser smoke or lab.
- Do not weaken smoke/lab checks that prove secrets, evidence, and passwords stay out of plaintext storage.
- Do not add dependencies before documenting the proof gap they close.
- Do not hide failures by replacing failing gates with warnings in release paths.

## Failure Response

When `npm run smoke:breaktest` fails, treat it as a release-blocking workflow issue. Fix the wiring, ordering, or weakened assertion first, then rerun:

```powershell
npm run check
npm run smoke:breaktest
npm run smoke
npm run lab
```

If the failure came from a new product capability, add the missing smoke coverage before continuing feature work. If the failure came from planned restructure, update the prevention document and gate in the same change so the new structure remains observable.
