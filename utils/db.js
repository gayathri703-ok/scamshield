/**
 * utils/db.js — Lightweight JSON file database
 * Stores: reports, blacklist, users, audit_log
 */

const fs   = require("fs");
const path = require("path");

const DB_DIR  = path.join(__dirname, "../data");
const TABLES  = ["reports", "blacklist", "users", "audit_log", "tips_slider"];

// ── Helpers ────────────────────────────────────────────────────────────────
function filePath(table) {
  return path.join(DB_DIR, `${table}.json`);
}

function read(table) {
  const fp = filePath(table);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); }
  catch { return []; }
}

function write(table, data) {
  fs.writeFileSync(filePath(table), JSON.stringify(data, null, 2), "utf8");
}

// ── Public API ─────────────────────────────────────────────────────────────
const db = {
  // Initialise all tables with seed data if empty
  init() {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

    TABLES.forEach(t => {
      if (!fs.existsSync(filePath(t))) write(t, []);
    });

    // Seed blacklist if empty
    if (read("blacklist").length === 0) {
      write("blacklist", SEED_BLACKLIST);
    }

    // Seed tips_slider if empty
    if (read("tips_slider").length === 0) {
      write("tips_slider", SEED_TIPS);
    }

    // Seed admin user if no users
    if (read("users").length === 0) {
      const crypto = require("crypto");
      const hash   = crypto.createHash("sha256").update("admin@scamshield123").digest("hex");
      write("users", [{
        id: "usr_admin",
        username: "admin",
        email: "admin@scamshield.in",
        passwordHash: hash,
        role: "admin",
        createdAt: new Date().toISOString(),
      }]);
    }

    console.log("[DB] Initialised — tables:", TABLES.join(", "));
  },

  // ── CRUD helpers ──────────────────────────────────────────────────────
  getAll(table, filters = {}) {
    let rows = read(table);
    Object.keys(filters).forEach(k => {
      if (filters[k] !== undefined && filters[k] !== "") {
        rows = rows.filter(r =>
          String(r[k]).toLowerCase().includes(String(filters[k]).toLowerCase())
        );
      }
    });
    return rows;
  },

  getById(table, id) {
    return read(table).find(r => r.id === id) || null;
  },

  insert(table, record) {
    const rows = read(table);
    rows.unshift(record); // newest first
    write(table, rows);
    return record;
  },

  update(table, id, updates) {
    const rows   = read(table);
    const idx    = rows.findIndex(r => r.id === id);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...updates, updatedAt: new Date().toISOString() };
    write(table, rows);
    return rows[idx];
  },

  delete(table, id) {
    const rows    = read(table);
    const filtered = rows.filter(r => r.id !== id);
    if (filtered.length === rows.length) return false;
    write(table, filtered);
    return true;
  },

  count(table, filters = {}) {
    return db.getAll(table, filters).length;
  },

  paginate(table, { page = 1, limit = 10, filters = {}, sortBy = "createdAt", order = "desc" } = {}) {
    let rows = db.getAll(table, filters);
    rows.sort((a, b) => {
      if (order === "desc") return (a[sortBy] < b[sortBy] ? 1 : -1);
      return (a[sortBy] > b[sortBy] ? 1 : -1);
    });
    const total = rows.length;
    const start = (page - 1) * limit;
    const items = rows.slice(start, start + limit);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },
};

// ── Seed Data ──────────────────────────────────────────────────────────────
const SEED_BLACKLIST = [
  { id:"bl_001", name:"wipro.hr.india@gmail.com",         platform:"Email",    scamType:"Registration Fee",    reportCount:47, status:"confirmed", addedAt:"2025-01-10T00:00:00Z", createdAt:"2025-01-10T00:00:00Z" },
  { id:"bl_002", name:"TCS Recruitment (Telegram)",       platform:"Telegram", scamType:"Fake Internship",     reportCount:89, status:"confirmed", addedAt:"2025-01-15T00:00:00Z", createdAt:"2025-01-15T00:00:00Z" },
  { id:"bl_003", name:"infosys-careers.net",              platform:"Website",  scamType:"Phishing Site",       reportCount:63, status:"confirmed", addedAt:"2025-02-01T00:00:00Z", createdAt:"2025-02-01T00:00:00Z" },
  { id:"bl_004", name:"accenture.jobs.official@gmail.com",platform:"Email",    scamType:"Data Theft",          reportCount:31, status:"confirmed", addedAt:"2025-02-10T00:00:00Z", createdAt:"2025-02-10T00:00:00Z" },
  { id:"bl_005", name:"HCL Work From Home Group",         platform:"WhatsApp", scamType:"Advance Fee Fraud",   reportCount:54, status:"confirmed", addedAt:"2025-03-05T00:00:00Z", createdAt:"2025-03-05T00:00:00Z" },
  { id:"bl_006", name:"amazon-india-jobs.org",            platform:"Website",  scamType:"Identity Theft",      reportCount:78, status:"confirmed", addedAt:"2025-03-20T00:00:00Z", createdAt:"2025-03-20T00:00:00Z" },
  { id:"bl_007", name:"deloitte.freshers2025@gmail.com",  platform:"Email",    scamType:"Fake Offer Letter",   reportCount:22, status:"confirmed", addedAt:"2025-04-01T00:00:00Z", createdAt:"2025-04-01T00:00:00Z" },
  { id:"bl_008", name:"Google India WFH (Telegram)",      platform:"Telegram", scamType:"Payment Fraud",       reportCount:112,status:"confirmed", addedAt:"2025-04-15T00:00:00Z", createdAt:"2025-04-15T00:00:00Z" },
  { id:"bl_009", name:"cognizant.freshers@yahoo.com",     platform:"Email",    scamType:"Registration Scam",   reportCount:19, status:"confirmed", addedAt:"2025-05-01T00:00:00Z", createdAt:"2025-05-01T00:00:00Z" },
];

const SEED_TIPS = [
  { id:"tip_001", text:"Never pay a registration fee for any job or internship. Legitimate companies do not charge candidates.", category:"payment" },
  { id:"tip_002", text:"Real MNC recruiters use official company email domains — never Gmail, Yahoo, or Hotmail.", category:"email" },
  { id:"tip_003", text:"Verify company registration on mca.gov.in before sharing any personal documents.", category:"verification" },
  { id:"tip_004", text:"No genuine company conducts interviews via WhatsApp or Telegram.", category:"platform" },
  { id:"tip_005", text:"If a salary offer sounds too good for a fresher — it's bait. Research market rates on Glassdoor.", category:"salary" },
  { id:"tip_006", text:"Always check the exact URL spelling — scammers create near-identical domains to fool you.", category:"phishing" },
  { id:"tip_007", text:"Use masked Aadhaar (from uidai.gov.in) when submitting ID online. Never share full Aadhaar freely.", category:"identity" },
  { id:"tip_008", text:"Report cybercrime immediately at cybercrime.gov.in or call 1930.", category:"reporting" },
];

module.exports = db;
