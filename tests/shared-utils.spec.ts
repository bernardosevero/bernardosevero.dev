import { test, expect } from '@playwright/test';
import { normalizeBasePath } from '../src/utils/paths';
import { isVisibleContent } from '../src/utils/content';
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
