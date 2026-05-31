/**
 * utils/validate.js — Input validation helpers
 */

const SCAM_TYPES = [
  "Fake Job Offer", "Fake Internship", "Phishing Email / Link",
  "Telegram / WhatsApp Scam", "Registration Fee Fraud",
  "Identity Theft Attempt", "Advance Fee Fraud", "Other",
];

const PLATFORMS = ["Email", "Telegram", "WhatsApp", "Website", "LinkedIn",
                   "Facebook", "Instagram", "Phone Call", "Other"];

function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isPhone(v) { return /^[+0-9\s\-()]{7,20}$/.test(v); }
function notEmpty(v) { return v && String(v).trim().length > 0; }
function maxLen(v, n) { return String(v).length <= n; }

function validateReport(body) {
  const errors = [];
  if (!notEmpty(body.reporterName))   errors.push("reporterName is required");
  if (!notEmpty(body.reporterEmail))  errors.push("reporterEmail is required");
  if (!isEmail(body.reporterEmail))   errors.push("reporterEmail must be valid");
  if (!notEmpty(body.scamType))       errors.push("scamType is required");
  if (!SCAM_TYPES.includes(body.scamType)) errors.push("scamType is invalid");
  if (!notEmpty(body.scammerContact)) errors.push("scammerContact is required");
  if (!notEmpty(body.description))    errors.push("description is required");
  if (!maxLen(body.description, 2000)) errors.push("description max 2000 chars");
  return errors;
}

function validateBlacklist(body) {
  const errors = [];
  if (!notEmpty(body.name))     errors.push("name is required");
  if (!notEmpty(body.platform)) errors.push("platform is required");
  if (!PLATFORMS.includes(body.platform)) errors.push("platform is invalid");
  if (!notEmpty(body.scamType)) errors.push("scamType is required");
  return errors;
}

module.exports = { validateReport, validateBlacklist, SCAM_TYPES, PLATFORMS };
