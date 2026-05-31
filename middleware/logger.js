/**
 * middleware/logger.js — Request logger with coloured output + file logging
 */

const fs   = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "../data/access.log");

const COLORS = {
  GET:    "\x1b[32m",  // green
  POST:   "\x1b[34m",  // blue
  PUT:    "\x1b[33m",  // yellow
  DELETE: "\x1b[31m",  // red
  PATCH:  "\x1b[35m",  // magenta
  reset:  "\x1b[0m",
};

function logger(req) {
  const ts     = new Date().toISOString();
  const method = req.method.padEnd(7);
  const color  = COLORS[req.method] || "";
  const ip     = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "?").split(",")[0].trim();

  const line = `[${ts}] ${method} ${req.pathname} — ${ip}`;

  // Console with colour
  console.log(`${color}${line}${COLORS.reset}`);

  // Append to file (non-blocking)
  fs.appendFile(LOG_FILE, line + "\n", () => {});
}

module.exports = { logger };
