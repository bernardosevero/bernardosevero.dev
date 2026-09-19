# Portfolio routes

## Scope

About, Projects, Posts, and Reading are implemented as static Astro routes using the shared village scenery, `WoodFrame`, `Ornament`, RPG controls, and portfolio route composition in `src/styles/portfolio.css`.

## Content availability

- About reads `src/content/pages/about.md`.
- Projects reads non-draft entries in `src/content/projects/`; only résumé-supported project facts are published.
- Posts reads non-draft entries in `src/content/posts/`. No posts existed when this route was implemented, so the index presents an honest empty state.
- Reading reads non-draft entries in `src/content/books/`, including supplied ratings, reviews, and verified edition covers. Empty shelves retain an honest empty state.

Dynamic post and project routes are generated only for non-draft entries. The layouts are therefore ready without exposing placeholder articles or case studies.

## Visual interpretation

The supplied mockups establish the split-panel parchment and timber hierarchy. This implementation reuses the production village asset and CSS materials rather than the reference PNGs. At small widths, split panels stack, list actions expand to full width, and the content remains readable.

The Reading Codex follows `docs/design/references/reading.png`: one timber window, compact leaf-decorated title banner, four-column bookshelf, 3:2 shelf/detail split, gold selected-book treatment, star ratings, and bottom shelf tabs. Container queries stack the shelf and details on phones. The backdrop uses the production village artwork with a lighter overlay.

Real verified edition covers replace the reference's illustrated volumes. Only the three real published entries appear; no mockup books or unsupported synopses are invented. The first populated shelf opens by default rather than showing an empty Reading shelf. Existing review links are retained. Compact global navigation remains above the window for site continuity. Timber, leaf ornaments, and parchment use production CSS approximations instead of raster interface artwork.

`ReadingCodex` and `BookRating` also render on `/system/`. All entries and native fragment navigation remain available without JavaScript; the small custom element adds shelf filtering and book selection. Existing review URLs are unchanged.
