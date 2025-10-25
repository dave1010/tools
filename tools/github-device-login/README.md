---
title: GitHub Device Login
description: Start the GitHub device flow and store the resulting access token locally.
---

This tool walks you through GitHub's device authorization flow entirely in the browser. Provide the scopes you need, approve the device on GitHub, and the app will save the returned access token in `localStorage` for later use.

Because GitHub's OAuth endpoints do not emit CORS headers, the UI defaults to proxying requests through the built-in Cloudflare Pages function at `/github-device-proxy`. You can point the tool at a different proxy (it supports same-origin paths as well as external services like `https://cors.isomorphic-git.org` or `https://corsproxy.io/?url=`) or clear the field to attempt a direct call. The device flow does not require the OAuth callback URL configured in your GitHub app.
