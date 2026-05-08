import {
  CATEGORIES,
  ENTRY_TYPES,
  ENVIRONMENTS,
  PURPOSES,
  RISK_LEVELS,
  ROTATION_CADENCES,
  STATUSES,
  validateEntry
} from "../schema.js";
import {
  ISO_STANDARDS,
  STANDARD_CONTROLS,
  STANDARD_PHASES,
  STANDARD_STATUSES,
  getControlAssurance,
  getStandardsProgress,
  normalizeStandardsState
} from "../standards.js";
import { estimateSecretStrength } from "../vaultCrypto.js";
import { buildConnectionLaunchpad } from "../domain/connections.js";
import { getEntryReadiness } from "../domain/readiness.js";
import { evaluateEntryPolicies, policySeverityClass } from "../domain/policies.js";
import { PROVIDER_TEMPLATES } from "../domain/providers.js";
import {
  escapeAttr,
  escapeHtml,
  formatDate,
  linkOrText,
  percentBucketClass,
  priorityClass,
  renderInput,
  renderPill,
  renderSelectField,
  renderTextarea,
  standardsStatusClass,
  statusClass
} from "./html.js";

export function renderQuickViews(commandCenter, vault, filters) {
  const quickViews = [
    { label: "All", count: vault.entries.length },
    { label: "Critical", count: vault.entries.filter((entry) => entry.riskLevel === "Critical").length },
    { label: "Needs verification", count: commandCenter.needsVerification },
    { label: "No expiration", count: vault.entries.filter((entry) => entry.rotationCadence === "No expiration").length },
    { label: "Incomplete", count: commandCenter.incomplete },
    { label: "Production", count: commandCenter.production },
    { label: "Policy issues", count: commandCenter.policy.entriesWithViolations }
  ];

  return `
    <div class="quick-views" aria-label="Quick views">
      ${quickViews.map((view) => `
        <button class="quick-view ${filters.quick === view.label ? "is-active" : ""}" type="button" data-quick-filter="${escapeAttr(view.label)}" aria-label="Quick view: ${escapeAttr(view.label)} (${view.count})">
          <span>${escapeHtml(view.label)}</span>
          <strong>${view.count}</strong>
        </button>
      `).join("")}
    </div>
  `;
}

export function renderEntryCard(entry, selectedId) {
  const readiness = getEntryReadiness(entry);
  const policyViolations = evaluateEntryPolicies(entry);
  return `
    <button class="entry-card ${entry.id === selectedId ? "is-active" : ""}" type="button" data-entry-id="${escapeAttr(entry.id)}">
      <div class="entry-card-topline">
        <h3>${escapeHtml(entry.name || "Untitled entry")}</h3>
        <span>${readiness.percent}%</span>
      </div>
      <div class="muted small">${escapeHtml(entry.provider || "No provider")} · ${escapeHtml(entry.purpose || entry.useCase || "Purpose not set")}</div>
      <div class="readiness-meter" aria-label="Entry readiness ${readiness.percent}%">
        <span class="${percentBucketClass("fill", readiness.percent)}"></span>
      </div>
      ${readiness.missing.length ? `<div class="muted small">Missing: ${escapeHtml(readiness.missing.slice(0, 2).join(", "))}</div>` : `<div class="muted small">Operationally complete enough for handoff.</div>`}
      ${policyViolations.length ? `<div class="muted small">Policy: ${escapeHtml(policyViolations.slice(0, 2).map((violation) => violation.title).join(", "))}</div>` : ""}
      <div class="entry-meta">
        ${renderPill(entry.type)}
        ${renderPill(entry.status, statusClass(entry.status))}
        ${renderPill(entry.riskLevel, entry.riskLevel.toLowerCase())}
        ${entry.rotationCadence === "No expiration" ? renderPill("No expiration", "medium") : renderPill(entry.rotationCadence)}
        ${policyViolations.length ? renderPill(`${policyViolations.length} policy`, policySeverityClass(policyViolations[0].severity)) : ""}
      </div>
    </button>
  `;
}

