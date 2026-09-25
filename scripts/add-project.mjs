import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

// Strict parsing rejects unknown flags and missing values instead of ignoring them.
const { values } = parseArgs({
  options: {
    slug: { type: 'string' },
    title: { type: 'string' },
  },
});

const { slug, title } = values;

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  throw new Error('Pass a lowercase kebab-case slug with --slug.');
}
if (!title?.trim()) throw new Error('Pass the real project title with --title.');

const targetDirectory = resolve('src/content/projects');
const target = resolve(targetDirectory, `${slug}.md`);
if (!target.startsWith(`${targetDirectory}\\`) && !target.startsWith(`${targetDirectory}/`)) {
  throw new Error('The project path escaped the content directory.');
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
problem: "TODO: explain the real problem."
constraints: []
decisions: []
contribution: "TODO: describe your real contribution."
lessons: []
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
try {
  // The exclusive flag makes the existence check and the write one atomic step.
  await writeFile(target, template, { encoding: 'utf8', flag: 'wx' });
} catch (error) {
  if (error?.code === 'EEXIST') {
    throw new Error(`Project already exists: ${target}`, { cause: error });
  }
  throw error;
}
console.log(`Created ${target}`);
