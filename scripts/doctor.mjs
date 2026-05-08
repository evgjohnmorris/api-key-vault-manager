import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const results = [];

try {
  const packageJson = JSON.parse(await read("package.json"));
  const workflow = await read(".github/workflows/pages.yml");
  const indexHtml = await read("index.html");
  const browser = await findBrowser();
  const npmVersion = getNpmVersion();
  const python = findCommand(["python", "py"], ["--version"]);

  check("Node runtime", getNodeMajor() >= 24, process.version);
  check("npm available", Boolean(npmVersion), npmVersion || "not found");
  check("Browser for smoke tests", Boolean(browser), browser || "Chrome/Edge/chromium not found");
  check("Node fetch API", typeof fetch === "function", "global fetch available");
  check("Node WebSocket API", typeof WebSocket === "function", "global WebSocket available for CDP tests");
  check("Package has no external dependencies", !packageJson.dependencies && !packageJson.devDependencies, "zero-install static project");
  check("Doctor script wired", packageJson.scripts?.doctor === "node scripts/doctor.mjs", packageJson.scripts?.doctor || "missing");
  check("Workflow smoke script wired", allIncluded(packageJson.scripts?.["smoke:workflow"] || "", ["npm run doctor", "npm run quality", "npm run smoke:breaktest", "npm run smoke:tooling", "npm run smoke:connectivity", "npm run smoke:security", "npm run smoke:bottlenecks", "npm run smoke:deadzones", "npm run smoke:design", "npm run smoke:accessibility", "npm run smoke:playtest-index", "npm run smoke:playtest", "npm run smoke:optimization"]), packageJson.scripts?.["smoke:workflow"] || "missing");
  check("Verify script includes doctor", packageJson.scripts?.verify?.includes("npm run doctor"), packageJson.scripts?.verify || "missing");
  check("Verify script includes security smoke", packageJson.scripts?.verify?.includes("npm run smoke:security"), packageJson.scripts?.verify || "missing");
  check("Verify script includes breaktest prevention smoke", packageJson.scripts?.verify?.includes("npm run smoke:breaktest"), packageJson.scripts?.verify || "missing");
  check("Verify script includes tooling readiness smoke", packageJson.scripts?.verify?.includes("npm run smoke:tooling"), packageJson.scripts?.verify || "missing");
  check("Verify script includes connectivity smoke", packageJson.scripts?.verify?.includes("npm run smoke:connectivity"), packageJson.scripts?.verify || "missing");
  check("Verify script includes bottleneck smoke", packageJson.scripts?.verify?.includes("npm run smoke:bottlenecks"), packageJson.scripts?.verify || "missing");
  check("Verify script includes deadzone smoke", packageJson.scripts?.verify?.includes("npm run smoke:deadzones"), packageJson.scripts?.verify || "missing");
  check("Verify script includes design smoke", packageJson.scripts?.verify?.includes("npm run smoke:design"), packageJson.scripts?.verify || "missing");
  check("Verify script includes accessibility smoke", packageJson.scripts?.verify?.includes("npm run smoke:accessibility"), packageJson.scripts?.verify || "missing");
  check("Verify script includes play-test index smoke", packageJson.scripts?.verify?.includes("npm run smoke:playtest-index"), packageJson.scripts?.verify || "missing");
  check("Verify script includes playtest audit", packageJson.scripts?.verify?.includes("npm run smoke:playtest"), packageJson.scripts?.verify || "missing");
  check("Verify script includes core smoke", packageJson.scripts?.verify?.includes("npm run smoke:core"), packageJson.scripts?.verify || "missing");
  check("Verify script includes dashboard panels smoke", packageJson.scripts?.verify?.includes("npm run smoke:dashboard-panels"), packageJson.scripts?.verify || "missing");
  check("Verify script includes dashboard smoke", packageJson.scripts?.verify?.includes("npm run smoke:dashboard"), packageJson.scripts?.verify || "missing");
  check("Verify script includes domain smoke", packageJson.scripts?.verify?.includes("npm run smoke:domain"), packageJson.scripts?.verify || "missing");
  check("Verify script includes policy smoke", packageJson.scripts?.verify?.includes("npm run smoke:policy"), packageJson.scripts?.verify || "missing");
  check("Verify script includes provider smoke", packageJson.scripts?.verify?.includes("npm run smoke:provider"), packageJson.scripts?.verify || "missing");
  check("Verify script includes standards smoke", packageJson.scripts?.verify?.includes("npm run smoke:standards"), packageJson.scripts?.verify || "missing");
  check("Verify script includes state smoke", packageJson.scripts?.verify?.includes("npm run smoke:state"), packageJson.scripts?.verify || "missing");
  check("Verify script includes UI smoke", packageJson.scripts?.verify?.includes("npm run smoke:ui"), packageJson.scripts?.verify || "missing");
  check("Verify script includes browser lab", packageJson.scripts?.verify?.includes("npm run lab"), packageJson.scripts?.verify || "missing");
  check("GitHub Pages deploy is gated", workflow.includes("npm run verify"), "workflow runs verify before deploy");
  check("Strict CSP prepared", hasStrictCsp(indexHtml), "self-only scripts/styles and connect-src none");
  note("Local static serving", python ? `available through ${python}` : "python not found; npm run serve needs Python");

  printResults("TOOLING DOCTOR PASSED");
} catch (error) {
  results.push(["Tooling doctor failure", false, error.message]);
  printResults("TOOLING DOCTOR FAILED");
  throw error;
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
    } else if (findCommand([candidate], ["--version"])) {
      return candidate;
    }
  }

  return "";
}

