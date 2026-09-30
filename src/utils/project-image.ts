import type { ImageMetadata } from 'astro';

export type ProjectImageSource = 'added' | 'og' | 'default';

export interface ProjectImageChoice {
  image: ImageMetadata;
  source: ProjectImageSource;
}

/**
 * Picks a project card image in priority order: the image stored with the entry,
 * then the saved og:image for the slug, then the site's default image.
 */
export function selectProjectImage(
  slug: string,
  added: ImageMetadata | undefined,
  ogImages: ReadonlyMap<string, ImageMetadata>,
  fallback: ImageMetadata,
): ProjectImageChoice {
  if (added) return { image: added, source: 'added' };
  const og = ogImages.get(slug);
  if (og) return { image: og, source: 'og' };
  return { image: fallback, source: 'default' };
}
