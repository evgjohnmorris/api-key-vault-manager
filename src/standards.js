export const STANDARD_STATUSES = [
  "Not started",
  "Planned",
  "Implemented",
  "Needs evidence",
  "Review ready",
  "Accepted",
  "Not applicable"
];

export const STANDARD_PHASES = [
  "Plan",
  "Do",
  "Check",
  "Act"
];

export const ISO_STANDARDS = [
  {
    id: "iso-27001",
    name: "ISO/IEC 27001:2022",
    domain: "Information security",
    purpose: "Information Security Management System requirements for governance, risk, controls, audit, and continual improvement.",
    url: "https://www.iso.org/standard/27001"
  },
  {
    id: "iso-27002",
    name: "ISO/IEC 27002:2022",
    domain: "Information security controls",
    purpose: "Implementation guidance for information security controls across organizational, people, physical, and technological themes.",
    url: "https://www.iso.org/standard/75652.html"
  },
  {
    id: "iso-27005",
    name: "ISO/IEC 27005:2022",
    domain: "Security risk",
    purpose: "Guidance for managing information security risks in support of an ISO/IEC 27001 ISMS.",
    url: "https://www.iso.org/standard/80585.html"
  },
  {
    id: "iso-31000",
    name: "ISO 31000:2018",
    domain: "Enterprise risk",
    purpose: "Organization-wide risk management principles and guidelines.",
    url: "https://www.iso.org/standard/65694.html"
  },
  {
    id: "iso-27017",
    name: "ISO/IEC 27017:2015",
    domain: "Cloud security",
    purpose: "Cloud-service information security guidance based on ISO/IEC 27002. ISO lists this edition as current, with a replacement final draft in process.",
    url: "https://www.iso.org/standard/43757.html"
  },
  {
    id: "iso-27018",
    name: "ISO/IEC 27018:2025",
    domain: "Cloud privacy",
    purpose: "Guidance for protecting PII in public cloud services acting as PII processors.",
    url: "https://www.iso.org/standard/27018"
  },
  {
    id: "iso-27701",
    name: "ISO/IEC 27701:2025",
    domain: "Privacy management",
    purpose: "Privacy Information Management System requirements and guidance.",
    url: "https://www.iso.org/standard/85819.html"
  },
  {
    id: "iso-42010",
    name: "ISO/IEC/IEEE 42010:2022",
    domain: "Architecture",
    purpose: "Architecture description structure, viewpoints, model kinds, and architecture decision evidence.",
    url: "https://www.iso.org/standard/74393.html"
  },
  {
    id: "iso-12207",
    name: "ISO/IEC/IEEE 12207:2017",
    domain: "Software lifecycle",
    purpose: "Software lifecycle processes for acquisition, supply, development, operation, maintenance, and disposal.",
    url: "https://www.iso.org/standard/63712.html"
  },
  {
    id: "iso-25010",
    name: "ISO/IEC 25010:2023",
    domain: "Software quality",
    purpose: "Product quality model for specifying, measuring, and evaluating ICT and software products.",
    url: "https://www.iso.org/standard/78176.html"
  },
  {
    id: "iso-27034",
    name: "ISO/IEC 27034-1:2011",
    domain: "Application security",
    purpose: "Application security concepts and processes for in-house, acquired, or outsourced applications.",
    url: "https://www.iso.org/standard/44378.html"
  },
  {
    id: "iso-20000-1",
    name: "ISO/IEC 20000-1:2018",
    domain: "Service management",
    purpose: "Service management system requirements for planning, design, transition, delivery, and improvement of services.",
    url: "https://www.iso.org/standard/70636.html"
  },
  {
    id: "iso-22301",
    name: "ISO 22301:2019",
    domain: "Business continuity",
    purpose: "Business continuity management system requirements for disruption readiness and recovery.",
    url: "https://www.iso.org/standard/75106.html"
  },
  {
    id: "iso-9001",
    name: "ISO 9001:2015",
    domain: "Quality management",
    purpose: "Quality management system requirements for consistent processes and continual improvement.",
    url: "https://www.iso.org/standard/62085.html"
  },
  {
    id: "iso-42001",
    name: "ISO/IEC 42001:2023",
    domain: "AI governance",
    purpose: "Artificial Intelligence Management System requirements for responsible AI development, provision, and use.",
    url: "https://www.iso.org/standard/42001"
  },
  {
    id: "iso-9241-210",
    name: "ISO 9241-210:2019",
    domain: "Human-centred design",
    purpose: "Human-centred design principles and lifecycle activities for interactive systems.",
    url: "https://www.iso.org/standard/77520.html"
  }
];

