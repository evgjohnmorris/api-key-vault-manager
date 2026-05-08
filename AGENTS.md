# Agent Instructions

This repo is a static, client-side encrypted API key vault and developer operations cockpit.

These instructions are for Codex, Google Antigravity, Cursor, VS Code agent features, and other coding agents working in this repository.

## Safety Rules

- Do not store plaintext secrets in source, docs, logs, screenshots, traces, `.env.example`, or committed config.
- Do not paste real API keys, OAuth client secrets, service-account JSON, webhook secrets, passwords, or encrypted vault exports into agent context.
- Keep the runtime static by default: no backend, no cookies, no third-party scripts, strict CSP, and `connect-src 'none'`.
- Add live connectors only after a specific adapter design, secret boundary, smoke gate, and user approval.
- Preserve GitHub Pages hosting unless the user explicitly switches deployment target.

## Verification

- Use `npm run test:fast` for normal implementation loops.
- Use `npm run smoke:tooling` after changes involving Google Cloud, n8n, Pipedream, Playwright, Cloudflare, Supabase, Codex, Antigravity, Cursor, VS Code, Notion, ClickUp, or adjacent tooling.
- Use `npm run smoke`, then `npm run lab`, after user-facing behavior changes.
- Use `npm run test:full` before release, deploy, security, workflow, or encryption changes.

## Editing Preferences

- Keep the project zero-dependency unless a documented proof gap requires a dev-only tool.
- Prefer small deterministic smoke scripts over broad framework adoption.
- Keep docs and package scripts aligned whenever a new gate is added.
- Redacted exports are safe for planning; raw secrets and evidence stay encrypted.
