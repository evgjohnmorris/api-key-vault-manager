import { spawn, spawnSync } from "node:child_process";
import { access, mkdtemp, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getFreePort } from "./static-server.mjs";

export async function launchBrowserRuntime({ appUrl, isLabMode }) {
  const browserPath = await findBrowser();
  const debugPort = await getFreePort();
  const profileDir = await mkdtemp(join(tmpdir(), isLabMode ? "akvm-lab-" : "akvm-smoke-"));
  const browserProcess = spawn(browserPath, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "--disable-background-networking",
    "--disable-default-apps",
    "--disable-extensions",
    "--disable-gpu",
    "--disable-sync",
    "--no-default-browser-check",
    "--no-first-run",
    appUrl
  ], {
    stdio: "ignore"
  });

  return {
    browserPath,
    browserProcess,
    debugPort,
    profileDir
  };
}

export async function closeBrowserRuntime(runtime = {}) {
  if (runtime.browserProcess && !runtime.browserProcess.killed) {
    runtime.browserProcess.kill();
  }
  if (runtime.profileDir) {
    await rm(runtime.profileDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function findBrowser() {
  const candidates = [
    process.env.BROWSER,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "google-chrome",
    "chromium",
    "msedge"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes("\\") || candidate.includes("/")) {
      if (await exists(candidate)) return candidate;
    } else if (commandExists(candidate)) {
      return candidate;
    }
  }

  throw new Error("No Chrome or Edge executable was found for headless smoke testing.");
}

async function exists(filePath) {
  try {
    await access(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function commandExists(command) {
  for (const variant of commandVariants(command)) {
    const result = spawnSync(variant, ["--version"], { encoding: "utf8", windowsHide: true });
    if (result.status === 0) {
      return true;
    }
  }

  return false;
}

function commandVariants(command) {
  if (process.platform !== "win32" || /\.[a-z0-9]+$/i.test(command)) {
    return [command];
  }

  return [command, `${command}.cmd`, `${command}.exe`];
}
