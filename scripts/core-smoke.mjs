import { createAuditEvent, prependAuditEvent, sanitizeAuditMetadata } from "../src/core/audit.js";
import { forgetEncryptedVault, parseEncryptedVault, readEncryptedVault, writeEncryptedVault } from "../src/core/storage.js";
import {
  VAULT_SCHEMA_VERSION,
  assertEncryptedVault,
  createVault,
  migrateVault,
  normalizeVault
} from "../src/core/vault.js";

const checks = [];
const fixedOptions = {
  idFactory: () => "audit-fixed-id",
  now: () => "2026-05-07T12:00:00.000Z"
};

try {
  const sanitized = sanitizeAuditMetadata({
    entryId: "entry-1",
    apiKey: "should-not-survive",
    passwordHint: "also-sensitive",
    provider: "Fixture Provider"
  });

  check("Audit metadata preserves safe fields", sanitized.entryId === "entry-1" && sanitized.provider === "Fixture Provider", JSON.stringify(sanitized));
  check("Audit metadata redacts sensitive fields", sanitized.apiKey === "[redacted]" && sanitized.passwordHint === "[redacted]", JSON.stringify(sanitized));

  const event = createAuditEvent("fixture_event", { tokenValue: "secret", name: "Fixture" }, fixedOptions);
  check("Audit event deterministic id/time", event.id === "audit-fixed-id" && event.at === "2026-05-07T12:00:00.000Z", JSON.stringify(event));
  check("Audit event redacts metadata", event.metadata.tokenValue === "[redacted]" && event.metadata.name === "Fixture", JSON.stringify(event.metadata));

  const auditLog = prependAuditEvent([{ id: "older-1" }, { id: "older-2" }], "new_event", {}, { ...fixedOptions, maxEvents: 2 });
  check("Audit prepend trims max events", auditLog.length === 2 && auditLog[0].id === "audit-fixed-id" && auditLog[1].id === "older-1", JSON.stringify(auditLog));

  assertEncryptedVault({
    version: 1,
    crypto: { algorithm: "AES-GCM", kdf: "PBKDF2" },
    payload: "encrypted-payload"
  });
  check("Encrypted vault shape accepts valid payload", true, "valid fixture accepted");

  let rejected = false;
  try {
    assertEncryptedVault({ version: 1, crypto: {} });
  } catch {
    rejected = true;
  }
  check("Encrypted vault shape rejects invalid payload", rejected, "missing payload rejected");

  const encryptedFixture = {
    version: 1,
    crypto: { algorithm: "AES-GCM", kdf: "PBKDF2" },
    payload: "encrypted-storage-payload"
  };
  const storage = createMemoryStorage();
  writeEncryptedVault(storage, encryptedFixture, "fixture-key");
  check("Storage writes encrypted vault", storage.getItem("fixture-key").includes("encrypted-storage-payload"), storage.getItem("fixture-key"));
  check("Storage reads encrypted vault", readEncryptedVault(storage, "fixture-key").payload === "encrypted-storage-payload", JSON.stringify(readEncryptedVault(storage, "fixture-key")));
  check("Storage parse rejects invalid JSON", parseEncryptedVault("{nope") === null, "invalid JSON returned null");
  forgetEncryptedVault(storage, "fixture-key");
  check("Storage forget removes encrypted vault", storage.getItem("fixture-key") === null, "fixture-key removed");

  const vault = createVault({
    includeSamples: true,
    sampleEntries: [
      {
        id: "sample-1",
        name: "Sample Fixture",
        provider: "Fixture Provider",
        tags: "one, two"
      }
    ],
    options: fixedOptions
  });
  check("Create vault normalizes sample entries", vault.entries.length === 1 && vault.entries[0].tags.length === 2, JSON.stringify(vault.entries[0]));
  check("Create vault uses latest schema version", vault.version === VAULT_SCHEMA_VERSION && Array.isArray(vault.records.risks), `version=${vault.version}`);
  check("Create vault creates redacted audit", vault.auditLog[0].action === "vault_created" && vault.auditLog[0].metadata.entryCount === 1, JSON.stringify(vault.auditLog[0]));
  check("Create vault uses fixed timestamps", vault.createdAt === "2026-05-07T12:00:00.000Z" && vault.updatedAt === vault.createdAt, vault.createdAt);

  const normalized = normalizeVault({
    settings: { autoLockMinutes: 5 },
    entries: [{ id: "normalized-1", tags: "alpha, beta" }],
    auditLog: "not-an-array"
  }, fixedOptions);
  check("Normalize vault merges settings", normalized.settings.autoLockMinutes === 5 && normalized.settings.clipboardClearSeconds > 0, JSON.stringify(normalized.settings));
  check("Normalize vault normalizes entries", normalized.entries[0].tags.length === 2, JSON.stringify(normalized.entries[0]));
  check("Normalize vault migrates legacy shape", normalized.version === VAULT_SCHEMA_VERSION && Array.isArray(normalized.records.reports), JSON.stringify(normalized.records));
  check("Normalize vault repairs audit log", Array.isArray(normalized.auditLog) && normalized.auditLog.length === 0, JSON.stringify(normalized.auditLog));

  const migrated = migrateVault({ version: 1, records: { risks: [{ id: "risk-1" }] } }, fixedOptions);
  check("Migrate vault preserves known record families", migrated.version === VAULT_SCHEMA_VERSION && migrated.records.risks[0].id === "risk-1", JSON.stringify(migrated.records));

  let futureRejected = false;
  try {
    migrateVault({ version: VAULT_SCHEMA_VERSION + 1 });
  } catch {
    futureRejected = true;
  }
  check("Migrate vault rejects newer schemas", futureRejected, "future version rejected");

  printResults("CORE SMOKE PASSED");
} catch (error) {
  checks.push(["Core smoke failure", false, error.message]);
  printResults("CORE SMOKE FAILED");
  throw error;
}

function check(name, pass, detail) {
  checks.push([name, Boolean(pass), detail]);
  if (!pass) {
    throw new Error(`${name}: ${detail}`);
  }
}

function printResults(title) {
  console.log(`\n${title}`);
  for (const [name, pass, detail] of checks) {
    console.log(`${pass ? "PASS" : "FAIL"} ${name} - ${detail}`);
  }
}

function createMemoryStorage() {
  const data = new Map();

  return {
    getItem: (key) => data.get(key) || null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key)
  };
}
