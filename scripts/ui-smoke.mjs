import {
  escapeAttr,
  escapeHtml,
  formatDate,
  linkOrText,
  percentBucketClass,
  priorityClass,
  renderPill,
  renderSelect,
  renderSelectField,
  statusClass,
  standardsStatusClass
} from "../src/ui/html.js";

const checks = [];

try {
  const escaped = escapeHtml(`<script data-x="&">'`);
  check("Escapes unsafe HTML", !/[<>"]/.test(escaped) && escaped.includes("&lt;script"), escaped);
  check("Escapes attributes through same contract", escapeAttr(`"onload"`).includes("&quot;"), escapeAttr(`"onload"`));
  check("Renders safe pills", renderPill("<Critical>", "high").includes("&lt;Critical&gt;"), renderPill("<Critical>", "high"));
  check("Renders selected selects", renderSelect("risk", ["Low", "High"], "High", "Risk").includes('value="High" selected'), "High selected");
  check("Renders select field blank prompt", renderSelectField("Purpose", "purpose", ["Analytics"], "", true).includes("Select purpose"), "blank prompt rendered");
  check("Renders external links safely", linkOrText("https://example.test/docs").includes('rel="noreferrer noopener"'), "external link rel set");
  check("Leaves non-links as text", linkOrText("vault/path") === "vault/path", "plain text preserved");
  check("Status classes are stable", statusClass("Active") === "active" && statusClass("Blocked") === "critical", "entry status classes");
  check("Standards status classes are stable", standardsStatusClass("Implemented") === "active" && standardsStatusClass("Planned") === "pending", "standards classes");
  check("Priority classes are stable", priorityClass("Critical") === "critical" && priorityClass("Unknown") === "low", "priority classes");
  check("Percent buckets clamp", percentBucketClass("score", 106) === "score-100" && percentBucketClass("fill", -4) === "fill-0", "bucket clamp");
  check("Empty dates are explicit", formatDate("") === "No date", "empty date label");

  printResults("UI SMOKE PASSED");
} catch (error) {
  checks.push(["UI smoke failure", false, error.message]);
  printResults("UI SMOKE FAILED");
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
