const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const apiBase = process.env.PROJECT_HEALTH_API_BASE || "";

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDir(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      copyFile(sourcePath, targetPath);
    }
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

["index.html", "styles.css", "script.js"].forEach((file) => {
  copyFile(path.join(root, file), path.join(dist, file));
});

copyDir(path.join(root, "assets"), path.join(dist, "assets"));

fs.writeFileSync(
  path.join(dist, "project-health-config.js"),
  `window.PROJECT_HEALTH_API_BASE = ${JSON.stringify(apiBase.replace(/\/$/, ""))};\n`
);

fs.writeFileSync(
  path.join(dist, "_headers"),
  [
    "/*",
    "  X-Content-Type-Options: nosniff",
    "  X-Frame-Options: DENY",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "  Permissions-Policy: camera=(), microphone=(), geolocation=()",
    ""
  ].join("\n")
);

fs.writeFileSync(
  path.join(dist, "_redirects"),
  [
    "https://projecthealth.com/* https://www.projecthealth.com/:splat 301!",
    "http://projecthealth.com/* https://www.projecthealth.com/:splat 301!",
    "http://www.projecthealth.com/* https://www.projecthealth.com/:splat 301!",
    ""
  ].join("\n")
);

console.log(`Static build created at ${dist}`);
if (!apiBase) {
  console.log("PROJECT_HEALTH_API_BASE is empty. Static UI will deploy, but API login needs a hosted backend URL or Vercel Functions.");
}
