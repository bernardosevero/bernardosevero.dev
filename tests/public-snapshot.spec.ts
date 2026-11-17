import { test, expect } from '@playwright/test';
import {
  publicUrl,
  rewriteMarkdownImages,
  snapshotSchemaVersion,
  toPublicBook,
  toPublicPost,
  toPublicProfile,
  toPublicProject,
  type AboutSource,
  type PublicBook,
  type PublicPost,
  type PublicSnapshot,
} from '../src/utils/public-snapshot';

// Fields that must never reach the public contract (docs/mcp.md, invariant 3).
const privateKeys = [
  'draft',
  'notionId',
  'notionLastEditedAt',
  'coverProvenance',
  'coverOverride',
  'level',
  'logo',
  'kind',
  // Project case-study fields are the owner's records, not published content.
  'outcomes',
  'problem',
  'constraints',
  'decisions',
  'contribution',
  'lessons',
  'featured',
  'isbn',
  'coverUrl',
];

function collectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys);
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      keys.add(key);
      collectKeys(child, keys);
    }
  }
  return keys;
}

const about: AboutSource = {
  name: 'Test Person',
  title: 'Engineer',
  location: 'Somewhere',
  headline: 'Headline',
  summary: 'Summary',
  description: 'Description',
  focus: ['Web'],
  strengths: [{ label: 'Backend' }],
  specializations: ['Go'],
  tools: ['Docker'],
  experience: [
    {
      company: 'Example',
      role: 'Engineer',
      period: '2020 — 2021',
      location: 'Remote',
      description: 'A company.',
      highlights: ['Did a thing.'],
      tech: ['Go'],
    },
  ],
  education: [],
  skills: [{ group: 'Languages', items: ['Go'] }],
  links: [{ label: 'GitHub', url: 'https://github.com/example' }],
};

test('public URLs honor the root and GitHub Pages base paths', () => {
  const site = new URL('https://example.dev');
  expect(publicUrl('about/', site, '/')).toBe('https://example.dev/about/');
  expect(publicUrl('about/', site, '/portfolio/')).toBe('https://example.dev/portfolio/about/');
  expect(publicUrl('', site, '/')).toBe('https://example.dev/');
});

test('the profile serializer emits only named fields and drops strength levels', () => {
  const source = {
    ...about,
    strengths: [{ label: 'Backend', level: 9 }],
    experience: [{ ...about.experience[0], logo: { src: '/logo.svg' } }],
    notionId: 'private',
  };
  const profile = toPublicProfile(source, {
    site: 'https://example.dev/',
    about: 'https://example.dev/about/',
  });

  expect(profile.strengths).toEqual(['Backend']);
  expect(profile.experience[0].technologies).toEqual(['Go']);
  expect(profile.experience[0]).not.toHaveProperty('employment');
  for (const key of privateKeys) expect(collectKeys(profile)).not.toContain(key);
});

test('the CV link appears only when a CV is published', () => {
  const urls = { site: 'https://example.dev/', about: 'https://example.dev/about/' };
  const withoutCv = toPublicProfile(about, urls).links.map((link) => link.label);
  const withCv = toPublicProfile(about, { ...urls, cv: 'https://example.dev/cv.pdf' }).links;

  expect(withoutCv).toEqual(['GitHub', 'Website']);
  expect(withCv.at(-1)).toEqual({ label: 'CV (PDF)', url: 'https://example.dev/cv.pdf' });
});

test('content.json serves the profile without private fields', async ({ request }) => {
  const response = await request.get('./api/v1/content.json');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');

  const snapshot = await response.json();
  expect(snapshot.schemaVersion).toBe(snapshotSchemaVersion);
  expect(Number.isNaN(Date.parse(snapshot.generatedAt))).toBe(false);
  expect(snapshot.profile.name).toBe('Bernardo Severo');
  expect(snapshot.profile.experience.length).toBeGreaterThan(0);
  expect(snapshot.profile.strengths.every((item: unknown) => typeof item === 'string')).toBe(true);

  for (const key of privateKeys) expect(collectKeys(snapshot)).not.toContain(key);
  expect(JSON.stringify(snapshot)).not.toMatch(/mailto:|[\w.+-]+@[\w-]+\.[\w.]+/);
});

test('snapshot URLs are absolute, sit under the base path, and resolve', async ({
  request,
  baseURL,
}) => {
  const snapshot = await (await request.get('./api/v1/content.json')).json();
  const index = await (await request.get('./api/v1/index.json')).json();
  const basePath = new URL(baseURL ?? '').pathname;

  expect(index.schemaVersion).toBe(snapshot.schemaVersion);
  expect(index.generatedAt).toBe(snapshot.generatedAt);
  expect(index.pages.about).toBe(snapshot.profile.url);

  const urls = [snapshot.site, snapshot.profile.url, index.content, ...Object.values(index.pages)];
  for (const url of urls as string[]) {
    const { pathname, protocol } = new URL(url);
    expect(protocol).toBe('https:');
    expect(pathname.startsWith(basePath)).toBe(true);
    // The canonical host is production; check the same path on the local build.
    expect((await request.get(pathname)).status()).toBe(200);
  }
});

