/**
 * middleware/auth.js — Simple token-based admin auth
 * Admin token is stored in data/users.json (hashed).
 * Pass header: X-Admin-Token: <raw-token>
 */

const crypto    = require("crypto");
const db        = require("../utils/db");
const { sendError } = require("../utils/response");

// For simplicity, admin token = sha256("admin@scamshield123")
// In production replace with JWT or session tokens.
const ADMIN_PASS = "admin@scamshield123";
const ADMIN_HASH = crypto.createHash("sha256").update(ADMIN_PASS).digest("hex");

function requireAdmin(req, res) {
  const token = req.headers["x-admin-token"] || "";
  const hash  = crypto.createHash("sha256").update(token).digest("hex");
  if (hash !== ADMIN_HASH) {
    sendError(res, 401, "Unauthorized. Admin token required.");
    return false;
  }
  return true;
}

module.exports = { requireAdmin, ADMIN_HASH };
