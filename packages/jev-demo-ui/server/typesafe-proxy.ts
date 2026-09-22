import type { IncomingMessage, ServerResponse } from "node:http";
import {
  PROXY_BASE_PATH,
  PROXY_CONFIG_PATH,
  SERVER_PROXY_SENTINEL,
  TYPESAFE_API_BASE,
} from "./constants.js";

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function resolveUpstreamAuth(req: IncomingMessage): string | null {
  const serverKey = process.env.TYPESAFE_API_KEY?.trim();
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";

  if (token && token !== SERVER_PROXY_SENTINEL && token !== "test-key-for-fixtures") {
    return header ?? null;
  }

  if (serverKey) {
    return `Bearer ${serverKey}`;
  }

  return null;
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export async function handleTypesafeProxy(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const url = req.url ?? "";

  if (url === PROXY_CONFIG_PATH) {
    sendJson(res, 200, {
      serverKeyConfigured: Boolean(process.env.TYPESAFE_API_KEY?.trim()),
    });
    return true;
  }

  if (!url.startsWith(`${PROXY_BASE_PATH}/`)) {
    return false;
  }

  const auth = resolveUpstreamAuth(req);
  if (!auth) {
    sendJson(res, 401, {
      detail:
        "No API key available. Set TYPESAFE_API_KEY in .env for the dev server, or paste a session override in the UI.",
    });
    return true;
  }

  const upstreamPath = url.slice(PROXY_BASE_PATH.length);
  const upstreamUrl = `${TYPESAFE_API_BASE}${upstreamPath}`;
  const method = req.method ?? "GET";
  const body =
    method === "GET" || method === "HEAD" ? undefined : await readBody(req);

  const upstream = await fetch(upstreamUrl, {
    method,
    headers: {
      Authorization: auth,
      Accept: req.headers.accept ?? "application/json",
      ...(req.headers["content-type"] ? { "Content-Type": req.headers["content-type"] } : {}),
    },
    body: body?.length ? body : undefined,
  });

  res.statusCode = upstream.status;
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    res.setHeader(key, value);
  });

  const responseBody = Buffer.from(await upstream.arrayBuffer());
  res.end(responseBody);
  return true;
}
