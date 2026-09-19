import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const inputFlag = process.argv.indexOf('--input');
const inputPath = inputFlag >= 0 ? process.argv[inputFlag + 1] : undefined;
if (!inputPath) throw new Error('Pass a normalized JSON file with --input.');

const raw = JSON.parse(await readFile(resolve(inputPath), 'utf8'));
if (!Array.isArray(raw)) throw new Error('The normalized Notion export must be a JSON array.');

const targetDirectory = resolve('src/content/books');
await mkdir(targetDirectory, { recursive: true });

const existingByNotionId = new Map();
for (const file of await readdir(targetDirectory)) {
  if (!file.endsWith('.md')) continue;
  const body = await readFile(resolve(targetDirectory, file), 'utf8');
  const id = body.match(/^notionId:\s*["']?([^\n"']+)/m)?.[1]?.trim();
  if (id) existingByNotionId.set(id, { file, coverUrl: body.match(/^coverUrl:\s*["']?([^\n"']+)/m)?.[1]?.trim(), coverOverride: /^coverOverride:\s*true/m.test(body) });
}

const slugify = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const yaml = (value) => JSON.stringify(String(value));
const allowedStatuses = new Set(['reading', 'finished', 'wishlist']);

for (const book of raw) {
  if (!book || typeof book !== 'object') throw new Error('Every book must be an object.');
  for (const field of ['notionId', 'title', 'author', 'status', 'notionLastEditedAt']) {
    if (!book[field]) throw new Error(`A book is missing ${field}.`);
  }
  if (!allowedStatuses.has(book.status)) throw new Error(`Invalid status for ${book.title}.`);
  if (book.rating != null && (!Number.isFinite(book.rating) || book.rating < 0 || book.rating > 5)) {
    throw new Error(`Invalid rating for ${book.title}.`);
  }

  const existing = existingByNotionId.get(book.notionId);
  const filename = existing?.file ?? `${slugify(`${book.author}-${book.title}`)}.md`;
  const target = resolve(targetDirectory, filename);
  const frontmatter = [
    '---',
    `title: ${yaml(book.title)}`,
    `author: ${yaml(book.author)}`,
    `status: ${book.status}`,
    ...(book.rating == null ? [] : [`rating: ${book.rating}`]),
    ...(book.finishedAt ? [`finishedAt: ${yaml(book.finishedAt)}`] : []),
    ...(book.coverUrl || existing?.coverUrl ? [`coverUrl: ${yaml(existing?.coverOverride ? existing.coverUrl : book.coverUrl ?? existing?.coverUrl)}`] : []),
    ...(existing?.coverOverride ? ['coverOverride: true'] : []),
    `notionId: ${yaml(book.notionId)}`,
    `notionLastEditedAt: ${yaml(book.notionLastEditedAt)}`,
    'draft: false',
    '---',
    '',
  ];
  const review = typeof book.review === 'string' ? book.review.trim() : '';
  await writeFile(target, `${frontmatter.join('\n')}${review}${review ? '\n' : ''}`, 'utf8');
  console.log(`Synced ${filename}`);
}

console.log(`Imported ${raw.length} book${raw.length === 1 ? '' : 's'} without deleting local entries.`);
