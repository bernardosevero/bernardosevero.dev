import { describe, expect, it } from 'vitest';
import { createServer } from '../src/server';
import type { Snapshot } from '../src/snapshot-schema';
import { ToolInputError } from '../src/tools/define';
import { getBookReview } from '../src/tools/get-book-review';
import { getPost } from '../src/tools/get-post';
import { getProjects } from '../src/tools/get-projects';
import { getReadingList } from '../src/tools/get-reading-list';
import { listPosts } from '../src/tools/list-posts';
import { snapshotFixture } from './fixtures/snapshot';
import { callMcp } from './mcp-client';

const empty: Snapshot = { ...snapshotFixture, projects: [], posts: [], books: [] };

interface ToolResult {
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
  content: { type: string; text: string }[];
}

async function callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  const message = await callMcp(
    () => createServer({ loadSnapshot: () => Promise.resolve(snapshotFixture) }),
    'tools/call',
    { name, arguments: args },
  );
  if (!message.result) throw new Error(`No result: ${JSON.stringify(message)}`);
  return message.result as ToolResult;
}

describe('get_projects', () => {
  it('returns every project with its links and canonical URL', () => {
    expect(getProjects.run(snapshotFixture, {})).toEqual({ projects: snapshotFixture.projects });
  });

  it('returns an empty list when nothing is published', () => {
    expect(getProjects.run(empty, {})).toEqual({ projects: [] });
  });
});

describe('list_posts', () => {
  it('lists summaries newest first, without bodies, plus every topic', () => {
    const { posts, topics } = listPosts.run(snapshotFixture, {});

    expect(posts.map((post) => post.slug)).toEqual(['newer-post', 'older-post']);
    expect(topics).toEqual(['Go', 'Testing']);
    for (const post of posts) expect(post).not.toHaveProperty('body');
    expect(posts[1]?.updatedAt).toBe('2026-01-15');
  });

  it('filters by topic regardless of case', () => {
    const { posts } = listPosts.run(snapshotFixture, { topic: 'go' });
    expect(posts.map((post) => post.slug)).toEqual(['newer-post']);
  });

  it('names the available topics when the topic matches nothing', () => {
    expect(() => listPosts.run(snapshotFixture, { topic: 'Rust' })).toThrow(ToolInputError);
    expect(() => listPosts.run(snapshotFixture, { topic: 'Rust' })).toThrow('Go, Testing');
  });

  it('returns empty lists when no posts are published', () => {
    expect(listPosts.run(empty, {})).toEqual({ topics: [], posts: [] });
  });
});

describe('get_post', () => {
  it('returns the full post with its body and canonical URL', () => {
    expect(getPost.run(snapshotFixture, { slug: 'newer-post' })).toEqual(snapshotFixture.posts[0]);
  });

  it('points to list_posts for an unknown slug', () => {
    expect(() => getPost.run(snapshotFixture, { slug: 'missing' })).toThrow(ToolInputError);
    expect(() => getPost.run(snapshotFixture, { slug: 'missing' })).toThrow('list_posts');
  });
});

describe('get_reading_list', () => {
  it('lists every book, with a review URL in place of the review text', () => {
    const { books } = getReadingList.run(snapshotFixture, {});

    expect(books.map((book) => book.id)).toEqual(['reviewed-book', 'current-book', 'wished-book']);
    expect(books[0]).toEqual({
      id: 'reviewed-book',
      title: 'Reviewed Book',
      author: 'An Author',
      status: 'finished',
      rating: 0,
      reviewUrl: 'https://example.dev/reading/reviewed-book/',
    });
    expect(books[1]).not.toHaveProperty('rating');
    expect(books[1]).not.toHaveProperty('reviewUrl');
  });

  it('filters by shelf', () => {
    const { books } = getReadingList.run(snapshotFixture, { status: 'reading' });
    expect(books.map((book) => book.id)).toEqual(['current-book']);
  });

  it('returns an empty list for a shelf with no books', () => {
    const onlyWishlist = { ...snapshotFixture, books: snapshotFixture.books.slice(2) };
    expect(getReadingList.run(onlyWishlist, { status: 'finished' })).toEqual({ books: [] });
  });
});

describe('get_book_review', () => {
  it('returns the review in its original language with the rating', () => {
    const book = getBookReview.run(snapshotFixture, { id: 'reviewed-book' });

    expect(book.rating).toBe(0);
    expect(book.review).toEqual(snapshotFixture.books[0]?.review);
  });

  it('points to get_reading_list for an unknown book', () => {
    expect(() => getBookReview.run(snapshotFixture, { id: 'missing' })).toThrow('get_reading_list');
  });

  it('says so when the book exists but has no published review', () => {
    expect(() => getBookReview.run(snapshotFixture, { id: 'current-book' })).toThrow(
      '"Current Book" has no published review',
    );
  });
});

describe('tools over the protocol', () => {
  it('returns structured content that matches the text content', async () => {
    const result = await callTool('get_post', { slug: 'older-post' });

    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toEqual(snapshotFixture.posts[1]);
    expect(JSON.parse(result.content[0]?.text ?? '')).toEqual(snapshotFixture.posts[1]);
  });

  it('reports an unknown slug as a tool error with the next step', async () => {
    const result = await callTool('get_post', { slug: 'missing' });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toBeUndefined();
    expect(result.content[0]?.text).toContain('list_posts');
  });

  it.each([
    ['get_post', { slug: '../etc/passwd' }],
    ['get_post', { slug: 'Has Spaces' }],
    ['get_post', {}],
    ['get_book_review', { id: 'https://example.com' }],
    ['get_reading_list', { status: 'abandoned' }],
    ['list_posts', { topic: '' }],
  ])('rejects invalid input for %s: %j', async (name, args) => {
    const message = await callMcp(
      () => createServer({ loadSnapshot: () => Promise.resolve(snapshotFixture) }),
      'tools/call',
      { name, arguments: args },
    );
    const result = message.result as ToolResult | undefined;

    expect(message.error !== undefined || result?.isError === true).toBe(true);
    expect(result?.structuredContent).toBeUndefined();
  });
});
