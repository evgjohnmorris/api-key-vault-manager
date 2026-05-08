export function createInitialState() {
  return {
    encryptedVault: null,
    vault: null,
    password: "",
    selectedEntryId: "",
    revealedSecrets: new Set(),
    filters: createDefaultFilters(),
    modal: null,
    message: "",
    busy: false,
    lockTimer: null,
    pendingFocus: null
  };
}

export function createDefaultFilters() {
  return {
    query: "",
    quick: "All",
    category: "All",
    type: "All",
    status: "All",
    riskLevel: "All"
  };
}

export function clearUnlockedSession(state, { message } = {}) {
  state.vault = null;
  state.password = "";
  state.selectedEntryId = "";
  state.revealedSecrets.clear();

  if (message !== undefined) {
    state.message = message;
  }
}
