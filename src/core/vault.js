import { DEFAULT_SETTINGS, normalizeEntry } from "../schema.js";
import { createStandardsState, normalizeStandardsState } from "../standards.js";
import { createAuditEvent } from "./audit.js";

export const VAULT_SCHEMA_VERSION = 2;
export const MIN_SUPPORTED_VAULT_SCHEMA_VERSION = 1;
export const VAULT_RECORD_FAMILIES = ["risks", "policies", "evidence", "reports", "decisions"];

export function assertEncryptedVault(value) {
  if (!value || value.version !== 1 || !value.crypto || !value.payload) {
    throw new Error("Invalid encrypted vault");
  }
}

export function normalizeVault(vault = {}, options = {}) {
  const now = options.now || (() => new Date().toISOString());
  const timestamp = now();
  const migratedVault = migrateVault(vault, options);

  return {
    version: VAULT_SCHEMA_VERSION,
    createdAt: migratedVault.createdAt || timestamp,
    updatedAt: migratedVault.updatedAt || timestamp,
    settings: { ...DEFAULT_SETTINGS, ...(migratedVault.settings || {}) },
    standards: normalizeStandardsState(migratedVault.standards),
    entries: Array.isArray(migratedVault.entries) ? migratedVault.entries.map(normalizeEntry) : [],
    records: normalizeVaultRecords(migratedVault.records),
    auditLog: Array.isArray(migratedVault.auditLog) ? migratedVault.auditLog : []
  };
}

export function createVault({ entries = [], includeSamples = false, sampleEntries = [], options = {} } = {}) {
  const now = options.now || (() => new Date().toISOString());
  const timestamp = now();
  const normalizedEntries = includeSamples ? sampleEntries.map(normalizeEntry) : entries.map(normalizeEntry);

  return {
    version: VAULT_SCHEMA_VERSION,
    createdAt: timestamp,
    updatedAt: timestamp,
    settings: { ...DEFAULT_SETTINGS },
    standards: createStandardsState({ updatedAt: timestamp }),
    entries: normalizedEntries,
    records: createEmptyVaultRecords(),
    auditLog: [
      createAuditEvent("vault_created", {
        samplesIncluded: includeSamples,
        entryCount: normalizedEntries.length
      }, options)
    ]
  };
}

export function migrateVault(vault = {}, options = {}) {
  const sourceVersion = Number(vault.version || MIN_SUPPORTED_VAULT_SCHEMA_VERSION);

  if (!Number.isInteger(sourceVersion) || sourceVersion < MIN_SUPPORTED_VAULT_SCHEMA_VERSION) {
    throw new Error(`Unsupported vault schema version: ${vault.version}`);
  }

  if (sourceVersion > VAULT_SCHEMA_VERSION) {
    throw new Error(`Vault schema version ${sourceVersion} is newer than this app supports.`);
  }

  let migrated = { ...vault, version: sourceVersion };
  for (let version = sourceVersion; version < VAULT_SCHEMA_VERSION; version += 1) {
    migrated = vaultMigrations[version](migrated, options);
  }

  return migrated;
}

export function createEmptyVaultRecords() {
  return VAULT_RECORD_FAMILIES.reduce((records, family) => {
    records[family] = [];
    return records;
  }, {});
}

export function normalizeVaultRecords(records = {}) {
  const emptyRecords = createEmptyVaultRecords();
  return VAULT_RECORD_FAMILIES.reduce((normalized, family) => {
    normalized[family] = Array.isArray(records[family]) ? records[family] : emptyRecords[family];
    return normalized;
  }, {});
}

const vaultMigrations = {
  1: (vault) => ({
    ...vault,
    version: 2,
    records: normalizeVaultRecords(vault.records)
  })
};
