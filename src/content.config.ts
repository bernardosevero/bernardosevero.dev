import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const date = z.coerce.date();

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: date,
    updatedAt: date.optional(),
    topics: z.array(z.string()).default([]),
    readingMinutes: z.number().int().positive(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    technologies: z.array(z.string()).default([]),
    outcomes: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
    publishedAt: date.optional(),
    repositoryUrl: z.url().optional(),
    liveUrl: z.url().optional(),
  }),
});

const books = defineCollection({
  loader: glob({ base: './src/content/books', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    status: z.enum(['reading', 'finished', 'wishlist']),
    rating: z.number().min(0).max(5).optional(),
    finishedAt: date.optional(),
    coverUrl: z.url().optional(),
    notionId: z.string().optional(),
    notionLastEditedAt: date.optional(),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('home'),
      name: z.string(),
      title: z.string(),
      welcome: z.string(),
      details: z.array(z.object({ label: z.string(), value: z.string() })),
      sections: z.array(z.object({
        id: z.enum(['posts', 'about', 'projects', 'reading']),
        label: z.string(),
        subtitle: z.string(),
        description: z.string(),
        status: z.string(),
      })),
    }),
    z.object({
      kind: z.literal('about'),
      name: z.string(),
      title: z.string(),
      base: z.string(),
      focus: z.array(z.string()),
      description: z.string(),
    }),
  ]),
});

export const collections = { posts, projects, books, pages };
