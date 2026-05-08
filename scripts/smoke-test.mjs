import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { closeBrowserRuntime, launchBrowserRuntime } from "./browser/chrome-runtime.mjs";
import { createCdpClient, waitForTarget } from "./browser/cdp-client.mjs";
import { runLabChecks } from "./browser/lab-flow.mjs";
import { createPageDriver } from "./browser/page-driver.mjs";
import { startStaticServer } from "./browser/static-server.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const smokeSecret = "smoke-secret-not-real-1234567890!";
const smokeEvidence = "smoke ISO evidence note with no real secrets";
const smokePassword = "smoke-test-master-password-2026";
const isLabMode = process.argv.includes("--lab");
const testLabel = isLabMode ? "LAB TEST" : "SMOKE TEST";

const checks = [];
const issues = [];
let staticServer;
let browserRuntime;
let cdp;
let evaluate;
let waitForExpression;

try {
  staticServer = await startStaticServer(projectRoot);
  const appUrl = `http://127.0.0.1:${staticServer.port}/`;
  browserRuntime = await launchBrowserRuntime({ appUrl, isLabMode });

  const target = await waitForTarget(browserRuntime.debugPort, appUrl);
  cdp = await createCdpClient(target.webSocketDebuggerUrl, { issues });
  ({ evaluate, waitForExpression } = createPageDriver(cdp));
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");

  await waitForExpression(
    "document.readyState === 'complete' && document.body.innerText.includes('API Key Vault Manager')",
    "app shell rendered"
  );
  checks.push(["App shell rendered", true, appUrl]);

  await evaluate(`(() => {
    document.querySelector("#master-password").value = ${JSON.stringify(smokePassword)};
    document.querySelector("#confirm-password").value = ${JSON.stringify(smokePassword)};
    document.querySelector("input[name='includeSamples']").checked = false;
    document.querySelector("#create-form").requestSubmit();
    return true;
  })()`);

  await waitForExpression(
    "document.body.innerText.includes('Key Ops') && !!document.querySelector('#new-entry-button')",
    "vault created and unlocked",
    45000
  );
  checks.push(["Vault create/unlock flow", true, "temporary browser profile"]);

  await evaluate(`document.querySelector("#new-entry-button").click()`);
  await waitForExpression("!!document.querySelector('#entry-form')", "entry modal opened");

  await evaluate(`(() => {
    const values = {
      name: "Smoke Test Key",
      provider: "Smoke Provider",
      type: "API key",
      category: "Developer platform",
      purpose: "Development and testing",
      useCase: "Automated smoke test entry",
      environment: "Testing",
      status: "Active",
      riskLevel: "Low",
      secretValue: ${JSON.stringify(smokeSecret)},
      username: "smoke@example.test",
      accountId: "acct_smoke_test",
      url: "https://example.test/api",
      dashboardUrl: "https://example.test/dashboard",
      docsUrl: "https://example.test/docs",
      scopes: "read-only smoke scope",
      rotationCadence: "No expiration",
      owner: "Smoke Test",
      project: "API Key Vault Manager",
      tags: "smoke, automated, no-real-secret",
      notes: "This is created in a temporary headless profile only."
    };
    for (const [name, value] of Object.entries(values)) {
      const field = document.querySelector("[name='" + name + "']");
      if (!field) throw new Error("Missing field: " + name);
      field.value = value;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }
    document.querySelector("#entry-form").requestSubmit();
    return true;
  })()`);

  await waitForExpression(
    "document.body.innerText.includes('Smoke Test Key') && document.body.innerText.includes('Entry created')",
    "entry created"
  );
  checks.push(["Entry creation flow", true, "Smoke Test Key"]);

  const encryptedStorage = await evaluate(`(() => {
    const raw = localStorage.getItem("akvm.encryptedVault.v1");
    const parsed = JSON.parse(raw);
    return {
      exists: Boolean(raw),
      hasPayload: Boolean(parsed.payload && parsed.payload.length > 64),
      hasPlainSecret: raw.includes(${JSON.stringify(smokeSecret)}),
      hasCryptoParams: Boolean(parsed.crypto && parsed.crypto.algorithm === "AES-GCM" && parsed.crypto.kdf === "PBKDF2")
    };
  })()`);

  assert(encryptedStorage.exists, "Encrypted vault was not stored.");
  assert(encryptedStorage.hasPayload, "Encrypted vault payload is missing or too small.");
  assert(encryptedStorage.hasCryptoParams, "Encrypted vault crypto parameters are missing.");
  assert(!encryptedStorage.hasPlainSecret, "Plaintext smoke secret leaked into encrypted storage.");
  checks.push(["Encrypted localStorage", true, "AES-GCM/PBKDF2 payload without plaintext secret"]);

  await evaluate(`document.querySelector("#reveal-secret-button").click()`);
  await waitForExpression(
    `document.body.innerText.includes(${JSON.stringify(smokeSecret)})`,
    "secret reveal worked"
  );
  checks.push(["Secret reveal interaction", true, "temporary fake secret displayed after reveal"]);

  await evaluate(`document.querySelector("#standards-button").click()`);
  await waitForExpression(
    "document.body.innerText.includes('Standards evidence tracker') && !!document.querySelector('#standards-form')",
    "standards modal opened"
  );

  await evaluate(`(() => {
    document.querySelector("[name='status__GOV-ISMS-01']").value = "Implemented";
    document.querySelector("[name='owner__GOV-ISMS-01']").value = "Smoke Owner";
    document.querySelector("[name='dueDate__GOV-ISMS-01']").value = "2026-12-31";
    document.querySelector("[name='evidence__GOV-ISMS-01']").value = ${JSON.stringify(smokeEvidence)};
    document.querySelector("#standards-form").requestSubmit();
    return true;
  })()`);

  await waitForExpression(
    "document.body.innerText.includes('ISO standards evidence updated') && document.body.innerText.includes('ISO READY')",
    "standards evidence saved",
    45000
  );

  const encryptedStandardsStorage = await evaluate(`(() => {
    const raw = localStorage.getItem("akvm.encryptedVault.v1");
    return {
      hasPlainEvidence: raw.includes(${JSON.stringify(smokeEvidence)}),
      hasEncryptedPayload: JSON.parse(raw).payload.length > 64
    };
  })()`);
  assert(encryptedStandardsStorage.hasEncryptedPayload, "Encrypted vault payload missing after standards save.");
  assert(!encryptedStandardsStorage.hasPlainEvidence, "Plaintext standards evidence leaked into encrypted storage.");
  checks.push(["ISO standards evidence flow", true, "control status saved without plaintext evidence in storage"]);

  if (isLabMode) {
    await runLabChecks({
      assert,
      checks,
      evaluate,
      smokeEvidence,
      smokePassword,
      smokeSecret,
      waitForExpression
    });
  }

  const relevantIssues = issues.filter((issue) => !/favicon/i.test(issue));
  assert(relevantIssues.length === 0, `Browser reported errors: ${relevantIssues.join(" | ")}`);
  checks.push(["Browser console/runtime", true, "no relevant errors"]);

  printResults(`${testLabel} PASSED`);
} catch (error) {
  checks.push([`${titleCase(testLabel)} failure`, false, error.message]);
  printResults(`${testLabel} FAILED`);
  throw error;
} finally {
  if (cdp) {
    await cdp.close().catch(() => {});
  }
  await closeBrowserRuntime(browserRuntime);
  if (staticServer) {
    await staticServer.close();
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function printResults(title) {
  console.log(`\n${title}`);
  for (const [name, passed, detail] of checks) {
    console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
  }
}

function titleCase(value) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
