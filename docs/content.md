# Content handbook

## Source of truth

Visitor-facing editorial content lives in `src/content/` and is validated by `src/content.config.ts`. Build failures caused by invalid frontmatter are intentional: broken content should not reach production.

Use Markdown for normal prose. Use MDX only when an article or project requires an embedded Astro component. Images belong in a clearly named production asset folder and need meaningful alt text unless they are decorative.

Posts and projects live in their respective `src/content/` directories; low-frequency copy lives in `src/content/pages/`. Use lowercase kebab-case slugs and ISO dates. Keep navigation behavior and reusable UI configuration in code. Every `draft: true` entry is excluded from routes, indexes, and feeds in development and production. There is no local draft-preview mode or `preview` content field.

## Posts

Required frontmatter: `title`, `description`, `publishedAt`, and `readingMinutes`. Add `topics` for useful grouping. Keep `draft: true` until the article has been reviewed and its links have been checked.

## Projects

Run:

```sh
npm run content:add-project -- --slug project-slug --title "Real project title"
```

The command fails if the slug exists and creates a draft with prompts for the problem, constraints, decisions, contribution, outcome, and lessons. Replace every `TODO` before publishing. A published project requires these sections plus a real role and supportable outcomes. Add only outcomes you can support and remove confidential details. Project detail (case-study) pages were removed: the `/projects/` list links straight to external destinations. The case-study fields and Markdown bodies are kept as the owner's records but are not rendered.

### Project card images

Each project card shows one image, first match wins:

1. **Added image:** set `image: ./images/<slug>.<ext>` in the entry and store the file in `src/content/projects/images/`. Use only files the owner supplies.
2. **Link preview:** the og:image of the project's `liveUrl`, else its first link, saved in `src/assets/projects/og/<slug>.<ext>`.
3. **Default:** `src/assets/projects/default.webp`, cropped from `public/images/village.webp` (left 150, top 690, 580 × 303: the notice board and fences), resized to 1200 × 630, WebP quality 82.

Link previews are fetched by a script, not during the build, so builds never depend on other servers:

```sh
npm run content:fetch-project-images
```

It skips drafts, entries with an added image, and slugs that already have a saved file (pass `-- --force` to replace one). It prints one line per project (`saved`, `skipped`, `no og:image`, `og:image unavailable`, or `error`), never edits content files, and exits non-zero only on errors. Re-run it when a site changes its preview image, then review and commit the saved file. The Alura course page currently advertises an og:image that returns 404, so that card uses the default until the owner supplies an image.

## Books

Book metadata lives in `src/content/books.json`, loaded by Astro's native single-file JSON loader. Each array entry has a unique lowercase kebab-case `id`, `title`, `author`, and one of three statuses: `reading`, `finished`, or `wishlist`. Ratings are optional numbers from 0 through 5. Reviews are separate Markdown files in `src/content/book-reviews/`, named `<book-id>.md`. A review needs no duplicated frontmatter; its filename links it to the catalog record. Astro renders the full Markdown body, and a review link appears only when a nonempty file exists for a visible book.

Set `reviewLanguage` to `pt-BR` for a Portuguese review. The review page then shows a Brazilian flag and language label, and marks the review text for assistive technology. English reviews may use `en` or omit the field.

Add a draft book with:

```sh
npm run add:book -- --id author-book-title --title "Book title" --author "Author name" --status wishlist
```

Pass `--isbn` when the exact edition is known. The command normalizes spaces and hyphens, validates ISBN-10 or ISBN-13 shapes (including an ISBN-10 `X` check character), rejects duplicate IDs, sorts the catalog by title, and creates `draft: true`. Edit the new JSON object to add verified metadata and publish it.

To add a review, create `src/content/book-reviews/author-book-title.md` with normal Markdown prose. Do not put the review in a JSON attribute. Reviews for draft books remain unpublished until the matching catalog record is visible.

Notion-managed entries also carry `notionId` and `notionLastEditedAt`. Those fields provide stable identity and conflict context. The importer updates the matching JSON object and writes a supplied nonempty review to its separate Markdown file. It never deletes a local entry or review simply because it disappeared from the input.

Sync owns only entries carrying `notionId`; it must not overwrite hand-authored entries or silently rewrite unrelated fields. Show the normalized diff before importing.

The normalized import shape is:

```json
[
  {
    "notionId": "stable-page-id",
    "notionLastEditedAt": "2026-09-17T12:00:00.000Z",
    "title": "Book title",
    "author": "Author name",
    "englishTitle": "Canonical English title",
    "englishAuthor": "Canonical English author name",
    "status": "finished",
    "rating": 4,
    "finishedAt": "2026-09-01",
    "isbn": "9780135398579",
    "coverUrl": "https://example.com/cover.jpg",
    "review": "Optional full Markdown review from Notion."
  }
]
```

The Notion database identifier and credentials stay outside the repository. `title` and `author` preserve the source metadata from Notion, while `englishTitle` and `englishAuthor` provide the canonical English display values written to the site. The three existing managed books have stable-ID fallbacks for compatibility; every new book must supply both English fields. Review the normalized diff before importing. The importer preserves local Markdown reviews and verified covers unless the normalized input explicitly supplies replacements.

Book covers load directly from each entry's `coverUrl`; do not save copies in the project. For verified fallback covers, prefer a durable catalog URL such as Open Library's ISBN or edition endpoint. Record the edition or ISBN in the normalized cover provenance; do not replace an explicitly supplied cover with a discovered match.

## Pages

### Public CV

The public CV is Bernardo's supplied Google Docs resume, exported as a PDF on 2026-09-20 without content edits. It lives at `public/documents/bernardo-severo-cv.pdf`. The typed `cvAsset` in `src/config/cv.ts` contains `{ path: 'documents/bernardo-severo-cv.pdf', downloadName: 'bernardo-severo-cv.pdf' }`. Set it to `null` to omit the action on Home, About, and System. External profile links retain their separate content schema.

Replace the PDF at the same path to preserve its URL. Review the document for public release before enabling it. Astro validates that a configured file is readable and has a PDF signature, failing the build if it is missing or invalid; this does not verify its contents or ownership. The URL uses the site's configured base, and native downloads work without JavaScript. One PDF is shared across the site; its language is not inferred from the page.

### Page copy

Low-frequency Home and About copy lives in `src/content/pages/`. The schema uses a `kind` discriminator so each page has an explicit contract. Do not move button behavior or layout configuration into prose files.

Two entries exist, and each caller narrows by `kind` before reading fields:

- `about.md` (`kind: about`) holds the CV facts. Besides `name`, `title`, `focus`, `strengths`, `experience`, `tools` and `links`, it requires `location`, `headline`, `summary` (the CV summary paragraph) and `teaser` (one or two sentences for the Home preview). Each `experience` item requires `location` and at least one `highlights` bullet, and may set `employment` (for example `Freelance, part-time`) and a `tech` list. `skills` is a non-empty list of `{ group, items }`, and `education` is a list of `{ degree, school, location, period, coursework? }`. Keep experience in the CV's order. `base`, `description`, `specializations` and the Markdown body are still validated but no page renders them since the Character Sheet was retired.
- `home.md` (`kind: home`) has no body. It holds `greeting`, `intro`, `prompt` and exactly four `choices`, each a `label` and a `destination` from `projects`, `posts`, `books` or `about`.

`summary` and `highlights` accept `**bold**` markers for metrics, and nothing else: no other Markdown, links or HTML. Layouts render them through `emphasisRuns` in `src/utils/format.ts`, never with `set:html` or `innerHTML`. An unpaired `**` stays literal text.

Copy facts only from the published CV. Its phone number and email address are not published on the site: keep them out of content files, code, tests, commits and pull requests.

About `tools` and profile `links` labels must be names listed in `src/config/profile.ts`, which also pairs each profile link with its `PixelIcon.astro` artwork. The build rejects unknown names instead of rendering an empty icon tile. To add a tool, add its name to that file; to add a profile link, draw its icon first, then add its label and icon there.

### Company logos

Each About `experience` item may have an optional `logo`. Save an official logo supplied by the owner (SVG, or PNG/WebP at least 80×80px) as `src/content/pages/logos/<company-slug>.<ext>`, for example `sap-concur.svg`, then reference it relatively:

```yaml
experience:
  - company: SAP Concur
    logo: ./logos/sap-concur.svg
```

Replace a logo by overwriting the file or changing the path. Never draw, trace, generate, or use placeholder artwork. Entries without `logo` show a monogram tile (`SAP Concur` becomes `SC`), so a missing logo never breaks the layout. The tile is decorative; the company name is the accessible text.

## Editorial release checklist

- All claims are accurate and safe to publish.
- Draft is false only when the destination page exists.
- Title and description explain the value without hype.
- Dates use ISO format and links resolve.
- Headings form a logical outline.
- Images include correct alt text and attribution when required.
- `npm run check` and `npm run build` pass.