export function renderDetail(entry, { revealedSecrets, settings }) {
  const isRevealed = revealedSecrets.has(entry.id);
  const secret = entry.secretValue ? (isRevealed ? entry.secretValue : "••••••••••••••••••••") : "No secret stored";
  const strength = estimateSecretStrength(entry.secretValue);
  const warnings = validateEntry(entry, settings);
  const readiness = getEntryReadiness(entry);
  const policyViolations = evaluateEntryPolicies(entry);

  return `
    <div class="detail-header">
      <div class="button-row">
        <div>
          <p class="muted small">${escapeHtml(entry.provider || "No provider")}</p>
          <h2 class="detail-title">${escapeHtml(entry.name || "Untitled entry")}</h2>
          <p class="muted small">${readiness.percent}% operational readiness · ${readiness.missing.length ? `Missing ${escapeHtml(readiness.missing.slice(0, 3).join(", "))}` : "Ready for controlled use"}</p>
        </div>
        <button class="button secondary" id="edit-entry-button" type="button">Edit</button>
        <button class="button danger" id="delete-entry-button" type="button">Delete</button>
      </div>
    </div>
    <div class="detail-body">
      <div class="entry-meta">
        ${renderPill(entry.type)}
        ${renderPill(entry.category)}
        ${renderPill(entry.environment)}
        ${renderPill(entry.status, statusClass(entry.status))}
        ${renderPill(entry.riskLevel, entry.riskLevel.toLowerCase())}
        ${entry.tags.map((tag) => renderPill(`#${tag}`)).join("")}
      </div>

      ${warnings.length ? `<div class="warnings">${warnings.map((warning) => `<div class="warning">${escapeHtml(warning)}</div>`).join("")}</div>` : ""}
      ${renderEntryPolicyFindings(policyViolations)}

      ${renderEntryRoadmap(entry)}
      ${renderConnectionLaunchpad(entry)}

      <div class="detail-grid">
        <div class="detail-box full">
          <span>Secret</span>
          <div class="secret-line">
            <code>${escapeHtml(secret)}</code>
            <button class="button secondary" id="reveal-secret-button" type="button" ${entry.secretValue ? "" : "disabled"}>${isRevealed ? "Hide" : "Reveal"}</button>
            <button class="button secondary" id="copy-secret-button" type="button" ${entry.secretValue ? "" : "disabled"}>Copy</button>
          </div>
          <p class="muted small">Strength: ${escapeHtml(strength.label)} · ${escapeHtml(strength.message)}</p>
        </div>
        ${renderDetailBox("Purpose", entry.purpose)}
        ${renderDetailBox("Use case", entry.useCase)}
        ${renderDetailBox("URL", linkOrText(entry.url))}
        ${renderDetailBox("Dashboard", linkOrText(entry.dashboardUrl))}
        ${renderDetailBox("Docs", linkOrText(entry.docsUrl))}
        ${renderDetailBox("Username / email", entry.username)}
        ${renderDetailBox("Account ID", entry.accountId)}
        ${renderDetailBox("Scopes / permissions", entry.scopes, true)}
        ${renderDetailBox("Allowed origins", entry.allowedOrigins, true)}
        ${renderDetailBox("Allowed IPs", entry.allowedIps, true)}
        ${renderDetailBox("Rate limit", entry.rateLimit)}
        ${renderDetailBox("Rotation cadence", entry.rotationCadence)}
        ${renderDetailBox("Expiration date", entry.expirationDate || "No date set")}
        ${renderDetailBox("Last verified", entry.lastVerifiedAt || "Not verified")}
        ${renderDetailBox("Owner", entry.owner)}
        ${renderDetailBox("Project", entry.project)}
        ${renderDetailBox("Storage path", entry.storagePath, true)}
        ${renderDetailBox("Blockers", entry.blockers, true)}
        ${renderDetailBox("Notes", entry.notes, true)}
      </div>
    </div>
  `;
}

export function renderNoSelection() {
  return `
    <div class="detail-body">
      <div class="empty-state">
        <h2 class="detail-title">No entry selected</h2>
        <p>Create or select an entry to manage keys, logins, URLs, purpose, rotation, and setup notes.</p>
      </div>
    </div>
  `;
}

export function renderEmptyList() {
  return `
    <div class="empty-state">
      <h3>No entries match these filters.</h3>
      <p>Clear filters or create a new entry for the connection you want to track.</p>
    </div>
  `;
}

export function renderModal({ modal, vault }) {
  if (modal.type === "settings") {
    return renderSettingsModal(modal.settings);
  }

  if (modal.type === "standards") {
    return renderStandardsModal(vault.standards);
  }

  if (modal.type === "templates") {
    return renderTemplatesModal();
  }

  return renderEntryModal(modal.entry);
}

export function renderAuditItems(auditLog) {
  const events = auditLog.slice(0, 10);
  if (!events.length) {
    return `<li>No audit events yet.</li>`;
  }

  return events
    .map((event) => `<li><strong>${escapeHtml(event.action.replaceAll("_", " "))}</strong><br>${escapeHtml(formatDate(event.at))}</li>`)
    .join("");
}

function getEntryLifecycleSteps(entry) {
  const readiness = getEntryReadiness(entry);
  const checkpointsByLabel = new Map(readiness.checkpoints.map((checkpoint) => [checkpoint.label, checkpoint.done]));

  return [
    {
      label: "Capture",
      detail: "Secret or storage source exists.",
      done: checkpointsByLabel.get("Secret source")
    },
    {
      label: "Classify",
      detail: "Purpose, environment, and risk are clear.",
      done: checkpointsByLabel.get("Purpose") && Boolean(entry.environment && entry.riskLevel)
    },
    {
      label: "Restrict",
      detail: "Scopes, origins, IPs, or limits are documented.",
      done: checkpointsByLabel.get("Restrictions")
    },
    {
      label: "Rotate",
      detail: "Rotation is safe for the risk level.",
      done: checkpointsByLabel.get("Rotation")
    },
    {
      label: "Verify",
      detail: "Status or verification date confirms usability.",
      done: checkpointsByLabel.get("Verification")
    },
    {
      label: "Evidence",
      detail: "URLs, docs, notes, or blockers connect context.",
      done: checkpointsByLabel.get("References")
    }
  ];
}

function renderEntryPolicyFindings(policyViolations) {
  if (!policyViolations.length) {
    return `
      <section class="entry-policy-panel">
        <div class="entry-roadmap-header">
          <div>
            <span class="section-label">Policy findings</span>
            <h3>0 open issues</h3>
          </div>
          <span class="pill active">Pass</span>
        </div>
      </section>
    `;
  }

  return `
    <section class="entry-policy-panel">
      <div class="entry-roadmap-header">
        <div>
          <span class="section-label">Policy findings</span>
          <h3>${policyViolations.length} issue${policyViolations.length === 1 ? "" : "s"} need attention</h3>
        </div>
        <span class="pill ${policySeverityClass(policyViolations[0].severity)}">${escapeHtml(policyViolations[0].severity)}</span>
      </div>
      <div class="policy-list">
        ${policyViolations.map((violation) => `
          <div class="policy-item is-passive">
            <span class="pill ${policySeverityClass(violation.severity)}">${escapeHtml(violation.severity)}</span>
            <strong>${escapeHtml(violation.title)}</strong>
            <small>${escapeHtml(violation.detail)}</small>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderConnectionLaunchpad(entry) {
  const launchpad = buildConnectionLaunchpad(entry);
  const title = launchpad.connection?.name || "Custom connection";
  const summary = launchpad.connection?.benefit || "Use entry links and metadata as a local-only launch surface.";

  return `
    <section class="connection-launchpad">
      <div class="entry-roadmap-header">
        <div>
          <span class="section-label">Connection launchpad</span>
          <h3>${escapeHtml(title)}</h3>
          <p class="muted small">${escapeHtml(summary)}</p>
        </div>
        <span class="pill ${launchpad.matched ? "active" : "pending"}">${launchpad.matched ? "Cataloged" : "Manual"}</span>
      </div>

      <div class="entry-meta">
        ${renderPill(launchpad.adapterStatus)}
        ${launchpad.connection ? renderPill(launchpad.connection.readinessTier) : renderPill("entry-defined")}
        ${launchpad.missingFields.length ? renderPill(`${launchpad.missingFields.length} gaps`, "pending") : renderPill("fields ready", "active")}
      </div>

      <p class="muted small">${escapeHtml(launchpad.safety)}</p>

      ${launchpad.surfaces.length ? `
        <div class="connection-surface-grid">
          ${launchpad.surfaces.map((surface) => `
            <a class="connection-surface" href="${escapeAttr(surface.url)}" target="_blank" rel="noreferrer noopener">
              <span>${escapeHtml(surface.kind)}</span>
              <strong>${escapeHtml(surface.label)}</strong>
            </a>
          `).join("")}
        </div>
      ` : `
        <div class="empty-state compact">
          <strong>No launch links yet.</strong>
          <span>Add a dashboard URL, docs URL, or service URL to make this connection actionable.</span>
        </div>
      `}

      ${launchpad.missingFields.length ? `
        <div class="assurance-warnings">
          ${launchpad.missingFields.map((field) => `<span>Missing ${escapeHtml(field)}</span>`).join("")}
        </div>
      ` : ""}

      ${launchpad.setupChecklist.length ? `
        <ol class="connection-checklist">
          ${launchpad.setupChecklist.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
      ` : ""}
    </section>
  `;
}

function renderEntryRoadmap(entry) {
  const steps = getEntryLifecycleSteps(entry);
  const doneCount = steps.filter((step) => step.done).length;

  return `
    <section class="entry-roadmap">
      <div class="entry-roadmap-header">
        <div>
          <span class="section-label">Credential workflow</span>
          <h3>${doneCount}/${steps.length} stages ready</h3>
        </div>
        <span class="pill ${doneCount === steps.length ? "active" : "pending"}">${doneCount === steps.length ? "Ready" : "Needs work"}</span>
      </div>
      <div class="roadmap-steps">
        ${steps.map((step) => `
          <div class="roadmap-step ${step.done ? "is-done" : "needs-work"}">
            <strong>${escapeHtml(step.label)}</strong>
            <span>${escapeHtml(step.detail)}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDetailBox(label, value, full = false) {
  const displayValue = value || "Not set";
  return `
    <div class="detail-box ${full ? "full" : ""}">
      <span>${escapeHtml(label)}</span>
      <div>${typeof displayValue === "string" && displayValue.startsWith("<a ") ? displayValue : escapeHtml(displayValue)}</div>
    </div>
  `;
}

function renderTemplatesModal() {
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="templates-modal-title">
      <section class="modal-card templates-modal">
        <div class="button-row">
          <div>
            <span class="eyebrow">Provider onboarding</span>
            <h2 id="templates-modal-title">Create from template</h2>
            <p class="muted small">Start with safe setup notes for common developer, SaaS, ad, analytics, AI, cloud, and application providers.</p>
          </div>
          <button class="button ghost" id="modal-close" type="button">Close</button>
        </div>
        <div class="template-grid">
          ${PROVIDER_TEMPLATES.map((template) => `
            <article class="template-card">
              <div class="entry-meta">
                ${renderPill(template.type)}
                ${renderPill(template.riskLevel, template.riskLevel.toLowerCase())}
              </div>
              <h3>${escapeHtml(template.name)}</h3>
              <p>${escapeHtml(template.useCase)}</p>
              <small>${escapeHtml(template.category)} · ${escapeHtml(template.rotationCadence)} rotation</small>
              <button class="button secondary" type="button" data-template-id="${escapeAttr(template.id)}">Use template</button>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderEntryModal(entry) {
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="entry-modal-title">
      <section class="modal-card">
        <div class="button-row">
          <div>
            <span class="eyebrow">Connection record</span>
            <h2 id="entry-modal-title">${entry.name ? "Edit entry" : "New entry"}</h2>
          </div>
          <button class="button ghost" id="modal-close" type="button">Close</button>
        </div>
        <form id="entry-form" class="form-grid">
          <input name="id" type="hidden" value="${escapeAttr(entry.id)}">
          <input name="createdAt" type="hidden" value="${escapeAttr(entry.createdAt)}">
          ${renderInput("Name", "name", entry.name, "Example: Google Ads API key")}
          ${renderInput("Provider", "provider", entry.provider, "Example: Google Ads")}
          ${renderSelectField("Type", "type", ENTRY_TYPES, entry.type)}
          ${renderSelectField("Category", "category", CATEGORIES, entry.category)}
          ${renderSelectField("Purpose", "purpose", PURPOSES, entry.purpose, true)}
          ${renderInput("Use case", "useCase", entry.useCase, "What this credential powers")}
          ${renderSelectField("Environment", "environment", ENVIRONMENTS, entry.environment)}
          ${renderSelectField("Status", "status", STATUSES, entry.status)}
          ${renderSelectField("Risk level", "riskLevel", RISK_LEVELS, entry.riskLevel)}
          ${renderInput("Secret value", "secretValue", entry.secretValue, "Paste key/token/password here", "password", "full")}
          ${renderInput("Username / email", "username", entry.username)}
          ${renderInput("Account ID", "accountId", entry.accountId)}
          ${renderInput("Service URL", "url", entry.url, "https://...")}
          ${renderInput("Dashboard URL", "dashboardUrl", entry.dashboardUrl, "https://...")}
          ${renderInput("Docs URL", "docsUrl", entry.docsUrl, "https://...")}
          ${renderInput("Storage path", "storagePath", entry.storagePath, "Where a related local file is stored", "text", "full")}
          ${renderTextarea("Scopes / permissions", "scopes", entry.scopes)}
          ${renderTextarea("Allowed origins", "allowedOrigins", entry.allowedOrigins)}
          ${renderTextarea("Allowed IPs", "allowedIps", entry.allowedIps)}
          ${renderInput("Rate limit", "rateLimit", entry.rateLimit)}
          ${renderSelectField("Rotation cadence", "rotationCadence", ROTATION_CADENCES, entry.rotationCadence)}
          ${renderInput("Expiration date", "expirationDate", entry.expirationDate, "", "date")}
          ${renderInput("Last verified", "lastVerifiedAt", entry.lastVerifiedAt, "", "date")}
          ${renderInput("Owner", "owner", entry.owner)}
          ${renderInput("Project", "project", entry.project)}
          ${renderInput("Tags", "tags", entry.tags.join(", "), "comma, separated, tags", "text", "full")}
          ${renderTextarea("Blockers", "blockers", entry.blockers, "full")}
          ${renderTextarea("Notes", "notes", entry.notes, "full")}
          <div class="button-row full">
            <button class="button" type="submit">Save encrypted entry</button>
            <button class="button secondary" id="modal-cancel" type="button">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderSettingsModal(settings) {
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <section class="modal-card">
        <div class="button-row">
          <div>
            <span class="eyebrow">Security posture</span>
            <h2 id="settings-modal-title">Vault settings</h2>
          </div>
          <button class="button ghost" id="modal-close" type="button">Close</button>
        </div>
        <form id="settings-form" class="form-grid">
          ${renderInput("Auto-lock minutes", "autoLockMinutes", settings.autoLockMinutes, "", "number")}
          ${renderInput("Clipboard clear seconds", "clipboardClearSeconds", settings.clipboardClearSeconds, "", "number")}
          ${renderSelectField("Default environment", "defaultEnvironment", ENVIRONMENTS, settings.defaultEnvironment)}
          ${renderSelectField("Default status", "defaultStatus", STATUSES, settings.defaultStatus)}
          ${renderSelectField("Default risk level", "defaultRiskLevel", RISK_LEVELS, settings.defaultRiskLevel)}
          <label class="checkbox-row full"><input name="requirePurpose" type="checkbox" ${settings.requirePurpose ? "checked" : ""}> Require purpose/use case before saving entries.</label>
          <label class="checkbox-row full"><input name="requireRotationPlan" type="checkbox" ${settings.requireRotationPlan ? "checked" : ""}> Require a rotation cadence.</label>
          <label class="checkbox-row full"><input name="redactedExportsOnly" type="checkbox" ${settings.redactedExportsOnly ? "checked" : ""}> Prefer redacted inventory exports for sharing.</label>
          <label class="checkbox-row full"><input name="warnOnNoExpiration" type="checkbox" ${settings.warnOnNoExpiration ? "checked" : ""}> Warn when non-low-risk entries have no expiration.</label>
          <label class="checkbox-row full"><input name="auditCopyEvents" type="checkbox" ${settings.auditCopyEvents ? "checked" : ""}> Audit secret copy events.</label>
          <label class="checkbox-row full"><input name="auditRevealEvents" type="checkbox" ${settings.auditRevealEvents ? "checked" : ""}> Audit secret reveal events.</label>
          <div class="button-row full">
            <button class="button" type="submit">Save settings</button>
            <button class="button secondary" id="modal-cancel" type="button">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderStandardsModal(standardsValue) {
  const standards = normalizeStandardsState(standardsValue);
  const progress = getStandardsProgress(standards);

  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="standards-modal-title">
      <section class="modal-card standards-modal">
        <div class="button-row">
          <div>
            <span class="eyebrow">ISO implementation</span>
            <h2 id="standards-modal-title">Standards evidence tracker</h2>
          </div>
          <button class="button ghost" id="modal-close" type="button">Close</button>
        </div>

        <div class="standards-summary">
          <div class="stat"><strong>${progress.percent}%</strong><span>Ready</span></div>
          <div class="stat"><strong>${progress.assurancePercent}%</strong><span>Assured</span></div>
          <div class="stat"><strong>${progress.ready}</strong><span>Ready controls</span></div>
          <div class="stat"><strong>${progress.missingEvidence}</strong><span>Missing evidence</span></div>
          <div class="stat"><strong>${progress.missingOwner}</strong><span>Missing owner</span></div>
          <div class="stat"><strong>${progress.overdue}</strong><span>Overdue</span></div>
        </div>

        <div class="standards-phase-grid">
          ${STANDARD_PHASES.map((phase) => `
            <div class="phase-card">
              <span>${escapeHtml(phase)}</span>
              <strong>${progress.phaseCounts[phase].percent}%</strong>
              <small>${progress.phaseCounts[phase].ready}/${progress.phaseCounts[phase].total} ready</small>
            </div>
          `).join("")}
        </div>

        <p class="muted small">
          This tracker is an implementation aid, not a certification claim. It maps practical controls
          to ISO standard families and stores owner, status, due date, and evidence inside the encrypted vault.
          "Ready" follows the control status; "Assured" also requires supporting evidence and an owner where applicable.
        </p>

        <details class="standards-reference">
          <summary>Referenced ISO families</summary>
          <div class="standards-reference-grid">
            ${ISO_STANDARDS.map((standard) => `
              <article class="standard-reference-card">
                <a href="${escapeAttr(standard.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(standard.name)}</a>
                <span>${escapeHtml(standard.domain)}</span>
                <p>${escapeHtml(standard.purpose)}</p>
              </article>
            `).join("")}
          </div>
        </details>

        <form id="standards-form" class="standards-form">
          <div class="field">
            <label for="standardsNotes">Overall standards notes</label>
            <textarea id="standardsNotes" name="standardsNotes">${escapeHtml(standards.notes)}</textarea>
          </div>

          <div class="standards-controls">
            ${STANDARD_CONTROLS.map((control) => renderStandardControl(control, standards.controls[control.id])).join("")}
          </div>

          <div class="button-row">
            <button class="button" type="submit">Save standards evidence</button>
            <button class="button secondary" id="modal-cancel" type="button">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderStandardControl(control, record) {
  const statusName = `status__${control.id}`;
  const ownerName = `owner__${control.id}`;
  const dueDateName = `dueDate__${control.id}`;
  const evidenceName = `evidence__${control.id}`;
  const assurance = getControlAssurance(control, record);
  const assuranceWarnings = [
    assurance.missingEvidence ? "Status needs evidence." : "",
    assurance.missingOwner ? "Ready controls need an owner." : "",
    assurance.missingDueDate ? "Open controls should have a due date." : "",
    assurance.overdue ? "Due date has passed." : ""
  ].filter(Boolean);

  return `
    <article class="standard-control-card">
      <div class="standard-control-heading">
        <div>
          <span class="pill">${escapeHtml(control.id)}</span>
          <h3>${escapeHtml(control.title)}</h3>
          <p class="muted small">${escapeHtml(control.implementation)}</p>
        </div>
        ${renderPill(record.status, standardsStatusClass(record.status))}
      </div>

      <div class="entry-meta">
        ${renderPill(control.domain)}
        ${renderPill(control.phase || "Plan")}
        ${renderPill(`${control.priority || "Medium"} priority`, priorityClass(control.priority))}
        ${renderPill(assurance.evidenceBacked ? "Assured" : "Needs assurance", assurance.evidenceBacked ? "active" : "pending")}
        ${control.standards.map((standard) => renderPill(standard)).join("")}
      </div>

      ${assuranceWarnings.length ? `<div class="assurance-warnings">${assuranceWarnings.map((warning) => `<span>${escapeHtml(warning)}</span>`).join("")}</div>` : ""}

      <div class="standard-evidence-hint">
        <strong>Evidence examples:</strong> ${escapeHtml(control.evidenceExamples)}
      </div>

      <div class="form-grid compact">
        ${renderSelectField("Status", statusName, STANDARD_STATUSES, record.status)}
        ${renderInput("Owner", ownerName, record.owner, "Policy/control owner")}
        ${renderInput("Due date", dueDateName, record.dueDate, "", "date")}
        ${renderTextarea("Evidence note", evidenceName, record.evidence, "full")}
      </div>
    </article>
  `;
}
