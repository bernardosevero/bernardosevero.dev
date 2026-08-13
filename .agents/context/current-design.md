# Current Design and Architecture

Last verified: 2026-07-25  
Evidence: the current feature branch, `package.json`, `bun.lock`, current source, deploy workflow, and the upper-level ecosystem map.

## Product and Configuration

Navfolio is an Astro starter centered on a personal introduction, articles, projects, life fragments, media records, and external identity entry points. The current visual direction is a calm editorial dashboard: paper-like palette, restrained shadows, compact tags, and spacious body text; responsive reading and navigation come first, with motion only as an enhancement.

`src/config/site.toml` is the user configuration surface, managing identity, palette, fonts, page copy, homepage cards, navigation, search, comments, and display settings. `navfolio.config.ts` is the build-time composition entry, explicitly registering Projects, Vibe, Media, the Pages marker, and the Markdown preset.

## Main Site Composition Flow

```text
page modules + Markdown/pages plugins
  → src/plugins/config.ts
  → Astro integrations / injected routes / remark / rehype

resolved modules
  → content.config.ts / site navigation / new-content / ui-text
```

`astro.config.mjs` also handles MDX, sitemap, Tailwind, the site base/url, and the `virtual:navfolio/page-runtime` alias.

## Page Module Boundaries

| Module   | Package owner                                      | Main site still owns                                        |
| -------- | -------------------------------------------------- | ----------------------------------------------------------- |
| Projects | `page-projects`'s descriptor, i18n, scaffold       | `src/modules/routes/**`'s index/detail UI and schema/config |
| Vibe     | `page-vibe`'s descriptor, route, UI, interactions  | runtime adapter, schema/config, and integration             |
| Media    | `page-media`'s descriptor, shelf/review routes, UI | runtime adapter, schema/config, and integration             |

`pages` defines the shared protocol, route/enablement resolution, duplicate-route validation, scaffold/i18n aggregation, standard template-variable rendering, and the official factory exports. By default it only enables Projects; this starter explicitly enables all three.

Every page package with a content scaffold publishes `templates/default.md`, and the descriptor points to it via URL. `scripts/new-content.ts` only handles the standard `<command>:new <filename> [output-directory]` arguments, template rendering, and safe writes; the Blog host template lives in `scripts/templates/post.md`.

`src/content.config.ts` still owns the concrete schemas. When a module is disabled, its corresponding route, collection, default navigation, scaffold, and i18n contributions should all disappear.

## Core, Theme, and Runtime

- `core` v0.2.0 provides a dependency-free i18n runtime, plus the theme manifest/component contracts, `defineTheme()`, and a component resolution helper.
- `theme-default` v0.1.0 provides the default theme manifest, the first batch of base/layout/blog components, and the global/palette/blog/Markdown-layout styles.
- The main site still keeps the compatibility wrappers, homepage dashboard, Projects, and other not-yet-extracted UI.
- `src/modules/page-runtime.ts` is the narrow adapter layer for package-owned routes, exposing selected components, site/i18n helpers, image helpers, and assets; it is the cross-repository runtime contract.

## Markdown, MDX, and Styles

- `plugin-markdown` orchestrates Expressive Code, math, Mermaid, responsive tables, callouts, and columns/timeline.
- `plugin-callout` and `plugin-markdown-layouts` own the syntax and structural output, respectively.
- `theme-default` owns the default visual skin for the shared structures.
- `mdx-components` only provides components and helpers explicitly imported by layout/content, and does not configure the compiler.

## Content, Data, and Deployment

- Starter content: `src/content`
- Docs/demo content: `src/docs` submodule, selected by `NAVFOLIO_CONTENT_SOURCE=docs`
- Docs publishing: first push `astro-navfolio-docs`, then update the gitlink and run the docs build
- Friend Circle: deploy action → `public/friend-circle.json` → MDX component/font subset consumer
- WeRead: an ecosystem producer exists, but the main site has no dependency, workflow, route, or component consumer

## Constraints

- `core` does not depend on any specific theme.
- A package-owned route must not import the main site's private paths directly; it goes through the virtual runtime instead.
- Plugin structural contracts are separated from theme visual contracts.
- Producers and consumers connect through verifiable, privacy-safe data contracts.
- Keep static output, no secrets in the repository, and GitHub Pages sub-path compatibility.
