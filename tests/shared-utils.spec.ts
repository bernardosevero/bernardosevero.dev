import { test, expect } from '@playwright/test';
import process from 'node:process';
import { normalizeBasePath } from '../src/utils/paths';
import { isVisibleContent } from '../src/utils/content';
import { formatCalendarDate, formatCount } from '../src/utils/format';
import { getActiveNavigationItem } from '../src/config/navigation';

test('base paths preserve root and GitHub Pages navigation', () => {
  for (const path of ['/', '/bernardosevero.dev', '/bernardosevero.dev/']) {
    const base = normalizeBasePath(path);
    expect(base).toBe(path === '/' ? '/' : '/bernardosevero.dev/');
    expect(getActiveNavigationItem(`${base}reading/example/`, path)).toBe('books');
    expect(getActiveNavigationItem(`${base}projects/example/`, path)).toBe('projects');
    expect(getActiveNavigationItem(base, path)).toBe('about');
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
