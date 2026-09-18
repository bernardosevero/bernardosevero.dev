# Content handbook

## Source of truth

Visitor-facing editorial content lives in `src/content/` and is validated by `src/content.config.ts`. Build failures caused by invalid frontmatter are intentional: broken content should not reach production.

Use Markdown for normal prose. Use MDX only when an article or project requires an embedded Astro component. Images belong in a clearly named production asset folder and need meaningful alt text unless they are decorative.

## Posts

Required frontmatter: `title`, `description`, `publishedAt`, and `readingMinutes`. Add `topics` for useful grouping. Keep `draft: true` until the article has been reviewed and its links have been checked.

## Projects

Run:

```sh
npm run content:add-project -- --slug project-slug --title "Real project title"
```

The command fails if the slug exists and creates a draft with prompts for the problem, constraints, decisions, outcome, and lessons. Replace every `TODO` before publishing. Add only outcomes you can support and remove confidential details.

## Books

Each book has `title`, `author`, and one of three statuses: `reading`, `finished`, or `wishlist`. Ratings are optional numbers from 0 through 5. The Markdown body is the optional review.

Notion-managed entries also carry `notionId` and `notionLastEditedAt`. Those fields provide stable identity and conflict context. The importer creates or updates matching entries but never deletes a local file simply because it disappeared from the input.

The normalized import shape is:

```json
[
  {
    "notionId": "stable-page-id",
    "notionLastEditedAt": "2026-09-17T12:00:00.000Z",
    "title": "Book title",
    "author": "Author name",
    "status": "finished",
    "rating": 4,
    "finishedAt": "2026-09-01",
    "coverUrl": "https://example.com/cover.jpg",
    "review": "Optional Markdown review."
  }
]
```

The Notion database identifier and credentials stay outside the repository. Review the normalized diff before importing.

## Pages

Low-frequency Home and About copy lives in `src/content/pages/`. The schema uses a `kind` discriminator so each page has an explicit contract. Do not move button behavior or layout configuration into prose files.

## Editorial release checklist

- All claims are accurate and safe to publish.
- Draft is false only when the destination page exists.
- Title and description explain the value without hype.
- Dates use ISO format and links resolve.
- Headings form a logical outline.
- Images include correct alt text and attribution when required.
- `npm run check` and `npm run build` pass.
