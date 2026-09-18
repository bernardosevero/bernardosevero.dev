# Architecture overview

## System map

The project is a statically generated Astro portfolio. Content collections provide typed editorial data at build time; Astro components render semantic HTML; vanilla CSS supplies the medieval RPG visual language; a small amount of browser JavaScript handles dialogs and keyboard selection.

| Area | Implementation | Reason |
| --- | --- | --- |
| Routes | `src/pages/` | Astro file-based routing and static output |
| Document shell | `src/layouts/BaseLayout.astro` | Shared metadata, fonts, favicon, and skip navigation |
| UI primitives | `src/components/` | Real frames, ornaments, menu, and dialogs reused across routes |
| Editorial content | `src/content/` | Human-editable Markdown/MDX validated at build time |
| Schemas | `src/content.config.ts` | Prevents malformed posts, projects, books, and page copy |
| Design tokens | `src/styles/tokens.css` | Shared palette, typography, geometry, and effects |
| Foundations | `src/styles/global.css` | Base behavior and reusable RPG component classes |
| Route composition | `src/styles/home.css` and route-local styles | Responsive layout without leaking page decisions into primitives |
| Automation | `scripts/` and personal Codex skills | Safe scaffolding and normalized content import |
| Verification | `tests/`, Astro check, build | Interaction, accessibility, overflow, assets, and schema confidence |

## Data flow

1. An editor changes a Markdown or MDX entry.
2. `src/content.config.ts` validates its frontmatter during development and build.
3. A route queries the collection at build time.
4. Astro renders static HTML with no content API required in the browser.
5. GitHub Actions builds and publishes `dist/` to GitHub Pages.

The Home page already reads profile and section copy from `src/content/pages/home.md`. The design-system page imports the same `WoodFrame` and `Ornament` components and reads CSS token values from the browser, which reduces documentation drift.

## External references

- [Astro styling guide](https://docs.astro.build/en/guides/styling/) — scoped styles, global styles, and CSS variables.
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) — build-time content loading and schema validation.
- [Astro GitHub Pages deployment](https://docs.astro.build/en/guides/deploy/github/) — static deployment model used by the workflow.
- [Bruno Paulino's design system](https://bpaulino.com/system/) — public, inspectable system-page reference.
- `docs/design/references/` — user-supplied visual direction for all five screens.

## Current state and next routes

Home and `/system/` are implemented. Posts, About, Projects, and Reading still use honest preview states. The recommended sequence is Projects, About, Posts, then Reading: it establishes the strongest recruiter-facing evidence first and leaves the external Notion integration until the content contract is stable.