test('projects carry only published fields and links to verified hosts', () => {
  const project = toPublicProject(
    'sample',
    {
      title: 'Sample',
      summary: 'A sample project.',
      links: [
        { label: 'Repository', url: 'https://github.com/example/sample' },
        { label: 'Unverified', url: 'https://unverified.example/' },
      ],
    },
    'https://example.dev/projects/',
  );

  expect(project).toEqual({
    slug: 'sample',
    url: 'https://example.dev/projects/',
    title: 'Sample',
    summary: 'A sample project.',
    links: [{ label: 'Repository', url: 'https://github.com/example/sample' }],
  });
});

test('posts use calendar dates and omit an absent update date', () => {
  const source = {
    title: 'Post',
    description: 'About a post.',
    publishedAt: new Date('2026-01-02T00:00:00Z'),
    topics: ['Testing'],
    readingMinutes: 3,
  };
  const post = toPublicPost('post', source, 'https://example.dev/posts/post/', 'Body');
  const updated = toPublicPost(
    'post',
    { ...source, updatedAt: new Date('2026-02-03T00:00:00Z') },
    'https://example.dev/posts/post/',
    'Body',
  );

  expect(post.publishedAt).toBe('2026-01-02');
  expect(post).not.toHaveProperty('updatedAt');
  expect(updated.updatedAt).toBe('2026-02-03');
});

test('books keep a zero rating and expose a review only when one is published', () => {
  const book = { id: 'a-book', title: 'A Book', author: 'An Author', status: 'finished' as const };
  const unrated = toPublicBook(book);
  const zero = toPublicBook({ ...book, rating: 0 });
  const reviewed = toPublicBook(
    { ...book, rating: 4.5, finishedAt: new Date('2026-03-04T00:00:00Z'), reviewLanguage: 'pt-BR' },
    { url: 'https://example.dev/reading/a-book/', body: 'Uma resenha.' },
  );

  expect(unrated).not.toHaveProperty('rating');
  expect(unrated).not.toHaveProperty('review');
  expect(zero.rating).toBe(0);
  expect(reviewed.review).toEqual({
    url: 'https://example.dev/reading/a-book/',
    language: 'pt-BR',
    finishedAt: '2026-03-04',
    body: 'Uma resenha.',
  });
});

test('relative Markdown images become absolute, others are untouched, unknown ones fail', () => {
  const known = new Map([['./images/a.png', 'https://example.dev/_astro/a.webp']]);
  const resolve = (path: string) => known.get(path);

  expect(rewriteMarkdownImages('![A](./images/a.png "Title") text', resolve)).toBe(
    '![A](https://example.dev/_astro/a.webp "Title") text',
  );
  expect(rewriteMarkdownImages('![B](https://cdn.example/b.png)', resolve)).toBe(
    '![B](https://cdn.example/b.png)',
  );
  expect(rewriteMarkdownImages('[a link](./images/a.png)', resolve)).toBe(
    '[a link](./images/a.png)',
  );
  expect(() => rewriteMarkdownImages('![C](./missing.png)', resolve)).toThrow('./missing.png');
});

test('the snapshot lists the same posts, projects, and reviews the site publishes', async ({
  request,
}) => {
  const snapshot: PublicSnapshot = await (await request.get('./api/v1/content.json')).json();
  const local = (url: string) => new URL(url).pathname;

  expect(snapshot.projects.length).toBeGreaterThan(0);
  for (const project of snapshot.projects) {
    expect(Object.keys(project).sort()).toEqual(['links', 'slug', 'summary', 'title', 'url']);
    expect(local(project.url).endsWith('/projects/')).toBe(true);
  }

  expect(snapshot.posts.length).toBeGreaterThan(0);
  const dates = snapshot.posts.map((post: PublicPost) => post.publishedAt);
  expect(dates).toEqual([...dates].sort().reverse());
  for (const post of snapshot.posts) {
    expect(post.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(post.body.trim().length).toBeGreaterThan(0);
    expect((await request.get(local(post.url))).status()).toBe(200);
  }

  const reviewed = snapshot.books.filter((book: PublicBook) => book.review);
  expect(reviewed.length).toBeGreaterThan(0);
  for (const book of snapshot.books) {
    expect(['reading', 'finished', 'wishlist']).toContain(book.status);
    if (!book.review) continue;
    expect(book.review.body.trim().length).toBeGreaterThan(0);
    expect((await request.get(local(book.review.url))).status()).toBe(200);
  }
});

test('images in post bodies are absolute and load from the build', async ({ request }) => {
  const snapshot: PublicSnapshot = await (await request.get('./api/v1/content.json')).json();
  const images = snapshot.posts.flatMap((post) =>
    [...post.body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((match) => match[1] ?? ''),
  );

  expect(images.length).toBeGreaterThan(0);
  for (const image of images) {
    const response = await request.get(new URL(image).pathname);
    expect(response.status(), image).toBe(200);
    expect(response.headers()['content-type']).toContain('image/');
  }
});
