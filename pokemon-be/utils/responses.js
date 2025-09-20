/**
 * Send a JSON success payload with consistent HTTP status handling.
 * Keeping this helper lightweight prevents unnecessary envelope changes.
 */
function sendSuccess(res, data, status = 200) {
  return res.status(status).json(data);
}

/**
 * Send a JSON error payload.
 * @param {object} res Express response object
 * @param {number} status HTTP status code (default 500)
 * @param {string} message Human-readable error message
 * @param {string} code Machine-readable error code
 */
function sendError(res, status = 500, message = "internal", code = "INTERNAL_ERROR") {
  return res.status(status).json({ error: message, code });
}

/**
 * Log the error with context and send a standardized internal error response.
 */
function sendInternalError(res, err, context = "") {
  const prefix = context ? `${context} error:` : "Unhandled error:";
  console.error(prefix, err);
  return sendError(res, 500, "internal", "INTERNAL_ERROR");
}

module.exports = {
  sendSuccess,
  sendError,
  sendInternalError,
};
