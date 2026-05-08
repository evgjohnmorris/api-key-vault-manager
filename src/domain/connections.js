import { REQUIRED_TOOLING_IDS, TOOLING_INTEGRATIONS, getToolingIntegration } from "./toolingIntegrations.js";

export function getConnectionCatalog() {
  return TOOLING_INTEGRATIONS.map(toConnectionRecord);
}

export function getConnectionRecord(id) {
  const integration = getToolingIntegration(id);
  return integration ? toConnectionRecord(integration) : null;
}

export function buildConnectionLaunchpad(entry) {
  const connection = findConnectionForEntry(entry);
  const customSurfaces = [
    entry.dashboardUrl ? { label: "Entry dashboard", url: entry.dashboardUrl, kind: "dashboard" } : null,
    entry.docsUrl ? { label: "Entry docs", url: entry.docsUrl, kind: "docs" } : null,
    entry.url ? { label: "Service URL", url: entry.url, kind: "service" } : null
  ].filter(Boolean);

  if (!connection) {
    return {
      matched: false,
      connection: null,
      surfaces: customSurfaces,
      missingFields: [],
      setupChecklist: [],
      smokeSignals: [],
      adapterStatus: "manual-only",
      safety: "No catalog adapter is matched. Keep this record local-only and add owner, purpose, scopes, docs, and dashboard links before use."
    };
  }

  return {
    matched: true,
    connection,
    surfaces: mergeSurfaces(connection.surfaces, customSurfaces),
    missingFields: connection.requiredVaultFields.filter((field) => !hasEntryValue(entry, field)),
    setupChecklist: connection.setupChecklist,
    smokeSignals: connection.smokeSignals,
    adapterStatus: connection.adapterStatus,
    safety: connection.safety
  };
}

export function findConnectionForEntry(entry = {}) {
  const text = [
    entry.provider,
    entry.name,
    entry.category,
    entry.type,
    entry.purpose,
    entry.useCase,
    ...(Array.isArray(entry.tags) ? entry.tags : [])
  ].filter(Boolean).join(" ").toLowerCase();

  return getConnectionCatalog().find((connection) => {
    return text.includes(connection.id)
      || text.includes(connection.name.toLowerCase())
      || connection.matchTerms.some((term) => text.includes(term));
  }) || null;
}

export function getConnectionReadinessSummary(entries = []) {
  const launchpads = entries.map(buildConnectionLaunchpad);
  const matched = launchpads.filter((launchpad) => launchpad.matched).length;
  const withSurfaces = launchpads.filter((launchpad) => launchpad.surfaces.length > 0).length;
  const missingFieldCount = launchpads.reduce((total, launchpad) => total + launchpad.missingFields.length, 0);

  return {
    total: entries.length,
    matched,
    unmatched: entries.length - matched,
    withSurfaces,
    missingFieldCount,
    requiredCatalogReady: REQUIRED_TOOLING_IDS.every((id) => Boolean(getConnectionRecord(id)))
  };
}

function toConnectionRecord(integration) {
  return {
    id: integration.id,
    name: integration.name,
    category: integration.category,
    readinessTier: integration.readinessTier,
    benefit: integration.benefit,
    authModel: integration.authModel,
    secretStorage: integration.secretStorage,
    localCommand: integration.localCommand,
    connectionMode: integration.connectionMode,
    requiredVaultFields: integration.requiredVaultFields,
    setupChecklist: integration.setupChecklist,
    smokeSignals: integration.smokeSignals,
    adapterStatus: "disabled-by-default",
    safety: "Launch links are informational only. Runtime network access remains disabled by CSP, and live adapters require explicit future implementation.",
    matchTerms: [integration.id, integration.name, ...(integration.tags || [])].map((term) => term.toLowerCase()),
    surfaces: [
      { label: `${integration.name} dashboard`, url: integration.dashboardUrl, kind: "dashboard" },
      { label: `${integration.name} docs`, url: integration.docsUrl, kind: "docs" }
    ].filter((surface) => surface.url)
  };
}

function mergeSurfaces(catalogSurfaces, entrySurfaces) {
  const surfaces = [...entrySurfaces, ...catalogSurfaces];
  const seen = new Set();
  return surfaces.filter((surface) => {
    const key = `${surface.kind}:${surface.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hasEntryValue(entry, field) {
  const value = entry[field];
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(String(value || "").trim());
}
