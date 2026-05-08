# Tooling Integration Readiness

## Objective

Prepare API Key Vault Manager for external platforms without weakening the current security model. The app remains static, encrypted in-browser, zero-dependency, and disconnected at runtime. Integrations are cataloged, documented, and smoke-tested before any live adapter is allowed.

## Required Platform Set

The readiness catalog now covers these requested platforms:

- `google-cloud`: production cloud runtime, IAM, Secret Manager, Cloud Run, storage, and managed services.
- `n8n`: workflow automation, webhooks, credentials, and handoff workflows.
- `pipedream`: event-driven workflows, HTTP triggers, connected accounts, and OAuth automation.
- `playwright`: future independent browser E2E, screenshots, traces, and accessibility smoke.
- `cloudflare`: Pages, Workers, DNS, R2, D1, KV, WAF, and edge deployment.
- `supabase`: optional Postgres/Auth/Storage/Realtime/Edge Functions backend target.
- `codex`: repo-aware implementation agent and local verification runner.
- `antigravity`: agent-first development workflow using the same repo instructions and smoke gates.
- `cursor`: AI editor rules, optional MCP planning, and local command loop.
- `vscode`: tasks, recommended extensions, and local smoke/lab execution.
- `notion`: planning, database handoff, documentation, and redacted report destinations.
- `clickup`: task planning, implementation tracking, status handoff, and project automation.

Adjacent readiness coverage includes GitHub Actions, Sentry, PostHog, Docker, OpenTofu/Terraform posture, and 1Password/Bitwarden handoff.

## Files Added

- `src/domain/toolingIntegrations.js` is the source of truth for readiness metadata, docs URLs, secret posture, setup checklist, local command, and disabled-by-default connection mode.
- `scripts/tooling-readiness-smoke.mjs` verifies the integration catalog, provider templates, editor config, agent instructions, secret-safe placeholders, and workflow wiring.
- `.env.example` provides placeholder-only names for optional local integrations.
- `.vscode/tasks.json` exposes doctor, check, tooling smoke, fast test, browser smoke, lab, full test, and serve tasks.
- `.vscode/extensions.json` recommends optional developer tooling.
- `.cursor/rules/api-key-vault-manager.mdc` gives Cursor the project safety and verification rules.
- `AGENTS.md` gives Codex, Antigravity, Cursor, and other coding agents a shared operating contract.

## Security Boundary

- No runtime connector is enabled by this readiness pass.
- `index.html` still requires `connect-src 'none'`.
- Real API keys, OAuth secrets, service-account JSON, webhook secrets, passwords, and private vault exports must not be committed.
- `.env.example` is placeholder-only; real `.env` files remain ignored.
- Provider dashboards and docs are launch references, not live API calls.
- Service role keys, cloud deployment tokens, and automation webhooks belong in provider secret stores or ignored local files.

## Adoption Order

1. Keep the current static GitHub Pages deployment as the baseline.
2. Use VS Code, Cursor, Codex, and Antigravity through repo instructions and local smoke gates.
3. Use Playwright only when the current browser smoke/lab harness needs screenshots, traces, or independent live-click coverage.
4. Add Cloudflare or Google Cloud deployment only after a release-boundary plan is accepted.
5. Add Supabase only after migrations and backend encryption boundaries exist.
6. Add n8n, Pipedream, Notion, and ClickUp adapters only as redacted workflow/report exporters before any secret-bearing sync.
7. Add observability or analytics only after privacy purpose, consent posture, CSP change, and redaction rules are documented.

## Tool-Specific Notes

- Google Cloud should use workload identity or Secret Manager references where possible.
- Cloudflare should use scoped API tokens, never global API keys.
- Supabase service role keys must never appear in client-side static code.
- n8n and Pipedream webhook URLs should be treated like secrets when they can trigger privileged workflows.
- Notion and ClickUp should receive redacted reports or task summaries before raw evidence is considered.
- Playwright traces and screenshots must not include real secrets.
- Codex, Antigravity, Cursor, and VS Code should run smoke gates rather than trusting generated code.

## Validation

Run:

```powershell
npm run smoke:tooling
npm run smoke:workflow
npm run test:full
```

`smoke:tooling` fails if a required platform disappears from the catalog, if editor/agent setup files are missing, if placeholder files look secret-bearing, if CSP is weakened, or if the new tooling gate is not part of the workflow.
