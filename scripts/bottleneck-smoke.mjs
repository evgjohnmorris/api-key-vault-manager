import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const skippedDirectories = new Set([".git", "node_modules", "dist", "build", "coverage", "vault-exports"]);
const scannedExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".yml", ".yaml"]);
const checks = [];

try {
  const packageJson = JSON.parse(await read("package.json"));
  const files = await listProjectFiles(projectRoot);
  const scannedFiles = files.filter((file) => scannedExtensions.has(extname(file)));
  const jsFiles = files.filter((file) => [".js", ".mjs"].includes(extname(file)));
  const fileMetrics = await Promise.all(scannedFiles.map(async (file) => {
    const text = await read(file);
    const fileStat = await stat(join(projectRoot, file));
    return {
      file,
      text,
      bytes: fileStat.size,
      lines: text.split(/\r?\n/).length,
      functions: (text.match(/^(?:export\s+)?function\s+/gm) || []).length,
      sideEffects: countMatches(text, /localStorage|navigator\.clipboard|window\.setTimeout|confirm\(|document\.querySelector|innerHTML/g),
      deadEndMarkers: countMatches(text, /\bTODO\b|\bFIXME\b|\bHACK\b|\bXXX\b/gi)
    };
  }));
  const app = metricFor(fileMetrics, "src/app.js");
  const styles = metricFor(fileMetrics, "src/styles.css");
  const browserSmoke = metricFor(fileMetrics, "scripts/smoke-test.mjs");
  const importEdges = await getImportEdges(jsFiles);
  const importedModules = new Set(importEdges.map((edge) => edge.to).filter(Boolean));
  const orphanSrcModules = jsFiles.filter((file) => file.startsWith("src/") && file !== "src/app.js" && !importedModules.has(file));
  const unwiredScripts = jsFiles.filter((file) => file.startsWith("scripts/") && !isScriptWired(file, packageJson) && !importedModules.has(file));
  const sourceAndScripts = fileMetrics.filter((metric) => metric.file.startsWith("src/") || metric.file.startsWith("scripts/"));
  const markerFiles = sourceAndScripts.filter((metric) => metric.deadEndMarkers > 0);
  const totalLines = fileMetrics.reduce((sum, metric) => sum + metric.lines, 0);

  check("Full text inventory is readable", scannedFiles.length >= 40 && totalLines >= 7000, `${scannedFiles.length} files, ${totalLines} lines`);
  check("No orphan source modules", orphanSrcModules.length === 0, orphanSrcModules.join(", ") || "none");
  check("No unwired smoke/tool scripts", unwiredScripts.length === 0, unwiredScripts.join(", ") || "none");
  check("App orchestrator below bottleneck ceiling", app.bytes < 55000 && app.lines < 1350, `${formatKb(app.bytes)}, ${app.lines} lines`);
  check("App function pressure remains bounded", app.functions <= 35, `${app.functions} top-level functions`);
  check("App browser side-effect pressure remains bounded", app.sideEffects <= 50, `${app.sideEffects} direct touchpoints`);
  check("Stylesheet below split ceiling", styles.lines < 1500 && styles.bytes < 27000, `${formatKb(styles.bytes)}, ${styles.lines} lines`);
  check("Browser harness below split ceiling", browserSmoke.lines < 650 && browserSmoke.bytes < 22000, `${formatKb(browserSmoke.bytes)}, ${browserSmoke.lines} lines`);
  check("No explicit dead-end markers in source or scripts", markerFiles.length === 0, markerFiles.map((metric) => `${metric.file}:${metric.deadEndMarkers}`).join(", ") || "none");
  check("Workflow smoke participates in package scripts", packageJson.scripts?.["smoke:workflow"]?.includes("smoke:optimization"), packageJson.scripts?.["smoke:workflow"] || "missing");

  checks.push(["Hotspot summary", true, summarizeHotspots(fileMetrics)]);

  printResults("BOTTLENECK SMOKE PASSED");
} catch (error) {
  checks.push(["Bottleneck smoke failure", false, error.message]);
  printResults("BOTTLENECK SMOKE FAILED");
  throw error;
}

async function getImportEdges(jsFiles) {
  const edges = [];

  for (const file of jsFiles) {
    const text = await read(file);
    for (const match of text.matchAll(/^import\s+(?:[\s\S]*?)\s+from\s+["'](.+?)["'];?/gm)) {
      edges.push({ from: file, to: resolveImport(file, match[1]) });
    }
  }

  return edges;
}

async function listProjectFiles(directory, base = projectRoot) {
  const entries = await readdir(directory, { withFileTypes: true });
  const collected = [];

  for (const entry of entries) {
    if (entry.isDirectory() && skippedDirectories.has(entry.name)) {
      continue;
    }

    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      collected.push(...await listProjectFiles(absolute, base));
      continue;
    }

    if (entry.isFile()) {
      collected.push(toPosix(relative(base, absolute)));
    }
  }

  return collected.sort();
}

async function read(file) {
  return readFile(join(projectRoot, file), "utf8");
}

function metricFor(metrics, file) {
  const metric = metrics.find((item) => item.file === file);
  if (!metric) {
    throw new Error(`Missing metric for ${file}`);
  }
  return metric;
}

function resolveImport(from, specifier) {
  if (!specifier.startsWith(".")) return "";
  const base = normalize(join(dirname(from), specifier));
  const withExtension = extname(base) ? base : `${base}.js`;
  return toPosix(withExtension);
}

function isScriptWired(file, packageJson) {
  return Object.values(packageJson.scripts || {}).some((script) => script.includes(file) || script.includes(file.replaceAll("/", "\\")));
}

function summarizeHotspots(metrics) {
  return metrics
    .filter((metric) => metric.sideEffects > 0)
    .sort((a, b) => b.sideEffects - a.sideEffects)
    .slice(0, 4)
    .map((metric) => `${metric.file}=${metric.sideEffects}`)
    .join(", ") || "none";
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function check(name, pass, detail) {
  checks.push([name, Boolean(pass), detail]);
  if (!pass) {
    throw new Error(`${name}: ${detail}`);
  }
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function toPosix(value) {
  return value.replaceAll("\\", "/");
}

function printResults(title) {
  console.log(`\n${title}`);
  for (const [name, pass, detail] of checks) {
    console.log(`${pass ? "PASS" : "FAIL"} ${name} - ${detail}`);
  }
}
