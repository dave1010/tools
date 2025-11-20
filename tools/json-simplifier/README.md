---
title: JSON Dedupe & Simplify
description: Shrink JSON for docs and prompt examples.
category: Data & File Conversion
---

A quick way to condense large JSON snippets for documentation and LLM prompts.

1. Paste or upload your JSON.
2. Click **Simplify JSON** to truncate long strings and keep only one leaf value per path in arrays.
3. Copy or download the simplified output.

String values are trimmed to 200 characters (with `...` added when truncated). Arrays only keep the first leaf value for each distinct JSON path, so you keep structure while dropping duplicates.
