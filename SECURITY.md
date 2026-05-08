# Security Policy

## Supported Model

This app is a static, browser-only encrypted vault. It is safest when used on a trusted device, in a trusted browser, from a trusted copy of the source.

## What The App Protects Against

- Accidental publication of raw API keys in a GitHub repository.
- Casual inspection of browser storage without the master password.
- Unintentional sharing of secrets through redacted inventory exports.
- Losing track of credential purpose, scope, status, and rotation expectations.

## What The App Does Not Protect Against

- A compromised computer, browser, browser extension, or clipboard manager.
- A weak or reused master password.
- A malicious change to the hosted JavaScript source.
- Someone who can access the unlocked browser session.
- Secrets that have already been exposed in Git history, logs, screenshots, chat, or support tickets.

## Handling Real Secrets

- Keep exported vault files private.
- Do not commit `.vault.json`, `.env`, service-account JSON, PEM, P12, PFX, or raw key files.
- Rotate any credential that was ever pasted into an unsafe place.
- Use least-privilege scopes and provider-side restrictions such as allowed origins, allowed IPs, app restrictions, and billing limits.
- Store production secrets server-side when possible. Do not ship API secrets in frontend apps.

## Reporting Issues

If this app is hosted in a GitHub repository, use private disclosure or a private issue channel for security reports. Do not post real API keys, passwords, account IDs, or tokens in public issues.
