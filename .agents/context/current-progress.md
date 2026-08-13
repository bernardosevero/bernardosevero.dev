# Current Progress

Last verified: 2026-07-26
Evidence: the current feature branch, current manifests, lockfile, source, deploy workflow, and the upper-level ecosystem map.

## Landed

- Astro 7, Tailwind 4, TypeScript 7, and the Bun build workflow.
- `core`'s i18n runtime and theme manifest contracts.
- The first batch of `theme-default` layout/base/blog components, palette/global/blog/layout styles, and the main site compatibility wrappers.
- The `pages` protocol, module resolution/validation, official factory exports, scaffold/i18n aggregation, and standard variable rendering for the page packages' own Markdown templates.
- `post:new`, `project:new`, `vibe:new`, and `media:new` all use the `<filename> [output-directory]` arguments; default frontmatter and body content are no longer hardcoded in scripts.
- Starter explicit registration for Projects, Vibe, and Media; package-owned routes for Vibe and Media.
- The Markdown preset's combination of Expressive Code, callouts, columns/timeline, responsive tables, Mermaid, and math.
- `mdx-components`'s explicit content components/runtime helpers, including the friend-link application form, field data copying, and GitHub Issue/Issue Form prefill.
- Homepage dashboard, Blog archive/category/series/tag, search, comments, and multilingual UI.
- Starter and docs/demo dual content modes.
- Friend Circle build-time sync, static JSON consumer, and font-subset integration.

## In Transition

- `core`'s shared contract scope is still smaller than the long-term full orchestration goal.
- `theme-default` only covers part of the UI; homepage widgets, Projects, some blog/comment/search UI, and wrappers still live in the main site.
- Projects does not yet have a package route/UI like Vibe/Media.
- Collection schemas are still centrally defined by the main site.
- GitHub dependencies are integrated through remote commits and the lockfile, without unified sibling workspace linking.
- Deploy uses the docs submodule `--remote`, but local reproducibility still depends on the correct committed gitlink.

## Exists but Not Wired into the Main Site

- `weread-sync` can output privacy-filtered versioned reading snapshots and optional sanitized insights; the main site has no consumer.
- `page-template` is a third-party page module reference, not a main-site runtime dependency.

## Not Current Components

The `@navfolio/types`, `@navfolio/utils`, `@navfolio/plugin-blog`, `create-navfolio`, and the "full orchestration core" from old proposals must not be treated as landed packages. Only update status when manifests, source, consumers, and the lockfile provide evidence.

## Status Maintenance

- Merging package code is not the same as completing integration; also confirm downstream pins, the lockfile, docs, and the build.
- A package existing is not the same as completing the long-term goal; only record current exports and consumers.
- Next-phase work is defined by issues/PRs/user tasks; do not maintain a suggestion backlog in this file.
