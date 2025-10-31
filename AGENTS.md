# AGENTS.md

## Making a new tool

- Add a new dir in ./tools
- Add index.html and any other files
- Add a README.md with YAML front matter defining `title` and a 4-8 word `description`. Use the README.md for any help text that would otherwise take up space on the tool web page.
- Include a `category` in the front matter, reusing an existing category when possible. Add a new one if nothing fits.
- Only when requested: set `featured: true` in the front matter to highlight a tool card on the homepage.
- Need the category list? From the repo root run `grep '^### ' README.md`.

## Build & Deploy

- Github Actions and Cloudflare automatically run `npm run build`, which will regenerate the top level index.html and README.md from tool README.md metadata.
- `npm run build` doesn't need to be ran manually when adding or editing tools, only if youre changing the build process itself.

## Tests

None.

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

<skills>

## Skills

You have new skills. If any skill might be relevant then you MUST read it.

- [cdn-usage](skills/cdn-usage/SKILL.md) - Use when adding external browser dependencies via CDN - Provides CDN selection guidance to ensure reliable script loading.
- [github-integration](skills/github-integration/SKILL.md) - Use when building GitHub-based features - Explains auth token usage and Gist rendering helpers.
- [llm-inference](skills/llm-inference/SKILL.md) - Use when orchestrating Cloudflare LLM calls or prompts - Explains available inference endpoints so the agent selects suitable models.
- [writing-skills](skills/writing-skills/SKILL.md) - Use when creating or updating SKILL.md documentation - Guides them through required front matter and consistent markdown content.
</skills>
