import { test, expect } from '@playwright/test';
import process from 'node:process';
import { normalizeBasePath } from '../src/utils/paths';
import { isVisibleContent } from '../src/utils/content';
import {
  companyMonogram,
  emphasisRuns,
  formatCalendarDate,
  formatCount,
} from '../src/utils/format';
import { getActiveNavigationItem, getNavigationItem } from '../src/config/navigation';
import { latestPosts, latestProject, readingDesk } from '../src/utils/home-previews';
import { selectProjectImage } from '../src/utils/project-image';
import { chapterStatusText, outlineSections, summarizeReading } from '../src/utils/outline';

test('base paths preserve root and GitHub Pages navigation', () => {
  for (const path of ['/', '/bernardosevero.dev', '/bernardosevero.dev/']) {
    const base = normalizeBasePath(path);
    expect(base).toBe(path === '/' ? '/' : '/bernardosevero.dev/');
    expect(getActiveNavigationItem(`${base}reading/example/`, path)).toBe('books');
    expect(getActiveNavigationItem(`${base}projects/example/`, path)).toBe('projects');
    expect(getActiveNavigationItem(base, path)).toBe('home');
  }
});

test('each navigation item owns its routes and Home covers the root and unknown routes', () => {
  for (const base of ['/', '/bernardosevero.dev/']) {
    expect(getActiveNavigationItem(`${base}posts/example/`, base)).toBe('posts');
    expect(getActiveNavigationItem(`${base}system/`, base)).toBe('system');
    expect(getActiveNavigationItem(`${base}about/`, base)).toBe('about');
    expect(getActiveNavigationItem(base, base)).toBe('home');
    expect(getActiveNavigationItem(`${base}missing/`, base)).toBe('home');
  }
});

test('navigation items resolve by id', () => {
  expect(getNavigationItem('books')).toEqual({ id: 'books', label: 'Books', path: 'reading/' });
  expect(getNavigationItem('about').path).toBe('about/');
});

test('drafts are excluded even when old content requests a preview', () => {
  const entries = [
    { id: 'published', data: { draft: false } },
    { id: 'unfinished', data: { draft: true } },
    { id: 'legacy-preview', data: { draft: true, preview: true } },
  ];

  expect(entries.filter(isVisibleContent).map((entry) => entry.id)).toEqual(['published']);
});

