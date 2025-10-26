const API_URL = "https://api.cerebras.ai/v1/chat/completions";

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const handleRequest = async (request, env) => {
  if (request.method === "OPTIONS") {
    const requestHeaders = request.headers.get("Access-Control-Request-Headers");
    return new Response(null, {
      status: 204,
      headers: {
        Allow: "POST",
        "Access-Control-Allow-Origin": request.headers.get("Origin") ?? "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": requestHeaders ?? "content-type",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  const apiKey = env.CEREBRAS_API_KEY;
  if (!apiKey) {
    return new Response("Missing Cerebras API key", { status: 500 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const messages = Array.isArray(payload?.messages) ? payload.messages : null;
  const model = typeof payload?.model === "string" ? payload.model.trim() : "";
  const stream = payload?.stream === true;

  if (!messages || messages.length === 0) {
    return new Response("`messages` must be a non-empty array", { status: 400 });
  }

  if (!model) {
    return new Response("`model` is required", { status: 400 });
  }

  const outgoing = {
    model,
    messages,
    stream,
  };

  if (isFiniteNumber(payload?.temperature)) {
    outgoing.temperature = payload.temperature;
  }

  if (isFiniteNumber(payload?.top_p)) {
    outgoing.top_p = payload.top_p;
  }

  if (typeof payload?.max_tokens === "number" && Number.isFinite(payload.max_tokens)) {
    outgoing.max_tokens = payload.max_tokens;
  }

  if (Array.isArray(payload?.stop)) {
    outgoing.stop = payload.stop;
  }

  if (typeof payload?.seed === "number" && Number.isFinite(payload.seed)) {
    outgoing.seed = payload.seed;
  }

  if (payload?.response_format && typeof payload.response_format === "object") {
    outgoing.response_format = payload.response_format;
  }

  const requestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(outgoing),
  };

  let response;
  try {
    response = await fetch(API_URL, requestInit);
  } catch (error) {
    console.error("Cerebras proxy request failed", error);
    return new Response("Failed to reach Cerebras API", { status: 502 });
  }

  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-store");
  headers.delete("www-authenticate");
  headers.set("access-control-allow-origin", request.headers.get("Origin") ?? "*");
  headers.set("vary", "Origin");

  if (stream) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const text = await response.text();
  return new Response(text, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const onRequest = async (context) => handleRequest(context.request, context.env);

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },
};
