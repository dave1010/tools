# AGENTS.md

## Making a new tool

- Add a new dir in ./tools
- Add index.html and any other files
- Add a README.md with YAML front matter defining `title` and a 4-8 word `description`. Other README.md content is rarely needed.
- Include a `category` in the front matter, reusing an existing category when possible (add a new one if nothing fits).
- Need the category list? From the repo root run `grep '^### ' README.md`.

## Build & Deploy

- Github Actions and Cloudflare automatically run `npm run build`, which will regenerate the top level index.html and README.md from tool README.md metadata.
- `npm run build` rarey needs to be ran manually.

## Tests

None.

## CDNs (if needed)

- UMD is probably best, unkess you're composing multiple modern packages and know they expose export syntax.
- Skip integrity hashes (LLMs get them wrong)
- LLM training data may get URLs wrong. Add `onerror="alert('Failed to load: ' + this.src)"`

### jsDelivr

- Use npm syntax: https://cdn.jsdelivr.net/npm/package@1 (auto-resolves latest 1.x)
- Works for ESM and UMD; safe default when unsure.

### cdnjs

- Only for very well-known libraries
- Eg https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js
- Explicit versions (@1.0.0) since it lacks semver resolution.

## Styling and Page Layout Guidelines

- Use the shared `/assets/tw.css`
- Page wrapper: `<main class="mx-auto max-w-3xl p-4 md:p-6 space-y-4 font-sans">`
- Primary button: `class="bg-brand-600 text-white rounded-lg px-3 py-1.5 hover:bg-brand-700"`
- The page should have the tool as its main focus. Eg use Flexbox (or CSS Grid) to have the tool fill the page
- Consider how it looks on mobile.
- Add a footer link to the home page. Eg: `<footer class="py-6 text-center text-sm text-gray-500"><a href="/" class="font-medium text-brand-700 hover:text-brand-600">← Back to tools.dave.engineer</a></footer>`
- These are guidelines! Different tools may need to look very different. Consider the request and what's best for the specific tool.
