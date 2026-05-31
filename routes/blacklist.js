/**
 * routes/blacklist.js
 *
 * GET    /api/blacklist            — list all (paginated, public)
 * GET    /api/blacklist/:id        — get one
 * POST   /api/blacklist            — add entry (admin)
 * PATCH  /api/blacklist/:id        — update entry (admin)
 * DELETE /api/blacklist/:id        — remove entry (admin)
 * POST   /api/blacklist/:id/report — increment report count (public)
 */

const crypto      = require("crypto");
const db          = require("../utils/db");
const { sendJSON, sendError, paginated } = require("../utils/response");
const { validateBlacklist } = require("../utils/validate");
const { requireAdmin } = require("../middleware/authMiddleware");

function router(req, res) {
  const { method, pathname } = req;
  const parts = pathname.split("/").filter(Boolean);
  const id    = parts[2];
  const sub   = parts[3]; // e.g. "report"

  if (method === "GET"    && !id)          return getAll(req, res);
  if (method === "GET"    && id)           return getOne(req, res, id);
  if (method === "POST"   && !id)          return create(req, res);
  if (method === "PATCH"  && id && !sub)   return update(req, res, id);
  if (method === "DELETE" && id)           return remove(req, res, id);
  if (method === "POST"   && sub === "report") return incrementReport(req, res, id);

  sendError(res, 405, "Method not allowed");
}

function getAll(req, res) {
  const { page = 1, limit = 20, platform, scamType, q, status } = req.query;
  const filters = {};
  if (platform) filters.platform = platform;
  if (scamType) filters.scamType = scamType;
  if (status)   filters.status   = status;

  let result = db.paginate("blacklist", {
    page: Number(page), limit: Number(limit),
    filters, sortBy: "reportCount", order: "desc",
  });

  if (q) {
    const kw = q.toLowerCase();
    result.items = result.items.filter(r =>
      [r.name, r.platform, r.scamType].some(v => v && v.toLowerCase().includes(kw))
    );
    result.total = result.items.length;
  }

  paginated(res, result, {
    meta: {
      total_confirmed: db.count("blacklist", { status: "confirmed" }),
      platforms: [...new Set(db.getAll("blacklist").map(r => r.platform))],
    },
  });
}

function getOne(req, res, id) {
  const entry = db.getById("blacklist", id);
  if (!entry) return sendError(res, 404, "Blacklist entry not found");
  sendJSON(res, 200, { data: entry });
}

function create(req, res) {
  if (!requireAdmin(req, res)) return;
  const body   = req.body || {};
  const errors = validateBlacklist(body);
  if (errors.length) return sendError(res, 422, "Validation failed", errors.join("; "));

  const entry = {
    id:          `bl_${crypto.randomUUID().replace(/-/g,"").slice(0,10)}`,
    name:        sanitise(body.name),
    platform:    sanitise(body.platform),
    scamType:    sanitise(body.scamType),
    description: sanitise(body.description || ""),
    reportCount: Number(body.reportCount) || 1,
    status:      body.status || "confirmed",
    addedAt:     new Date().toISOString(),
    createdAt:   new Date().toISOString(),
  };

  db.insert("blacklist", entry);
  db.insert("audit_log", { id: crypto.randomUUID(), action:"BLACKLIST_ADDED", target: entry.id, at: new Date().toISOString() });

  sendJSON(res, 201, { message: "Entry added to blacklist", data: entry });
}

function update(req, res, id) {
  if (!requireAdmin(req, res)) return;
  const entry = db.getById("blacklist", id);
  if (!entry) return sendError(res, 404, "Entry not found");

  const body    = req.body || {};
  const allowed = ["name","platform","scamType","description","status","reportCount"];
  const updates = {};
  allowed.forEach(k => { if (body[k] !== undefined) updates[k] = sanitise(String(body[k])); });

  const updated = db.update("blacklist", id, updates);
  sendJSON(res, 200, { message: "Entry updated", data: updated });
}

function remove(req, res, id) {
  if (!requireAdmin(req, res)) return;
  const ok = db.delete("blacklist", id);
  if (!ok) return sendError(res, 404, "Entry not found");
  sendJSON(res, 200, { message: "Entry removed from blacklist" });
}

function incrementReport(req, res, id) {
  const entry = db.getById("blacklist", id);
  if (!entry) return sendError(res, 404, "Entry not found");
  const updated = db.update("blacklist", id, { reportCount: (entry.reportCount || 0) + 1 });
  sendJSON(res, 200, { message: "Report count updated", reportCount: updated.reportCount });
}

function sanitise(v = "") { return String(v).replace(/[<>]/g, "").trim().slice(0, 500); }

module.exports = { router };
