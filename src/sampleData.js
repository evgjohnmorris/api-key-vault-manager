import { createEmptyEntry } from "./schema.js";

export const SAMPLE_ENTRIES = [
  createEmptyEntry({
    name: "Google Analytics Measurement",
    provider: "Google Analytics",
    type: "Analytics",
    category: "Analytics and attribution",
    purpose: "Analytics collection",
    useCase: "Track application traffic, conversion events, and post performance.",
    environment: "Production",
    status: "Pending setup",
    riskLevel: "Medium",
    secretValue: "",
    url: "https://analytics.google.com/",
    docsUrl: "https://developers.google.com/analytics",
    dashboardUrl: "https://analytics.google.com/",
    scopes: "Analytics read/write permissions only when required.",
    rotationCadence: "No expiration",
    tags: ["google", "analytics", "web"],
    notes: "Store Measurement IDs and API credentials here after setup."
  }),
  createEmptyEntry({
    name: "Ad Network Publisher Account",
    provider: "Ad platform",
    type: "Ad platform",
    category: "Ads and monetization",
    purpose: "Ad serving or monetization",
    useCase: "Place ads on posts, tools, and hosted applications.",
    environment: "Production",
    status: "Needs verification",
    riskLevel: "High",
    secretValue: "",
    url: "https://example.com/",
    scopes: "Publisher reporting and ad-unit management.",
    rotationCadence: "90 days",
    tags: ["ads", "publisher", "monetization"],
    blockers: "Replace this sample with the real network name and setup status."
  }),
  createEmptyEntry({
    name: "AI Model Provider Key",
    provider: "OpenAI-compatible provider",
    type: "AI model provider",
    category: "AI and machine learning",
    purpose: "Model inference",
    useCase: "Server-side model requests for SaaS features and automation.",
    environment: "Development",
    status: "Active",
    riskLevel: "Critical",
    secretValue: "",
    scopes: "Model inference only. Keep billing/admin permissions separate.",
    allowedOrigins: "Server-side only",
    rotationCadence: "60 days",
    tags: ["ai", "llm", "backend"],
    notes: "Never expose AI provider keys in frontend code."
  })
];
