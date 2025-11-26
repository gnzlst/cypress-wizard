import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

function ts() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

const stamp = ts();
const videosDir = path.join("cypress", "videos", stamp);
const shotsDir = path.join("cypress", "screenshots", stamp);
fs.mkdirSync(videosDir, { recursive: true });
fs.mkdirSync(shotsDir, { recursive: true });

const configValue = `videosFolder=${videosDir},screenshotsFolder=${shotsDir}`;
console.log("Running Cypress with config:", configValue);

const res = spawnSync("npx", ["cypress", "run", "--config", configValue], { stdio: "inherit", shell: true });
process.exit(res.status ?? 1);
