import { createEmptyEntry } from "../schema.js";
import { createEntryFromProviderTemplate } from "../domain/providers.js";

export function bindVaultEvents({ state, renderVault, actions }) {
  document.querySelector("#filter-query")?.addEventListener("input", (event) => {
    state.filters.query = event.target.value;
    renderVault();
  });

  document.querySelector("#filter-category")?.addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    renderVault();
  });

  document.querySelector("#filter-type")?.addEventListener("change", (event) => {
    state.filters.type = event.target.value;
    renderVault();
  });

  document.querySelector("#filter-status")?.addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    renderVault();
  });

  document.querySelector("#filter-risk")?.addEventListener("change", (event) => {
    state.filters.riskLevel = event.target.value;
    renderVault();
  });

  document.querySelectorAll("[data-quick-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.applyQuickFilter(button.dataset.quickFilter);
    });
  });

  document.querySelectorAll("[data-command-action]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.handleCommandAction(button.dataset.commandAction);
    });
  });

  document.querySelectorAll("[data-entry-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedEntryId = button.dataset.entryId;
      state.revealedSecrets.clear();
      renderVault();
    });
  });

  document.querySelector("#new-entry-button")?.addEventListener("click", () => {
    state.modal = { type: "entry", entry: createEmptyEntry() };
    renderVault();
  });

  document.querySelector("#edit-entry-button")?.addEventListener("click", () => {
    const entry = state.vault.entries.find((item) => item.id === state.selectedEntryId);
    if (entry) {
      state.modal = { type: "entry", entry: { ...entry, tags: [...entry.tags] } };
      renderVault();
    }
  });

  document.querySelector("#delete-entry-button")?.addEventListener("click", actions.handleDeleteEntry);
  document.querySelector("#copy-secret-button")?.addEventListener("click", actions.handleCopySecret);
  document.querySelector("#reveal-secret-button")?.addEventListener("click", actions.handleRevealSecret);

  document.querySelector("#settings-button")?.addEventListener("click", () => {
    state.modal = { type: "settings", settings: { ...state.vault.settings } };
    renderVault();
  });

  document.querySelector("#templates-button")?.addEventListener("click", () => {
    state.modal = { type: "templates" };
    renderVault();
  });

  document.querySelector("#standards-button")?.addEventListener("click", () => {
    state.modal = { type: "standards" };
    renderVault();
  });

  document.querySelector("#export-vault-button")?.addEventListener("click", actions.handleExportEncrypted);
  document.querySelector("#export-redacted-button")?.addEventListener("click", actions.handleExportRedacted);
  document.querySelector("#export-reports-button")?.addEventListener("click", actions.handleExportReports);
  document.querySelector("#import-entries-button")?.addEventListener("click", () => document.querySelector("#import-entries-file")?.click());
  document.querySelector("#import-entries-file")?.addEventListener("change", actions.handleUnlockedVaultImport);
  document.querySelector("#lock-button")?.addEventListener("click", actions.lockVault);

  document.querySelector("#modal-close")?.addEventListener("click", () => actions.closeModal());
  document.querySelector("#modal-cancel")?.addEventListener("click", () => actions.closeModal());
  document.querySelector("#entry-form")?.addEventListener("submit", actions.handleEntrySubmit);
  document.querySelector("#settings-form")?.addEventListener("submit", actions.handleSettingsSubmit);
  document.querySelector("#standards-form")?.addEventListener("submit", actions.handleStandardsSubmit);

  document.querySelectorAll("[data-template-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const entry = createEntryFromProviderTemplate(button.dataset.templateId, {
        environment: state.vault.settings.defaultEnvironment,
        status: state.vault.settings.defaultStatus
      });
      state.modal = { type: "entry", entry };
      renderVault();
    });
  });
}
