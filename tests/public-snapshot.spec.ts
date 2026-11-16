import { test, expect } from '@playwright/test';
import {
  publicUrl,
  snapshotSchemaVersion,
  toPublicProfile,
  type AboutSource,
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

  for (const url of [snapshot.site, snapshot.profile.url, index.content, index.pages.about]) {
    const { pathname, protocol } = new URL(url);
    expect(protocol).toBe('https:');
    expect(pathname.startsWith(basePath)).toBe(true);
    // The canonical host is production; check the same path on the local build.
    expect((await request.get(pathname)).status()).toBe(200);
  }
});
