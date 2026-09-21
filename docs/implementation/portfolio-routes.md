# Portfolio routes

## Scope

About, Projects, Posts, and Reading are implemented as static Astro routes using the shared village scenery, `WoodFrame`, `Ornament`, RPG controls, and portfolio route composition in `src/styles/portfolio.css`.

## Content availability

- About reads `src/content/pages/about.md`.
- Projects reads non-draft entries in `src/content/projects/`; only résumé-supported project facts are published.
- Posts reads non-draft entries in `src/content/posts/`. No posts existed when this route was implemented, so the index presents an honest empty state.
- Reading reads non-draft book metadata from the single `src/content/books.json` catalog, including supplied ratings, ISBNs, and verified edition covers. Full reviews live in matching `src/content/book-reviews/<book-id>.md` files. Empty shelves retain an honest empty state.

Dynamic post and project routes are generated only for non-draft entries. The layouts are therefore ready without exposing placeholder articles or case studies.

## Visual interpretation

The supplied mockups establish the split-panel parchment and timber hierarchy. This implementation reuses the production village asset and CSS materials rather than the reference PNGs. At small widths, split panels stack, list actions expand to full width, and the content remains readable.

The Reading Codex follows `docs/design/references/reading.png`: one timber window, compact leaf-decorated title banner, four-column bookshelf, 3:2 shelf/detail split, gold selected-book treatment, star ratings, and bottom shelf tabs. Container queries stack the shelf and details on phones. The backdrop uses the same production village artwork and overlay as every other content page.

Real verified edition covers replace the reference's illustrated volumes. No mockup books or unsupported synopses are invented. The Finished shelf opens by default. Each shelf has a bounded, keyboard-focusable vertical scroll region so a long wishlist does not extend the whole page. Existing review links are retained. The shared green, timber-framed site navigation remains above the window in normal document flow. Timber, leaf ornaments, and parchment use production CSS approximations instead of raster interface artwork.

`BookTile` and `BookRating` render as individual specimens on `/system/`. All entries and native fragment navigation remain available without JavaScript; the small custom element adds shelf filtering and book selection. Existing review URLs are unchanged.

## Shared page geometry and specimen isolation

All content routes share `--page-width` (1160px), `--page-top-space`, and `--page-section-gap`. `BaseLayout` owns the top navigation; `portfolio.css` owns the common backdrop and content shell. About's former side navigation is intentionally replaced by this shared bar. Books has no background opacity or width override. Codex frames inherit the global timber thickness, and their parchment uses `--surface-parchment`, the same material as `WoodFrame`.

The design-system catalog displays individual components in responsive specimen cells. Layout CSS targets direct specimen children only; it must not override nested component padding, heading styles, or dimensions. The menu specimen uses its own full-width section and static preview mode. The return-to-Personal-Log link remains functional on `/system/`.
