import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"]
]);

export async function startStaticServer(projectRoot) {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, "http://127.0.0.1");
      const requestedPath = decodeURIComponent(requestUrl.pathname);
      const safePath = requestedPath === "/" ? "/index.html" : requestedPath;
      const filePath = normalize(join(projectRoot, safePath));
      const normalizedRoot = normalize(projectRoot);

      if (!filePath.startsWith(normalizedRoot)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const data = await readFile(filePath);
      response.writeHead(200, {
        "Content-Type": mimeTypes.get(extname(filePath)) || "application/octet-stream"
      });
      response.end(data);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  await listen(server, 0);
  const { port } = server.address();

  return {
    port,
    close: () => new Promise((resolveClose) => server.close(resolveClose))
  };
}

export async function getFreePort() {
  const server = createServer();
  await listen(server, 0);
  const { port } = server.address();
  await new Promise((resolveClose) => server.close(resolveClose));
  return port;
}

function listen(server, port) {
  return new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", rejectListen);
      resolveListen();
    });
  });
}
