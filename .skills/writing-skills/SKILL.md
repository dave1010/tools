---
name: writing-skills
description: "Use when creating or updating SKILL.md documentation - Explains how and why to create a skill."
---

Skills are used to for context that *may* be useful to a coding agent, without bloating LLM context at times theyre not useful.

Skills are only worthwhile if the coding agent fails a task without the skill.

Skills live in `/.skills`, with each skill having its own directory.

## SKILL.md

### Front matter

- Match the `name` to the directory name exactly.
- Write the `description` as "Use when <scenario> - <what it does>" in under 30 words and third person.
- Quote the description if it includes punctuation that could break YAML.

### Markdown body

- Write concise instructions for the skill topic.
- Keep headings and bullet lists structured so readers can scan quickly.

## Aditional files

Other files, like scripts or data, may live in the directory and be referenced by the skill.

## AGENTS.md

A GitHub Action automatically regenerates the skills list in AGENTS.md.
