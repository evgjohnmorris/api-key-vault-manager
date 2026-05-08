const SENSITIVE_AUDIT_KEY = /secret|token|password|key/i;
const MAX_AUDIT_EVENTS = 300;

export function sanitizeAuditMetadata(metadata = {}) {
  const safe = {};

  Object.entries(metadata || {}).forEach(([key, value]) => {
    safe[key] = SENSITIVE_AUDIT_KEY.test(key) ? "[redacted]" : value;
  });

  return safe;
}

export function createAuditEvent(action, metadata = {}, options = {}) {
  const idFactory = options.idFactory || (() => crypto.randomUUID());
  const now = options.now || (() => new Date().toISOString());

  return {
    id: idFactory(),
    action,
    metadata: sanitizeAuditMetadata(metadata),
    at: now()
  };
}

export function prependAuditEvent(auditLog = [], action, metadata = {}, options = {}) {
  const maxEvents = Number(options.maxEvents || MAX_AUDIT_EVENTS);
  return [
    createAuditEvent(action, metadata, options),
    ...(Array.isArray(auditLog) ? auditLog : [])
  ].slice(0, maxEvents);
}
