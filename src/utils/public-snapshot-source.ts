import { getEntry } from 'astro:content';
import { cvAsset } from '../config/cv';
import { basePath } from './paths';
import {
  publicUrl,
  snapshotSchemaVersion,
  toPublicProfile,
  type PublicIndex,
  type PublicSnapshot,
} from './public-snapshot';

// One timestamp per build, so content.json and index.json always agree.
const generatedAt = new Date().toISOString();

function requireSite(site: URL | undefined): URL {
  if (!site) throw new Error('Set `site` in astro.config.mjs: the public snapshot needs it.');
  return site;
}

export async function buildPublicSnapshot(site: URL | undefined): Promise<PublicSnapshot> {
  const origin = requireSite(site);
  const about = await getEntry('pages', 'about');
  if (!about || about.data.kind !== 'about') {
    throw new Error('src/content/pages/about.md is missing or is not an About entry.');
  }

  return {
    schemaVersion: snapshotSchemaVersion,
    generatedAt,
    site: publicUrl('', origin, basePath),
    profile: toPublicProfile(about.data, {
      site: publicUrl('', origin, basePath),
      about: publicUrl('about/', origin, basePath),
      ...(cvAsset && { cv: publicUrl(cvAsset.path, origin, basePath) }),
    }),
  };
}

export function buildPublicIndex(site: URL | undefined): PublicIndex {
  const origin = requireSite(site);
  return {
    schemaVersion: snapshotSchemaVersion,
    generatedAt,
    site: publicUrl('', origin, basePath),
    content: publicUrl('api/v1/content.json', origin, basePath),
    pages: { about: publicUrl('about/', origin, basePath) },
  };
}
