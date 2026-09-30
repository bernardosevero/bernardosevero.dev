import { test, expect } from '@playwright/test';
import process from 'node:process';
import { normalizeBasePath } from '../src/utils/paths';
import { isVisibleContent } from '../src/utils/content';
import { companyMonogram, formatCalendarDate, formatCount } from '../src/utils/format';
import { getActiveNavigationItem } from '../src/config/navigation';
import { chapterStatusText, outlineSections, summarizeReading } from '../src/utils/outline';

test('base paths preserve root and GitHub Pages navigation', () => {
  for (const path of ['/', '/bernardosevero.dev', '/bernardosevero.dev/']) {
    const base = normalizeBasePath(path);
    expect(base).toBe(path === '/' ? '/' : '/bernardosevero.dev/');
    expect(getActiveNavigationItem(`${base}reading/example/`, path)).toBe('books');
    expect(getActiveNavigationItem(`${base}projects/example/`, path)).toBe('projects');
    expect(getActiveNavigationItem(base, path)).toBe('about');
  }
});

test('each navigation item owns its routes and About is the fallback', () => {
  for (const base of ['/', '/bernardosevero.dev/']) {
    expect(getActiveNavigationItem(`${base}posts/example/`, base)).toBe('posts');
    expect(getActiveNavigationItem(`${base}system/`, base)).toBe('system');
    expect(getActiveNavigationItem(`${base}about/`, base)).toBe('about');
    expect(getActiveNavigationItem(`${base}missing/`, base)).toBe('about');
  }
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
