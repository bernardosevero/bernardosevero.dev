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

test('draft previews never publish and require opt-in in development', () => {
  for (const development of [false, true]) {
    for (const draft of [false, true]) {
      for (const preview of [false, true]) {
        expect(isVisibleContent({ data: { draft, preview } }, development)).toBe(
          !draft || (development && preview),
        );
      }
    }
  }
});
