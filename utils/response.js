/**
 * utils/response.js — Standardised API response helpers
 */

function sendJSON(res, status, data) {
  const body = JSON.stringify({ success: status < 400, ...data });
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendError(res, status, message, detail = null) {
  const body = { success: false, error: message };
  if (detail && process.env.NODE_ENV !== "production") body.detail = detail;
  sendJSON(res, status, body);
}

function paginated(res, result, extra = {}) {
  sendJSON(res, 200, {
    data: result.items,
    pagination: {
      total: result.total,
      page:  result.page,
      limit: result.limit,
      pages: result.pages,
    },
    ...extra,
  });
}

module.exports = { sendJSON, sendError, paginated };
