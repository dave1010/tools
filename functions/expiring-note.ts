interface Env {
  TOOLS_KV: KVNamespace;
}

const TOOL_PREFIX = "expiring-note";
const MAX_LENGTH = 5000;
const MIN_TTL = 60;
const MAX_TTL = 60 * 60 * 24 * 7;

const jsonResponse = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
};

const parseJson = async (request: Request) => {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
};

const createNoteId = () => {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
};

const clampTtl = (ttl: number) => {
  if (!Number.isFinite(ttl)) {
    return null;
  }
  return Math.min(Math.max(Math.floor(ttl), MIN_TTL), MAX_TTL);
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const { TOOLS_KV } = env;

  if (!TOOLS_KV) {
    console.error("TOOLS_KV binding is missing");
    return jsonResponse({ error: "KV store unavailable" }, { status: 500 });
  }

  if (request.method === "GET") {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return jsonResponse({ error: "Missing id parameter" }, { status: 400 });
    }

    try {
      const key = `${TOOL_PREFIX}:${id}`;
      const stored = await TOOLS_KV.get(key, { type: "json" });

      if (!stored) {
        return jsonResponse({ error: "Note not found" }, { status: 404 });
      }

      return jsonResponse(stored);
    } catch (error) {
      console.error("Failed to fetch note", error);
      return jsonResponse({ error: "Failed to fetch note" }, { status: 500 });
    }
  }

  if (request.method === "POST") {
    const payload = await parseJson(request);
    const content = typeof payload?.content === "string" ? payload.content.trim() : "";
    const ttlInput = payload?.ttlSeconds;

    if (!content) {
      return jsonResponse({ error: "Note content is required" }, { status: 400 });
    }

    if (content.length > MAX_LENGTH) {
      return jsonResponse({ error: "Note is too long" }, { status: 400 });
    }

    const ttl = clampTtl(Number(ttlInput));
    if (!ttl) {
      return jsonResponse({ error: "Invalid TTL" }, { status: 400 });
    }

    const id = createNoteId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 1000);
    const payloadToStore = {
      content,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    try {
      await TOOLS_KV.put(`${TOOL_PREFIX}:${id}`, JSON.stringify(payloadToStore), {
        expirationTtl: ttl,
      });

      return jsonResponse({ id, ...payloadToStore });
    } catch (error) {
      console.error("Failed to save note", error);
      return jsonResponse({ error: "Failed to save note" }, { status: 500 });
    }
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: {
      Allow: "GET, POST",
    },
  });
};
