/**
 * middleware/rateLimiter.js
 * Simple in-memory rate limiter — no Redis needed.
 * Window: 15 min / 100 requests per IP.
 * Stricter on POST /api/reports: 5 per 10 min per IP.
 */

const { sendError } = require("../utils/response");

const store = new Map(); // ip -> { count, resetAt }

const GLOBAL_LIMIT  = 100;
const GLOBAL_WINDOW = 15 * 60 * 1000;

const REPORT_LIMIT  = 5;
const REPORT_WINDOW = 10 * 60 * 1000;

function getIP(req) {
  return (req.headers["x-forwarded-for"] || "").split(",")[0].trim()
      || req.socket.remoteAddress
      || "unknown";
}

function check(key, limit, window) {
  const now  = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + window });
    return false; // not limited
  }
  entry.count++;
  if (entry.count > limit) return true; // limited
  return false;
}

// Periodically clean up expired entries
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store) { if (now > v.resetAt) store.delete(k); }
}, 5 * 60 * 1000);

function rateLimiter(req, res) {
  const ip = getIP(req);

  // Strict limit for report submission
  if (req.method === "POST" && req.pathname === "/api/reports") {
    if (check(`report:${ip}`, REPORT_LIMIT, REPORT_WINDOW)) {
      sendError(res, 429, "Too many report submissions. Try again in 10 minutes.");
      return true;
    }
  }

  // Global limit
  if (check(`global:${ip}`, GLOBAL_LIMIT, GLOBAL_WINDOW)) {
    sendError(res, 429, "Rate limit exceeded. Try again in 15 minutes.");
    return true;
  }

  return false;
}

module.exports = { rateLimiter };
