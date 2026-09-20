# Architecture overview

## System map

The project is a statically generated Astro portfolio. Content collections provide typed editorial data at build time; Astro components render semantic HTML; vanilla CSS supplies the medieval RPG visual language; a small amount of browser JavaScript handles bookshelf keyboard selection and post filtering.

| Area | Implementation | Reason |
| --- | --- | --- |
| Routes | `src/pages/` | Astro file-based routing and static output |
| Document shell | `src/layouts/BaseLayout.astro` | Shared metadata, fonts, favicon, skip link, and top navigation |
| UI primitives | `src/components/` | Real frames, ornaments, menu, book tiles, and ratings reused across routes |
| Editorial content | `src/content/` | Human-editable Markdown/MDX validated at build time |
| Schemas | `src/content.config.ts` | Prevents malformed posts, projects, books, and page copy |
| Design tokens | `src/styles/tokens.css` | Shared palette, typography, geometry, and effects |
| Foundations | `src/styles/global.css` | Base behavior and reusable RPG component classes |
| Route composition | `src/styles/portfolio.css`, `about.css`, `reading-codex.css`, and route-local styles | Responsive layout without leaking page decisions into primitives |
| Automation | `scripts/` and personal Codex skills | Safe scaffolding and normalized content import |
| Verification | `tests/`, Astro check, build | Interaction, accessibility, overflow, assets, and schema confidence |

## Data flow

1. An editor changes a Markdown or MDX entry.
2. `src/content.config.ts` validates its frontmatter during development and build.
3. A route queries the collection at build time.
4. Astro renders static HTML with no content API required in the browser.
5. GitHub Actions checks types, builds through Playwright, tests, and uploads the verified root-path `dist/` to Cloudflare Pages after both root and GitHub Pages compatibility suites pass. Pull requests validate without deploying.

Home and About share `CharacterSheet.astro` and read `src/content/pages/about.md`. Base-path normalization lives in `src/utils/paths.ts`; collection visibility lives in `src/utils/content.ts`. Draft previews are development-only. The design-system page imports the same `WoodFrame` and `Ornament` components and reads CSS token values from the browser, which reduces documentation drift.

## External references

- [Astro styling guide](https://docs.astro.build/en/guides/styling/) — scoped styles, global styles, and CSS variables.
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) — build-time content loading and schema validation.
- [Cloudflare Pages deployment](deployment.md) — verified static uploads, credentials, and custom-domain setup.
- [Bruno Paulino's design system](https://bpaulino.com/system/) — public, inspectable system-page reference.
- `docs/design/references/` — user-supplied visual direction for all five screens.

## Current state and next routes

Home, `/system/`, About, Projects, Posts, and Reading are implemented. Posts currently has no published entries; Reading has real covers and reviews. Detail routes are generated from visible collection entries, with book reviews requiring a nonempty body.

## Compatibility and retired code

The original Home stylesheet, unused preview-dialog component, Home content entry/schema, and branch ornament have been retired. Historical implementation notes and design references remain as provenance. `public/images/social-card.png` is intentionally retained for older external links; current metadata uses `social-card-v2.jpg`.
