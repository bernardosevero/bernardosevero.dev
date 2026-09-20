export function normalizeBasePath(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

export const basePath = normalizeBasePath(import.meta.env?.BASE_URL ?? '/');
