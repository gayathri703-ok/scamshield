/**
 * utils/bodyParser.js — JSON body parser + multipart file upload
 * Zero dependencies — uses Node.js built-ins only.
 */

const fs   = require("fs");
const path = require("path");
const crypto = require("crypto");

const UPLOAD_DIR  = path.join(__dirname, "../uploads");
const MAX_BODY    = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXT = [".jpg",".jpeg",".png",".gif",".webp",".pdf"];

// ── JSON / URL-encoded body ────────────────────────────────────────────────
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    let size = 0;

    req.on("data", chunk => {
      size += chunk.length;
      if (size > MAX_BODY) { req.destroy(); return reject(new Error("Payload too large")); }
      data += chunk;
    });

    req.on("end", () => {
      if (!data) return resolve({});
      const ct = req.headers["content-type"] || "";
      try {
        if (ct.includes("application/json")) return resolve(JSON.parse(data));
        if (ct.includes("application/x-www-form-urlencoded")) {
          const parsed = {};
          new URLSearchParams(data).forEach((v, k) => { parsed[k] = v; });
          return resolve(parsed);
        }
        resolve({});
      } catch { resolve({}); }
    });

    req.on("error", reject);
  });
}

// ── Multipart / form-data parser ───────────────────────────────────────────
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const ct      = req.headers["content-type"] || "";
    const boundary = ct.split("boundary=")[1];
    if (!boundary) return resolve({});

    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => {
      const buf    = Buffer.concat(chunks);
      const sep    = Buffer.from(`--${boundary}`);
      const result = { fields: {}, files: [] };

      let start = 0;
      while (true) {
        const idx = buf.indexOf(sep, start);
        if (idx === -1) break;
        start = idx + sep.length;

        if (buf[start] === 45 && buf[start + 1] === 45) break; // --

        const headerEnd = buf.indexOf("\r\n\r\n", start);
        if (headerEnd === -1) break;

        const headerStr = buf.slice(start, headerEnd).toString();
        const endOfPart = buf.indexOf(sep, headerEnd) - 2; // -2 for \r\n
        const body      = buf.slice(headerEnd + 4, endOfPart);

        const nameMatch = headerStr.match(/name="([^"]+)"/);
        const fileMatch = headerStr.match(/filename="([^"]+)"/);

        if (!nameMatch) continue;
        const fieldName = nameMatch[1];

        if (fileMatch) {
          const origName = fileMatch[1];
          const ext      = path.extname(origName).toLowerCase();
          if (!ALLOWED_EXT.includes(ext)) continue; // skip disallowed types

          const saveName = `${crypto.randomUUID()}${ext}`;
          const savePath = path.join(UPLOAD_DIR, saveName);
          fs.writeFileSync(savePath, body);

          result.files.push({
            field:    fieldName,
            origName,
            saveName,
            path:     savePath,
            url:      `/uploads/${saveName}`,
            size:     body.length,
          });
        } else {
          result.fields[fieldName] = body.toString().trim();
        }
        start = headerEnd;
      }

      resolve(result);
    });
    req.on("error", reject);
  });
}

module.exports = { parseBody, parseMultipart };
