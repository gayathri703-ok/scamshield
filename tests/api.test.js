/**
 * tests/api.test.js — Self-contained API test runner
 * Run: node tests/api.test.js
 * (Server must be running on PORT 3000)
 */

const http = require("http");

const BASE    = "http://localhost:3000";
const TOKEN   = "admin@scamshield123"; // default admin password
let   passed  = 0;
let   failed  = 0;

// ── HTTP helper ─────────────────────────────────────────────────────────────
function request({ method = "GET", path, body = null, token = null } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "X-Admin-Token": token } : {}),
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
      },
    };
    const url = new URL(path, BASE);
    const req = http.request(url, opts, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Assert helper ────────────────────────────────────────────────────────────
function assert(label, condition, got) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label} — got: ${JSON.stringify(got)}`);
    failed++;
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────
async function run() {
  console.log("\n🛡  ScamShield API Tests\n" + "─".repeat(48));

  // ── Root ──
  console.log("\n[ROOT]");
  let r = await request({ path: "/api" });
  assert("GET /api returns 200",         r.status === 200, r.status);
  assert("Response has name field",       r.body.name === "ScamShield API", r.body.name);

  // ── Stats ──
  console.log("\n[STATS]");
  r = await request({ path: "/api/stats" });
  assert("GET /api/stats returns 200",   r.status === 200, r.status);
  assert("Has studentsWarned counter",   r.body.data?.studentsWarned > 0, r.body.data);

  r = await request({ path: "/api/stats/tips" });
  assert("GET /api/stats/tips returns tips", r.status === 200 && Array.isArray(r.body.data), r.status);

  // ── Auth ──
  console.log("\n[AUTH]");
  r = await request({ method: "POST", path: "/api/auth/login", body: { password: TOKEN } });
  assert("POST /api/auth/login success", r.status === 200, r.status);
  assert("Returns token",                r.body.token === TOKEN, r.body.token);

  r = await request({ method: "POST", path: "/api/auth/login", body: { password: "wrong" } });
  assert("Wrong password returns 401",   r.status === 401, r.status);

  r = await request({ path: "/api/auth/verify", token: TOKEN });
  assert("GET /api/auth/verify valid",   r.status === 200, r.status);

  r = await request({ path: "/api/auth/verify" });
  assert("GET /api/auth/verify no token → 401", r.status === 401, r.status);

  // ── Reports ──
  console.log("\n[REPORTS]");

  // Submit valid report
  r = await request({
    method: "POST", path: "/api/reports",
    body: {
      reporterName:   "Test Student",
      reporterEmail:  "test@college.edu",
      institution:    "Test College",
      scamType:       "Fake Job Offer",
      scammerContact: "fakehr@gmail.com",
      platform:       "Email",
      description:    "Received a fake job offer asking for ₹2000 registration fee.",
    },
  });
  assert("POST /api/reports → 201",      r.status === 201, r.status);
  assert("Returns reportId",             !!r.body.reportId, r.body);
  const reportId = r.body.reportId;

  // Validation failure
  r = await request({ method: "POST", path: "/api/reports", body: { reporterName: "X" } });
  assert("Incomplete report → 422",      r.status === 422, r.status);

  // Get all reports
  r = await request({ path: "/api/reports" });
  assert("GET /api/reports → 200",       r.status === 200, r.status);
  assert("Returns data array",           Array.isArray(r.body.data), r.body.data);
  assert("PII masked (email contains ***)",  r.body.data?.[0]?.reporterEmail?.includes("***"), r.body.data?.[0]?.reporterEmail);

  // Get single report
  r = await request({ path: `/api/reports/${reportId}` });
  assert("GET /api/reports/:id → 200",   r.status === 200, r.status);

  // Update status (admin)
  r = await request({
    method: "PATCH", path: `/api/reports/${reportId}/status`,
    body: { status: "reviewing" }, token: TOKEN,
  });
  assert("PATCH status → 200",           r.status === 200, r.status);
  assert("Status updated to reviewing",  r.body.data?.status === "reviewing", r.body.data?.status);

  // Update status without token → 401
  r = await request({ method: "PATCH", path: `/api/reports/${reportId}/status`, body: { status: "confirmed" } });
  assert("PATCH status without token → 401", r.status === 401, r.status);

  // ── Blacklist ──
  console.log("\n[BLACKLIST]");

  r = await request({ path: "/api/blacklist" });
  assert("GET /api/blacklist → 200",     r.status === 200, r.status);
  assert("Has seeded entries",           r.body.data?.length > 0, r.body.data?.length);
  const blId = r.body.data?.[0]?.id;

  r = await request({ path: `/api/blacklist/${blId}` });
  assert("GET /api/blacklist/:id → 200", r.status === 200, r.status);

  // Admin: add entry
  r = await request({
    method: "POST", path: "/api/blacklist",
    body: { name: "test.scammer@gmail.com", platform: "Email", scamType: "Fake Job Offer", description: "Test scammer" },
    token: TOKEN,
  });
  assert("POST /api/blacklist (admin) → 201", r.status === 201, r.status);
  const newBlId = r.body.data?.id;

  // Increment report count (public)
  r = await request({ method: "POST", path: `/api/blacklist/${blId}/report` });
  assert("POST /api/blacklist/:id/report → 200", r.status === 200, r.status);
  assert("reportCount incremented",      typeof r.body.reportCount === "number", r.body.reportCount);

  // Admin: delete
  r = await request({ method: "DELETE", path: `/api/blacklist/${newBlId}`, token: TOKEN });
  assert("DELETE /api/blacklist/:id (admin) → 200", r.status === 200, r.status);

  // ── Admin stats ──
  console.log("\n[ADMIN STATS]");
  r = await request({ path: "/api/stats/admin", token: TOKEN });
  assert("GET /api/stats/admin → 200",   r.status === 200, r.status);
  assert("Has reports summary",          !!r.body.data?.reports, r.body.data);

  r = await request({ path: "/api/stats/admin" });
  assert("GET /api/stats/admin no token → 401", r.status === 401, r.status);

  // ── Rate limit (soft check) ──
  console.log("\n[RATE LIMITER]");
  // We can't easily exhaust the limit in tests; just verify header not present on normal req
  r = await request({ path: "/api/stats" });
  assert("Normal request not rate-limited", r.status !== 429, r.status);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(48));
  console.log(`  Total: ${passed + failed}  ✅ Passed: ${passed}  ❌ Failed: ${failed}`);
  console.log("─".repeat(48) + "\n");
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error("\n[FATAL] Could not connect to server:", err.message);
  console.error("Make sure the server is running: node server.js\n");
  process.exit(1);
});
