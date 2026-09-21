import { readFileSync } from 'node:fs';
import type { CvAsset } from '../config/cv';

export function validateCvAsset(asset: CvAsset | null, publicDir: URL): void {
  if (!asset) return;

  const file = new URL(asset.path, publicDir);
  let contents: Buffer;
  try {
    contents = readFileSync(file);
  } catch (cause) {
    throw new Error(`Configured CV asset is missing or unreadable: ${file.pathname}`, { cause });
  }
  if (contents.subarray(0, 5).toString() !== '%PDF-') {
    throw new Error(`Configured CV asset must be a PDF: ${file.pathname}`);
  }
}