export const STANDARD_CONTROLS = [
  {
    id: "GOV-ISMS-01",
    domain: "Security governance",
    phase: "Plan",
    priority: "High",
    title: "Define ISMS scope, roles, and asset boundaries",
    standards: ["ISO/IEC 27001:2022", "ISO/IEC 27002:2022"],
    implementation: "Document what systems, repos, vaults, credentials, providers, users, and workflows are in scope. Assign accountable owners for secrets and provider accounts.",
    evidenceExamples: "Scope statement, asset inventory, owner list, credential register, repository boundary note."
  },
  {
    id: "RISK-REG-02",
    domain: "Risk management",
    phase: "Plan",
    priority: "High",
    title: "Maintain risk register and treatment decisions",
    standards: ["ISO/IEC 27005:2022", "ISO 31000:2018", "ISO/IEC 27001:2022"],
    implementation: "Track risks, likelihood, impact, treatment choice, owner, and review date for credentials, infrastructure, cloud services, and applications.",
    evidenceExamples: "Risk register export, treatment plan, accepted-risk approvals, review notes."
  },
  {
    id: "POL-SET-03",
    domain: "Policies",
    phase: "Plan",
    priority: "High",
    title: "Create core security and operating policies",
    standards: ["ISO/IEC 27001:2022", "ISO/IEC 27002:2022", "ISO 9001:2015"],
    implementation: "Define practical policies for access control, acceptable use, key rotation, incident response, provider onboarding, backups, and change control.",
    evidenceExamples: "Policy documents, approval dates, policy owners, review schedule."
  },
  {
    id: "IAM-SEC-04",
    domain: "Identity and access",
    phase: "Do",
    priority: "High",
    title: "Control account access and secret lifecycle",
    standards: ["ISO/IEC 27002:2022", "ISO/IEC 27001:2022"],
    implementation: "Use least privilege, MFA, separate production credentials, documented scopes, rotation plans, revocation steps, and restricted origins/IPs where available.",
    evidenceExamples: "Access review, MFA proof, scope notes, rotation log, disabled account record."
  },
  {
    id: "CRY-KEY-05",
    domain: "Cryptography",
    phase: "Do",
    priority: "Critical",
    title: "Protect secrets with encryption and key-management rules",
    standards: ["ISO/IEC 27002:2022", "ISO/IEC 27034-1:2011"],
    implementation: "Keep raw secrets out of Git, logs, client bundles, screenshots, and tickets. Encrypt vault exports and document where production secrets are allowed to live.",
    evidenceExamples: ".gitignore, secret scan output, encrypted vault export, server-side env policy."
  },
  {
    id: "SUP-TPR-06",
    domain: "Supplier and provider risk",
    phase: "Plan",
    priority: "Medium",
    title: "Review third-party providers before use",
    standards: ["ISO/IEC 27001:2022", "ISO/IEC 27002:2022", "ISO/IEC 20000-1:2018"],
    implementation: "Record provider purpose, data handled, billing risk, security settings, terms status, support path, and offboarding process.",
    evidenceExamples: "Provider entry, data-processing note, terms approval, offboarding checklist."
  },
  {
    id: "CLD-SEC-07",
    domain: "Cloud infrastructure",
    phase: "Do",
    priority: "High",
    title: "Document cloud shared-responsibility controls",
    standards: ["ISO/IEC 27017:2015", "ISO/IEC 27018:2025", "ISO/IEC 27002:2022"],
    implementation: "Separate provider duties from your duties for hosting, storage, logs, PII processing, backups, identity, encryption, and incident response.",
    evidenceExamples: "Cloud responsibility matrix, backup settings, provider configuration screenshots, PII processor notes."
  },
  {
    id: "PRI-PIMS-08",
    domain: "Privacy",
    phase: "Plan",
    priority: "High",
    title: "Track PII, processing purpose, retention, and privacy responsibilities",
    standards: ["ISO/IEC 27701:2025", "ISO/IEC 27018:2025"],
    implementation: "Map personal data in analytics, ad platforms, auth systems, forms, logs, and AI workflows. Record purpose, retention, processor/controller role, and deletion path.",
    evidenceExamples: "Data map, retention policy, privacy notices, deletion procedure, processor list."
  },
  {
    id: "APP-SEC-09",
    domain: "Application security",
    phase: "Do",
    priority: "High",
    title: "Build application security into the software lifecycle",
    standards: ["ISO/IEC 27034-1:2011", "ISO/IEC/IEEE 12207:2017", "ISO/IEC 27002:2022"],
    implementation: "Require threat modeling, secret handling, secure defaults, dependency review, test evidence, and release checks before shipping application changes.",
    evidenceExamples: "Threat model, secure coding checklist, dependency scan, test report, release approval."
  },
  {
    id: "ARC-DESC-10",
    domain: "Architecture",
    phase: "Plan",
    priority: "Medium",
    title: "Maintain architecture descriptions and decisions",
    standards: ["ISO/IEC/IEEE 42010:2022", "ISO/IEC 25010:2023"],
    implementation: "Record system context, stakeholders, viewpoints, data flows, trust boundaries, key decisions, alternatives, and constraints.",
    evidenceExamples: "Architecture diagram, ADRs, data-flow diagram, trust-boundary notes, decision log."
  },
  {
    id: "QLT-REQ-11",
    domain: "Quality and acceptance",
    phase: "Check",
    priority: "Medium",
    title: "Define quality requirements and acceptance evidence",
    standards: ["ISO/IEC 25010:2023", "ISO 9001:2015"],
    implementation: "Translate quality needs into measurable acceptance criteria for security, reliability, usability, maintainability, portability, and performance.",
    evidenceExamples: "Acceptance checklist, test matrix, quality goals, bug triage, verification output."
  },
  {
    id: "OPS-SMS-12",
    domain: "Service operations",
    phase: "Do",
    priority: "Medium",
    title: "Track service management, incidents, and changes",
    standards: ["ISO/IEC 20000-1:2018", "ISO/IEC 27002:2022"],
    implementation: "Maintain service catalog, change records, incident records, service objectives, support contacts, and operational review notes.",
    evidenceExamples: "Service catalog, change log, incident report, runbook, support escalation path."
  },
  {
    id: "BCM-REC-13",
    domain: "Continuity",
    phase: "Plan",
    priority: "High",
    title: "Define continuity and recovery expectations",
    standards: ["ISO 22301:2019", "ISO/IEC 27005:2022"],
    implementation: "Set backup, restore, RTO/RPO, dependency, credential-recovery, and provider-outage procedures for critical applications and accounts.",
    evidenceExamples: "Backup test, recovery checklist, dependency map, continuity plan, incident exercise notes."
  },
  {
    id: "AI-AIMS-14",
    domain: "AI governance",
    phase: "Plan",
    priority: "Medium",
    title: "Govern AI provider and model usage",
    standards: ["ISO/IEC 42001:2023", "ISO/IEC 27001:2022", "ISO/IEC 27701:2025"],
    implementation: "Record model purpose, data restrictions, human review expectations, output risk, prompt/data retention, and provider terms for AI-enabled workflows.",
    evidenceExamples: "AI use register, model card link, data restriction note, evaluation results, human review procedure."
  },
  {
    id: "UX-HCD-15",
    domain: "Design",
    phase: "Check",
    priority: "Medium",
    title: "Use human-centred design for security-critical flows",
    standards: ["ISO 9241-210:2019", "ISO/IEC 25010:2023"],
    implementation: "Validate that secret handling, warnings, setup instructions, recovery paths, and destructive actions are understandable, accessible, and hard to misuse.",
    evidenceExamples: "Usability notes, accessibility checks, warning copy review, test observations."
  },
  {
    id: "DOC-CTL-16",
    domain: "Document control",
    phase: "Do",
    priority: "Medium",
    title: "Control important policy and architecture documents",
    standards: ["ISO 9001:2015", "ISO/IEC 27001:2022", "ISO/IEC/IEEE 12207:2017"],
    implementation: "Track document owner, version, approval status, next review date, and change history for policies, architecture, runbooks, and security evidence.",
    evidenceExamples: "Versioned docs, approval record, review schedule, change history."
  },
  {
    id: "MON-LOG-17",
    domain: "Monitoring and audit",
    phase: "Check",
    priority: "High",
    title: "Preserve logs, alerts, and audit events",
    standards: ["ISO/IEC 27002:2022", "ISO/IEC 20000-1:2018"],
    implementation: "Define what logs matter, where they live, who reviews alerts, what gets retained, and how incidents are reconstructed.",
    evidenceExamples: "Logging matrix, alert routing, incident timeline, audit export, retention note."
  },
  {
    id: "RET-DISP-18",
    domain: "Retention and disposal",
    phase: "Act",
    priority: "Medium",
    title: "Set retention and disposal rules for secrets and data",
    standards: ["ISO/IEC 27001:2022", "ISO/IEC 27701:2025", "ISO/IEC 27018:2025"],
    implementation: "Document how long keys, backups, analytics data, ad data, logs, and vault exports are retained, and how they are deleted or rotated.",
    evidenceExamples: "Retention schedule, deletion proof, rotation log, backup expiry rule."
  },
  {
    id: "DEV-CI-19",
    domain: "Engineering workflow",
    phase: "Do",
    priority: "High",
    title: "Protect the repository and release workflow",
    standards: ["ISO/IEC/IEEE 12207:2017", "ISO/IEC 27034-1:2011", "ISO/IEC 25010:2023"],
    implementation: "Use reviews, smoke tests, secret scanning, dependency checks, release notes, and rollback plans before hosting or publishing code.",
    evidenceExamples: "CI run, smoke test output, review notes, release tag, rollback plan."
  },
  {
    id: "AUD-CI-20",
    domain: "Internal audit",
    phase: "Act",
    priority: "High",
    title: "Run internal reviews and continual improvement",
    standards: ["ISO/IEC 27001:2022", "ISO 9001:2015", "ISO/IEC 20000-1:2018"],
    implementation: "Schedule periodic reviews of controls, evidence, incidents, provider status, open risks, exceptions, and improvement actions.",
    evidenceExamples: "Internal audit checklist, corrective action log, management review notes, improvement backlog."
  }
];

