---
name: writing-skills
description: "Use when creating or updating SKILL.md documentation - Guides them through required front matter and consistent markdown content."
---

## Front matter

- Match the `name` to the directory name exactly.
- Write the `description` as "Use when … - …" in under 30 words and third person.
- Quote the description if it includes punctuation that could break YAML.

## Markdown body

- Copy relevant guidance from AGENTS.md or synthesize concise instructions for the skill topic.
- Keep headings and bullet lists structured so readers can scan quickly.
- Preserve the original AGENTS.md text unless instructed to move or delete it.

## Maintenance

- Refresh the skill when AGENTS.md guidance changes or new expectations emerge.
- Run `scripts/skills-to-agents-md` after updates to regenerate the skills list in AGENTS.md.
