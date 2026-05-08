import {
  CATEGORIES,
  DEFAULT_SETTINGS,
  ENTRY_TYPES,
  ENVIRONMENTS,
  PURPOSES,
  RISK_LEVELS,
  ROTATION_CADENCES,
  STATUSES,
  createEmptyEntry,
  validateEntry
} from "./schema.js";
import { SAMPLE_ENTRIES } from "./sampleData.js";
import {
  getStandardsProgress
} from "./standards.js";
import {
  decryptVaultPayload,
  downloadJson,
  encryptVaultPayload
} from "./vaultCrypto.js";
import { buildGovernanceReportBundle, buildRedactedInventoryExport } from "./domain/reports.js";
import { buildCommandCenter, buildVaultStats } from "./domain/dashboard.js";
import { prependAuditEvent } from "./core/audit.js";
import { assertEncryptedVault, createVault, normalizeVault } from "./core/vault.js";
import { forgetEncryptedVault, readEncryptedVault, writeEncryptedVault } from "./core/storage.js";
import { buildEntryFromForm, buildSettingsFromForm, buildStandardsFromForm } from "./state/formPayloads.js";
import { filterEntries, resolveSelectedEntry } from "./state/filters.js";
import { clearUnlockedSession, createInitialState } from "./state/session.js";
import {
  renderCommandCenter,
  renderOperationalPhysics,
  renderPolicyPanel
} from "./ui/dashboardPanels.js";
import { bindVaultEvents } from "./ui/events.js";
import {
  escapeAttr,
  escapeHtml,
  renderSelect
} from "./ui/html.js";
import {
  renderAuditItems,
  renderDetail,
  renderEmptyList,
  renderEntryCard,
  renderModal,
  renderNoSelection,
  renderQuickViews
} from "./ui/vaultViews.js";

const app = document.querySelector("#app");

const state = createInitialState();

const REPAIR_FIELD_BY_ACTION = {
  Critical: "riskLevel",
  "No expiration": "rotationCadence",
  "Needs verification": "lastVerifiedAt",
  Incomplete: "purpose",
  "Policy issues": "owner",
  Production: "environment"
};

const setQuickFilter = (filter) => {
  state.filters.quick = filter || "All";
  state.filters.query = "";
  state.filters.category = "All";
  state.filters.type = "All";
  state.filters.status = "All";
  state.filters.riskLevel = "All";
};

const openRepairForAction = (action, fieldName) => {
  setQuickFilter(action);
  const entries = filterEntries(state.vault.entries, state.filters);
  const targetEntry = entries[0];

  if (!targetEntry) {
    state.pendingFocus = { selector: "#filter-query" };
    renderVault();
    return;
  }

  state.selectedEntryId = targetEntry.id;
  state.revealedSecrets.clear();
  state.modal = { type: "entry", entry: { ...targetEntry, tags: [...targetEntry.tags] } };
  state.pendingFocus = { selector: `#${fieldName}` };
  renderVault();
};

const applyPendingFocus = () => {
  const pending = state.pendingFocus;
  if (!pending) return;

  state.pendingFocus = null;
  requestAnimationFrame(() => {
    const target = document.querySelector(pending.selector);
    if (!target) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "center", behavior: prefersReducedMotion ? "auto" : "smooth" });
    target.focus({ preventScroll: true });
  });
};

bootstrap();

function bootstrap() {
  state.encryptedVault = readEncryptedVault(localStorage);
  render();
  bindGlobalEvents();
}

function bindGlobalEvents() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.vault) {
      scheduleAutoLock();
    }
  });

  document.addEventListener("pointerdown", scheduleAutoLock);
  document.addEventListener("keydown", scheduleAutoLock);
}

function render() {
  if (!state.vault) {
    renderLocked();
    return;
  }

  renderVault();
}

