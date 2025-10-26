---
title: GitHub Device Login
description: Start the GitHub device flow and store the resulting access token locally.
category: Developer
---

This tool walks you through GitHub's device authorization flow entirely in the browser. Provide the scopes you need, approve the device on GitHub, and the app will save the returned access token in `localStorage` for later use.

Because GitHub's OAuth endpoints do not emit CORS headers, all requests are automatically proxied through the built-in Cloudflare Pages function at `/github-device-proxy`. The device flow does not require the OAuth callback URL configured in your GitHub app.
