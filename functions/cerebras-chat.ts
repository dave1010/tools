// functions/cerebras-chat.ts
import type { PagesFunction } from "@cloudflare/workers-types";

type Env = {
  CEREBRAS_API_KEY?: string;
  /** Optional: override to point at CF AI Gateway or a mock */
  CEREBRAS_API_URL?: string;
  /** Optional: set "1" to expose a small debug header */
  DEBUG?: string;
};

type ChatPayload = {
  model: string;
  messages: Array<any>;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string[];
  seed?: number;
  response_format?: Record<string, unknown>;
};

const DEFAULT_API_URL = "https://api.cerebras.ai/v1/chat/completions"; // 1

/* ---------- small helpers ---------- */

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

const readJSON = async <T>(req: Request): Promise<T | null> => {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
};

const corsBase = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin ?? "*",
  Vary: "Origin",
});

const exposeRateLimitHeaders = () =>
  // let the browser read Cerebras rate-limit headers
  ({
    "Access-Control-Expose-Headers":
      [
        "x-ratelimit-limit-requests-day",
        "x-ratelimit-remaining-requests-day",
        "x-ratelimit-limit-tokens-minute",
        "x-ratelimit-remaining-tokens-minute",
      ].join(", "),
  }); // 2

/* ---------- OPTIONS (CORS preflight) ---------- */
export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  const acrh =
    request.headers.get("Access-Control-Request-Headers") ?? "content-type";
  const origin = request.headers.get("Origin");
  return new Response(null, {
    status: 204,
    headers: {
      ...corsBase(origin),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": acrh,
      "Access-Control-Max-Age": "86400",
      Allow: "POST, OPTIONS",
    },
  });
};

/* ---------- POST (proxy to Cerebras) ---------- */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get("Origin");

  const apiKey = env.CEREBRAS_API_KEY?.trim();
  if (!apiKey) {
    return json(
      { error: "Missing binding 'CEREBRAS_API_KEY' on this deployment." },
      500,
      {
        ...corsBase(origin),
        "X-Missing-Binding": "CEREBRAS_API_KEY",
      }
    );
  }

  const payload = await readJSON<ChatPayload>(request);
  if (!payload) {
    return json({ error: "Invalid JSON payload" }, 400, corsBase(origin));
  }

  const { model, messages } = payload;
  if (!model || typeof model !== "string") {
    return json({ error: "`model` is required" }, 400, corsBase(origin));
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return json(
      { error: "`messages` must be a non-empty array" },
      400,
      corsBase(origin)
    );
  }

  const outgoing: Record<string, unknown> = {
    model: model.trim(),
    messages,
    stream: payload.stream === true,
  };

  if (isFiniteNumber(payload.temperature)) outgoing.temperature = payload.temperature;
  if (isFiniteNumber(payload.top_p)) outgoing.top_p = payload.top_p;
  if (isFiniteNumber(payload.max_tokens)) outgoing.max_tokens = payload.max_tokens;
  if (Array.isArray(payload.stop)) outgoing.stop = payload.stop;
  if (isFiniteNumber(payload.seed)) outgoing.seed = payload.seed;
  if (payload.response_format && typeof payload.response_format === "object") {
    outgoing.response_format = payload.response_format;
  }

  const apiURL = (env.CEREBRAS_API_URL?.trim() || DEFAULT_API_URL);

  const upstreamInit: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Cerebras auth is a Bearer token
      Authorization: `Bearer ${apiKey}`, // 3
    },
    body: JSON.stringify(outgoing),
  };

  let upstream: Response;
  try {
    upstream = await fetch(apiURL, upstreamInit);
  } catch (err) {
    console.error("Cerebras proxy request failed", err);
    return json(
      { error: "Failed to reach Cerebras API" },
      502,
      corsBase(origin)
    );
  }

  // Prepare response headers: pass-through + CORS + no-store
  const headers = new Headers(upstream.headers);
  headers.set("Cache-Control", "no-store");
  headers.delete("www-authenticate");
  Object.entries(corsBase(origin)).forEach(([k, v]) => headers.set(k, v));
  Object.entries(exposeRateLimitHeaders()).forEach(([k, v]) => headers.set(k, v));

  // Optional small debug signal (does not leak secrets)
  if (env.DEBUG === "1") headers.set("X-Has-Cerebras-Key", "1");

  // Stream or buffer depending on caller's request
  if (outgoing.stream === true) {
    // Pass through the SSE stream untouched.
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  }

  const text = await upstream.text();
  // Ensure JSON content-type for non-streamed responses
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  return new Response(text, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
};

/* ---------- utils ---------- */
function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}
