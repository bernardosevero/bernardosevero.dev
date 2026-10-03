import { normalizeBasePath } from '../utils/paths';

export const navigationItems = [
  { id: 'about', label: 'About', path: 'about/' },
  { id: 'projects', label: 'Projects', path: 'projects/' },
  { id: 'posts', label: 'Blog', path: 'posts/' },
  { id: 'books', label: 'Books', path: 'reading/' },
  { id: 'system', label: 'System', path: 'system/' },
] as const;

export type NavigationItemId = (typeof navigationItems)[number]['id'];
export type NavigationItem = (typeof navigationItems)[number];

/** `home` is the site root, reached through the Home tile rather than a menu button. */
export type ActiveNavigationItem = NavigationItemId | 'home';

export function getActiveNavigationItem(pathname: string, base: string): ActiveNavigationItem {
  const basePath = normalizeBasePath(base);
  const relativePath = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : pathname.replace(/^\/+/, '');
  const activeItem = navigationItems.find((item) => relativePath.startsWith(item.path));

  // The root and unknown routes belong to no menu section.
  return activeItem?.id ?? 'home';
}

export function getNavigationItem(id: NavigationItemId): NavigationItem {
  const item = navigationItems.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown navigation item: ${id}`);
  return item;
}
