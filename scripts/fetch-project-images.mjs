import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

// Saves each visible project's og:image once, so builds never depend on other servers.
const { values } = parseArgs({
  options: {
    force: { type: 'boolean', default: false },
  },
});

const projectsDirectory = resolve('src/content/projects');
const outputDirectory = resolve('src/assets/projects/og');
const userAgent = 'bernardosevero.dev project image fetcher (+https://bernardosevero.dev/)';
const timeoutMs = 10_000;
const maxImageBytes = 5 * 1024 * 1024;
const extensionsByType = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
]);

/** Reads only the top-level frontmatter fields this script needs. */
function readProjectFields(source) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1];
  if (frontmatter === undefined) throw new Error('missing frontmatter');
  const scalar = (key) => {
    const match = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(frontmatter);
    return match ? match[1].trim().replace(/^["']|["']$/g, '') : undefined;
  };
  const linksBlock = /^links:\s*\r?\n((?:[ \t]+.*\r?\n?)*)/m.exec(frontmatter)?.[1] ?? '';
  const firstLinkUrl = /^\s*(?:-\s*)?url:\s*(.+)$/m.exec(linksBlock)?.[1].trim();
  return {
    // The schema defaults `draft` to true, so only an explicit false is visible.
    visible: scalar('draft') === 'false',
    hasImage: scalar('image') !== undefined,
    pageUrl: scalar('liveUrl') ?? firstLinkUrl?.replace(/^["']|["']$/g, ''),
  };
}

function parseHttpsUrl(value, base) {
  const url = URL.parse(value, base);
  return url?.protocol === 'https:' ? url : undefined;
}

function fetchWithTimeout(url) {
  return fetch(url, {
    headers: { 'User-Agent': userAgent },
    signal: AbortSignal.timeout(timeoutMs),
  });
}

function readMetaContent(html, attribute, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (!new RegExp(`\\b${attribute}=["']${name}["']`, 'i').test(tag)) continue;
    const content = /\bcontent=["']([^"']+)["']/i.exec(tag)?.[1];
    if (content) return content.replaceAll('&amp;', '&');
  }
  return undefined;
}

/** Returns the saved file name, or a reason when the page has no usable preview image. */
async function saveOgImage(slug, pageUrl, previousFileName) {
  const page = await fetchWithTimeout(pageUrl);
  if (!page.ok) throw new Error(`${pageUrl} responded ${page.status}`);
  const html = await page.text();
  const imageValue =
    readMetaContent(html, 'property', 'og:image') ?? readMetaContent(html, 'name', 'twitter:image');
  if (!imageValue) return { status: 'no og:image' };

  const imageUrl = parseHttpsUrl(imageValue, page.url);
  if (!imageUrl) throw new Error(`og:image is not an https URL: ${imageValue}`);

  const image = await fetchWithTimeout(imageUrl);
  // A page may advertise a preview image it no longer serves; the card then uses the default.
  if (!image.ok)
    return { status: 'og:image unavailable', detail: `(${imageUrl} responded ${image.status})` };
  const contentType = image.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? '';
  const extension = extensionsByType.get(contentType);
  if (!extension) throw new Error(`${imageUrl} is ${contentType || 'untyped'}, not png/jpeg/webp`);
  const bytes = Buffer.from(await image.arrayBuffer());
  if (bytes.byteLength > maxImageBytes) throw new Error(`${imageUrl} is larger than 5 MB`);

  const fileName = `${slug}.${extension}`;
  await writeFile(resolve(outputDirectory, fileName), bytes);
  // A replaced image may change format; two files for one slug would make the card's choice ambiguous.
  if (previousFileName && previousFileName !== fileName) {
    await rm(resolve(outputDirectory, previousFileName));
  }
  return { status: 'saved', detail: `${fileName} from ${imageUrl}` };
}

await mkdir(outputDirectory, { recursive: true });
const existing = await readdir(outputDirectory);
const projectFiles = (await readdir(projectsDirectory)).filter((name) => /\.mdx?$/.test(name));
let failures = 0;

for (const fileName of projectFiles) {
  const slug = fileName.replace(/\.mdx?$/, '');
  try {
    const project = readProjectFields(await readFile(resolve(projectsDirectory, fileName), 'utf8'));
    if (!project.visible) {
      console.log(`${slug}: skipped (draft)`);
      continue;
    }
    if (project.hasImage) {
      console.log(`${slug}: skipped (has an added image)`);
      continue;
    }
    const saved = existing.find((name) => name.replace(/\.[^.]+$/, '') === slug);
    if (saved && !values.force) {
      console.log(`${slug}: skipped (${saved} exists; pass --force to replace)`);
      continue;
    }
    const pageUrl = project.pageUrl && parseHttpsUrl(project.pageUrl);
    if (!pageUrl) {
      console.log(`${slug}: no og:image (no https liveUrl or link)`);
      continue;
    }
    const result = await saveOgImage(slug, pageUrl, saved);
    console.log(`${slug}: ${result.status}${result.detail ? ` ${result.detail}` : ''}`);
  } catch (error) {
    failures += 1;
    console.error(`${slug}: error ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures > 0) process.exitCode = 1;