function renderLocked() {
  const hasVault = Boolean(state.encryptedVault);

  app.innerHTML = `
    <main class="hero">
      <section class="hero-panel">
        <span class="eyebrow">Encrypted developer operations</span>
        <h1>API Key Vault Manager</h1>
        <p class="hero-copy">
          Maintain API keys, logins, OAuth clients, service accounts, ad/analytics connections,
          and provider setup notes in a GitHub-hostable static app. The code can be public; vault
          contents stay encrypted client-side with your master password.
        </p>
        <div class="feature-grid">
          <div class="feature-card">
            <strong>Rich entries</strong>
            <span>Track purpose, URL, scopes, environment, risk, rotation cadence, blockers, and tags.</span>
          </div>
          <div class="feature-card">
            <strong>Security-first</strong>
            <span>AES-GCM encryption, PBKDF2, local-only storage, redacted exports, audit events, and auto-lock.</span>
          </div>
          <div class="feature-card">
            <strong>GitHub-ready</strong>
            <span>Runs as static files on GitHub Pages with no backend, database, cookies, or analytics.</span>
          </div>
          <div class="feature-card">
            <strong>ISO-aligned</strong>
            <span>Track evidence for security, infrastructure, architecture, privacy, continuity, AI, and design standards.</span>
          </div>
        </div>
      </section>

      <section class="auth-card">
        <h2>${hasVault ? "Unlock vault" : "Create vault"}</h2>
        <p>${hasVault ? "Enter the master password for the vault stored in this browser." : "Choose a strong master password. It is never stored and cannot be recovered."}</p>
        <form id="${hasVault ? "unlock-form" : "create-form"}" class="form-stack">
          <div class="field">
            <label for="master-password">Master password</label>
            <input id="master-password" name="password" type="password" autocomplete="current-password" required minlength="12">
          </div>
          ${hasVault ? "" : `
            <div class="field">
              <label for="confirm-password">Confirm password</label>
              <input id="confirm-password" name="confirmPassword" type="password" autocomplete="new-password" required minlength="12">
            </div>
            <label class="checkbox-row">
              <input name="includeSamples" type="checkbox" checked>
              Include safe sample entries for Google analytics, ad platforms, and AI providers.
            </label>
          `}
          <div id="auth-message" class="notice ${state.message ? "is-visible" : ""}">${escapeHtml(state.message)}</div>
          <div class="button-row">
            <button class="button" type="submit" ${state.busy ? "disabled" : ""}>${state.busy ? "Working..." : hasVault ? "Unlock" : "Create encrypted vault"}</button>
            ${hasVault ? `<button class="button secondary" id="import-vault-button" type="button">Import encrypted vault</button>` : ""}
            ${hasVault ? `<button class="button ghost" id="reset-browser-vault" type="button">Forget browser copy</button>` : ""}
          </div>
          <input id="import-vault-file" class="hidden" type="file" accept="application/json,.json">
        </form>
      </section>
    </main>
  `;

  const form = document.querySelector(hasVault ? "#unlock-form" : "#create-form");
  form.addEventListener("submit", hasVault ? handleUnlock : handleCreateVault);

  const importButton = document.querySelector("#import-vault-button");
  const importFile = document.querySelector("#import-vault-file");
  const resetButton = document.querySelector("#reset-browser-vault");

  if (importButton && importFile) {
    importButton.addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", handleEncryptedVaultImport);
  }

  if (resetButton) {
    resetButton.addEventListener("click", handleForgetBrowserCopy);
  }
}

