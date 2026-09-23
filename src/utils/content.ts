interface EditorialEntry {
  data: { draft: boolean; preview: boolean };
}

/** Draft previews are visible only in development, never in production output. */
export function isVisibleContent(
  entry: EditorialEntry,
  development = import.meta.env?.DEV ?? false,
): boolean {
  return !entry.data.draft || (development && entry.data.preview);
}