test('calendar dates keep their day in every build time zone', () => {
  const buildTimeZone = process.env.TZ;
  try {
    for (const timeZone of ['UTC', 'America/Sao_Paulo', 'Pacific/Kiritimati']) {
      process.env.TZ = timeZone;
      expect(formatCalendarDate(new Date('2026-09-21'), 'long')).toBe('September 21, 2026');
      expect(formatCalendarDate(new Date('2026-09-21'), 'short')).toBe('Sep 21, 2026');
    }
  } finally {
    if (buildTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = buildTimeZone;
  }
});

test('counts use the singular noun only for exactly one item', () => {
  expect(formatCount(0, 'post')).toBe('0 posts');
  expect(formatCount(1, 'post')).toBe('1 post');
  expect(formatCount(2, 'book')).toBe('2 books');
});

test('company monograms use the first letter of up to three words', () => {
  expect(companyMonogram('SAP Concur')).toBe('SC');
  expect(companyMonogram('Alura')).toBe('A');
  expect(companyMonogram('TAG Livros')).toBe('TL');
  expect(companyMonogram('  one two   three four ')).toBe('OTT');
  expect(companyMonogram('   ')).toBe('');
  expect(companyMonogram('')).toBe('');
});

test('emphasis runs split paired bold markers and keep unpaired ones literal', () => {
  const plain = (text: string) => ({ text, strong: false });
  const strong = (text: string) => ({ text, strong: true });

  expect(emphasisRuns('No emphasis here.')).toEqual([plain('No emphasis here.')]);
  expect(emphasisRuns('With **7+ years** of work.')).toEqual([
    plain('With '),
    strong('7+ years'),
    plain(' of work.'),
  ]);
  expect(emphasisRuns('Reached **12,300+** students rated **9.2/10**.')).toEqual([
    plain('Reached '),
    strong('12,300+'),
    plain(' students rated '),
    strong('9.2/10'),
    plain('.'),
  ]);
  expect(emphasisRuns('**Doubled** resilience, **8 hours**')).toEqual([
    strong('Doubled'),
    plain(' resilience, '),
    strong('8 hours'),
  ]);
  expect(emphasisRuns('A **bold** and a stray ** marker')).toEqual([
    plain('A '),
    strong('bold'),
    plain(' and a stray ** marker'),
  ]);
  expect(emphasisRuns('**')).toEqual([plain('**')]);
  expect(emphasisRuns('')).toEqual([]);
});

test('project images prefer the added image, then og:image, then the default', () => {
  const image = (src: string) => ({ src, width: 1200, height: 630, format: 'webp' as const });
  const added = image('/added.webp');
  const og = image('/og.png');
  const fallback = image('/default.webp');
  const ogImages = new Map([['with-og', og]]);

  expect(selectProjectImage('with-og', added, ogImages, fallback)).toEqual({
    image: added,
    source: 'added',
  });
  expect(selectProjectImage('with-og', undefined, ogImages, fallback)).toEqual({
    image: og,
    source: 'og',
  });
  expect(selectProjectImage('plain', undefined, ogImages, fallback)).toEqual({
    image: fallback,
    source: 'default',
  });
  expect(selectProjectImage('plain', undefined, new Map(), fallback).source).toBe('default');
});

test('post outlines pair each ## section with its heading and word count', () => {
  const markdown = [
    'Intro words are not a section.',
    '',
    '## First part',
    'one two three',
    '### A subheading',
    'four',
    '## Second part',
    '```md',
    '## not a heading inside a fence',
    '```',
    'five',
  ].join('\n');
  const headings = [
    { depth: 2, slug: 'first-part', text: 'First part' },
    { depth: 3, slug: 'a-subheading', text: 'A subheading' },
    { depth: 2, slug: 'second-part', text: 'Second part' },
  ];

  expect(outlineSections(markdown, headings)).toEqual([
    { slug: 'first-part', text: 'First part', words: 7 },
    { slug: 'second-part', text: 'Second part', words: 10 },
  ]);
  expect(outlineSections('Just an introduction.\n\n### Minor', [])).toEqual([]);
  expect(() => outlineSections('## One\ntext', [])).toThrow(/Outline mismatch/);
});

test('reading progress is word-weighted and names the section being read', () => {
  expect(summarizeReading([100, 300], [0, 0], 4)).toEqual({
    percent: 0,
    minutesLeft: 4,
    current: undefined,
  });
  expect(summarizeReading([100, 300], [1, 0.5], 4)).toEqual({
    percent: 63,
    minutesLeft: 2,
    current: 1,
  });
  expect(summarizeReading([100, 300], [1, 1], 4)).toEqual({
    percent: 100,
    minutesLeft: 0,
    current: 1,
  });
  expect(summarizeReading([0, 0], [1, 0], 2).percent).toBe(50);
  expect(summarizeReading([10], [1.4], 1).percent).toBe(100);
  expect(() => summarizeReading([10, 20], [1], 1)).toThrow(/Expected 2/);
});

test('chapter status labels show position, time left, and completion', () => {
  const labels = { of: 'of', minLeft: 'min left', finished: 'Finished' };
  expect(chapterStatusText({ percent: 0, minutesLeft: 4, current: undefined }, 6, labels)).toEqual({
    position: '· 0 of 6',
    remaining: '0% · 4 min left',
  });
  expect(chapterStatusText({ percent: 30, minutesLeft: 3, current: 1 }, 6, labels)).toEqual({
    position: '· 2 of 6',
    remaining: '30% · 3 min left',
  });
  expect(chapterStatusText({ percent: 100, minutesLeft: 0, current: 5 }, 6, labels).remaining).toBe(
    '100% · Finished',
  );
});

test('latest posts are newest first and limited to the requested count', () => {
  const post = (id: string, date: string) => ({ id, data: { publishedAt: new Date(date) } });
  const posts = [post('old', '2026-01-01'), post('new', '2026-09-29'), post('mid', '2026-05-01')];
  expect(latestPosts(posts, 2).map(({ id }) => id)).toEqual(['new', 'mid']);
  expect(latestPosts(posts, 5)).toHaveLength(3);
  expect(latestPosts([], 2)).toEqual([]);
  expect(posts.map(({ id }) => id)).toEqual(['old', 'new', 'mid']);
});

test('the latest project is the newest dated one, undated last, featured breaking ties', () => {
  const project = (id: string, featured: boolean, date?: string) => ({
    id,
    data: date ? { featured, publishedAt: new Date(date) } : { featured },
  });
  expect(
    latestProject([
      project('undated-featured', true),
      project('older', true, '2026-01-01'),
      project('newest', false, '2026-09-29'),
    ])?.id,
  ).toBe('newest');
  expect(
    latestProject([project('plain', false, '2026-09-29'), project('star', true, '2026-09-29')])?.id,
  ).toBe('star');
  expect(latestProject([project('plain', false), project('star', true)])?.id).toBe('star');
  expect(latestProject([])).toBeUndefined();
});

test('the reading desk shows the current book and the two most recently finished', () => {
  const book = (id: string, status: 'reading' | 'finished' | 'wishlist', finished?: string) => ({
    id,
    data: finished ? { status, finishedAt: new Date(finished) } : { status },
  });
  const desk = readingDesk(
    [
      book('wish', 'wishlist'),
      book('first-read', 'reading'),
      book('second-read', 'reading'),
      book('undated', 'finished'),
      book('old', 'finished', '2025-01-01'),
      book('recent', 'finished', '2026-09-22'),
      book('reviewed', 'finished', '2026-09-06'),
    ],
    new Set(['reviewed', 'old']),
  );
  expect(desk.current?.id).toBe('first-read');
  expect(desk.finished.map(({ book: { id }, hasReview }) => [id, hasReview])).toEqual([
    ['recent', false],
    ['reviewed', true],
  ]);
  expect(readingDesk([book('wish', 'wishlist')], new Set())).toEqual({ finished: [] });
});
