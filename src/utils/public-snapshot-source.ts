import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { getCollection, getEntry } from 'astro:content';
import { cvAsset } from '../config/cv';
import { isVisibleContent } from './content';
import { basePath } from './paths';
import {
  publicUrl,
  rewriteMarkdownImages,
  snapshotSchemaVersion,
  toPublicBook,
  toPublicPost,
  toPublicProfile,
  toPublicProject,
  type PublicBook,
  type PublicIndex,
  type PublicPost,
  type PublicProject,
  type PublicSnapshot,
} from './public-snapshot';

// One timestamp per build, so content.json and index.json always agree.
const generatedAt = new Date().toISOString();

function requireSite(site: URL | undefined): URL {
  if (!site) throw new Error('Set `site` in astro.config.mjs: the public snapshot needs it.');
  return site;
}

const postImageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../content/posts/**/*.{png,jpg,jpeg,webp,gif,avif}',
  { eager: true },
);

/** Repository-root path for a module path relative to this file, e.g. `/src/content/posts/a.png`. */
function repositoryPath(relativeToThisFile: string): string {
  return new URL(relativeToThisFile, 'file:///src/utils/public-snapshot-source.ts').pathname;
}

/** Published URL of every post image, keyed by its repository-root path. */
async function publishedPostImages(origin: URL): Promise<Map<string, string>> {
  const entries = await Promise.all(
    Object.entries(postImageModules).map(async ([modulePath, module]) => {
      // The optimized rendition is always emitted; an unused original may be pruned.
      const { src } = await getImage({ src: module.default });
      return [repositoryPath(modulePath), new URL(src, origin).href] as const;
    }),
  );
  return new Map(entries);
}

async function publicProjects(origin: URL): Promise<PublicProject[]> {
  const projects = (await getCollection('projects', isVisibleContent)).sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured),
  );
  // Projects have no detail pages; the list page is each one's canonical URL.
  const url = publicUrl('projects/', origin, basePath);
  return projects.map((project) => toPublicProject(project.id, project.data, url));
}

async function publicPosts(origin: URL): Promise<PublicPost[]> {
  const [posts, images] = await Promise.all([
    getCollection('posts', isVisibleContent),
    publishedPostImages(origin),
  ]);

  return posts
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
    .map((post) => {
      if (!post.filePath) throw new Error(`Post "${post.id}" has no source file path.`);
      const postFile = `file:///${post.filePath}`;
      const body = rewriteMarkdownImages(post.body ?? '', (path) =>
        images.get(new URL(path, postFile).pathname),
      );
      return toPublicPost(
        post.id,
        post.data,
        publicUrl(`posts/${post.id}/`, origin, basePath),
        body,
      );
    });
}

async function publicBooks(origin: URL): Promise<PublicBook[]> {
  const [books, reviews] = await Promise.all([
    getCollection('books', isVisibleContent),
    getCollection('bookReviews'),
  ]);
  const reviewBodies = new Map(reviews.map((review) => [review.id, review.body?.trim() ?? '']));

  return books
    .sort((a, b) => a.data.title.localeCompare(b.data.title))
    .map((book) => {
      const body = reviewBodies.get(book.id);
      // Mirrors /reading/[slug]/: a review page exists only for a nonempty review.
      if (!body) return toPublicBook(book.data);
      return toPublicBook(book.data, {
        url: publicUrl(`reading/${book.id}/`, origin, basePath),
        // Reviews have no published images, so any relative image fails the build.
        body: rewriteMarkdownImages(body, () => undefined),
      });
    });
}

export async function buildPublicSnapshot(site: URL | undefined): Promise<PublicSnapshot> {
  const origin = requireSite(site);
  const about = await getEntry('pages', 'about');
  if (!about || about.data.kind !== 'about') {
    throw new Error('src/content/pages/about.md is missing or is not an About entry.');
  }
  const [projects, posts, books] = await Promise.all([
    publicProjects(origin),
    publicPosts(origin),
    publicBooks(origin),
  ]);

  return {
    schemaVersion: snapshotSchemaVersion,
    generatedAt,
    site: publicUrl('', origin, basePath),
    profile: toPublicProfile(about.data, {
      site: publicUrl('', origin, basePath),
      about: publicUrl('about/', origin, basePath),
      ...(cvAsset && { cv: publicUrl(cvAsset.path, origin, basePath) }),
    }),
    projects,
    posts,
    books,
  };
}

export function buildPublicIndex(site: URL | undefined): PublicIndex {
  const origin = requireSite(site);
  return {
    schemaVersion: snapshotSchemaVersion,
    generatedAt,
    site: publicUrl('', origin, basePath),
    content: publicUrl('api/v1/content.json', origin, basePath),
    pages: {
      about: publicUrl('about/', origin, basePath),
      projects: publicUrl('projects/', origin, basePath),
      posts: publicUrl('posts/', origin, basePath),
      reading: publicUrl('reading/', origin, basePath),
    },
  };
}
