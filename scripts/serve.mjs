import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve("dist");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};
http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let p;
    try {
      p = path.resolve(root, "." + decodeURIComponent(url.pathname));
    } catch {
      res.writeHead(400);
      return res.end("Bad URL");
    }
    if (!p.startsWith(root + path.sep) && p !== root) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    if (fs.existsSync(p) && fs.statSync(p).isDirectory())
      p = path.join(p, "index.html");
    if (!fs.existsSync(p)) p = path.join(root, "index.html");
    res.writeHead(200, {
      "Content-Type": types[path.extname(p)] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    fs.createReadStream(p).pipe(res);
  })
  .listen(4173, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4173"));
