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
  const category = data.category?.trim() || 'Miscellaneous';

  if (!title || !description) {
    throw new Error(`README.md for tool "${slug}" must define both title and description.`);
  }

  tools.push({ slug, title, description, category });
}

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toolsAlpha = [...tools].sort((a, b) => a.title.localeCompare(b.title));

const toolsByCategory = new Map();

for (const tool of toolsAlpha) {
  const list = toolsByCategory.get(tool.category) ?? [];
  list.push(tool);
  toolsByCategory.set(tool.category, list);
}

const orderedCategories = Array.from(toolsByCategory.keys()).sort((a, b) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' })
);

const categoryId = (category) =>
  `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'misc'}`;

const toolCard = (tool) => `        <li
          data-tool-card
          data-tool-slug="${escapeHtml(tool.slug)}"
          data-tool-title="${escapeHtml(tool.title)}"
          data-tool-description="${escapeHtml(tool.description)}"
          data-tool-category="${escapeHtml(tool.category)}"
        >
          <a href="/tools/${tool.slug}" class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-white/5 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
            <div class="flex items-center justify-between gap-3">
              <span class="text-lg font-semibold text-white transition-colors duration-200 group-hover:text-cyan-200">${escapeHtml(tool.title)}</span>
              <span aria-hidden="true" class="rounded-full bg-fuchsia-500/20 p-2 text-fuchsia-200 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white">
                <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </span>
            </div>
            <p class="mt-3 text-sm text-white/70">${escapeHtml(tool.description)}</p>
          </a>
        </li>`;

const listItems = toolsAlpha.map((tool) => toolCard(tool)).join('\n');

const categorySections = orderedCategories
  .map((category) => {
    const items = toolsByCategory.get(category)?.map((tool) => toolCard(tool)).join('\n') ?? '';
    const id = categoryId(category);
    const count = toolsByCategory.get(category)?.length ?? 0;
    return `      <section
        id="${id}"
        class="space-y-4"
        data-category-section
        data-category-name="${escapeHtml(category)}"
      >
        <div class="flex items-center justify-between gap-4">
          <h3 class="text-2xl font-semibold text-white">${escapeHtml(category)}</h3>
          <span
            class="text-sm font-medium text-white/60"
            data-category-count
            data-category-total="${count}"
          >${count} tool${count === 1 ? '' : 's'}</span>
        </div>
        <ul class="grid gap-4 sm:grid-cols-2">
${items}
        </ul>
      </section>`;
  })
  .join('\n\n');

const tocLinks = orderedCategories
  .map((category) => {
    const id = categoryId(category);
    return `<a href="#${id}" class="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm font-medium text-white/80 transition hover:border-cyan-400/60 hover:text-white">${escapeHtml(category)}</a>`;
  })
  .join('\n            ');

const tocMarkup = `          <nav class="flex flex-wrap gap-2" aria-label="Tool categories">
            ${tocLinks}
          </nav>`;

const template = await fs.readFile(templatePath, 'utf8');

const requiredPlaceholders = ['{{TOOLS_TOC}}', '{{TOOLS_BY_CATEGORY}}', '{{TOOLS_AZ}}'];

for (const placeholder of requiredPlaceholders) {
  if (!template.includes(placeholder)) {
    throw new Error(`Template ${templatePath} must include a ${placeholder} placeholder.`);
  }
}

let html = template
  .replace('{{TOOLS_TOC}}', tocMarkup)
  .replace('{{TOOLS_BY_CATEGORY}}', categorySections)
  .replace('{{TOOLS_AZ}}', listItems);

if (template.includes('{{TOOLS_COUNT}}')) {
  html = html.replace(/{{TOOLS_COUNT}}/g, String(toolsAlpha.length));
}

await fs.writeFile(path.join(rootDir, 'index.html'), html);

const readmePath = path.join(rootDir, 'README.md');
const readme = await fs.readFile(readmePath, 'utf8');
const startMarker = '<!-- TOOLS-LIST:START -->';
const endMarker = '<!-- TOOLS-LIST:END -->';

if (!readme.includes(startMarker) || !readme.includes(endMarker)) {
  throw new Error(
    `README.md must include ${startMarker} and ${endMarker} markers to update the tools list.`
  );
}

const readmeSections = orderedCategories
  .map((category) => {
    const toolsInCategory = toolsByCategory.get(category) ?? [];
    const items = toolsInCategory
      .map(
        (tool) =>
          `- [${tool.title}](https://tools.dave.engineer/tools/${tool.slug}) — ${tool.description}`
      )
      .join('\n');
    return `### ${category}\n\n${items}`;
  })
  .join('\n\n');

const generatedNotice = '<!-- This section is automatically generated by `npm run build`. -->';
const readmeSection = `${startMarker}\n\n${generatedNotice}\n\n${readmeSections}\n\n${endMarker}`;
const readmeSectionRegex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
const updatedReadme = readme.replace(readmeSectionRegex, readmeSection).replace(/\s*$/, '\n');

await fs.writeFile(readmePath, updatedReadme);
