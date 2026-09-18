import { access, mkdir, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const slug = args.get('--slug');
const title = args.get('--title');

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  throw new Error('Pass a lowercase kebab-case slug with --slug.');
}
if (!title?.trim()) throw new Error('Pass the real project title with --title.');

const targetDirectory = resolve('src/content/projects');
const target = resolve(targetDirectory, `${slug}.md`);
if (!target.startsWith(`${targetDirectory}\\`) && !target.startsWith(`${targetDirectory}/`)) {
  throw new Error('The project path escaped the content directory.');
}

try {
  await access(target, constants.F_OK);
  throw new Error(`Project already exists: ${target}`);
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const yamlString = (value) => JSON.stringify(value.trim());
const template = `---
title: ${yamlString(title)}
summary: "TODO: explain the problem and why it mattered."
role: "TODO: add your real role."
technologies: []
outcomes: []
featured: false
draft: true
---

## The problem

Replace this prompt with the real context. Do not publish confidential information.

## Constraints and decisions

Explain the tradeoffs, your contribution, and the reasoning behind the solution.

## Outcome

Add only outcomes you can support. Prefer concrete evidence over inflated numbers.

## What I learned

Close with the lesson that another builder or recruiter should remember.
`;

await mkdir(targetDirectory, { recursive: true });
await writeFile(target, template, { encoding: 'utf8', flag: 'wx' });
console.log(`Created ${target}`);
