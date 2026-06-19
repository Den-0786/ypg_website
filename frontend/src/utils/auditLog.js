const STORAGE_KEY = "ypg_admin_audit_log";
const MAX_ENTRIES = 100;

export function getAuditLog() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addAuditLog(action) {
  if (typeof window === "undefined") return;
  const username = localStorage.getItem("ypg_admin_user") || "Unknown";
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    username,
    action,
    timestamp: new Date().toISOString(),
  };
  const log = [entry, ...getAuditLog()].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export function clearAuditLog() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
