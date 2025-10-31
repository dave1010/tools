# AGENTS.md

## Making a new tool

- Add a new dir in ./tools
- Add index.html and any other files
- Add a README.md with YAML front matter defining `title` and a 4-8 word `description`. Use the README.md for any help text that would otherwise take up space on the tool web page.
- Include a `category` in the front matter, reusing an existing category when possible. Add a new one if nothing fits.
- Optional: set `featured: true` in the front matter to highlight a tool card on the homepage.
- Need the category list? From the repo root run `grep '^### ' README.md`.

## Build & Deploy

- Github Actions and Cloudflare automatically run `npm run build`, which will regenerate the top level index.html and README.md from tool README.md metadata.
- `npm run build` doesn't need to be ran manually when adding or editing tools, only if youre changing the build process itself.

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

### esm.sh

- Use for live ESM transforms, not static files. Transforms TS/TSX on the fly.
- Eg `import * as THREE from "https://esm.sh/three@0.180.0";`
- tsx mode: load https://esm.sh/tsx as a module → inline <script type="text/tsx">

## Styling and Page Layout Guidelines

- Use the shared `/assets/tw.css`
- Page wrapper: `<main class="mx-auto max-w-3xl p-4 md:p-6 space-y-4 font-sans">`
- Brand palette: 50 `#eff6ff`, 100 `#dbeafe`, 200 `#bfdbfe`, 500 `#3b82f6`, 600 `#2563eb`, 700 `#1d4ed8`
- Base button styles are provided via the `.btn` class (also applied to raw `<button>` elements).
- Primary button: `class="btn btn-primary"` (or rely on the default `<button>` styles).
- Secondary button: `class="btn btn-secondary"`
- The page should have the tool as its main focus. Eg use Flexbox (or CSS Grid) to have the tool fill the page.
- Consider how it looks on mobile.
- Keep on-page copy short. Move instructions, tips, and troubleshooting info into the tool's README unless it is essential for the current interaction.
- Add a footer that links back home and to the tool's GitHub directory as “About”. Example:
  ```html
  <footer class="py-6 text-center text-sm text-gray-500">
    <div class="flex justify-center gap-4">
      <a href="/" class="font-medium text-brand-700 hover:text-brand-600">← Back to tools.dave.engineer</a>
      <a href="https://github.com/dave1010/tools/tree/main/tools/example" class="font-medium text-brand-700 hover:text-brand-600">About</a>
    </div>
  </footer>
  ```
- These are guidelines! Different tools may need to look very different. Consider the request and what's best for the specific tool.

## Debugging JS

If the developer reports that JS is completely broken then surface all errors. Eg `window.addEventListener('error', ...`

## LLM Inference

The Cloudflare Pages function `functions/cerebras-chat.ts` provides OpenAI-compatible LLM inference. See `tools/cerebras-llm-inference/index.html` for a working example. The model `gpt-oss-120b` is the best all rounder.

LLMs are not just for chat: they can be used to process and string in any arbitrary way.

## GitHub

### GitHub tokens and auth

For GitHub integrations, the user's browser may already have `github-device-login-token` in local storage. If they don't, or if more permissions are needed, then direct the user to /tools/github-device-login/

### Gists

See `tools/scratch-pad/index.html` for an example of saving Gists. The URL `https://gistpreview.github.io/?${encodeURIComponent(gistId)}` will render an index.html gist as HTML.