function renderVault() {
  const entries = filterEntries(state.vault.entries, state.filters);
  const selection = resolveSelectedEntry(entries, state.selectedEntryId);
  const selectedEntry = selection.entry;
  state.selectedEntryId = selection.selectedEntryId;
  const stats = buildVaultStats(state.vault);
  const commandCenter = buildCommandCenter(state.vault.entries, stats);

  app.innerHTML = `
    <main class="vault-grid">
      <aside class="sidebar">
        <div>
          <span class="eyebrow">Local encrypted vault</span>
          <h1 class="app-title">Key Ops</h1>
          <p class="muted small">Secrets are decrypted only in this browser session. Keep exported vault files private.</p>
        </div>

        <div class="stats-grid">
          <div class="stat"><strong>${stats.total}</strong><span>Total</span></div>
          <div class="stat"><strong>${stats.critical}</strong><span>Critical</span></div>
          <div class="stat"><strong>${stats.blocked}</strong><span>Blocked</span></div>
          <div class="stat"><strong>${stats.noExpiration}</strong><span>No expiration</span></div>
          <div class="stat"><strong>${stats.standardsReady}</strong><span>ISO ready</span></div>
          <div class="stat"><strong>${stats.standardsPercent}%</strong><span>Standards</span></div>
          <div class="stat"><strong>${stats.policyScore}%</strong><span>Policy</span></div>
          <div class="stat"><strong>${stats.policyViolations}</strong><span>Policy gaps</span></div>
        </div>

        ${renderCommandCenter(commandCenter)}
        ${renderOperationalPhysics(commandCenter.physics)}
        ${renderPolicyPanel(commandCenter.policy)}

        <div class="filters">
          <input id="filter-query" class="search-box" type="search" placeholder="Search provider, purpose, URL, tags..." value="${escapeAttr(state.filters.query)}">
          ${renderSelect("filter-category", ["All", ...CATEGORIES], state.filters.category, "Category")}
          ${renderSelect("filter-type", ["All", ...ENTRY_TYPES], state.filters.type, "Type")}
          ${renderSelect("filter-status", ["All", ...STATUSES], state.filters.status, "Status")}
          ${renderSelect("filter-risk", ["All", ...RISK_LEVELS], state.filters.riskLevel, "Risk")}
        </div>

        <div class="settings-card">
          <div class="section-label">Vault controls</div>
          <p class="muted small">Auto-lock: ${state.vault.settings.autoLockMinutes} min. Clipboard clear: ${state.vault.settings.clipboardClearSeconds} sec.</p>
          <div class="button-row">
            <button class="button secondary" id="settings-button" type="button">Settings</button>
            <button class="button secondary" id="templates-button" type="button">Templates</button>
            <button class="button secondary" id="standards-button" type="button">ISO standards</button>
            <button class="button secondary" id="export-vault-button" type="button">Export encrypted</button>
            <button class="button secondary" id="export-redacted-button" type="button">Export redacted</button>
            <button class="button secondary" id="export-reports-button" type="button">Export reports</button>
            <button class="button secondary" id="import-entries-button" type="button">Import vault</button>
            <button class="button danger" id="lock-button" type="button">Lock</button>
          </div>
          <input id="import-entries-file" class="hidden" type="file" accept="application/json,.json">
        </div>

        <div class="audit-card">
          <div class="section-label">Recent audit log</div>
          <ul class="audit-list">${renderAuditItems(state.vault.auditLog)}</ul>
        </div>
      </aside>

      <section class="entry-list">
        <div class="list-header">
          <div class="button-row">
            <div>
              <h2>Entries</h2>
              <p class="muted small">${entries.length} matching entries</p>
            </div>
            <button class="button" id="new-entry-button" type="button">New entry</button>
          </div>
          ${renderQuickViews(commandCenter, state.vault, state.filters)}
          <div id="vault-message" class="notice ${state.message ? "is-visible" : ""}">${escapeHtml(state.message)}</div>
        </div>
        <div class="entry-scroll">
          ${entries.length ? entries.map((entry) => renderEntryCard(entry, selectedEntry?.id)).join("") : renderEmptyList()}
        </div>
      </section>

      <section class="detail-panel">
          ${selectedEntry ? renderDetail(selectedEntry, { revealedSecrets: state.revealedSecrets, settings: state.vault.settings }) : renderNoSelection()}
      </section>
    </main>
    ${state.modal ? renderModal({ modal: state.modal, vault: state.vault }) : ""}
  `;

  bindVaultEvents({
    state,
    renderVault,
    actions: {
      applyQuickFilter,
      handleCommandAction,
      handleDeleteEntry,
      handleCopySecret,
      handleRevealSecret,
      handleExportEncrypted,
      handleExportRedacted,
      handleExportReports,
      handleUnlockedVaultImport,
      lockVault,
      closeModal,
      handleEntrySubmit,
      handleSettingsSubmit,
      handleStandardsSubmit
    }
  });
  applyPendingFocus();
}

function applyQuickFilter(filter) {
  setQuickFilter(filter);
  renderVault();
}

function handleCommandAction(action) {
  if (action === "standards") {
    state.modal = { type: "standards" };
    renderVault();
    return;
  }

  if (action === "new-entry") {
    state.modal = { type: "entry", entry: createEmptyEntry() };
    renderVault();
    return;
  }

  const repairField = REPAIR_FIELD_BY_ACTION[action];
  if (repairField) {
    openRepairForAction(action, repairField);
    return;
  }

  applyQuickFilter(action);
}

