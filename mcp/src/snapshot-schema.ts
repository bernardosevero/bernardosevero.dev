import { z } from 'zod';

// The Worker's view of the site's /api/v1/content.json. Objects strip unknown
// keys, so the site may add fields (the v1 contract is additive) while the
// Worker only ever returns the fields named here.

export const profileSchema = z.object({
  url: z.url().describe('Canonical page for this profile on bernardosevero.dev.'),
  name: z.string(),
  title: z.string(),
  location: z.string(),
  headline: z.string(),
  summary: z.string().describe('Markdown; **bold** marks emphasis.'),
  description: z.string(),
  focus: z.array(z.string()),
  strengths: z.array(z.string()),
  specializations: z.array(z.string()),
  tools: z.array(z.string()),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      period: z.string(),
      location: z.string(),
      employment: z.string().optional(),
      description: z.string(),
      highlights: z.array(z.string()).describe('Markdown; **bold** marks emphasis.'),
      technologies: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      school: z.string(),
      location: z.string(),
      period: z.string(),
      coursework: z.string().optional(),
    }),
  ),
  skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
  links: z
    .array(z.object({ label: z.string(), url: z.url() }))
    .describe('Public contact and profile links.'),
});

/** Lowercase kebab-case, the shape of every slug and book ID on the site. */
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const calendarDateSchema = z.iso.date().describe('Calendar date, YYYY-MM-DD.');

export const projectSchema = z.object({
  slug: slugSchema,
  url: z.url().describe('The Projects page on bernardosevero.dev; projects have no detail pages.'),
  title: z.string(),
  summary: z.string(),
  links: z.array(z.object({ label: z.string(), url: z.url() })),
});

export const postSchema = z.object({
  slug: slugSchema,
  url: z.url().describe('Canonical page for this post on bernardosevero.dev.'),
  title: z.string(),
  description: z.string(),
  publishedAt: calendarDateSchema,
  updatedAt: calendarDateSchema.optional(),
  topics: z.array(z.string()),
  readingMinutes: z.number().int().positive(),
  body: z.string().describe('The full post as Markdown.'),
});

export const bookStatusSchema = z.enum(['reading', 'finished', 'wishlist']);

export const bookSchema = z.object({
  id: slugSchema,
  title: z.string(),
  author: z.string(),
  status: bookStatusSchema,
  rating: z.number().min(0).max(5).optional().describe('Out of 5. Absent when not rated.'),
  review: z
    .object({
      url: z.url().describe('Canonical page for this review on bernardosevero.dev.'),
      language: z.enum(['en', 'pt-BR']),
      finishedAt: calendarDateSchema.optional(),
      body: z.string().describe('The full review as Markdown, in its original language.'),
    })
    .optional(),
});

export const snapshotSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.iso.datetime(),
  site: z.url(),
  profile: profileSchema,
  projects: z.array(projectSchema),
  posts: z.array(postSchema),
  books: z.array(bookSchema),
});

export type Profile = z.infer<typeof profileSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Post = z.infer<typeof postSchema>;
export type Book = z.infer<typeof bookSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
