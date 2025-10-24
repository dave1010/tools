# AGENTS.md

## Making a new tool

- add a new dir in ./tools
- add index.html and any other files
- add a link from README.md.
-  amd top level index.html

## Tests

None.

## CDNs (if needed)

- UMD is probably best, unkess you're composing multiple modern packages and know they expose export syntax.
- Skip integrity hashes (LLMs get them wrong)

### jsDelivr

- Use npm syntax: https://cdn.jsdelivr.net/npm/package@1 (auto-resolves latest 1.x)
- Works for ESM and UMD; safe default when unsure.

### cdnjs 

- for well-known libraries
- eg https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js
- explicit versions (@1.0.0) since it lacks semver resolution.
