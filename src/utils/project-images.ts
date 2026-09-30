import type { ImageMetadata } from 'astro';
import defaultProjectImage from '../assets/projects/default.webp';
import { selectProjectImage, type ProjectImageChoice } from './project-image';

// og:image files are saved by `npm run content:fetch-project-images`, named by project slug.
const ogImageModules = import.meta.glob<ImageMetadata>(
  '/src/assets/projects/og/*.{png,jpg,jpeg,webp}',
  { eager: true, import: 'default' },
);

const ogImages = new Map(
  Object.entries(ogImageModules).map(([path, image]) => [
    path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.')),
    image,
  ]),
);

export { defaultProjectImage };

export function resolveProjectImage(
  slug: string,
  added: ImageMetadata | undefined,
): ProjectImageChoice {
  return selectProjectImage(slug, added, ogImages, defaultProjectImage);
}
