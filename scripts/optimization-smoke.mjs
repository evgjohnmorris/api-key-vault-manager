import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateOperationalPhysics } from "../src/operationalPhysics.js";
import { createEmptyEntry } from "../src/schema.js";
import { createStandardsState, getStandardsProgress } from "../src/standards.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const checks = [];

try {
  const packageJson = JSON.parse(await read("package.json"));
  const indexHtml = await read("index.html");
  const appJs = await read("src/app.js");
  const dashboardJs = await read("src/domain/dashboard.js");
  const dashboardPanelsJs = await read("src/ui/dashboardPanels.js");
  const plan = await read("docs/next-stage-optimization-plan.md");
  const appStats = await stat(join(projectRoot, "src", "app.js"));

  check("Next-stage plan exists", plan.includes("developer operations control plane"), "control-plane direction documented");
  check("Plan identifies first extraction", plan.includes("src/domain/readiness.js"), "readiness extraction is named");
  check("Plan keeps encrypted local mode", plan.includes("local-only encryption model"), "future work cannot weaken current security model");
  check("Strict CSP remains optimized", hasStrictCsp(indexHtml), "no unsafe inline/eval and connect-src none");
  check("Operational physics is wired through dashboard domain", dashboardJs.includes("calculateOperationalPhysics") && appJs.includes("renderOperationalPhysics"), "pure model reaches cockpit through dashboard stats");
  check("Verification includes tooling doctor", packageJson.scripts?.verify?.includes("npm run doctor"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes breaktest prevention smoke", packageJson.scripts?.verify?.includes("smoke:breaktest"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes tooling readiness smoke", packageJson.scripts?.verify?.includes("smoke:tooling"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes connectivity smoke", packageJson.scripts?.verify?.includes("smoke:connectivity"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes security smoke", packageJson.scripts?.verify?.includes("smoke:security"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes bottleneck smoke", packageJson.scripts?.verify?.includes("smoke:bottlenecks"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes deadzone smoke", packageJson.scripts?.verify?.includes("smoke:deadzones"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes design smoke", packageJson.scripts?.verify?.includes("smoke:design"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes accessibility smoke", packageJson.scripts?.verify?.includes("smoke:accessibility"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes play-test index smoke", packageJson.scripts?.verify?.includes("smoke:playtest-index"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes playtest audit", packageJson.scripts?.verify?.includes("smoke:playtest"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes core smoke", packageJson.scripts?.verify?.includes("smoke:core"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes dashboard panels smoke", packageJson.scripts?.verify?.includes("smoke:dashboard-panels"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes dashboard smoke", packageJson.scripts?.verify?.includes("smoke:dashboard"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes domain smoke", packageJson.scripts?.verify?.includes("smoke:domain"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes policy smoke", packageJson.scripts?.verify?.includes("smoke:policy"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes provider smoke", packageJson.scripts?.verify?.includes("smoke:provider"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes standards smoke", packageJson.scripts?.verify?.includes("smoke:standards"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes state smoke", packageJson.scripts?.verify?.includes("smoke:state"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes UI smoke", packageJson.scripts?.verify?.includes("smoke:ui"), packageJson.scripts?.verify || "missing verify script");
  check("Verification includes optimization smoke", packageJson.scripts?.verify?.includes("smoke:optimization"), packageJson.scripts?.verify || "missing verify script");
  check("Workflow smoke shortcut stays wired", allIncluded(packageJson.scripts?.["smoke:workflow"] || "", ["npm run doctor", "npm run quality", "npm run smoke:breaktest", "npm run smoke:tooling", "npm run smoke:connectivity", "npm run smoke:security", "npm run smoke:bottlenecks", "npm run smoke:deadzones", "npm run smoke:design", "npm run smoke:accessibility", "npm run smoke:playtest-index", "npm run smoke:playtest", "npm run smoke:optimization"]), packageJson.scripts?.["smoke:workflow"] || "missing workflow smoke script");
  check("App size below emergency ceiling", appStats.size < 75000, `${formatKb(appStats.size)} current orchestrator size`);

  const functionCount = (appJs.match(/^function /gm) || []).length;
  check("App function count remains bounded after extraction", functionCount > 0 && functionCount <= 25, `${functionCount} functions in app orchestrator`);

  const sideEffectPressure = countMatches(appJs, /localStorage|navigator\.clipboard|window\.setTimeout|confirm\(|document\.querySelector|innerHTML/g);
  check("Side-effect pressure measured", sideEffectPressure > 0, `${sideEffectPressure} direct browser/persistence touchpoints`);
  check("Dashboard panels are pure renderers", !/document\.|localStorage|navigator\.clipboard|window\.|innerHTML/.test(dashboardPanelsJs), "dashboard panels have no browser side effects");

  const physics = calculateOperationalPhysics({
    entries: [
      createEmptyEntry({
        name: "Optimization Smoke Production Key",
        provider: "Smoke Provider",
        purpose: "Optimization fixture",
        environment: "Production",
        riskLevel: "Critical",
        status: "Needs verification",
        rotationCadence: "No expiration"
      }),
      createEmptyEntry({
        name: "Optimization Smoke Support Key",
        provider: "Smoke Provider",
        purpose: "Support fixture",
        environment: "Testing",
        riskLevel: "Low",
        status: "Active",
        rotationCadence: "No expiration",
        lastVerifiedAt: "2026-05-01",
        docsUrl: "https://example.test/docs"
      })
    ],
    standardsProgress: getStandardsProgress(createStandardsState()),
    auditLog: [
      { at: "2026-05-06T12:00:00.000Z", action: "optimization_smoke" }
    ],
    now: Date.parse("2026-05-07T12:00:00.000Z")
  });

  check("Operational physics deterministic pressure", physics.pressure === 26, `pressure=${physics.pressure}`);
  check("Operational physics deterministic drag", physics.drag === 38, `drag=${physics.drag}`);
  check("Operational physics detects exposure", physics.exposure === 23, `exposure=${physics.exposure}`);
  check("Operational physics deterministic stability", physics.stability === 52, `stability=${physics.stability}`);
  check("Operational physics returns valid state", ["Controlled", "Balanced", "Transitional", "Turbulent", "Unstable"].includes(physics.state), physics.state);
  check("Operational physics vector contract", physics.vectors.length === 6 && physics.vectors.every((vector) => typeof vector.value === "number"), `${physics.vectors.length} vectors`);

  printResults("OPTIMIZATION SMOKE PASSED");
} catch (error) {
  checks.push(["Optimization smoke failure", false, error.message]);
  printResults("OPTIMIZATION SMOKE FAILED");
  throw error;
}

function check(name, pass, detail) {
  checks.push([name, Boolean(pass), detail]);
  if (!pass) {
    throw new Error(`${name}: ${detail}`);
  }
}

async function read(file) {
  return readFile(join(projectRoot, file), "utf8");
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

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function allIncluded(text, fragments) {
  return fragments.every((fragment) => String(text || "").includes(fragment));
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function printResults(title) {
  console.log(`\n${title}`);
  for (const [name, pass, detail] of checks) {
    console.log(`${pass ? "PASS" : "FAIL"} ${name} - ${detail}`);
  }
}
