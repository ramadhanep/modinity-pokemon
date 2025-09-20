/**
 * Parse "CODE: message" produced by useApi() into { code, message }.
 * Falls back to generic shapes but stays minimal on purpose.
 */
const parseApiError = (err) => {
  // Native Error with "CODE: message"
  if (err instanceof Error && typeof err.message === "string") {
    const m = err.message.trim();
    const i = m.indexOf(":");
    if (i > 0) {
      const code = m.slice(0, i).trim();
      const message = m.slice(i + 1).trim() || code;
      return { code, message };
    }
    return { code: "ERROR", message: m || "Unknown error" };
  }

  // Plain string "CODE: message" or just "message"
  if (typeof err === "string") {
    const m = err.trim();
    const i = m.indexOf(":");
    if (i > 0) {
      const code = m.slice(0, i).trim();
      const message = m.slice(i + 1).trim() || code;
      return { code, message };
    }
    return { code: "ERROR", message: m || "Unknown error" };
  }

  // Minimal fallback
  return { code: "ERROR", message: "Unknown error" };
};

/**
 * Map known codes used in the app to friendly messages.
 * Only handles: TEAM_FULL, DUPLICATE, VALIDATION.
 * Everything else returns the parsed message (cleaned).
 */
export const humanizeApiError = (err) => {
  const { code, message } = parseApiError(err);
  const C = String(code || "").toUpperCase();

  if (C.includes("TEAM_FULL")) return "Team is full (max 6).";
  if (C.includes("DUPLICATE")) return "Already exists, cannot duplicate.";
  if (C.includes("VALIDATION")) return "Missing or invalid fields.";

  // Clean "ERROR:" prefix if present; keep it short but don't over-process
  return (
    String(message || "")
      .replace(/^ERROR:?\s*/i, "")
      .trim() || "Something went wrong."
  );
};
