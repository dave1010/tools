---
name: github-integration
description: "Use when building GitHub-based features - Explains auth token usage and Gist rendering helpers."
---

## GitHub tokens and auth

- Check whether `github-device-login-token` is already in local storage before prompting users.
- When the token is missing or lacks scopes, direct users to `/tools/github-device-login/` to refresh authorization.

## Gists

- Review `tools/scratch-pad/index.html` for an end-to-end example of creating and saving Gists.
- Render saved HTML gists at `https://gistpreview.github.io/?${encodeURIComponent(gistId)}` to preview their content.
