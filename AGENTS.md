# Development guidelines

## Purpose and scope

Build Bernardo Severo's personal portfolio in Astro as a cozy medieval pixel-art RPG pause menu. Present professional work clearly, accessibly, and with good performance.

The Home / Personal Log screen is implemented in Astro and CSS; visual approval remains with the user. Only Home is currently in scope. Its menu opens explicit status dialogs, not finished destination pages. Work within the requested scope. Publishing, external service changes, and additional full screen implementations require a corresponding user request.

## Language

- Write all code identifiers, comments, documentation, commit messages, and default interface copy in English.
- Use `lang="en"` for English pages. Introduce other languages only when explicitly requested.
- Preserve proper names and the supplied reference images as provided.

## Visual source of truth

- Open and inspect the mockups in `docs/design/references/` before changing the interface.
- The five user-provided mockups are the primary visual references. The previous Figma reconstruction was rejected for poor fidelity; its components, fonts, and tokens are not approved specifications.
- Home defines navigation and composition. Projects guides the list/detail structure. Reading guides visual finish. Posts and About define their respective screens.
- Preserve proportions, hierarchy, spacing, frames, ornamentation, colors, and visual density. Do not reduce the design to green and beige rectangles or a generic dashboard.
- PNGs are references, not production screens. Text, links, buttons, lists, and states must be real, selectable, functional HTML/CSS. Do not use an entire screenshot as a background with transparent controls over it.
- Scenery, textures, and illustrations may be raster assets, separate from the interface. An image with embedded UI is not a clean scenery asset.
- The images do not specify exact fonts, tokens, or interaction states. Document implementation choices as proposals and validate them visually; do not claim exact matches without evidence.
- Report missing assets needed for fidelity. Do not present placeholders or approximations as final work.

## Site sections

- Home / Personal Log: introduction and main menu.
- Posts / Journal: writing list and topic filters.
- About / Character Sheet: profile, experience, and specializations.
- Projects / Quest Log: project list and case details.
- Reading / Codex: books, reading status, ratings, and details.

Use parchment, dark wood, green actions, golden selection indicators, and a medieval pixel-art village as the visual direction. Avoid cyberpunk, terminal, glassmorphism, and generic card layouts. Do not invent professional metrics, experience, or ratings; identify sample content clearly.

## Architecture and code

- Use Astro, strict TypeScript, and static generation as the foundation.
- Use npm and keep `package-lock.json` current. Do not introduce other package-manager lockfiles.
- Use `src/pages/` for routes, `src/layouts/` for shared structure, and `src/components/` for reusable components created as needed.
- Centralize visual tokens in CSS when implementing the interface. Reuse components for windows, buttons, navigation, list rows, and book slots.
- Prefer semantic HTML and CSS Grid/Flexbox. Reserve absolute positioning for decoration and necessary overlays.
- Add client-side JavaScript only for interactions that need it. Introduce React, UI libraries, or large dependencies only for a concrete requirement.
- Separate data and content from presentation. Use Astro content collections when implementing posts, projects, and reading entries.
- Keep reference images in `docs/` and production assets in `src/assets/` or `public/`.
- Never commit secrets, caches, installed dependencies, or build output.

## Responsiveness and accessibility

- The mockups show desktop layouts. Adapt the composition to smaller screens while preserving hierarchy and navigation; do not shrink the entire screenshot.
- Provide keyboard access, visible focus, sufficient contrast, comfortable touch targets, and accessible names.
- Use links for navigation and buttons for actions. Indicate selected states with more than color alone.
- Keep long-form text readable. Pixel fonts do not justify tiny or clipped text.
- Respect `prefers-reduced-motion`. Hide purely decorative elements from assistive technology.

## Verification and delivery

- Run `npm run check` and `npm run build` after code or configuration changes.
- Run `npm test` after changing Home layout or interactions. Install its browser once with `npx playwright install chromium`; tests use a separate preview server on port 4322.
- For visual changes, open the site and compare screenshots with the mockups at equivalent dimensions. Also check mobile layouts, scrolling, focus, and relevant interaction states.
- Fix overflow, overlap, and material composition differences before declaring a screen complete.
- Add tests for meaningful behavior when logic is introduced; avoid tests that merely repeat static markup.
- Report what was implemented, what was verified, and remaining limitations. A successful build alone does not establish visual fidelity.
- Preserve existing user changes. Broad deletions, force pushes, commits, pushes, and deployments must be authorized by the task.
