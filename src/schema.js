export const STORAGE_KEY = "akvm.encryptedVault.v1";

export const ENTRY_TYPES = [
  "API key",
  "OAuth client",
  "Login",
  "Service account",
  "Webhook",
  "Database credential",
  "Ad platform",
  "Analytics",
  "Tag manager",
  "Affiliate network",
  "AI model provider",
  "Storage/CDN",
  "Email/SMS",
  "Payment processor",
  "Monitoring",
  "Other"
];

export const CATEGORIES = [
  "Core infrastructure",
  "AI and machine learning",
  "Ads and monetization",
  "Analytics and attribution",
  "Authentication",
  "Cloud hosting",
  "Content and CMS",
  "Database",
  "Developer platform",
  "Email and messaging",
  "Finance and payments",
  "Maps and location",
  "Marketing automation",
  "Media and files",
  "Search and discovery",
  "Security and compliance",
  "Social and publishing",
  "Workflow automation",
  "Uncategorized"
];

export const PURPOSES = [
  "Production application",
  "Development and testing",
  "Analytics collection",
  "Ad serving or monetization",
  "Automation workflow",
  "Backend integration",
  "Customer messaging",
  "Data import/export",
  "Internal dashboard",
  "Model inference",
  "Monitoring and alerts",
  "Search/indexing",
  "User authentication",
  "Other"
];

export const ENVIRONMENTS = [
  "Production",
  "Staging",
  "Development",
  "Testing",
  "Personal",
  "Shared",
  "Unknown"
];

export const STATUSES = [
  "Active",
  "Pending setup",
  "Blocked",
  "Needs verification",
  "Rotated",
  "Revoked",
  "Expired",
  "Archived"
];

export const RISK_LEVELS = [
  "Low",
  "Medium",
  "High",
  "Critical",
  "Unknown"
];

export const ROTATION_CADENCES = [
  "No expiration",
  "30 days",
  "60 days",
  "90 days",
  "180 days",
  "Annual",
  "Manual",
  "Unknown"
];

export const DEFAULT_SETTINGS = {
  autoLockMinutes: 15,
  clipboardClearSeconds: 45,
  requirePurpose: true,
  requireRotationPlan: true,
  redactedExportsOnly: true,
  warnOnNoExpiration: true,
  auditCopyEvents: true,
  auditRevealEvents: true,
  defaultEnvironment: "Development",
  defaultStatus: "Active",
  defaultRiskLevel: "Medium"
};

export function createEmptyEntry(overrides = {}) {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: "",
    provider: "",
    type: "API key",
    category: "Uncategorized",
    purpose: "",
    useCase: "",
    environment: DEFAULT_SETTINGS.defaultEnvironment,
    status: DEFAULT_SETTINGS.defaultStatus,
    riskLevel: DEFAULT_SETTINGS.defaultRiskLevel,
    secretValue: "",
    username: "",
    accountId: "",
    url: "",
    docsUrl: "",
    dashboardUrl: "",
    storagePath: "",
    scopes: "",
    allowedOrigins: "",
    allowedIps: "",
    rateLimit: "",
    rotationCadence: "No expiration",
    expirationDate: "",
    lastVerifiedAt: "",
    owner: "",
    project: "",
    tags: [],
    blockers: "",
    notes: "",
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

export function normalizeEntry(entry) {
  const normalized = createEmptyEntry({
    ...entry,
    id: entry.id || crypto.randomUUID(),
    tags: normalizeTags(entry.tags),
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: entry.updatedAt || new Date().toISOString()
  });

  return normalized;
}

export function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (!tags) {
    return [];
  }

  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function validateEntry(entry, settings = DEFAULT_SETTINGS) {
  const warnings = [];

  if (!entry.name.trim()) {
    warnings.push("Name is required.");
  }

  if (!entry.provider.trim()) {
    warnings.push("Provider is recommended.");
  }

  if (settings.requirePurpose && !entry.purpose.trim() && !entry.useCase.trim()) {
    warnings.push("Purpose or use case is required by vault settings.");
  }

  if (settings.requireRotationPlan && !entry.rotationCadence.trim()) {
    warnings.push("Rotation cadence is required by vault settings.");
  }

  if (settings.warnOnNoExpiration && entry.rotationCadence === "No expiration" && entry.riskLevel !== "Low") {
    warnings.push("No-expiration credentials should be restricted, low-risk, or documented.");
  }

  if (entry.url && !looksLikeUrl(entry.url)) {
    warnings.push("URL should start with https:// or http://.");
  }

  if (entry.dashboardUrl && !looksLikeUrl(entry.dashboardUrl)) {
    warnings.push("Dashboard URL should start with https:// or http://.");
  }

  if (entry.docsUrl && !looksLikeUrl(entry.docsUrl)) {
    warnings.push("Docs URL should start with https:// or http://.");
  }

  return warnings;
}

export function redactEntry(entry) {
  return {
    ...entry,
    secretValue: entry.secretValue ? "••••••••••••" : ""
  };
}

export function looksLikeUrl(value) {
  return /^https?:\/\//i.test(value.trim());
}
