// Neutralize spreadsheet formula injection: prefix cells that a spreadsheet
// app could interpret as a formula (=, +, -, @, tab, CR) with an apostrophe.
export const cellSafe = (v) => {
  const s = v == null ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
};

// Safely parse amounts that may use comma (Romanian convention), period, or spaces.
export const parseAmount = (v) => {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  const cleaned = String(v).trim().replace(/\s/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Format amounts as Romanian RON with 2 decimals
export const formatAmount = (v) => {
  const num = parseAmount(v);
  return num.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Whole days between today and a "YYYY-MM-DD" date string (negative = overdue).
// Returns null if the date string is invalid to prevent NaN glitches.
export const daysUntil = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const cleaned = dateStr.trim();
  if (!cleaned) return null;
  const target = new Date(cleaned.includes("T") ? cleaned : cleaned + "T00:00:00");
  if (isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};

// Safe date string formatter (e.g. "4 sep. 2026")
export const formatDate = (dateStr, lang = "ro") => {
  if (!dateStr) return "";
  try {
    const cleaned = String(dateStr).trim();
    const d = new Date(cleaned.includes("T") ? cleaned : cleaned + "T12:00:00");
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return String(dateStr);
  }
};

// Safe date-time formatter for status history (e.g. "4 sep., 14:30")
export const formatDateTime = (isoStr, lang = "ro") => {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return String(isoStr);
    return d.toLocaleString(lang === "en" ? "en-GB" : "ro-RO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return String(isoStr);
  }
};

// Copy to clipboard with a robust fallback for insecure contexts, iframes, and mobile browsers.
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
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, 99999);
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

// Unique id generator with cryptographic fallback.
export const uid = () => {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) { /* fall through */ }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
};

