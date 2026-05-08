import { delay } from "./cdp-client.mjs";

export function createPageDriver(cdp) {
  async function evaluate(expression) {
    const result = await cdp.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    });

    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "Runtime evaluation failed.");
    }

    return result.result?.value;
  }

  async function waitForExpression(expression, label, timeoutMs = 20000) {
    const deadline = Date.now() + timeoutMs;
    let lastError = "";

    while (Date.now() < deadline) {
      const value = await evaluate(expression).catch((error) => {
        lastError = error.message;
        return false;
      });
      if (value) return;
      await delay(250);
    }

    const bodyText = await evaluate("document.body.innerText.slice(0, 1500)").catch(() => "");
    throw new Error(`Timed out waiting for ${label}.${lastError ? ` Last error: ${lastError}.` : ""} Visible text: ${bodyText}`);
  }

  return {
    evaluate,
    waitForExpression
  };
}
