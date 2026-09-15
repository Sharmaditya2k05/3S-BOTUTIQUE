// Builds the React client and copies the output into server/public, so the
// Express server (this folder) can serve it directly in production.
// Cross-platform on purpose (no `cp`/`xcopy` shell commands) so it works
// the same on Windows, macOS and Linux hosts and CI systems.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const clientDir = path.join(__dirname, "..", "..", "client");
const clientDist = path.join(clientDir, "dist");
const serverPublic = path.join(__dirname, "..", "public");

console.log("Installing client dependencies...");
execSync("npm install", { cwd: clientDir, stdio: "inherit" });

console.log("Building client...");
execSync("npm run build", { cwd: clientDir, stdio: "inherit" });

console.log("Copying client build into server/public...");
fs.rmSync(serverPublic, { recursive: true, force: true });
fs.cpSync(clientDist, serverPublic, { recursive: true });

console.log("Done. server/public now contains the production client build.");
