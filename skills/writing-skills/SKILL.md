---
name: writing-skills
description: "Use when drafting new tool or documentation instructions - Reminds them of required structure so deliverables stay compliant."
---

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
