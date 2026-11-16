// Drift check: the snapshot the site just built must satisfy the Worker's schema.
// Usage: npm run check:snapshot -- ../dist/api/v1/content.json
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { z } from 'zod';
import { snapshotSchema } from '../src/snapshot-schema.ts';

const path = process.argv[2];
if (!path) {
  console.error('Pass the path to a built snapshot, e.g. ../dist/api/v1/content.json');
  process.exit(2);
}

const result = snapshotSchema.safeParse(JSON.parse(await readFile(path, 'utf8')));
if (!result.success) {
  console.error(`${path} does not match the Worker's snapshot schema:`);
  console.error(z.prettifyError(result.error));
  process.exit(1);
}

console.log(`${path} matches the Worker's snapshot schema (v${result.data.schemaVersion}).`);
