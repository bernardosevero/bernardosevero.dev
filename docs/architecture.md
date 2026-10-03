# Architecture overview

## System map

The project is a statically generated Astro portfolio. Content collections provide typed editorial data at build time; Astro components render semantic HTML; vanilla CSS supplies the medieval RPG visual language; a small amount of browser JavaScript handles bookshelf keyboard selection and post filtering.

| Area | Implementation | Reason |
| --- | --- | --- |
| Routes | `src/pages/` | Astro file-based routing and static output |
| Document shell | `src/layouts/BaseLayout.astro` | Shared metadata, fonts, favicon, skip link, and top navigation |
| UI primitives | `src/components/` | Real frames, ornaments, menu, book tiles, and ratings reused across routes |
| Editorial content | `src/content/` | Human-editable Markdown/MDX plus the single-file book catalog, validated at build time |
| Schemas | `src/content.config.ts` | Prevents malformed posts, projects, books, and page copy |
| Design tokens | `src/styles/tokens.css` | Shared palette, typography, geometry, and effects |
| Foundations | `src/styles/global.css` | Base behavior and reusable RPG component classes |
| Route composition | `src/styles/portfolio.css`, `about.css`, `reading-codex.css`, and route-local styles | Responsive layout without leaking page decisions into primitives |
| Automation | `scripts/` and personal Codex skills | Safe scaffolding and normalized content import |
| Verification | `tests/`, Astro check, build | Interaction, accessibility, overflow, assets, and schema confidence |

## Data flow

1. An editor changes a Markdown/MDX entry, a book metadata record in `src/content/books.json`, or a matching Markdown review in `src/content/book-reviews/`.
2. `src/content.config.ts` validates its frontmatter during development and build.
3. A route queries the collection at build time.
4. Astro renders static HTML with no content API required in the browser.
5. GitHub Actions checks formatting, CSS lint, and types, builds through Playwright, tests, and uploads the verified root-path `dist/` to Cloudflare Pages after both root and GitHub Pages compatibility suites pass. Pull requests validate without deploying.

Home renders the village greeting from `src/content/pages/home.md`; About renders the CV page (`CvSheet.astro`) from `src/content/pages/about.md`. Base-path normalization lives in `src/utils/paths.ts`; `src/utils/content.ts` excludes drafts in every environment. There is no draft-preview mode. The design-system page imports production components and reads CSS token values from the browser.

## Route contract

| Route | Purpose |
| --- | --- |
| `/` | Home: animated village scene and RPG dialogue with four destinations |
| `/about/` | CV page: profile, experience, education, side quests, skills, stats, and CV download |
| `/posts/`, `/posts/[slug]/` | Blog index (kicker "Journal") with topic filters and individual articles |
| `/projects/` | Quest Log list; cards link directly to live apps, courses, and repositories. There are no project detail pages |
| `/reading/` | Reading Codex: reading, finished, wishlist, optional ratings/reviews |
| `/reading/[slug]/` | Review for a visible book with nonempty Markdown |
| `/system/` | Live inventory of production tokens, components, and states |

Expose a route as finished only when its content, responsive layout, keyboard behavior, metadata, and tests are ready; otherwise use an honest unavailable state. Production components and the design system supersede historical implementation notes.

## External references

- [Astro styling guide](https://docs.astro.build/en/guides/styling/) — scoped styles, global styles, and CSS variables.
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) — build-time content loading and schema validation.
- [Cloudflare Pages deployment](deployment.md) — verified static uploads, credentials, and custom-domain setup.
- [Bruno Paulino's design system](https://bpaulino.com/system/) — public, inspectable system-page reference.

## Current state and next routes

Home, `/system/`, About, Projects, Blog (`/posts/`), and Reading are implemented. The blog currently has no published entries; Reading has real covers and reviews. Astro's `file()` loader reads the JSON metadata catalog, while `glob()` loads separate Markdown reviews. A detail route is generated only when a visible book has a nonempty review with the same ID.


