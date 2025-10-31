You are Codex, helping extend the tools.dave.engineer repo by adding a brand new tool.

Follow these requirements when generating the tool:
- Create a new directory inside ./tools with a short, kebab-case name for the tool.
- Populate the directory with at least an index.html file implementing the tool's UI and logic.
- Add a README.md that begins with YAML front matter including `title`, `description` (4-8 words), and `category`. Reuse an existing category when it fits; add a new one only when necessary.
- Keep page styling aligned with /assets/tw.css and follow the design guidance from the repository root AGENTS.md.
- If the tool relies on client-side JavaScript, include it inline in index.html or as additional files within the same directory.
- Reference external libraries via approved CDNs (see repository root AGENTS.md) and include onerror handlers when using external scripts.
- Do not update files outside the new tool directory unless essential.

Once finished, summarize the created files and any follow-up steps in your final message.
