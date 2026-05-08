import {
  ISO_STANDARDS,
  STANDARD_CONTROLS,
  STANDARD_PHASES,
  createStandardsState,
  getControlAssurance,
  getStandardsProgress,
  normalizeStandardsState,
  redactStandardsState
} from "../src/standards.js";

const checks = [];

try {
  const base = createStandardsState({
    notes: "Private standards note",
    controls: {
      "GOV-ISMS-01": {
        status: "Implemented",
        evidence: "Scope statement and owner list stored in private repo.",
        owner: "Security Owner",
        dueDate: "2026-05-30",
        updatedAt: "2026-05-07T12:00:00.000Z"
      },
      "RISK-REG-02": {
        status: "Implemented",
        evidence: "",
        owner: "",
        dueDate: "2026-05-30"
      },
      "POL-SET-03": {
        status: "Planned",
        evidence: "",
        owner: "Policy Owner",
        dueDate: "2000-01-01"
      },
      "IAM-SEC-04": {
        status: "Not applicable",
        evidence: "",
        owner: "IAM Owner",
        dueDate: ""
      }
    }
  });
  const normalized = normalizeStandardsState({
    controls: {
      "GOV-ISMS-01": base.controls["GOV-ISMS-01"]
    }
  });
  const progress = getStandardsProgress(base);
  const redacted = redactStandardsState(base);
  const standardNames = new Set(ISO_STANDARDS.map((standard) => standard.name));
  const requiredStandardNames = [
    "ISO/IEC 27001:2022",
    "ISO/IEC 27002:2022",
    "ISO/IEC 27005:2022",
    "ISO 31000:2018",
    "ISO/IEC 27017:2015",
    "ISO/IEC 27018:2025",
    "ISO/IEC 27701:2025",
    "ISO/IEC/IEEE 42010:2022",
    "ISO/IEC/IEEE 12207:2017",
    "ISO/IEC 25010:2023",
    "ISO/IEC 27034-1:2011",
    "ISO/IEC 20000-1:2018",
    "ISO 22301:2019",
    "ISO 9001:2015",
    "ISO/IEC 42001:2023",
    "ISO 9241-210:2019"
  ];
  const requiredControlDomains = [
    "Security governance",
    "Risk management",
    "Policies",
    "Identity and access",
    "Cryptography",
    "Cloud infrastructure",
    "Privacy",
    "Application security",
    "Architecture",
    "Quality and acceptance",
    "Service operations",
    "Continuity",
    "AI governance",
    "Design",
    "Engineering workflow",
    "Internal audit"
  ];
  const unknownStandardRefs = STANDARD_CONTROLS
    .flatMap((control) => control.standards || [])
    .filter((name) => !standardNames.has(name));
  const implementedControl = STANDARD_CONTROLS.find((control) => control.id === "GOV-ISMS-01");
  const implementedAssurance = getControlAssurance(implementedControl, base.controls["GOV-ISMS-01"]);
  const missingAssurance = getControlAssurance(
    STANDARD_CONTROLS.find((control) => control.id === "RISK-REG-02"),
    base.controls["RISK-REG-02"]
  );
  const plannedAssurance = getControlAssurance(
    STANDARD_CONTROLS.find((control) => control.id === "POL-SET-03"),
    base.controls["POL-SET-03"]
  );
  const notApplicableAssurance = getControlAssurance(
    STANDARD_CONTROLS.find((control) => control.id === "IAM-SEC-04"),
    base.controls["IAM-SEC-04"]
  );

  check("ISO standards catalog covers required families", requiredStandardNames.every((name) => standardNames.has(name)), `${ISO_STANDARDS.length} standard families`);
  check("ISO standards use official reference URLs", ISO_STANDARDS.every((standard) => standard.url.startsWith("https://www.iso.org/standard/")), "all URLs are ISO standard pages");
  check("Implementation controls cover required domains", requiredControlDomains.every((domain) => STANDARD_CONTROLS.some((control) => control.domain === domain)), `${requiredControlDomains.length} required domains`);
  check("Controls only reference cataloged standards", unknownStandardRefs.length === 0, unknownStandardRefs.join(", ") || "all references cataloged");
  check("Standards catalog has broad ISO control coverage", STANDARD_CONTROLS.length >= 20, `${STANDARD_CONTROLS.length} controls`);
  check("Standards phases are PDCA", STANDARD_PHASES.join(",") === "Plan,Do,Check,Act", STANDARD_PHASES.join(","));
  check("State creates every control record", Object.keys(base.controls).length === STANDARD_CONTROLS.length, `${Object.keys(base.controls).length} controls`);
  check("Normalization repairs missing controls", Object.keys(normalized.controls).length === STANDARD_CONTROLS.length, `${Object.keys(normalized.controls).length} normalized`);
  check("Implemented controls are ready", implementedAssurance.ready && implementedAssurance.evidenceBacked, JSON.stringify(implementedAssurance));
  check("Implemented controls require evidence", missingAssurance.missingEvidence && missingAssurance.missingOwner && !missingAssurance.evidenceBacked, JSON.stringify(missingAssurance));
  check("Open controls require due dates and can be overdue", plannedAssurance.missingEvidence === false && plannedAssurance.overdue, JSON.stringify(plannedAssurance));
  check("Not applicable can be assured with owner", notApplicableAssurance.ready && notApplicableAssurance.evidenceBacked, JSON.stringify(notApplicableAssurance));
  check("Progress counts ready controls", progress.ready === 3, `ready=${progress.ready}`);
  check("Progress tracks assurance separately", progress.evidenceBacked === 2 && progress.assurancePercent < progress.percent, `assured=${progress.evidenceBacked} ${progress.assurancePercent}/${progress.percent}`);
  check("Progress tracks missing evidence", progress.missingEvidence === 1, `missingEvidence=${progress.missingEvidence}`);
  check("Progress tracks missing owners", progress.missingOwner === 1, `missingOwner=${progress.missingOwner}`);
  check("Progress tracks overdue controls", progress.overdue === 1, `overdue=${progress.overdue}`);
  check("Progress includes phase buckets", STANDARD_PHASES.every((phase) => progress.phaseCounts[phase]?.total >= 1), JSON.stringify(progress.phaseCounts));
  check("Redaction removes standards notes", redacted.notes === "[redacted notes]", redacted.notes);
  check("Redaction removes evidence text", redacted.controls["GOV-ISMS-01"].evidence === "[redacted evidence]", redacted.controls["GOV-ISMS-01"].evidence);
  check("Redaction preserves non-secret assurance fields", redacted.controls["GOV-ISMS-01"].owner === "Security Owner" && redacted.controls["GOV-ISMS-01"].status === "Implemented", "owner/status preserved");

  printResults("STANDARDS SMOKE PASSED");
} catch (error) {
  checks.push(["Standards smoke failure", false, error.message]);
  printResults("STANDARDS SMOKE FAILED");
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
