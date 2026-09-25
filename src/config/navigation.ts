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
  const activeItem = navigationItems.find(
    (item) => item.path !== '' && relativePath.startsWith(item.path),
  );

  // About lives at the site root, so it also covers /about/ and unknown routes.
  return activeItem?.id ?? 'about';
}
