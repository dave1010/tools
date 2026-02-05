---
title: Expiring Note Link
description: Share notes that expire automatically
category: Productivity & Writing
---

Create a private note and get a shareable link that expires automatically. Choose a lifetime, save the note, and share the URL with anyone who needs access before it disappears.

## Data stored in Cloudflare KV

Notes are stored in Cloudflare KV under the key pattern `expiring-note:<id>` as JSON:

```json
{
  "content": "string",
  "createdAt": "ISO timestamp",
  "expiresAt": "ISO timestamp"
}
```

Notes are deleted automatically by Cloudflare KV when the TTL elapses.
