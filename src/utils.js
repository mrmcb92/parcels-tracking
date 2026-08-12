// Neutralize spreadsheet formula injection: prefix cells that a spreadsheet
// app could interpret as a formula (=, +, -, @, tab, CR) with an apostrophe.
export const cellSafe = (v) => {
  const s = v==null ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'"+s : s;
};

// Whole days between today and a "YYYY-MM-DD" date string (negative = overdue).
export const daysUntil = (dateStr) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr+"T00:00:00");
  return Math.round((target-today)/86400000);
};

// Copy to clipboard with a fallback for insecure contexts / old browsers.
export const copyText = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
};

// Absolute base URL of the current app location (works on any deployment).
export const appBaseUrl = () =>
  `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

// Unique id. crypto.randomUUID() exists only in secure contexts (https or
// localhost), so a fallback is needed when the app is reached over plain
// http on a LAN IP (e.g. phone testing against the dev server).
export const uid = () => {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) { /* fall through */ }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
};
