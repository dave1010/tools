const ALLOWED_HOSTS = new Set(["www.emfcamp.org", "emfcamp.org"]);
const MAX_FEED_BYTES = 2 * 1024 * 1024;

const jsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

const isAllowedFeedUrl = (value) => {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  return parsed.protocol === "https:" && ALLOWED_HOSTS.has(parsed.hostname) && parsed.pathname.startsWith("/favourites");
};

export const onRequestGet = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const feedUrl = requestUrl.searchParams.get("url")?.trim() ?? "";

  if (!feedUrl) {
    return jsonResponse({ success: false, error: "Missing url parameter." }, 400);
  }

  if (!isAllowedFeedUrl(feedUrl)) {
    return jsonResponse({ success: false, error: "Only EMF Camp favourites feed URLs are supported." }, 400);
  }

  let response;
  try {
    response = await fetch(feedUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "tools.dave.engineer EMF favourites comparison",
      },
      cf: {
        cacheTtl: 60,
        cacheEverything: false,
      },
    });
  } catch (error) {
    console.error("EMF favourites request failed", error);
    return jsonResponse({ success: false, error: "Could not fetch the EMF favourites feed." }, 502);
  }

  if (!response.ok) {
    return jsonResponse({ success: false, error: `EMF returned HTTP ${response.status}.` }, response.status);
  }

  const contentLength = Number(response.headers.get("content-length") || "0");
  if (contentLength > MAX_FEED_BYTES) {
    return jsonResponse({ success: false, error: "Feed is too large." }, 413);
  }

  const text = await response.text();
  if (text.length > MAX_FEED_BYTES) {
    return jsonResponse({ success: false, error: "Feed is too large." }, 413);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse EMF favourites feed", error);
    return jsonResponse({ success: false, error: "EMF did not return valid JSON." }, 502);
  }

  if (!Array.isArray(data)) {
    return jsonResponse({ success: false, error: "EMF feed did not return a JSON array." }, 502);
  }

  return jsonResponse({ success: true, data });
};
