export async function waitForTarget(debugPort, appUrl) {
  const deadline = Date.now() + 20000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const targets = await response.json();
      const target = targets.find((item) => item.type === "page" && item.url.startsWith(appUrl));
      if (target?.webSocketDebuggerUrl) {
        return target;
      }
    } catch {
      await delay(250);
    }
  }

  throw new Error("Could not connect to the headless browser debugging target.");
}

export async function createCdpClient(webSocketUrl, { issues = [] } = {}) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  let nextId = 1;

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.id && pending.has(message.id)) {
      const { resolveMessage, rejectMessage } = pending.get(message.id);
      pending.delete(message.id);

      if (message.error) {
        rejectMessage(new Error(message.error.message || JSON.stringify(message.error)));
      } else {
        resolveMessage(message.result || {});
      }
      return;
    }

    if (message.method === "Runtime.exceptionThrown") {
      issues.push(message.params?.exceptionDetails?.text || "Runtime exception");
    }

    if (message.method === "Log.entryAdded" && ["error", "warning"].includes(message.params?.entry?.level)) {
      issues.push(message.params.entry.text);
    }
  });

  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", rejectOpen, { once: true });
  });

  return {
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      socket.send(JSON.stringify({ id, method, params }));

      return new Promise((resolveMessage, rejectMessage) => {
        pending.set(id, { resolveMessage, rejectMessage });
      });
    },
    close() {
      socket.close();
      return Promise.resolve();
    }
  };
}

export function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}
