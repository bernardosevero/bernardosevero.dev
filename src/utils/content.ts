interface EditorialEntry {
  data: { draft: boolean };
}

export function isVisibleContent(entry: EditorialEntry): boolean {
  return !entry.data.draft;
}
