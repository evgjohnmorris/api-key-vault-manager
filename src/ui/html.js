export function renderInput(label, name, value = "", placeholder = "", type = "text", className = "") {
  return `
    <div class="field ${escapeAttr(className)}">
      <label for="${escapeAttr(name)}">${escapeHtml(label)}</label>
      <input id="${escapeAttr(name)}" name="${escapeAttr(name)}" type="${escapeAttr(type)}" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder)}">
    </div>
  `;
}

export function renderTextarea(label, name, value = "", className = "") {
  return `
    <div class="field ${escapeAttr(className)}">
      <label for="${escapeAttr(name)}">${escapeHtml(label)}</label>
      <textarea id="${escapeAttr(name)}" name="${escapeAttr(name)}">${escapeHtml(value)}</textarea>
    </div>
  `;
}

export function renderSelectField(label, name, options, selected, includeBlank = false) {
  return `
    <div class="field">
      <label for="${escapeAttr(name)}">${escapeHtml(label)}</label>
      ${renderSelect(name, includeBlank ? ["", ...options] : options, selected, label)}
    </div>
  `;
}

export function renderSelect(id, options, selected, label = "") {
  const aria = label ? ` aria-label="${escapeAttr(label)}"` : "";
  return `
    <select id="${escapeAttr(id)}" name="${escapeAttr(id)}"${aria}>
      ${options.map((option) => `<option value="${escapeAttr(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option || `Select ${label.toLowerCase()}`)}</option>`).join("")}
    </select>
  `;
}

export function renderPill(label, className = "") {
  return `<span class="pill ${escapeAttr(className)}">${escapeHtml(label)}</span>`;
}

export function linkOrText(value) {
  if (!value) return "";
  if (!/^https?:\/\//i.test(value)) return value;
  return `<a href="${escapeAttr(value)}" target="_blank" rel="noreferrer noopener">${escapeHtml(value)}</a>`;
}

export function statusClass(status) {
  if (status === "Active") return "active";
  if (status === "Blocked" || status === "Revoked" || status === "Expired") return "critical";
  if (status === "Pending setup" || status === "Needs verification") return "pending";
  return "";
}

export function standardsStatusClass(status) {
  if (status === "Implemented" || status === "Review ready" || status === "Accepted" || status === "Not applicable") return "active";
  if (status === "Needs evidence" || status === "Planned") return "pending";
  return "";
}

export function priorityClass(priority = "") {
  if (priority === "Critical") return "critical";
  if (priority === "High") return "high";
  if (priority === "Medium") return "medium";
  return "low";
}

export function percentBucketClass(prefix, value) {
  const bucket = Math.max(0, Math.min(100, Math.round(Number(value || 0) / 10) * 10));
  return `${prefix}-${bucket}`;
}

export function formatDate(value) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function escapeAttr(value) {
  return escapeHtml(value);
}
