import { policySeverityClass } from "../domain/policies.js";
import { escapeAttr, escapeHtml, percentBucketClass } from "./html.js";

export function renderCommandCenter(commandCenter) {
  const actionMarkup = commandCenter.actions.length
    ? commandCenter.actions.map((action) => `
      <button class="command-action" type="button" data-command-action="${escapeAttr(action.action)}">
        <strong>${escapeHtml(action.label)}</strong>
        <span>${escapeHtml(action.detail)}</span>
      </button>
    `).join("")
    : `
      <div class="command-action is-passive">
        <strong>Vault is calm</strong>
        <span>No urgent action surfaced from the current evidence.</span>
      </div>
    `;

  return `
    <section class="command-center">
      <div class="section-label">Operations cockpit</div>
      <div class="health-panel">
        <div class="health-orb ${percentBucketClass("score", commandCenter.healthScore)}">
          <strong>${commandCenter.healthScore}</strong>
          <span>health</span>
        </div>
        <div>
          <h2>Credential readiness</h2>
          <p class="muted small">Average entry completeness is ${commandCenter.averageReadiness}%. This blends metadata, restrictions, rotation, verification, and evidence.</p>
        </div>
      </div>
      <div class="command-metrics">
        <span>${commandCenter.incomplete} incomplete</span>
        <span>${commandCenter.riskyNoExpiration} risky no-expiration</span>
        <span>${commandCenter.needsVerification} verify</span>
        <span>${commandCenter.production} production</span>
      </div>
      <div class="command-actions">${actionMarkup}</div>
    </section>
  `;
}

export function renderOperationalPhysics(physics) {
  const vectors = physics.vectors.map((vector) => {
    const vectorClass = vector.direction === "lower" ? "is-inverse" : "is-forward";
    const forceLabel = vector.direction === "lower" ? "reduce" : "build";

    return `
      <article class="physics-vector ${vectorClass}">
        <div class="physics-vector-head">
          <strong>${escapeHtml(vector.label)}</strong>
          <span>${vector.value}%</span>
        </div>
        <div class="readiness-meter physics-meter" aria-label="${escapeAttr(vector.label)} force ${vector.value}%">
          <span class="${percentBucketClass("fill", vector.value)}"></span>
        </div>
        <p>${escapeHtml(vector.detail)}</p>
        <small>${escapeHtml(forceLabel)} force</small>
      </article>
    `;
  }).join("");

  return `
    <section class="physics-panel">
      <div class="physics-panel-header">
        <div>
          <div class="section-label">Operational physics</div>
          <h2>${escapeHtml(physics.state)} system</h2>
        </div>
        <div class="physics-stability ${percentBucketClass("score", physics.stability)}">
          <strong>${physics.stability}</strong>
          <span>stability</span>
        </div>
      </div>
      <p class="muted small">${escapeHtml(physics.summary)}</p>
      <div class="physics-grid">${vectors}</div>
      <div class="command-metrics physics-metrics">
        <span>${physics.counts.recentActivity} recent audit events</span>
        <span>${physics.gravity}% gravity</span>
        <span>${physics.averageReadiness}% avg readiness</span>
      </div>
    </section>
  `;
}

export function renderPolicyPanel(policy) {
  const topViolations = policy.violations.slice(0, 4);
  const violationMarkup = topViolations.length
    ? topViolations.map((violation) => `
      <button class="policy-item" type="button" data-command-action="Policy issues">
        <span class="pill ${policySeverityClass(violation.severity)}">${escapeHtml(violation.severity)}</span>
        <strong>${escapeHtml(violation.title)}</strong>
        <small>${escapeHtml(violation.entryName)} · ${escapeHtml(violation.detail)}</small>
      </button>
    `).join("")
    : `
      <div class="policy-item is-passive">
        <span class="pill active">Clear</span>
        <strong>Policy gate is clean</strong>
        <small>No entry currently violates the local policy rules.</small>
      </div>
    `;

  return `
    <section class="policy-panel">
      <div class="policy-panel-header">
        <div>
          <div class="section-label">Policy gate</div>
          <h2>${policy.score}% release confidence</h2>
        </div>
        <div class="policy-score ${percentBucketClass("score", policy.score)}">
          <strong>${policy.score}</strong>
          <span>policy</span>
        </div>
      </div>
      <div class="command-metrics">
        <span>${policy.bySeverity.Critical} critical</span>
        <span>${policy.bySeverity.High} high</span>
        <span>${policy.bySeverity.Medium} medium</span>
        <span>${policy.entriesWithViolations} entries</span>
      </div>
      <div class="policy-list">${violationMarkup}</div>
    </section>
  `;
}
