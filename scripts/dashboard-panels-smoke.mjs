import {
  renderCommandCenter,
  renderOperationalPhysics,
  renderPolicyPanel
} from "../src/ui/dashboardPanels.js";

const checks = [];

try {
  const commandHtml = renderCommandCenter({
    healthScore: 82,
    averageReadiness: 76,
    incomplete: 2,
    riskyNoExpiration: 1,
    needsVerification: 3,
    production: 4,
    actions: [
      { label: "<Review critical>", detail: "Critical action detail", action: "Critical" }
    ]
  });
  check("Command panel renders cockpit", commandHtml.includes("Operations cockpit") && commandHtml.includes("score-80"), "cockpit health rendered");
  check("Command panel escapes action labels", commandHtml.includes("&lt;Review critical&gt;") && !commandHtml.includes("<Review critical>"), "action label escaped");
  check("Command panel includes action target", commandHtml.includes('data-command-action="Critical"'), "command action data attr");

  const calmHtml = renderCommandCenter({
    healthScore: 100,
    averageReadiness: 100,
    incomplete: 0,
    riskyNoExpiration: 0,
    needsVerification: 0,
    production: 0,
    actions: []
  });
  check("Command panel renders passive calm state", calmHtml.includes("Vault is calm"), "calm state");

  const physicsHtml = renderOperationalPhysics({
    state: "Balanced",
    stability: 74,
    summary: "System <stable>",
    gravity: 18,
    averageReadiness: 76,
    counts: { recentActivity: 2 },
    vectors: [
      { label: "Pressure", value: 33, direction: "lower", detail: "Reduce pressure" },
      { label: "Momentum", value: 81, direction: "higher", detail: "Build momentum" }
    ]
  });
  check("Physics panel renders vectors", physicsHtml.includes("Operational physics") && physicsHtml.includes("Pressure") && physicsHtml.includes("Momentum"), "vectors rendered");
  check("Physics panel escapes summaries", physicsHtml.includes("System &lt;stable&gt;"), "summary escaped");
  check("Physics panel buckets scores", physicsHtml.includes("score-70") && physicsHtml.includes("fill-30") && physicsHtml.includes("fill-80"), "score buckets");

  const policyHtml = renderPolicyPanel({
    score: 64,
    bySeverity: { Critical: 1, High: 2, Medium: 3, Low: 0 },
    entriesWithViolations: 4,
    violations: [
      {
        severity: "Critical",
        title: "Unsafe <policy>",
        entryName: "Prod Key",
        detail: "Needs restriction"
      }
    ]
  });
  check("Policy panel renders release confidence", policyHtml.includes("64% release confidence") && policyHtml.includes("score-60"), "policy score");
  check("Policy panel escapes violation text", policyHtml.includes("Unsafe &lt;policy&gt;"), "policy escaped");
  check("Policy panel maps severity classes", policyHtml.includes('class="pill critical"'), "critical pill");

  const cleanPolicyHtml = renderPolicyPanel({
    score: 100,
    bySeverity: { Critical: 0, High: 0, Medium: 0, Low: 0 },
    entriesWithViolations: 0,
    violations: []
  });
  check("Policy panel renders clean state", cleanPolicyHtml.includes("Policy gate is clean"), "clean state");

  printResults("DASHBOARD PANELS SMOKE PASSED");
} catch (error) {
  checks.push(["Dashboard panels smoke failure", false, error.message]);
  printResults("DASHBOARD PANELS SMOKE FAILED");
  throw error;
}

function check(name, pass, detail) {
  checks.push([name, Boolean(pass), detail]);
  if (!pass) {
    throw new Error(`${name}: ${detail}`);
  }
}

function printResults(title) {
  console.log(`\n${title}`);
  for (const [name, pass, detail] of checks) {
    console.log(`${pass ? "PASS" : "FAIL"} ${name} - ${detail}`);
  }
}