async function handleCreateVault(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const password = String(form.get("password") || "");
  const confirmPassword = String(form.get("confirmPassword") || "");

  if (password.length < 12) {
    setMessage("Use at least 12 characters for the master password.");
    return;
  }

  if (password !== confirmPassword) {
    setMessage("The password confirmation does not match.");
    return;
  }

  const now = new Date().toISOString();
  const includeSamples = form.get("includeSamples") === "on";
  state.vault = createVault({
    includeSamples,
    sampleEntries: SAMPLE_ENTRIES,
    options: { now: () => now }
  });
  state.password = password;
  state.selectedEntryId = state.vault.entries[0]?.id || "";
  await persistVault("vault_saved");
  scheduleAutoLock();
  setMessage("Vault created and encrypted in this browser.");
}

async function handleUnlock(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const password = String(form.get("password") || "");
  setBusy(true);

  try {
    const vault = await decryptVaultPayload(state.encryptedVault, password);
    state.vault = normalizeVault(vault);
    state.password = password;
    state.selectedEntryId = state.vault.entries[0]?.id || "";
    addAudit("vault_unlocked");
    await persistVault("vault_unlocked_persisted", {}, false);
    scheduleAutoLock();
    state.message = "Vault unlocked.";
    renderVault();
  } catch (error) {
    state.vault = null;
    state.password = "";
    setMessage("Could not unlock the vault. Check the password or imported file.");
  } finally {
    setBusy(false);
  }
}

async function handleEncryptedVaultImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text());
    assertEncryptedVault(imported);
    writeEncryptedVault(localStorage, imported);
    state.encryptedVault = imported;
    setMessage("Encrypted vault imported into this browser. Unlock it with its master password.");
  } catch (error) {
    setMessage("Import failed. Choose a valid encrypted vault JSON file.");
  }
}

async function handleUnlockedVaultImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text());
    assertEncryptedVault(imported);
    writeEncryptedVault(localStorage, imported);
    state.encryptedVault = imported;
    clearUnlockedSession(state);
    setMessage("Encrypted vault imported. Unlock it with its master password.");
  } catch (error) {
    setMessage("Import failed. Choose a valid encrypted vault JSON file.");
  }
}

function handleForgetBrowserCopy() {
  if (!confirm("Forget the encrypted vault stored in this browser? Export first if this is your only copy.")) {
    return;
  }

  forgetEncryptedVault(localStorage);
  state.encryptedVault = null;
  clearUnlockedSession(state);
  setMessage("Browser copy removed. No exported files were touched.");
}

async function handleEntrySubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const entry = buildEntryFromForm(form, {
    idFactory: () => crypto.randomUUID(),
    now: () => new Date().toISOString()
  });

  const warnings = validateEntry(entry, state.vault.settings);
  if (warnings.some((warning) => warning.includes("required"))) {
    state.message = warnings.join(" ");
    renderVault();
    return;
  }

  const existingIndex = state.vault.entries.findIndex((item) => item.id === entry.id);
  if (existingIndex >= 0) {
    state.vault.entries[existingIndex] = entry;
    state.selectedEntryId = entry.id;
    await persistVault("entry_updated", { entryId: entry.id, name: entry.name });
    state.modal = null;
    setMessage("Entry updated and vault re-encrypted.");
  } else {
    state.vault.entries.unshift(entry);
    state.selectedEntryId = entry.id;
    await persistVault("entry_created", { entryId: entry.id, name: entry.name });
    state.modal = null;
    setMessage("Entry created and vault re-encrypted.");
  }
}

async function handleSettingsSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  state.vault.settings = buildSettingsFromForm(form);

  await persistVault("settings_updated");
  scheduleAutoLock();
  state.modal = null;
  setMessage("Settings updated.");
}

async function handleStandardsSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  state.vault.standards = buildStandardsFromForm(form, {
    now: () => new Date().toISOString()
  });

  await persistVault("standards_updated", getStandardsProgress(state.vault.standards));
  state.modal = null;
  setMessage("ISO standards evidence updated and vault re-encrypted.");
}

