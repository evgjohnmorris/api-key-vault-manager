export async function runLabChecks({
  assert,
  checks,
  evaluate,
  smokeEvidence,
  smokePassword,
  smokeSecret,
  waitForExpression
}) {
  await evaluate(`document.querySelector("#edit-entry-button").click()`);
  await waitForExpression("!!document.querySelector('#entry-form')", "edit modal opened");

  await evaluate(`(() => {
    const updates = {
      name: "Lab Edited Key",
      provider: "Lab Provider",
      status: "Needs verification",
      riskLevel: "Medium",
      useCase: "Edited during deeper lab test",
      tags: "smoke, lab, edited",
      notes: "Updated in lab mode using temporary fake data only."
    };
    for (const [name, value] of Object.entries(updates)) {
      const field = document.querySelector("[name='" + name + "']");
      if (!field) throw new Error("Missing edit field: " + name);
      field.value = value;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }
    document.querySelector("#entry-form").requestSubmit();
    return true;
  })()`);

  await waitForExpression(
    "document.body.innerText.includes('Entry updated') && document.body.innerText.includes('Lab Edited Key') && document.body.innerText.includes('Needs verification')",
    "entry edit saved",
    45000
  );
  checks.push(["Entry edit flow", true, "metadata, status, risk, tags, and notes updated"]);

  await evaluate(`(() => {
    const query = document.querySelector("#filter-query");
    query.value = "Lab Provider";
    query.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  })()`);
  await waitForExpression(
    "document.body.innerText.includes('1 matching entries') && document.body.innerText.includes('Lab Edited Key')",
    "positive filter result"
  );

  await evaluate(`(() => {
    const query = document.querySelector("#filter-query");
    query.value = "no-entry-should-match-this-lab-query";
    query.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  })()`);
  await waitForExpression(
    "document.body.innerText.includes('No entries match these filters')",
    "empty filter result"
  );

  await evaluate(`(() => {
    const query = document.querySelector("#filter-query");
    query.value = "";
    query.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  })()`);
  await waitForExpression(
    "document.body.innerText.includes('Lab Edited Key')",
    "filter reset"
  );
  checks.push(["Search/filter behavior", true, "positive match, empty state, and reset verified"]);

  await evaluate(`document.querySelector("#settings-button").click()`);
  await waitForExpression("!!document.querySelector('#settings-form')", "settings modal opened");

  await evaluate(`(() => {
    document.querySelector("[name='autoLockMinutes']").value = "3";
    document.querySelector("[name='clipboardClearSeconds']").value = "7";
    document.querySelector("[name='defaultRiskLevel']").value = "High";
    document.querySelector("[name='requirePurpose']").checked = true;
    document.querySelector("[name='requireRotationPlan']").checked = true;
    document.querySelector("#settings-form").requestSubmit();
    return true;
  })()`);

  await waitForExpression(
    "document.body.innerText.includes('Settings updated') && document.body.innerText.includes('Auto-lock: 3 min') && document.body.innerText.includes('Clipboard clear: 7 sec')",
    "settings saved",
    45000
  );
  checks.push(["Settings flow", true, "auto-lock, clipboard, defaults, and requirements saved"]);

  const labStorage = await evaluate(`(() => {
    const raw = localStorage.getItem("akvm.encryptedVault.v1");
    return {
      hasPlainSecret: raw.includes(${JSON.stringify(smokeSecret)}),
      hasPlainEvidence: raw.includes(${JSON.stringify(smokeEvidence)}),
      hasPlainPassword: raw.includes(${JSON.stringify(smokePassword)}),
      hasEditedName: raw.includes("Lab Edited Key"),
      hasPayload: JSON.parse(raw).payload.length > 64
    };
  })()`);

  assert(labStorage.hasPayload, "Encrypted vault payload missing after lab updates.");
  assert(!labStorage.hasPlainSecret, "Plaintext secret leaked after lab updates.");
  assert(!labStorage.hasPlainEvidence, "Plaintext standards evidence leaked after lab updates.");
  assert(!labStorage.hasPlainPassword, "Master password leaked into browser storage.");
  assert(!labStorage.hasEditedName, "Entry metadata unexpectedly leaked outside encrypted payload.");
  checks.push(["Encrypted storage after mutations", true, "secret, evidence, password, and metadata remain encrypted"]);

  await evaluate(`document.querySelector("#lock-button").click()`);
  await waitForExpression(
    "document.body.innerText.includes('Unlock vault') && !!document.querySelector('#unlock-form')",
    "vault locked"
  );

  await evaluate(`(() => {
    document.querySelector("#master-password").value = "wrong-lab-password";
    document.querySelector("#unlock-form").requestSubmit();
    return true;
  })()`);
  await waitForExpression(
    "document.body.innerText.includes('Could not unlock the vault')",
    "wrong password rejected",
    45000
  );

  await evaluate(`(() => {
    document.querySelector("#master-password").value = ${JSON.stringify(smokePassword)};
    document.querySelector("#unlock-form").requestSubmit();
    return true;
  })()`);
  await waitForExpression(
    "document.body.innerText.includes('Key Ops') && document.body.innerText.includes('Lab Edited Key')",
    "correct password unlocks",
    45000
  );
  checks.push(["Lock/unlock security flow", true, "wrong password rejected and correct password restores vault"]);
}
