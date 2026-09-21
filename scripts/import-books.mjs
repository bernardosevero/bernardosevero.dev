import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const inputFlag = process.argv.indexOf('--input');
const inputPath = inputFlag >= 0 ? process.argv[inputFlag + 1] : undefined;
if (!inputPath) throw new Error('Pass a normalized JSON file with --input.');

const incoming = JSON.parse(await readFile(resolve(inputPath), 'utf8'));
if (!Array.isArray(incoming)) throw new Error('The normalized Notion export must be a JSON array.');

const target = resolve('src/content/books.json');
const temporary = `${target}.${process.pid}.tmp`;
const reviewDirectory = resolve('src/content/book-reviews');
const books = JSON.parse(await readFile(target, 'utf8'));
if (!Array.isArray(books)) throw new Error('src/content/books.json must contain an array.');

const byNotionId = new Map(books.filter((book) => book.notionId).map((book) => [book.notionId, book]));
const byId = new Map(books.map((book) => [book.id, book]));
const allowedStatuses = new Set(['reading', 'finished', 'wishlist']);
const knownEnglishMetadata = new Map([
  ['3d474cb445b881328124e14e1570a5c8', { title: 'The Metamorphosis', author: 'Franz Kafka' }],
  ['3d474cb445b881199053ee7d6730761a', { title: 'The Death of Ivan Ilyich', author: 'Leo Tolstoy' }],
  ['3d474cb445b881629c05e1c0862934d8', { title: 'White Nights', author: 'Fyodor Dostoevsky' }],
]);
const slugify = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const normalizeIsbn = (value) => value == null ? undefined : String(value).replace(/[\s-]/g, '').toUpperCase();
const reviewUpdates = [];

for (const source of incoming) {
  if (!source || typeof source !== 'object') throw new Error('Every book must be an object.');
  for (const field of ['notionId', 'title', 'author', 'status', 'notionLastEditedAt']) {
    if (!source[field]) throw new Error(`A book is missing ${field}.`);
  }
  if (!allowedStatuses.has(source.status)) throw new Error(`Invalid status for ${source.title}.`);
  if (source.rating != null && (!Number.isFinite(source.rating) || source.rating < 0 || source.rating > 5)) {
    throw new Error(`Invalid rating for ${source.title}.`);
  }
  const isbn = normalizeIsbn(source.isbn);
  if (isbn && !/^(?:\d{9}[\dX]|\d{13})$/.test(isbn)) throw new Error(`Invalid ISBN for ${source.title}.`);

  const known = knownEnglishMetadata.get(source.notionId);
  const title = source.englishTitle?.trim() || known?.title;
  const author = source.englishAuthor?.trim() || known?.author;
  if (!title || !author) throw new Error(`English title and author are required for ${source.title}.`);

  const existing = byNotionId.get(source.notionId);
  const id = existing?.id ?? slugify(`${author}-${title}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error(`Invalid book ID: ${id}`);
  const collision = byId.get(id);
  if (collision && collision !== existing) throw new Error(`Book ID collision: ${id}`);

  const book = { ...existing, id, title, author, status: source.status, notionId: source.notionId, notionLastEditedAt: source.notionLastEditedAt, draft: false, preview: false };
  delete book.review;
  if (source.rating == null) delete book.rating; else book.rating = source.rating;
  if (!source.finishedAt) delete book.finishedAt; else book.finishedAt = source.finishedAt;
  if (isbn) book.isbn = isbn;
  if (typeof source.review === 'string' && source.review.trim()) {
    reviewUpdates.push({ id, content: `${source.review.trim()}\n`, existing: Boolean(existing) });
  }
  if (!book.coverOverride && source.coverUrl) book.coverUrl = source.coverUrl;
  if (source.coverSource) book.coverSource = source.coverSource;
  if (source.coverProvenance) book.coverProvenance = source.coverProvenance;

  if (existing) Object.assign(existing, book);
  else { books.push(book); byId.set(id, book); byNotionId.set(source.notionId, book); }
  console.log(`Synced ${id}`);
}

books.sort((left, right) => left.title.localeCompare(right.title));
if (reviewUpdates.length) await mkdir(reviewDirectory, { recursive: true });
const reviewWrites = [];
for (const review of reviewUpdates) {
  const reviewPath = resolve(reviewDirectory, `${review.id}.md`);
  let current;
  try { current = await readFile(reviewPath, 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (current !== undefined && !review.existing) throw new Error(`Review file already exists for new book: ${review.id}`);
  if (current === review.content) continue;
  reviewWrites.push({ path: reviewPath, content: review.content });
}
await writeFile(temporary, `${JSON.stringify(books, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
for (const review of reviewWrites) {
  const reviewTemporary = `${review.path}.${process.pid}.tmp`;
  await writeFile(reviewTemporary, review.content, { encoding: 'utf8', flag: 'wx' });
  await rename(reviewTemporary, review.path);
}
await rename(temporary, target);
console.log(`Imported ${incoming.length} book${incoming.length === 1 ? '' : 's'} without deleting local entries.`);
