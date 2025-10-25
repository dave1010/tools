import { promises as fs } from 'fs';
import path from 'path';

const rootDir = process.cwd();
const toolsDir = path.join(rootDir, 'tools');
const templatePath = path.join(rootDir, 'src', 'index.template.html');

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

const template = await fs.readFile(templatePath, 'utf8');

if (!template.includes('{{TOOLS_LIST}}')) {
  throw new Error(`Template ${templatePath} must include a {{TOOLS_LIST}} placeholder.`);
}

const html = template.replace('{{TOOLS_LIST}}', listItems);

await fs.writeFile(path.join(rootDir, 'index.html'), html);