export function createStandardsState(overrides = {}) {
  const controls = {};
  const now = new Date().toISOString();

  STANDARD_CONTROLS.forEach((control) => {
    controls[control.id] = {
      status: "Not started",
      evidence: "",
      owner: "",
      dueDate: "",
      updatedAt: "",
      ...(overrides.controls?.[control.id] || {})
    };
  });

  return {
    updatedAt: overrides.updatedAt || now,
    notes: overrides.notes || "",
    controls
  };
}

export function normalizeStandardsState(value = {}) {
  return createStandardsState(value || {});
}

export function redactStandardsState(standards) {
  const normalized = normalizeStandardsState(standards);
  const controls = {};

  Object.entries(normalized.controls).forEach(([id, control]) => {
    controls[id] = {
      ...control,
      evidence: control.evidence ? "[redacted evidence]" : ""
    };
  });

  return {
    ...normalized,
    notes: normalized.notes ? "[redacted notes]" : "",
    controls
  };
}

export function getStandardsProgress(standards) {
  const normalized = normalizeStandardsState(standards);
  const total = STANDARD_CONTROLS.length;
  const counts = STANDARD_STATUSES.reduce((accumulator, status) => {
    accumulator[status] = 0;
    return accumulator;
  }, {});

  Object.values(normalized.controls).forEach((control) => {
    counts[control.status] = (counts[control.status] || 0) + 1;
  });

  const acceptedStatuses = ["Implemented", "Review ready", "Accepted", "Not applicable"];
  const controlAssurance = STANDARD_CONTROLS.map((control) => getControlAssurance(control, normalized.controls[control.id]));
  const ready = controlAssurance.filter((item) => item.ready).length;
  const evidenceBacked = controlAssurance.filter((item) => item.evidenceBacked).length;
  const missingEvidence = controlAssurance.filter((item) => item.missingEvidence).length;
  const missingOwner = controlAssurance.filter((item) => item.missingOwner).length;
  const missingDueDate = controlAssurance.filter((item) => item.missingDueDate).length;
  const overdue = controlAssurance.filter((item) => item.overdue).length;
  const percent = total ? Math.round((ready / total) * 100) : 0;
  const assurancePercent = total ? Math.round((evidenceBacked / total) * 100) : 0;
  const phaseCounts = STANDARD_PHASES.reduce((accumulator, phase) => {
    const phaseControls = controlAssurance.filter((item) => item.phase === phase);
    const phaseReady = phaseControls.filter((item) => item.ready).length;
    accumulator[phase] = {
      ready: phaseReady,
      total: phaseControls.length,
      percent: phaseControls.length ? Math.round((phaseReady / phaseControls.length) * 100) : 0
    };
    return accumulator;
  }, {});

  return {
    total,
    ready,
    percent,
    assurancePercent,
    evidenceBacked,
    missingEvidence,
    missingOwner,
    missingDueDate,
    overdue,
    phaseCounts,
    counts
  };
}

