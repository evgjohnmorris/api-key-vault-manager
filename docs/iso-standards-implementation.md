# ISO Standards Implementation Map

This project includes an ISO-aligned implementation tracker for practical software, SaaS, API-key, and infrastructure work. It is not a certification claim and does not reproduce paid ISO control text. It gives you an evidence structure that can support better engineering, governance, and future formal assessment.

## Standards Included

- `ISO/IEC 27001:2022`: information security management system requirements.
- `ISO/IEC 27002:2022`: information security control implementation guidance.
- `ISO/IEC 27005:2022` and `ISO 31000:2018`: risk management.
- `ISO/IEC 27017:2015` and `ISO/IEC 27018:2025`: cloud security and public-cloud PII protection.
- `ISO/IEC 27701:2025`: privacy information management.
- `ISO/IEC/IEEE 42010:2022`: architecture descriptions, viewpoints, and architecture decision evidence.
- `ISO/IEC/IEEE 12207:2017`: software lifecycle process structure.
- `ISO/IEC 25010:2023`: software and ICT product quality model.
- `ISO/IEC 27034-1:2011`: application security concepts and processes.
- `ISO/IEC 20000-1:2018`: service management system requirements.
- `ISO 22301:2019`: business continuity management.
- `ISO 9001:2015`: quality management.
- `ISO/IEC 42001:2023`: artificial intelligence management systems.
- `ISO 9241-210:2019`: human-centred design for interactive systems.

## Implementation Controls

The app tracks twenty practical implementation controls:

1. ISMS scope, roles, and asset boundaries.
2. Risk register and treatment decisions.
3. Core security and operating policies.
4. Account access and secret lifecycle.
5. Encryption and key-management rules.
6. Third-party provider review.
7. Cloud shared-responsibility controls.
8. PII, processing purpose, retention, and privacy responsibilities.
9. Application security lifecycle.
10. Architecture descriptions and decisions.
11. Quality requirements and acceptance evidence.
12. Service management, incidents, and changes.
13. Continuity and recovery expectations.
14. AI provider and model governance.
15. Human-centred design for security-critical flows.
16. Document control.
17. Logging, monitoring, and audit evidence.
18. Retention and disposal rules.
19. Protected repository and release workflow.
20. Internal audit and continual improvement.

Each control stores:

- Status.
- Owner.
- Due date.
- Evidence note.

The app reports two separate readiness concepts:

- `Ready`: the control status is `Implemented`, `Review ready`, `Accepted`, or `Not applicable`.
- `Assured`: the control is ready and has the minimum owner/evidence support needed for a useful audit trail.

The evidence is encrypted in the vault. Redacted exports replace evidence text with placeholders so you can share implementation posture without leaking operational detail.

## Recommended Policy Set

Start with these policy documents:

- Information Security Policy.
- Access Control and Credential Management Policy.
- API Key Rotation and Revocation Policy.
- Cloud and Provider Onboarding Policy.
- Secure Development and Release Policy.
- Incident Response Policy.
- Backup, Recovery, and Continuity Policy.
- Privacy and Data Retention Policy.
- AI Provider and Model Usage Policy.
- Document Control and Review Policy.

## Evidence Rules

- Keep evidence specific enough to prove the control exists.
- Do not paste raw secrets into evidence notes.
- Prefer links, filenames, dates, owners, command outputs, screenshots stored outside the repo, and short summaries.
- Keep production credential details separate from frontend source code.
- Rotate any key that has ever been exposed in a repo, browser console, screenshot, chat, or ticket.

## Current Implementation Gaps To Remember

- This is an ISO-aligned implementation aid, not a certified management system.
- It does not reproduce Annex A controls or paid ISO requirement text.
- Formal certification still needs a defined organization scope, documented statement of applicability, management review, internal audit records, corrective actions, and external audit evidence.
- Status alone is not enough. Treat controls as audit-ready only when the `Assured` metrics are healthy.
