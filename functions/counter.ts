interface Env {
  TOOLS_KV: KVNamespace;
}

const COUNTER_KEY = "counter:value";

const jsonResponse = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
};

const getStoredCount = async (kv: KVNamespace): Promise<number> => {
  const stored = await kv.get(COUNTER_KEY);
  if (!stored) {
    return 0;
  }

  const value = Number.parseInt(stored, 10);
  return Number.isFinite(value) && value >= 0 ? value : 0;
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const { TOOLS_KV } = env;

  if (!TOOLS_KV) {
    console.error("TOOLS_KV binding is missing");
    return jsonResponse({ error: "KV store unavailable" }, { status: 500 });
  }

  if (request.method === "GET") {
    try {
      const count = await getStoredCount(TOOLS_KV);
      return jsonResponse({ count });
    } catch (error) {
      console.error("Failed to read counter", error);
      return jsonResponse({ error: "Failed to read counter" }, { status: 500 });
    }
  }

  if (request.method === "POST") {
    try {
      const current = await getStoredCount(TOOLS_KV);
      const next = current + 1;
      await TOOLS_KV.put(COUNTER_KEY, String(next));
      return jsonResponse({ count: next });
    } catch (error) {
      console.error("Failed to increment counter", error);
      return jsonResponse({ error: "Failed to increment counter" }, { status: 500 });
    }
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: {
      Allow: "GET, POST",
    },
  });
};
