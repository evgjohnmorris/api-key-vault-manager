# Threat Model

## Assets

- API keys and tokens.
- Account logins and service-account details.
- OAuth client secrets.
- Provider metadata such as account IDs, scopes, allowed origins, and dashboard URLs.
- Audit trail describing how credentials are handled.

## Primary Risks

- Raw keys committed to GitHub.
- Frontend exposure of production credentials.
- Weak master password.
- Browser compromise or malicious extension.
- Clipboard leakage after copying a secret.
- Lost master password or missing encrypted backup.
- Old exposed keys still active after migration.

## Controls In This App

- Client-side encryption before storage.
- No backend or network calls.
- Strict meta-delivered Content Security Policy. Host-level headers can add directives such as `frame-ancestors`.
- Master password not stored.
- Auto-lock timer.
- Copy and reveal audit events.
- Clipboard clear attempt after copy.
- Redacted export path for inventories.
- `.gitignore` patterns for common secret files.
- Required purpose and rotation settings.

## Operational Controls To Add Outside The App

- Rotate exposed or old credentials.
- Restrict API keys by IP, origin, app, service account, or scope.
- Separate production, staging, development, and personal credentials.
- Enable provider-side alerts and billing limits.
- Use a dedicated enterprise password manager for shared team production credentials.
- Review Git history before making any repository public.
