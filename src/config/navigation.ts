import { normalizeBasePath } from '../utils/paths';

export const navigationItems = [
  { id: 'about', label: 'About', path: '' },
  { id: 'projects', label: 'Projects', path: 'projects/' },
  { id: 'posts', label: 'Posts', path: 'posts/' },
  { id: 'books', label: 'Books', path: 'reading/' },
  { id: 'system', label: 'System', path: 'system/' },
] as const;

export type NavigationItemId = (typeof navigationItems)[number]['id'];

export function getActiveNavigationItem(pathname: string, base: string): NavigationItemId {
  const basePath = normalizeBasePath(base);
  const relativePath = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : pathname.replace(/^\/+/, '');

  if (relativePath === '' || relativePath === 'about/' || relativePath === 'about') return 'about';
  if (relativePath.startsWith('projects/')) return 'projects';
  if (relativePath.startsWith('posts/')) return 'posts';
  if (relativePath.startsWith('reading/')) return 'books';
  if (relativePath.startsWith('system/')) return 'system';

  return 'about';
}
