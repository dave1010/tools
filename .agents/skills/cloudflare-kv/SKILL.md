---
name: cloudflare-kv
description: "Use when persisting tool data in Cloudflare KV - Describes bindings, key naming, and function conventions."
---

## Cloudflare KV basics

- Cloudflare deploys a shared KV namespace bound as `TOOLS_KV` for all tools. Use the binding directly; do not create new namespaces per tool.
- Structure keys as `<tool-name>:<key>` so data stays isolated between tools.
- Store small JSON blobs or strings. For structured data, serialize to JSON and document the schema in the tool README.

## Access patterns

- Prefer atomic operations like `TOOLS_KV.get`, `put`, and `delete`. For counters, use `TOOLS_KV.get` + `put` with retries or Workers KV atomic counters when available.
- Always handle the `null` case on `get` to avoid `undefined` data paths for first-time users.
- Cache reads in memory during a single request when multiple lookups are required.

## Cloudflare Functions

- Name or prefix Functions after the tool, e.g. `counter_increment` or `counter/functions/increment` so routes stay organized.
- In Functions, read and write KV via the `env.TOOLS_KV` binding provided in the handler signature.
- Return descriptive error messages and HTTP status codes for KV failures to simplify debugging.

## Example

The `counter` tool stores its count in `TOOLS_KV` under the key `counter:value`. Reuse that pattern whenever you need shared state across sessions.
