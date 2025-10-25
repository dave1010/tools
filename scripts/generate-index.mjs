import { promises as fs } from 'fs';
import path from 'path';

const rootDir = process.cwd();
const toolsDir = path.join(rootDir, 'tools');

const entries = await fs.readdir(toolsDir, { withFileTypes: true });
const tools = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const slug = entry.name;
  const readmePath = path.join(toolsDir, slug, 'README.md');
  let content;

  try {
    content = await fs.readFile(readmePath, 'utf8');
  } catch (error) {
    throw new Error(`Missing README.md with front matter for tool: ${slug}`);
  }

  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\s*(?:\n|$)/);

  if (!frontMatterMatch) {
    throw new Error(`README.md for tool "${slug}" must contain YAML front matter.`);
  }

  const data = {};
  for (const line of frontMatterMatch[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  const title = data.title;
  const description = data.description;

  if (!title || !description) {
    throw new Error(`README.md for tool "${slug}" must define both title and description.`);
  }

  tools.push({ slug, title, description });
}

tools.sort((a, b) => a.title.localeCompare(b.title));

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const listItems = tools
  .map(
    (tool) => `        <li class="space-y-1">\n          <a href="/tools/${tool.slug}" class="font-medium">${escapeHtml(tool.title)}</a>\n          <p class="text-sm text-gray-600">${escapeHtml(tool.description)}</p>\n        </li>`
  )
  .join('\n');

const html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Tools</title>\n  <link rel="stylesheet" href="/assets/tw.css">\n</head>\n<body>\n  <main class="mx-auto max-w-3xl space-y-6 p-4 font-sans md:p-6">\n    <header class="space-y-2 text-center">\n      <h1 class="text-4xl font-semibold text-gray-900">Tools</h1>\n      <p class="text-gray-600">Collection of tools. Inspired by <a href="https://github.com/simonw/tools" class="font-medium">simonw/tools</a>.</p>\n      <p class="text-gray-600">Made by <a href="https://dave.engineer/" class="font-medium">Dave Hulbert</a>.</p>\n    </header>\n\n    <p>Tools live in the <a href="./tools" class="font-medium">./tools</a> directory.</p>\n\n    <section class="space-y-3">\n      <h2 class="text-2xl font-semibold text-gray-900">All tools</h2>\n      <ul class="space-y-2">\n${listItems}\n      </ul>\n    </section>\n\n    <footer class="border-t border-gray-200 pt-4 text-sm text-gray-600">\n      <p>View the project on <a href="https://github.com/dave1010/tools" class="font-medium">GitHub</a>.</p>\n    </footer>\n  </main>\n</body>\n</html>\n`;

await fs.writeFile(path.join(rootDir, 'index.html'), html);
