// The public data contract served at /api/v1/ and read by the MCP Worker.
// Every emitted field is named here on purpose: never spread a content entry,
// so a new schema field stays private until someone adds it (docs/mcp.md).

import { getDestinationType } from './project-links';

export const snapshotSchemaVersion = 1;

/** The subset of the About entry this serializer reads. */
export interface AboutSource {
  name: string;
  title: string;
  location: string;
  headline: string;
  summary: string;
  description: string;
  focus: string[];
  strengths: { label: string }[];
  specializations: string[];
  tools: string[];
  experience: {
    company: string;
    role: string;
    period: string;
    location: string;
    employment?: string;
    description: string;
    highlights: string[];
    tech: string[];
  }[];
  education: {
    degree: string;
    school: string;
    location: string;
    period: string;
    coursework?: string;
  }[];
  skills: { group: string; items: string[] }[];
  links: { label: string; url: string }[];
}

export interface PublicProfile {
  url: string;
  name: string;
  title: string;
  location: string;
  headline: string;
  summary: string;
  description: string;
  focus: string[];
  strengths: string[];
  specializations: string[];
  tools: string[];
  experience: {
    company: string;
    role: string;
    period: string;
    location: string;
    employment?: string;
    description: string;
    highlights: string[];
    technologies: string[];
  }[];
  education: {
    degree: string;
    school: string;
    location: string;
    period: string;
    coursework?: string;
  }[];
  skills: { group: string; items: string[] }[];
  links: { label: string; url: string }[];
}

export interface PublicSnapshot {
  schemaVersion: typeof snapshotSchemaVersion;
  generatedAt: string;
  site: string;
  profile: PublicProfile;
  projects: PublicProject[];
  posts: PublicPost[];
  books: PublicBook[];
}

export interface PublicIndex {
  schemaVersion: typeof snapshotSchemaVersion;
  generatedAt: string;
  site: string;
  content: string;
  pages: { about: string; projects: string; posts: string; reading: string };
}

/** Absolute URL for a site-relative path, honoring the configured base path. */
export function publicUrl(path: string, site: URL, basePath: string): string {
  return new URL(`${basePath}${path}`, site).href;
}

export interface ProfileUrls {
  site: string;
  about: string;
  /** Absent when no CV document is published. */
  cv?: string;
}

export function toPublicProfile(about: AboutSource, urls: ProfileUrls): PublicProfile {
  const links = [
    ...about.links.map((link) => ({ label: link.label, url: link.url })),
    { label: 'Website', url: urls.site },
  ];
  if (urls.cv !== undefined) links.push({ label: 'CV (PDF)', url: urls.cv });

  return {
    url: urls.about,
    name: about.name,
    title: about.title,
    location: about.location,
    headline: about.headline,
    summary: about.summary,
    description: about.description,
    focus: [...about.focus],
    // Levels are a visual device on the CV page, not a factual claim.
    strengths: about.strengths.map((strength) => strength.label),
    specializations: [...about.specializations],
    tools: [...about.tools],
    experience: about.experience.map((job) => ({
      company: job.company,
      role: job.role,
      period: job.period,
      location: job.location,
      ...(job.employment !== undefined && { employment: job.employment }),
      description: job.description,
      highlights: [...job.highlights],
      technologies: [...job.tech],
    })),
    education: about.education.map((entry) => ({
      degree: entry.degree,
      school: entry.school,
      location: entry.location,
      period: entry.period,
      ...(entry.coursework !== undefined && { coursework: entry.coursework }),
    })),
    skills: about.skills.map((skill) => ({ group: skill.group, items: [...skill.items] })),
    links,
  };
}

export interface ProjectSource {
  title: string;
  summary: string;
  links: { label: string; url: string }[];
}

export interface PublicProject {
  slug: string;
  url: string;
  title: string;
  summary: string;
  links: { label: string; url: string }[];
}

/**
 * Only what the Projects page renders: title, summary, and links to verified
 * hosts. Role, technologies, outcomes, and the case-study fields are the
 * owner's records and are not published (docs/content.md).
 */
export function toPublicProject(slug: string, project: ProjectSource, url: string): PublicProject {
  return {
    slug,
    url,
    title: project.title,
    summary: project.summary,
    links: project.links
      .filter((link) => getDestinationType(link.url) !== undefined)
      .map((link) => ({ label: link.label, url: link.url })),
  };
}

export interface PostSource {
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date | undefined;
  topics: string[];
  readingMinutes: number;
}

export interface PublicPost {
  slug: string;
  url: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  topics: string[];
  readingMinutes: number;
  body: string;
}

/** Calendar date (YYYY-MM-DD): content dates carry no meaningful time. */
export function calendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toPublicPost(
  slug: string,
  post: PostSource,
  url: string,
  body: string,
): PublicPost {
  return {
    slug,
    url,
    title: post.title,
    description: post.description,
    publishedAt: calendarDate(post.publishedAt),
    ...(post.updatedAt !== undefined && { updatedAt: calendarDate(post.updatedAt) }),
    topics: [...post.topics],
    readingMinutes: post.readingMinutes,
    body,
  };
}

export interface BookSource {
  id: string;
  title: string;
  author: string;
  status: 'reading' | 'finished' | 'wishlist';
  rating?: number | undefined;
  finishedAt?: Date | undefined;
  reviewLanguage?: 'en' | 'pt-BR' | undefined;
}

export interface PublicBook {
  id: string;
  title: string;
  author: string;
  status: 'reading' | 'finished' | 'wishlist';
  rating?: number;
  review?: {
    url: string;
    language: 'en' | 'pt-BR';
    finishedAt?: string;
    body: string;
  };
}

/** `review` is present only when the site publishes a review page for the book. */
export function toPublicBook(book: BookSource, review?: { url: string; body: string }): PublicBook {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    status: book.status,
    // Zero is a real rating; only an absent one is omitted.
    ...(book.rating !== undefined && { rating: book.rating }),
    ...(review && {
      review: {
        url: review.url,
        language: book.reviewLanguage ?? 'en',
        // The finish date is shown only on the review page.
        ...(book.finishedAt !== undefined && { finishedAt: calendarDate(book.finishedAt) }),
        body: review.body,
      },
    }),
  };
}

const markdownImage = /!\[([^\]]*)\]\(\s*([^)\s]+)((?:\s+"[^"]*")?)\s*\)/g;
const absoluteReference = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i;

/**
 * Rewrites relative Markdown image paths to absolute URLs, so the body still
 * works outside the site. `resolve` returns the published URL for a path, or
 * undefined when the image is unknown, which fails the build.
 */
export function rewriteMarkdownImages(
  body: string,
  resolve: (path: string) => string | undefined,
): string {
  return body.replace(markdownImage, (match, alt: string, path: string, title: string) => {
    if (absoluteReference.test(path)) return match;
    const url = resolve(path);
    if (url === undefined) throw new Error(`No published image for Markdown path "${path}".`);
    return `![${alt}](${url}${title})`;
  });
}
