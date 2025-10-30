---
title: Tool Calling Demo
description: Watch Cerebras tool calls unfold
category: Developer
---

This demo shows how a Cerebras-hosted LLM can decide to call a JavaScript tool for precise answers. It logs each tool request and result so you can follow the full reasoning loop.

1. Enter a prompt that requires a calculation (for example, “How many days until Christmas?”).
2. The assistant decides whether to call the `run_js` tool.
3. The tool evaluates the JavaScript snippet and sends the output back to the model.
4. The assistant responds to the user with the final answer.

The JavaScript tool runs in the browser with a very small sandbox that exposes core math and date utilities.
