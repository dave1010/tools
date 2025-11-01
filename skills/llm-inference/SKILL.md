---
name: llm-inference
description: "Use when wanting to interact with any LLM - Explains available inference endpoints so the agent selects suitable models."
---

## LLM Inference

The Cloudflare Pages function `functions/cerebras-chat.ts` provides OpenAI-compatible LLM inference. See `tools/cerebras-llm-inference/index.html` for a working example. The model `gpt-oss-120b` is the best all rounder.

LLMs are not just for chat: they can be used to process any string in any arbitrary way. If making a tool that requires the LLM to respond in a specific way or format then be very clear and explicit in its system prompt; eg what to include/exclude, plain/markdown formatting, length, etc.
