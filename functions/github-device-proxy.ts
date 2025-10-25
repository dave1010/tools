const ALLOWED_ENDPOINTS = new Set([
  "https://github.com/login/device/code",
  "https://github.com/login/oauth/access_token",
]);

export const onRequest = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const endpoint = typeof payload.endpoint === "string" ? payload.endpoint.trim() : "";
  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return new Response("Unsupported endpoint", { status: 400 });
  }

  const outgoingHeaders = new Headers({
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  });

  if (payload.headers && typeof payload.headers === "object") {
    for (const [key, value] of Object.entries(payload.headers)) {
      if (typeof value === "string" && value) {
        outgoingHeaders.set(key, value);
      }
    }
  }

  const body = typeof payload.body === "string" ? payload.body : "";

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: outgoingHeaders,
      body,
    });
  } catch (error) {
    console.error("GitHub proxy request failed", error);
    return new Response("Upstream request failed", { status: 502 });
  }

  const text = await response.text();
  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  headers.set("cache-control", "no-store");

  return new Response(text, {
    status: response.status,
    headers,
  });
};
