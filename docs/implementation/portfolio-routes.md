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

The Reading Codex uses the original cover artwork for each verified edition in a reusable semantic book card. Cards preserve a 2:3 cover area, expose status and optional ratings as text, retain review links, and fall back without collapsing when an image is absent. Compared with `docs/design/references/reading.png`, the production page intentionally uses responsive CSS grids instead of fixed shelf slots, groups books by their real collection status, and omits decorative volumes when no factual book entry exists.
