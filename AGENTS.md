# AGENTS.md

## Making a new tool

- add a new dir in ./tools
- add index.html and any other files
- add a README.md with YAML front matter defining `title` and a 4-8 word `description`
- run `npm run build` to regenerate the top level index.html from README metadata
- add a link from README.md and top level index.html

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

## Styling

- use the shared `/assets/tw.css`
- Page wrapper: `<main class="mx-auto max-w-3xl p-4 md:p-6 space-y-4 font-sans">…`
- Primary button: `class="bg-brand-600 text-white rounded-lg px-3 py-1.5 hover:bg-brand-700"`
- Limit inline styles.
- ensure it works on mobile
