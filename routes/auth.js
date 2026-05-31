/**
 * routes/auth.js
 *
 * POST /api/auth/login
 * GET  /api/auth/verify
 */

const crypto = require("crypto");

const {
  sendJSON,
  sendError,
} = require("../utils/response");

const {
  ADMIN_HASH,
} = require("../middleware/authMiddleware");

/* ───────────────────────────────────────────── */

function router(req, res) {
  const { method, pathname } = req;

  const parts = pathname
    .split("/")
    .filter(Boolean);

  const sub = parts[2];

  // POST /api/auth/login
  if (
    method === "POST" &&
    sub === "login"
  ) {
    return login(req, res);
  }

  // GET /api/auth/verify
  if (
    method === "GET" &&
    sub === "verify"
  ) {
    return verify(req, res);
  }

  sendError(
    res,
    405,
    "Method not allowed"
  );
}

/* ───────────────────────────────────────────── */

function login(req, res) {
  const body = req.body || {};

  const token = body.token || "";

  const hash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  if (hash !== ADMIN_HASH) {
    return sendError(
      res,
      401,
      "Invalid admin token"
    );
  }

  sendJSON(res, 200, {
    success: true,
    message: "Admin authenticated",
    token,
  });
}

/* ───────────────────────────────────────────── */

function verify(req, res) {
  const token =
    req.headers["x-admin-token"] || "";

  const hash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  sendJSON(res, 200, {
    authenticated:
      hash === ADMIN_HASH,
  });
}

/* ───────────────────────────────────────────── */

module.exports = {
  router,
};