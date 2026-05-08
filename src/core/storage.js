import { STORAGE_KEY } from "../schema.js";
import { assertEncryptedVault } from "./vault.js";

export function parseEncryptedVault(raw) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    assertEncryptedVault(parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function readEncryptedVault(storage, storageKey = STORAGE_KEY) {
  return parseEncryptedVault(resolveStorage(storage).getItem(storageKey));
}

export function writeEncryptedVault(storage, encryptedVault, storageKey = STORAGE_KEY) {
  assertEncryptedVault(encryptedVault);
  resolveStorage(storage).setItem(storageKey, JSON.stringify(encryptedVault));
  return encryptedVault;
}

export function forgetEncryptedVault(storage, storageKey = STORAGE_KEY) {
  resolveStorage(storage).removeItem(storageKey);
}

function resolveStorage(storage) {
  if (storage) return storage;
  if (globalThis.localStorage) return globalThis.localStorage;
  throw new Error("Storage adapter is not available.");
}
