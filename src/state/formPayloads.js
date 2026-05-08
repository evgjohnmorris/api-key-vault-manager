import {
  DEFAULT_SETTINGS,
  normalizeEntry,
  normalizeTags
} from "../schema.js";
import {
  STANDARD_CONTROLS,
  normalizeStandardsState
} from "../standards.js";

export function buildEntryFromForm(form, { idFactory, now }) {
  const currentTime = now();
  return normalizeEntry({
    id: String(form.get("id") || idFactory()),
    name: String(form.get("name") || "").trim(),
    provider: String(form.get("provider") || "").trim(),
    type: String(form.get("type") || "API key"),
    category: String(form.get("category") || "Uncategorized"),
    purpose: String(form.get("purpose") || "").trim(),
    useCase: String(form.get("useCase") || "").trim(),
    environment: String(form.get("environment") || DEFAULT_SETTINGS.defaultEnvironment),
    status: String(form.get("status") || DEFAULT_SETTINGS.defaultStatus),
    riskLevel: String(form.get("riskLevel") || DEFAULT_SETTINGS.defaultRiskLevel),
    secretValue: String(form.get("secretValue") || ""),
    username: String(form.get("username") || "").trim(),
    accountId: String(form.get("accountId") || "").trim(),
    url: String(form.get("url") || "").trim(),
    docsUrl: String(form.get("docsUrl") || "").trim(),
    dashboardUrl: String(form.get("dashboardUrl") || "").trim(),
    storagePath: String(form.get("storagePath") || "").trim(),
    scopes: String(form.get("scopes") || "").trim(),
    allowedOrigins: String(form.get("allowedOrigins") || "").trim(),
    allowedIps: String(form.get("allowedIps") || "").trim(),
    rateLimit: String(form.get("rateLimit") || "").trim(),
    rotationCadence: String(form.get("rotationCadence") || "No expiration"),
    expirationDate: String(form.get("expirationDate") || ""),
    lastVerifiedAt: String(form.get("lastVerifiedAt") || ""),
    owner: String(form.get("owner") || "").trim(),
    project: String(form.get("project") || "").trim(),
    tags: normalizeTags(String(form.get("tags") || "")),
    blockers: String(form.get("blockers") || "").trim(),
    notes: String(form.get("notes") || "").trim(),
    createdAt: String(form.get("createdAt") || currentTime),
    updatedAt: currentTime
  });
}

export function buildSettingsFromForm(form) {
  return {
    autoLockMinutes: Number(form.get("autoLockMinutes") || DEFAULT_SETTINGS.autoLockMinutes),
    clipboardClearSeconds: Number(form.get("clipboardClearSeconds") || DEFAULT_SETTINGS.clipboardClearSeconds),
    requirePurpose: form.get("requirePurpose") === "on",
    requireRotationPlan: form.get("requireRotationPlan") === "on",
    redactedExportsOnly: form.get("redactedExportsOnly") === "on",
    warnOnNoExpiration: form.get("warnOnNoExpiration") === "on",
    auditCopyEvents: form.get("auditCopyEvents") === "on",
    auditRevealEvents: form.get("auditRevealEvents") === "on",
    defaultEnvironment: String(form.get("defaultEnvironment") || DEFAULT_SETTINGS.defaultEnvironment),
    defaultStatus: String(form.get("defaultStatus") || DEFAULT_SETTINGS.defaultStatus),
    defaultRiskLevel: String(form.get("defaultRiskLevel") || DEFAULT_SETTINGS.defaultRiskLevel)
  };
}

export function buildStandardsFromForm(form, { now }) {
  const currentTime = now();
  const controls = {};

  STANDARD_CONTROLS.forEach((control) => {
    controls[control.id] = {
      status: String(form.get(`status__${control.id}`) || "Not started"),
      owner: String(form.get(`owner__${control.id}`) || "").trim(),
      dueDate: String(form.get(`dueDate__${control.id}`) || ""),
      evidence: String(form.get(`evidence__${control.id}`) || "").trim(),
      updatedAt: currentTime
    };
  });

  return normalizeStandardsState({
    updatedAt: currentTime,
    notes: String(form.get("standardsNotes") || "").trim(),
    controls
  });
}