export function getControlAssurance(control, record) {
  const safeRecord = record || {};
  const readyStatuses = ["Implemented", "Review ready", "Accepted", "Not applicable"];
  const evidenceBackedStatuses = ["Implemented", "Review ready", "Accepted"];
  const isReadyStatus = readyStatuses.includes(safeRecord.status);
  const requiresEvidence = evidenceBackedStatuses.includes(safeRecord.status);
  const hasEvidence = Boolean(String(safeRecord.evidence || "").trim());
  const hasOwner = Boolean(String(safeRecord.owner || "").trim());
  const hasDueDate = Boolean(String(safeRecord.dueDate || "").trim());
  const overdue = hasDueDate && new Date(`${safeRecord.dueDate}T23:59:59`) < new Date() && !isReadyStatus;
  const evidenceBacked = safeRecord.status === "Not applicable" || (isReadyStatus && (!requiresEvidence || hasEvidence) && hasOwner);

  return {
    id: control.id,
    phase: control.phase || "Plan",
    priority: control.priority || "Medium",
    ready: isReadyStatus,
    evidenceBacked,
    missingEvidence: requiresEvidence && !hasEvidence,
    missingOwner: isReadyStatus && !hasOwner,
    missingDueDate: !isReadyStatus && !hasDueDate,
    overdue
  };
}
