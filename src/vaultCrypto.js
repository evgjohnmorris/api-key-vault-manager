const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export const CRYPTO_VERSION = 1;
export const DEFAULT_ITERATIONS = 600000;

export function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export async function encryptVaultPayload(payload, password, options = {}) {
  const iterations = options.iterations || DEFAULT_ITERATIONS;
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveVaultKey(password, salt, iterations);
  const encoded = TEXT_ENCODER.encode(JSON.stringify(payload));
  const cipherBytes = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded));

  return {
    version: CRYPTO_VERSION,
    createdAt: new Date().toISOString(),
    crypto: {
      algorithm: "AES-GCM",
      kdf: "PBKDF2",
      hash: "SHA-256",
      iterations,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv)
    },
    payload: bytesToBase64(cipherBytes)
  };
}

export async function decryptVaultPayload(encryptedVault, password) {
  const salt = base64ToBytes(encryptedVault.crypto.salt);
  const iv = base64ToBytes(encryptedVault.crypto.iv);
  const cipherBytes = base64ToBytes(encryptedVault.payload);
  const key = await deriveVaultKey(password, salt, encryptedVault.crypto.iterations);
  const plainBytes = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipherBytes);
  return JSON.parse(TEXT_DECODER.decode(plainBytes));
}

export async function deriveVaultKey(password, salt, iterations) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    TEXT_ENCODER.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function estimateSecretStrength(secret) {
  if (!secret) {
    return { label: "Empty", score: 0, message: "No secret has been stored for this entry." };
  }

  let score = 0;
  if (secret.length >= 16) score += 1;
  if (secret.length >= 32) score += 1;
  if (/[a-z]/.test(secret) && /[A-Z]/.test(secret)) score += 1;
  if (/\d/.test(secret)) score += 1;
  if (/[^a-zA-Z0-9]/.test(secret)) score += 1;

  if (score <= 1) {
    return { label: "Weak", score, message: "Short or predictable secret. Rotate if this is real." };
  }

  if (score <= 3) {
    return { label: "Moderate", score, message: "Reasonable shape, but restrict scopes and rotate regularly." };
  }

  return { label: "Strong", score, message: "Good secret shape. Keep scopes narrow and monitor usage." };
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
