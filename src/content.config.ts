import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { profileLinkLabels, toolNames } from './config/profile';

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
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      image: image().optional(),
      role: z.string(),
      technologies: z.array(z.string()).default([]),
      outcomes: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      draft: z.boolean().default(true),
      publishedAt: date.optional(),
      repositoryUrl: z.url().optional(),
      liveUrl: z.url().optional(),
      links: z
        .array(
          z.object({
            label: z.string(),
            url: z.url(),
          }),
        )
        .default([]),
      problem: z.string(),
      constraints: z.array(z.string()).default([]),
      decisions: z.array(z.string()).default([]),
      contribution: z.string(),
      lessons: z.array(z.string()).default([]),
    }),
});

const books = defineCollection({
  loader: file('./src/content/books.json'),
  schema: z
    .object({
      id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string(),
      author: z.string(),
      status: z.enum(['reading', 'finished', 'wishlist']),
      reviewLanguage: z.enum(['en', 'pt-BR']).optional(),
      rating: z.number().min(0).max(5).optional(),
      finishedAt: date.optional(),
      coverUrl: z.url().optional(),
      coverSource: z.enum(['manual', 'catalog']).optional(),
      coverProvenance: z.string().optional(),
      coverOverride: z.boolean().default(false),
      isbn: z
        .string()
        .regex(/^(?:\d{9}[\dX]|\d{13})$/)
        .optional(),
      notionId: z.string().optional(),
      notionLastEditedAt: date.optional(),
      draft: z.boolean().default(false),
    })
    .strict(),
});

const bookReviews = defineCollection({
  loader: glob({ base: './src/content/book-reviews', pattern: '**/*.md' }),
});

// Home choices may only point at public sections; the System specimen route stays out.
const homeDestinations = ['projects', 'posts', 'books', 'about'] as const;

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: ({ image }) => {
    const aboutSchema = z.object({
      kind: z.literal('about'),
      name: z.string(),
      title: z.string(),
      base: z.string(),
      location: z.string(),
      headline: z.string(),
      summary: z.string(),
      teaser: z.string(),
      focus: z.array(z.string()),
      description: z.string(),
      strengths: z.array(
        z.object({
          label: z.string(),
          level: z.number().int().min(1).max(10),
        }),
      ),
      experience: z.array(
        z.object({
          company: z.string(),
          role: z.string(),
          period: z.string(),
          description: z.string(),
          logo: image().optional(),
          location: z.string(),
          employment: z.string().optional(),
          highlights: z.array(z.string()).min(1),
          tech: z.array(z.string()).default([]),
        }),
      ),
      skills: z
        .array(
          z.object({
            group: z.string(),
            items: z.array(z.string()).min(1),
          }),
        )
        .min(1),
      education: z
        .array(
          z.object({
            degree: z.string(),
            school: z.string(),
            location: z.string(),
            period: z.string(),
            coursework: z.string().optional(),
          }),
        )
        .default([]),
      specializations: z.array(z.string()),
      tools: z.array(z.enum(toolNames)),
      links: z.array(
        z.object({
          label: z.enum(profileLinkLabels),
          url: z.url(),
        }),
      ),
    });

    const homeSchema = z.object({
      kind: z.literal('home'),
      greeting: z.string(),
      intro: z.string(),
      prompt: z.string(),
      choices: z
        .array(
          z.object({
            label: z.string(),
            destination: z.enum(homeDestinations),
          }),
        )
        .length(4),
    });

    return z.discriminatedUnion('kind', [aboutSchema, homeSchema]);
  },
});

export const collections = { posts, projects, books, bookReviews, pages };