async function exists(filePath) {
  try {
    await access(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function read(file) {
  return readFile(join(projectRoot, file), "utf8");
}

function getNodeMajor() {
  return Number(process.versions.node.split(".")[0] || 0);
}

function findCommand(commands, args) {
  for (const command of commands) {
    for (const variant of commandVariants(command)) {
      const result = spawnSync(variant, args, { encoding: "utf8", windowsHide: true });
      if (result.status === 0) {
        return variant;
      }
    }
  }

  return "";
}

function commandVersion(command, args) {
  for (const variant of commandVariants(command)) {
    const result = spawnSync(variant, args, { encoding: "utf8", windowsHide: true });
    if (result.status === 0) {
      return String(result.stdout || result.stderr || "").trim() || "available";
    }
  }

  return "not found";
}

function getNpmVersion() {
  if (process.env.npm_execpath) {
    const result = spawnSync(process.execPath, [process.env.npm_execpath, "--version"], {
      encoding: "utf8",
      windowsHide: true
    });
    if (result.status === 0) {
      return String(result.stdout || result.stderr || "").trim();
    }
  }

  return commandVersion("npm", ["--version"]);
}

function commandVariants(command) {
  if (process.platform !== "win32" || /\.[a-z0-9]+$/i.test(command)) {
    return [command];
  }

  return [command, `${command}.cmd`, `${command}.exe`];
}

function hasStrictCsp(html) {
  return html.includes("default-src 'self'")
    && html.includes("script-src 'self'")
    && html.includes("style-src 'self'")
    && html.includes("connect-src 'none'")
    && html.includes("object-src 'none'")
    && !html.includes("'unsafe-inline'")
    && !html.includes("'unsafe-eval'");
}

function allIncluded(text, fragments) {
  return fragments.every((fragment) => String(text || "").includes(fragment));
}

function check(name, pass, detail) {
  results.push([name, Boolean(pass), detail]);
  if (!pass) {
    throw new Error(`${name}: ${detail}`);
  }
}

function note(name, detail) {
  results.push([name, true, detail]);
}

function printResults(title) {
  console.log(`\n${title}`);
  for (const [name, pass, detail] of results) {
    console.log(`${pass ? "PASS" : "FAIL"} ${name} - ${detail}`);
  }
}
