---
name: sync-notion-books
description: One-way sync of the Notion books database into `src/content/books.json` and Markdown reviews. Use when asked to sync books, ratings, covers, ISBNs, or reviews from Notion, or to update the Reading Codex.
---

# Sync Notion books

Read Notion as the editorial source for managed book records and produce a reviewable, one-way local sync. Ratings and reviews are copied, never guessed.

1. Read [docs/content.md](../../../docs/content.md), the `books` schema in `src/content.config.ts`, and `scripts/import-books.mjs`.
2. Resolve the exact Notion books database from the URL or identifier the user supplied. Ask if none is known. Read only that database and its pages.
3. Use the connected Notion read tools. If Notion is not connected or readable, stop and state the connection requirement. Tokens never enter the chat or the repository.
4. Map the database's actual property names to the contract in [references/notion-book-mapping.md](references/notion-book-mapping.md). Absent optional values stay absent. Review Markdown is preserved in full, without embellishment.
5. Read every page, following pagination. Normalize status to `reading`, `finished`, or `wishlist`; an unknown status stops the sync.
6. For a book with no `coverUrl`, search a publisher or library catalog for the original published cover. Identify the edition by the Notion `ISBN`, or by title and author together. An ambiguous match stays unresolved: ask the user to add an ISBN in Notion. Record verified cover provenance. A cover supplied by Notion or already set locally is kept.
7. Compare normalized entries by `notionId` with `src/content/books.json` and `src/content/book-reviews/<book-id>.md`. Before writing, show the normalized diff: counts and record IDs for create, update, unchanged, skipped, and conflicts, including cover and review changes.
8. Stop for direction on a conflict: an uncommitted local change that overlaps a managed record or its review, or a local managed timestamp newer than Notion. Unrelated records in the same file are not conflicts.
9. Write the normalized array to a temporary JSON file outside the repository, then run:

   ```sh
   npm run content:import-books -- --input <temporary-json-path>
   ```

10. Remove the temporary file, run `npm run check` and `npm run build`, and inspect the Git diff for unexpected changes.
11. Report created and updated records, conflicts, skipped entries, and validation results.

## Boundaries

- The sync is one-way. Notion is only read.
- A local book or review missing from Notion is kept.
- Hand-authored entries, unrelated fields, and existing reviews are preserved unless a replacement is supplied.
- Full reviews live in `src/content/book-reviews/<book-id>.md`, never in a JSON attribute, and contain no executable markup.
