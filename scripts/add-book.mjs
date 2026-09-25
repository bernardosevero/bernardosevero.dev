import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

// Strict parsing rejects unknown flags and missing values instead of ignoring them.
const { values } = parseArgs({
  options: {
    id: { type: 'string' },
    title: { type: 'string' },
    author: { type: 'string' },
    status: { type: 'string' },
    isbn: { type: 'string' },
  },
});

const id = values.id;
const title = values.title?.trim();
const author = values.author?.trim();
const status = values.status;
const isbn = values.isbn?.replace(/[\s-]/g, '').toUpperCase();
const allowedStatuses = new Set(['reading', 'finished', 'wishlist']);

if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
  throw new Error('Pass a lowercase kebab-case ID with --id.');
if (!title) throw new Error('Pass the real book title with --title.');
if (!author) throw new Error('Pass the real author with --author.');
if (!status || !allowedStatuses.has(status))
  throw new Error('Pass --status reading, finished, or wishlist.');
if (isbn && !/^(?:\d{9}[\dX]|\d{13})$/.test(isbn))
  throw new Error('ISBN must be a valid 10- or 13-character identifier.');

const target = resolve('src/content/books.json');
const temporary = `${target}.${process.pid}.tmp`;
const books = JSON.parse(await readFile(target, 'utf8'));
if (!Array.isArray(books)) throw new Error('src/content/books.json must contain an array.');
if (books.some((book) => book.id === id)) throw new Error(`Book already exists: ${id}`);

books.push({ id, title, author, status, ...(isbn ? { isbn } : {}), draft: true });
books.sort((left, right) => left.title.localeCompare(right.title));
await writeFile(temporary, `${JSON.stringify(books, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
await rename(temporary, target);
console.log(`Added draft book ${id} to ${target}.`);