async function handleDeleteEntry() {
  const entry = state.vault.entries.find((item) => item.id === state.selectedEntryId);
  if (!entry) return;

  if (!confirm(`Delete "${entry.name || entry.provider || "this entry"}" from the vault?`)) {
    return;
  }

  state.vault.entries = state.vault.entries.filter((item) => item.id !== entry.id);
  state.revealedSecrets.delete(entry.id);
  state.selectedEntryId = state.vault.entries[0]?.id || "";
  await persistVault("entry_deleted", { entryId: entry.id, name: entry.name });
  setMessage("Entry deleted and vault re-encrypted.");
}

async function handleCopySecret() {
  const entry = state.vault.entries.find((item) => item.id === state.selectedEntryId);
  if (!entry?.secretValue) {
    setMessage("No secret value is stored for this entry.");
    return;
  }

  try {
    await navigator.clipboard.writeText(entry.secretValue);
    if (state.vault.settings.auditCopyEvents) {
      await persistVault("secret_copied", { entryId: entry.id, name: entry.name });
    }
    window.setTimeout(() => navigator.clipboard.writeText("").catch(() => {}), state.vault.settings.clipboardClearSeconds * 1000);
    setMessage(`Secret copied. Clipboard clear attempted in ${state.vault.settings.clipboardClearSeconds} seconds.`);
  } catch (error) {
    setMessage("Clipboard copy failed. Use reveal only if you are in a private place.");
  }
}

async function handleRevealSecret() {
  const entry = state.vault.entries.find((item) => item.id === state.selectedEntryId);
  if (!entry?.secretValue) return;

  if (state.revealedSecrets.has(entry.id)) {
    state.revealedSecrets.delete(entry.id);
    renderVault();
    return;
  }

  state.revealedSecrets.add(entry.id);
  if (state.vault.settings.auditRevealEvents) {
    await persistVault("secret_revealed", { entryId: entry.id, name: entry.name });
  }

  renderVault();
}

async function handleExportEncrypted() {
  if (!state.encryptedVault) return;
  await persistVault("encrypted_vault_exported", {}, true);
  downloadJson(`api-key-vault-${stamp()}.vault.json`, state.encryptedVault);
  setMessage("Encrypted vault exported. Keep the file private.");
}

function handleExportRedacted() {
  const exportData = buildRedactedInventoryExport(state.vault, {
    exportedAt: new Date().toISOString()
  });

  downloadJson(`api-key-inventory-redacted-${stamp()}.json`, exportData);
  persistVault("redacted_inventory_exported", {}, true).then(() => {
    setMessage("Redacted inventory exported.");
  });
}

function handleExportReports() {
  const generatedAt = new Date().toISOString();
  const exportData = buildGovernanceReportBundle(state.vault, {
    generatedAt,
    now: Date.parse(generatedAt)
  });

  downloadJson(`api-key-governance-reports-${stamp()}.json`, exportData);
  persistVault("governance_reports_exported", {}, true).then(() => {
    setMessage("Governance report bundle exported with secrets redacted.");
  });
}

async function persistVault(action, metadata = {}, addEvent = true) {
  if (!state.vault || !state.password) return;
  if (addEvent) {
    addAudit(action, metadata);
  }
  state.vault.updatedAt = new Date().toISOString();
  setBusy(true, false);
  state.encryptedVault = await encryptVaultPayload(state.vault, state.password);
  writeEncryptedVault(localStorage, state.encryptedVault);
  setBusy(false, false);
}

function addAudit(action, metadata = {}) {
  if (!state.vault) return;
  state.vault.auditLog = prependAuditEvent(state.vault.auditLog, action, metadata);
}

function lockVault() {
  window.clearTimeout(state.lockTimer);
  clearUnlockedSession(state, { message: "Vault locked." });
  renderLocked();
}

function scheduleAutoLock() {
  if (!state.vault) return;
  window.clearTimeout(state.lockTimer);
  const minutes = Number(state.vault.settings.autoLockMinutes || DEFAULT_SETTINGS.autoLockMinutes);
  state.lockTimer = window.setTimeout(lockVault, Math.max(minutes, 1) * 60 * 1000);
}

function setMessage(message) {
  state.message = message;
  render();
}

function setBusy(isBusy, rerender = true) {
  state.busy = isBusy;
  if (rerender) render();
}

function closeModal(shouldRender = true) {
  state.modal = null;
  if (shouldRender) renderVault();
}

function stamp() {
  return new Date().toISOString().replaceAll(":", "-").replace(/\.\d+Z$/, "Z");
}
