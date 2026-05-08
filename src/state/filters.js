import { evaluateEntryPolicies } from "../domain/policies.js";
import { getEntryReadiness } from "../domain/readiness.js";

export function filterEntries(entries = [], filters = {}) {
  const normalizedFilters = {
    query: "",
    quick: "All",
    category: "All",
    type: "All",
    status: "All",
    riskLevel: "All",
    ...filters
  };
  const query = String(normalizedFilters.query || "").trim().toLowerCase();

  return entries
    .filter((entry) => matchesQuickFilter(entry, normalizedFilters.quick))
    .filter((entry) => normalizedFilters.category === "All" || entry.category === normalizedFilters.category)
    .filter((entry) => normalizedFilters.type === "All" || entry.type === normalizedFilters.type)
    .filter((entry) => normalizedFilters.status === "All" || entry.status === normalizedFilters.status)
    .filter((entry) => normalizedFilters.riskLevel === "All" || entry.riskLevel === normalizedFilters.riskLevel)
    .filter((entry) => !query || searchableEntryText(entry).includes(query))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function resolveSelectedEntry(entries = [], selectedEntryId = "") {
  if (!entries.length) {
    return { entry: null, selectedEntryId: "" };
  }

  const selected = entries.find((entry) => entry.id === selectedEntryId);
  if (selected) {
    return { entry: selected, selectedEntryId };
  }

  return {
    entry: entries[0],
    selectedEntryId: entries[0].id
  };
}

export function matchesQuickFilter(entry, filter) {
  if (!filter || filter === "All") return true;
  if (filter === "Critical") return entry.riskLevel === "Critical";
  if (filter === "Needs verification") return entry.status === "Needs verification" || !entry.lastVerifiedAt;
  if (filter === "No expiration") return entry.rotationCadence === "No expiration";
  if (filter === "Incomplete") return getEntryReadiness(entry).percent < 75;
  if (filter === "Production") return entry.environment === "Production";
  if (filter === "Policy issues") return evaluateEntryPolicies(entry).length > 0;
  return true;
}

function searchableEntryText(entry) {
  return [
    entry.name,
    entry.provider,
    entry.category,
    entry.purpose,
    entry.useCase,
    entry.url,
    entry.dashboardUrl,
    entry.docsUrl,
    entry.project,
    entry.owner,
    Array.isArray(entry.tags) ? entry.tags.join(" ") : entry.tags
  ]
    .join(" ")
    .toLowerCase();
}
