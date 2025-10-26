const TYPE_MAP = {
  A: 1,
  AAAA: 28,
  CNAME: 5,
  MX: 15,
  NS: 2,
  TXT: 16,
  SOA: 6,
};

const MAX_HOSTNAME_LENGTH = 253;
const LABEL_PATTERN = /^[A-Za-z0-9_-]{1,63}$/;

const isValidHostname = (value) => {
  if (!value || value.length > MAX_HOSTNAME_LENGTH) {
    return false;
  }

  const trimmed = value.endsWith(".") ? value.slice(0, -1) : value;
  if (!trimmed) {
    return false;
  }

  const labels = trimmed.split(".");
  return labels.every((label) => {
    if (label === "*") {
      return true;
    }
    if (!LABEL_PATTERN.test(label)) {
      return false;
    }
    return !(label.startsWith("-") || label.endsWith("-"));
  });
};

export const onRequest = async ({ request }) => {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET" },
    });
  }

  const url = new URL(request.url);
  const name = url.searchParams.get("name")?.trim() ?? "";
  const typeParam = (url.searchParams.get("type") || "A").toUpperCase();

  if (!name) {
    return new Response(JSON.stringify({ success: false, error: "Missing name parameter." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isValidHostname(name)) {
    return new Response(JSON.stringify({ success: false, error: "Invalid hostname provided." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const recordType = TYPE_MAP[typeParam] ?? TYPE_MAP.A;
  const query = new URL("https://cloudflare-dns.com/dns-query");
  query.searchParams.set("name", name);
  query.searchParams.set("type", String(recordType));

  let response;
  try {
    response = await fetch(query.toString(), {
      headers: {
        Accept: "application/dns-json",
        "User-Agent": "tools.dave.engineer dns lookup",
      },
      cf: {
        cacheTtl: 30,
        cacheEverything: false,
      },
    });
  } catch (error) {
    console.error("DNS lookup request failed", error);
    return new Response(JSON.stringify({ success: false, error: "DNS resolver request failed." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!response.ok) {
    const text = await response.text();
    return new Response(JSON.stringify({ success: false, error: text || "Resolver returned an error." }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.error("Failed to parse resolver response", error);
    return new Response(JSON.stringify({ success: false, error: "Invalid resolver response." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = {
    success: true,
    query: {
      name,
      type: typeParam,
    },
    data,
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  });
};
