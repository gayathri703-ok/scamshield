/**
 * routes/stats.js
 *
 * GET /api/stats
 * GET /api/stats/admin
 * GET /api/stats/tips
 */

const db = require("../utils/db");

const {
  sendJSON,
} = require("../utils/response");

const {
  requireAdmin,
} = require("../middleware/authMiddleware");

/* ───────────────────────────────────────────── */

function router(req, res) {
  const { method, pathname } = req;

  const parts = pathname
    .split("/")
    .filter(Boolean);

  const sub = parts[2];

  // GET /api/stats
  if (method === "GET" && !sub) {
    return publicStats(req, res);
  }

  // GET /api/stats/admin
  if (
    method === "GET" &&
    sub === "admin"
  ) {
    return adminStats(req, res);
  }

  // GET /api/stats/tips
  if (
    method === "GET" &&
    sub === "tips"
  ) {
    return tips(req, res);
  }

  sendJSON(res, 405, {
    error: "Method not allowed",
  });
}

/* ───────────────────────────────────────────── */

function publicStats(req, res) {
  const reports =
    db.getAll("reports");

  const blacklist =
    db.getAll("blacklist");

  const byType = {};

  reports.forEach((r) => {
    byType[r.scamType] =
      (byType[r.scamType] || 0) + 1;
  });

  const byStatus = {};

  reports.forEach((r) => {
    byStatus[r.status] =
      (byStatus[r.status] || 0) + 1;
  });

  sendJSON(res, 200, {
    data: {
      studentsWarned:
        10000 + reports.length * 3,

      totalReports:
        reports.length,

      confirmedScammers:
        blacklist.filter(
          (b) =>
            b.status === "confirmed"
        ).length,

      pendingReviews:
        reports.filter(
          (r) =>
            r.status === "pending"
        ).length,

      reportsByType:
        byType,

      reportsByStatus:
        byStatus,

      topScamTypes:
        topN(byType, 5),

      recentReports:
        reports
          .slice(0, 5)
          .map(stripPII),

      blacklistTotal:
        blacklist.length,

      lastUpdated:
        new Date().toISOString(),
    },
  });
}

/* ───────────────────────────────────────────── */

function adminStats(req, res) {
  if (!requireAdmin(req, res)) {
    return;
  }

  const reports =
    db.getAll("reports");

  const blacklist =
    db.getAll("blacklist");

  const auditLog =
    db.getAll("audit_log");

  const now = Date.now();

  const perDay = {};

  reports.forEach((r) => {
    const date =
      r.createdAt.slice(0, 10);

    const timestamp =
      new Date(date).getTime();

    if (
      now - timestamp <
      30 * 24 * 60 * 60 * 1000
    ) {
      perDay[date] =
        (perDay[date] || 0) + 1;
    }
  });

  const byPlatform = {};

  reports.forEach((r) => {
    byPlatform[r.platform] =
      (byPlatform[r.platform] || 0) + 1;
  });

  sendJSON(res, 200, {
    data: {
      reports: {
        total:
          reports.length,

        pending:
          reports.filter(
            (r) =>
              r.status === "pending"
          ).length,

        reviewing:
          reports.filter(
            (r) =>
              r.status === "reviewing"
          ).length,

        confirmed:
          reports.filter(
            (r) =>
              r.status === "confirmed"
          ).length,

        dismissed:
          reports.filter(
            (r) =>
              r.status === "dismissed"
          ).length,

        perDay,

        byPlatform,
      },

      blacklist: {
        total:
          blacklist.length,

        confirmed:
          blacklist.filter(
            (b) =>
              b.status === "confirmed"
          ).length,

        topEntries:
          blacklist
            .sort(
              (a, b) =>
                b.reportCount -
                a.reportCount
            )
            .slice(0, 10),
      },

      auditLog:
        auditLog.slice(0, 20),

      exportUrl:
        "/api/reports/export",
    },
  });
}

/* ───────────────────────────────────────────── */

function tips(req, res) {
  const all =
    db.getAll("tips_slider");

  sendJSON(res, 200, {
    data: all,
  });
}

/* ───────────────────────────────────────────── */

function topN(obj, n) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({
      label,
      count,
    }));
}

function stripPII(report) {
  const {
    reporterEmail,
    ipHash,
    ...safe
  } = report;

  return safe;
}

/* ───────────────────────────────────────────── */

module.exports = {
  router,
};
