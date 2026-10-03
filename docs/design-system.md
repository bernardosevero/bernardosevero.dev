# Design system

## Purpose

The design system defines the portfolio's medieval pixel-art language: a distinctive RPG atmosphere with immediate professional clarity.

The public `/system/` route is the live specimen sheet. This document defines ownership, constraints, and contribution rules. Production CSS and components remain authoritative.

## Decision: vanilla CSS

The project uses vanilla CSS with Astro rather than Tailwind or another styling framework.

Why it fits:

- The interface relies on a small, distinctive vocabulary rather than a broad utility catalog.
- Timber, parchment, pixel corners, ornaments, and layered shadows benefit from readable custom CSS.
- Astro scopes component styles by default and ships no runtime CSS-in-JS cost.
- A token layer keeps recurring choices consistent without turning every template into a long class string.
- Fewer dependencies make a small static portfolio easier to understand and maintain.

Tradeoffs accepted:

- Contributors must name and organize CSS deliberately.
- Responsive composition is written by hand.
- Drift is possible if one-off values bypass tokens; review and the live `/system/` page are the controls.

Revisit this decision only with explicit user direction. Do not add a framework preemptively.

## Visual source of truth

Use production tokens, components, and live `/system/` specimens when changing UI. Home is the village greeting with the RPG dialogue; About is the CV page. Every content route uses the top navigation from `BaseLayout`.

Preserve hierarchy, density, proportions, timber, parchment, green actions, gold selection cues, and the medieval village atmosphere. Avoid generic dashboards, terminal aesthetics, glassmorphism, and cyberpunk motifs. Raster assets may supply scenery, texture, and illustration; text, navigation, controls, lists, ratings, and statuses remain semantic HTML.

## CSS ownership

| Layer | Location | Owns |
| --- | --- | --- |
| Tokens | `src/styles/tokens.css` | Palette, typography families, type scale, shared page spacing, frame geometry, shared effects |
| Foundations and primitives | `src/styles/global.css` | Reset, document defaults, focus, wood frames, parchment, RPG buttons, ornaments, long-form `.prose`, reduced-motion behavior |
| Components | Component-local `<style>` | A reusable component's internal layout and variants |
| Routes | `src/styles/*.css` or route-local `<style>` | Cross-component page composition and responsive changes |

`tokens.css` declares the cascade order `reset, tokens, base, components, utilities`. `global.css` places its reset, document defaults, shared primitives, and `.sr-only` utility in those layers. Component-local `<style>` blocks and route stylesheets stay unlayered, so they refine shared primitives without specificity contests. Do not create a new layer without a concrete conflict it resolves.

Reuse existing tokens before adding values. Name stable roles semantically and materials descriptively. Keep page composition out of shared primitives; prefer Grid/Flexbox, reserve absolute positioning for decoration and overlays, and document any accessibility or third-party `!important` override.

`npm run lint:css` runs Stylelint with `stylelint-config-standard` over CSS files and Astro `<style>` blocks. Class names follow kebab-case BEM (`block__element--modifier`); Prettier owns whitespace. Fix findings instead of adding disable comments.

## Foundation tokens

### Color roles

- `--ink`, `--ink-soft` — primary and secondary text on parchment.
- `--parchment`, `--parchment-light`, `--parchment-edge` — readable surfaces and aged edges.
- `--wood-dark`, `--wood-shadow`, `--wood`, `--wood-light` — structural frames and depth.
- `--backdrop` — village-green fallback behind the page scenery.
- `--green-dark`, `--green`, `--green-light` — primary actions and village continuity.
- `--green-highlight`, `--green-shade` — top and bottom bevels of green controls.
- `--on-green` — light text on green controls.
- `--button-shadow` — drop shadow beneath raised controls.
- `--gold` — focus, selection, and scarce emphasis.
- `--gold-highlight` — bevel highlight on gold markers and gems.
- `--ornament` — dividers and quiet decoration.

Gold is not body-copy color. Green does not carry state by itself. Every status also needs text, shape, position, or an accessible label.

### Typography

- `--font-heading`: Pixelify Sans 700 for decorative page titles, section titles, navigation, and compact labels.
- `--font-body`: VT323 400 for metadata, descriptions, tags, badges, inline code, and controls where legible.
- `--font-text`: Alegreya 400, 400 italic, and 700 (fallback Georgia, serif) for sentence-length copy (long-form prose, the About paragraph and timeline descriptions, and project card summaries) and, at 700, for post and project names: the post page title, post titles on `/posts/`, and project card titles.

Rule: anything read as sentences uses the text face, and so do post and project names, which are often sentence-length. Decorative page titles (`ABOUT`, `PROJECTS`, `POSTS`, `READING`, `SYSTEM`), other names and headings (including book titles and `h2` headings inside prose), labels, stats, tags, badges, dates, navigation, buttons, links styled as actions, the post kicker, and the short page intro under each page title stay pixel (`--font-heading` / `--font-body`).

The post page title uses the route-local `.page-title--text` modifier in `src/pages/posts/[slug].astro` (Alegreya 700, no uppercase, `clamp(var(--text-2xl), 5vw, var(--text-4xl))`, 1.1 line height, centered `22ch` measure); the shared `.page-title` stays pixel. The topic tags under a post header are centered by the route-local `.article-tags` class; the shared `.tag-list` and the tags on `/posts/` stay left-aligned.

All fonts are self-hosted through Fontsource, with their SIL Open Font License texts in `public/licenses/` (`pixelify-sans.txt`, `vt323.txt`, `alegreya.txt`). Pixel typography is thematic, not permission to use cramped sizes.

#### Long-form prose

`.prose` in `src/styles/global.css` (`@layer components`) is the single owner of long-form reading styles; it wraps the rendered Markdown on post articles and book reviews. It sets a `68ch` measure (in the text face), the `--prose-size` token (`clamp(var(--text-sm), 2.5vw, var(--text-md))`), 1.6 line height, and 0.8em spacing between blocks, and adds no type-scale token. Pixel accents: `h2` in `--font-heading` with diamond ornaments, wood diamond bullets, wood numbered badges, pixel table headers, inline `code` in `--font-body`, and a centered italic pull quote with ornament rules. There is no drop cap. Descendant rules use `:where()` so routes can refine them; routes keep only page composition (for example the top margin). `/system/` lists Alegreya as a font card (name and short description) under Typography, like the other faces.

#### Type scale

Every font size uses a `--text-*` token. Steps follow the 4px rhythm through 32px, then widen for display headings:

| Token | Size | Typical use |
| --- | --- | --- |
| `--text-2xs` | 1rem · 16px | Character Sheet strength and identity labels |
| `--text-xs` | 1.125rem · 18px | Navigation minimum, book tile titles, timeline periods, project links |
| `--text-sm` | 1.25rem · 20px | Tags and badges, timeline copy, About prose, phone-size headings |
| `--text-md` | 1.5rem · 24px | Metadata, topic filters, Codex fact labels, heading and intro minimums |
| `--text-lg` | 1.75rem · 28px | Body copy (`body` default), card and post title minimums |
| `--text-xl` | 2rem · 32px | RPG buttons, article subheads, section heading and intro maximums |
| `--text-2xl` | 2.5rem · 40px | Page and sheet title minimums, card and post title maximums |
| `--text-3xl` | 3rem · 48px | Codex title and desktop sheet title maximums |
| `--text-4xl` | 3.75rem · 60px | Character Sheet title maximum |
| `--text-5xl` | 4.5rem · 72px | Page title maximum |

Fluid headings use two tokens as `clamp()` bounds, for example `clamp(var(--text-md), 3vw, var(--text-xl))`. The tokens are in `rem`, so text follows the visitor's browser font-size preference; layout geometry, borders, and pixel-art details stay in `px`. `npm run lint:css` rejects raw font sizes. Add a step only when no existing step works, and record it here and in the `/system/` type-scale specimen.

When a label column must fit text, size it from the content (for example a shared `max-content` column with `subgrid`) instead of a fixed pixel width tuned to one font size.

### Space and geometry

- Shared component spacing should normally use multiples of 4px; there is no unused base-unit token.
- `--frame-width` controls the shared timber surround.
- `--frame-shadow` owns the shared elevation recipe.

Not every dimension must become a token. Promote a value when it represents a reusable decision, not merely because it appears twice by coincidence.

## Materials and primitives

### WoodFrame

`WoodFrame.astro` provides the timber surround, corner hardware, and optional parchment surface. Its timber material is the `--surface-wood` background plus the `--wood-bevel` inset highlights (tokens.css), which other dark-wood strips reuse instead of copying the gradients. Use it for primary RPG windows, not every content card. Nested frames should be rare so the hierarchy remains obvious.

The Components and States section on `/system/` includes a live timber-only specimen alongside the parchment-backed production windows that structure the page.

### RPG button

`.rpg-button` is the primary action primitive. Its focus ring uses gold and remains visible independently of hover. Use native links for navigation even if they share the visual class; use buttons only for actions.

### Site navigation

`SiteNavigation.astro` and `src/config/navigation.ts` own the portfolio's five destinations: About (`about/`), Projects, Blog, Books, and System. A 54px Home tile (the pixelated wizard portrait in a 3px `--ornament` frame, `aria-label="Home"`) starts the bar before the five buttons and links to the site root. It uses real anchors and derives the active section from the current route by matching each item's path; the root and unknown routes resolve to `home`, which marks the Home tile `aria-current="page"` and no button. It renders on every public content route. All content pages, including Home, About, and Books, use the same top bar from `BaseLayout`. Navigation stays in normal flow with a token-based gap before content. The grid is `54px repeat(5, minmax(0, 1fr))` when the menu has room and `54px repeat(2, minmax(0, 1fr))` in narrow containers, where the tile spans all three button rows. There is one navigation layout, without a redundant bar/rail variant. Its 54px minimum link height is preserved at mobile sizes. The documentation-only `preview` mode renders static spans with identical production classes, so its specimen never navigates away.

### Reading Codex

`ReadingCodex.astro` renders the compact banner, bookshelf tiles, selected-book details, and shelf navigation. Its page-composition styles live in `src/styles/reading-codex.css`; enhancement lives in `src/scripts/reading-codex.ts`. `BookTile.astro` owns its scoped tile styles and does not import the page stylesheet. The complete component runs only on Reading. `/system/` demonstrates the shared `BookTile` and `BookRating` components individually, without embedding a page or querying the book collection. The page has one fixed level-one heading; its default instance ID is `reading-codex`.

Desktop uses a 3:2 split between shelf and details, with four cover-first columns. Container queries reduce the shelf to three columns on tablets, then two columns with stacked panels on phones. Real edition covers use `object-fit: contain`; metadata is semantic HTML. Selected tiles have gold corner brackets and a diamond, while the active shelf has a gold border and marker. Keyboard focus remains distinct from selection.

Without JavaScript, shelf navigation and book tiles are fragment links and all metadata and review links remain readable. Each shelf is a named, keyboard-focusable scroll region with a bounded block size. Enhancement displays one shelf and detail at a time, remembers a selection per shelf, supports Arrow Left/Right and Home/End on tabs, and moves focus to the chosen book details. The Finished shelf opens by default. Empty shelves never display stale book details.

`BookRating.astro` renders five outlined stars with full or fractional fills plus an exact accessible value. Missing ratings say “Not rated”; zero remains a valid rating. The system page shows all these states. No ratings or review summaries are inferred.

Reading uses the same `SiteNavigation` bar demonstrated on `/system/`: green actions in a timber frame, five columns on desktop and two on mobile. It sits in normal document flow above the Codex so its actual height determines the content spacing.

### Project card

`ProjectCard.astro` owns the compact Projects index presentation. Its explicit link list can expose verified course pages, source repositories, and live applications without making the entire card interactive; missing or unusable URLs leave the title and summary readable. Summaries use the text face (`--font-text`, 70ch measure, 1.55 line height); titles use the text face at 700 with a 1.15 line height and the existing size clamps; link actions stay pixel. Each card shows one decorative image (`alt=""`) in a timber frame at a 1200:630 ratio: beside the text in a `304px` column when the card is wider than 600px (a container query, so `/system/` cells and tablets stack), otherwise full width above the title. The image is chosen by `resolveProjectImage` in `src/utils/project-images.ts`, first match wins: the entry's own `image`, then its saved og:image in `src/assets/projects/og/`, then `src/assets/projects/default.webp`. The frame exposes the choice as `data-image-source` (`added`, `og`, or `default`). The image links to the project's main destination (`primaryUrl`: the entry's `liveUrl`, otherwise its first `links` entry) when that URL passes the same verified-host check as the link list; otherwise it stays a plain, unclickable image. The image link opens in the same tab, duplicates a link already in the list, and is therefore hidden from keyboard and assistive technology (`tabindex="-1"`, `aria-hidden="true"`) so it adds no duplicate, unlabelled stop. On hover it shows a pointer and the frame border turns from `--wood-dark` to `--gold`, with no zoom or motion. It reports the same `project_destination_opened` event as its text link, with `trigger: 'image'` instead of `'link'`. `/system/` specimens pass the default image; the linked specimen passes a verified `primaryUrl` and the read-only specimen passes none. Project list cards do not show technology tags or case-study labels. Draft entries are excluded in all environments; cards have no draft-preview state.

### Chapter bar

`ChapterBar.astro` (with `src/scripts/chapter-bar.ts`) is the reading tracker on posts. It renders only when a post has at least two `##` sections; book reviews and shorter posts get nothing. `posts/[slug].astro` builds the outline at build time with `outlineSections()` in `src/utils/outline.ts`, which pairs Astro's rendered `headings` (never hand-made slugs) with per-section word counts, so segment sizes are in the HTML with no layout shift.

- It is a native `<details>` placed directly above `.prose`, with the same `68ch` measure (it shares `--prose-size` so `ch` matches), `position: sticky; top: 12px` inside the article wrapper so it scrolls away when the article ends.
- The `<summary>` strip uses `--surface-wood` and `--wood-bevel`: current section, `· 2 of 6`, `30% · 4 min left` (or `Finished`), the `Contents` label, and one segment per section sized by word count and filled in green as you read. The current segment has a gold border.
- The open panel overlays the prose with one link per section; the current link has `aria-current="location"`. Activating a link closes the panel; Escape closes it and returns focus to the summary. The script measures the strip so headings reached from Contents land below it.
- Without JavaScript, the strip shows only `Contents` and a chevron, and the disclosure still opens a working list of heading links. The script reveals the status and segments; if markup is missing it throws before enhancing, leaving that native disclosure usable.
- A section's progress is how far a reading line, 30% down the viewport, has moved from its heading to the next heading (or the end of the prose). In the last viewport-height of scrolling the line slides to the viewport bottom so the final sections can reach 100% and show `Finished`.
- Progress updates run in a `requestAnimationFrame`-throttled passive scroll/resize listener, with no live-region announcements. Fill width transitions are disabled under reduced motion.
- The four UI strings (`Contents`, `of`, `min left`, `Finished`) are constants in the component for translation.

`/system/` shows a closed static preview (`previewProgress`) from a fixed three-section outline; it is not scroll-tracked.

### Ornaments

`Ornament.astro` renders divider and sprig variants as CSS shapes. They are decorative and hidden from assistive technology. Ornaments reinforce structure but never replace a heading or label.

### Pixel icons

`src/layouts/CharacterSheet.astro` is no longer routed and is kept only until its planned removal. Production content pages use the shared navigation for page switching; redundant return links are not rendered. `/system/` retains a return link as a documentation-page escape hatch and specimen.

`PixelIcon.astro` contains multicolor SVG artwork for the character sheet, tool tiles, and professional profile links. Tool marks retain recognizable colors; the briefcase, star, wrench, book, and graduation cap share dark walnut outlines, bronze shading, and gold highlights drawn from the About reference. The walnut `pin` marks a location in metadata lines. The AWS illustration is a cloud symbol with an orange smile, not an official logo. Artwork is independent of CSS geometry; CSS controls its size and surrounding tile. Decorative instances are hidden from assistive technology; icon-only controls must provide an accessible name and a visible tooltip or nearby label. The live inventory shows both icon families.

### CV download

The optional `CvDownloadLink.astro` has two variants. `icon` (the default) reuses `.social-link` from `src/styles/social-link.css` and follows LinkedIn and GitHub on the Character Sheet. `button` is a labelled `.rpg-button` with the same icon, used as the primary action in the CV page header. It owns native download semantics and an explicit accessible PDF label, independently of external profile navigation. The contact heading row wraps when the actions need more space. Its walnut-and-gold document icon belongs to `PixelIcon.astro`. System renders both variants and their keyboard focus behavior when a public CV is configured, or the icon alone when it is absent. This small addition preserves the approved About composition; the narrow heading row may reflow to a second line. See `docs/content.md` for enabling and replacing the PDF.

### Company tile

`CompanyTile.astro` renders the 40px tile and owns its styles. `ExperienceEntry.astro` (Character Sheet timeline) and `CvExperience.astro` (CV page) both use it. `ExperienceEntry` renders a row with the tile, then the company name (`h3`) with role and period, followed by the description; its timeline diamond alignment (centered on the 40px row) lives in `about.css`. The tile has a 2px `--wood-dark` border, `--parchment-light` fill, and the standard inset and drop shadows. A supplied logo renders at 28px with `object-fit: contain` and keeps its own colors; without one, the tile shows a monogram from `companyMonogram()` in `src/utils/format.ts` (first letter of up to three words, `--font-heading` 700 at `--text-2xs`, `--ink-soft`). Both forms are decorative (`alt=""` or `aria-hidden="true"`) because the company name sits beside the tile. The tile stays 40px on phones. `/system/` shows static monogram specimens in both entries. See `docs/content.md` for adding logos.

### Home dialogue

`/` renders `src/pages/index.astro`: the village backdrop as the scene, a decorative layer, and `HomeDialogue.astro`, whose copy comes from the `home` content entry. Each choice maps its `destination` to a navigation item for its `href` and page name. The first screen fills the viewport below the navigation (`min-height: calc(100svh - var(--home-chrome))`, never `height` or `overflow: hidden`) and anchors the dialogue to its bottom. `--home-chrome` is the page top space, the measured navigation height for each navigation layout, and the section gap; re-measure it when the navigation's height changes.

The dialogue is a `WoodFrame` with a green `Bernardo` name plate on its top edge, a 156px bobbing portrait, and a parchment text area: the greeting as the `h1`, the intro, the prompt, and the four choices as real links in a two-column grid. Each choice shows a pixel ▶ cursor when hovered or focused, and the first choice shows it when none is active. At `<= 560px` the portrait shrinks to 72px and joins the plate in a row overlapping the frame's top edge, the choices stack in one column (at least 44px tall), and the prompt is visually hidden but still read aloud. Content taller than the first screen makes the page scroll; text and touch targets never shrink further.

`src/scripts/home-dialogue.ts` is progressive enhancement. The server renders the complete text and choices. The script types the text at 28ms per character into an `aria-hidden` copy layered over the real text, which keeps its layout and stays readable to assistive technology. It hides the choices until typing ends and adds a `Skip ▸▸` button. Skip, any key press, or any click inside the dialogue completes the text at once; listeners stay on the dialogue, and no timer runs after completion. Missing markup throws before enhancing, leaving the server-rendered dialogue usable. `/system/` shows a static `preview` specimen with no heading, links, or typing.

Motion inventory, all CSS animating only `transform` and `opacity`:

| Element | Motion |
| --- | --- |
| Backdrop and decorative layer | Ken Burns drift to `scale(1.07) translate(-1.5%, -1%)`, 36s, `ease-in-out`, infinite alternate |
| Chimney smoke | Three 12px squares rising and fading, 4.5s, staggered 1.5s |
| Lantern glow | 44px radial gold pulse, 2.6s |
| Fireflies | Ten 6px gold squares (four on phones, with no smoke), 7s float, staggered |
| Portrait | 3px bob, `steps(2)` |
| Choice cursor and caret | Pixel nudge and blinking ▼ caret |

The decorative layer is `aria-hidden` and ignores pointer events. Its inner box is sized like the cover-fitted art, so percentage positions stay over the left house and lantern at any viewport. With `prefers-reduced-motion: reduce`, nothing moves: the global rule stops animations, the decorative layer is hidden, and the script leaves the full text and choices in place with no Skip button. Without JavaScript the dialogue is complete and its links work.

### CV page

`/about/` renders `src/layouts/CvSheet.astro`, with route styles in `src/styles/cv.css`. One parchment `WoodFrame` holds a header (portrait, kicker, name as the only `h1`, class line, pinned location and focus, then the CV button and profile links in a `Professional profiles and CV` navigation), a Summary, and two columns: Experience, Education, and Side quests in the main column; Skills, Character stats, and Daily tools in the sidebar. The sidebar follows the main column at `<= 900px`.

`CvExperience.astro` renders one role as an `article`: company tile, company name (`h3`), role with optional employment, period and location, an italic description, diamond highlights, and soft tech chips labelled `Tech used at <company>`. `Emphasis.astro` renders content text through `emphasisRuns`, so `**bold**` markers become `<strong>` without `set:html`. Side quests list visible projects in Projects order; a title links to its main destination only when that host is verified by `src/utils/project-links.ts`, which `ProjectCard` also uses.

The print stylesheet in `cv.css` hides navigation, the footer, the actions, the stats and tools boxes, and the All projects link; removes wood, parchment, and shadows; prints black on white; and keeps each role on one page (`break-inside: avoid`).

### Tags and status labels

`.tag-list` groups technologies and topics; `.status-badge` labels metadata. `.tag-list--soft` is a quieter parchment variant for secondary lists, such as the tech used in a role or daily tools. Both use the legible body pixel font rather than the display face. They are real semantic list or text content and are demonstrated on `/system/`. The Codex's status field and star rating belong to its detail panel.

### Topic filters

`.topic-filter` is a native button used for client-side post filtering. The active option carries `aria-pressed="true"` as well as a gold selected state. Without JavaScript, every post remains visible and readable.

## Responsive behavior

Layouts reflow at content-driven breakpoints:

- Preserve readable text and touch targets.
- Stack or reorder panels when horizontal space disappears.
- Keep functional controls inside the viewport without scaling the entire scene.
- Allow documents and lists to scroll naturally.
- Decorative scenery may crop; professional content may not.

Current regression widths are 320, 390, 760, 768, 1024, and 1586 pixels.

Write queries in range syntax (`width <= 520px`, `width > 820px`) so adjacent ranges cannot leave fractional-pixel gaps. Native CSS cannot put custom properties in media queries, so reuse these values instead of inventing nearby ones:

| Query | Value | Role |
| --- | --- | --- |
| Viewport | `<= 520px` | Phone density: tighter panel padding, smaller headings and icons |
| Viewport | `<= 560px` | Outer shell: page and navigation side gutters shrink to 8px |
| Viewport | `<= 760px` | `/system/` specimen grid switches to auto-fit columns |
| Viewport | `> 820px`, `<= 1200px`, `<= 1080px` | Character Sheet: desktop spacing, one stacked column, then compact identity and tag sizing |
| Viewport | `<= 838px`, `<= 520px` | Home: `--home-chrome` follows the two-column navigation, then its phone padding |
| Viewport | `<= 560px` | Home dialogue: stacked speaker row, one choice column, hidden prompt line, fewer decorations |
| Viewport | `<= 1080px`, `<= 900px`, `<= 520px` | CV page: header actions wrap below the name, sidebar follows the main column, then a stacked header |
| Container | `<= 850px`, `<= 650px` | Reading Codex: three-column shelf, then two columns with stacked panels |
| Container | `<= 650px` | `BookTile` and `BookRating` compact sizing inside the Codex |
| Container | `<= 760px` | `SiteNavigation` switches from five to two button columns beside the Home tile |

Prefer container queries for components whose width depends on their parent. Add a new value only when content breaks between the existing ones, and record it here.

## Accessibility states

Target WCAG 2.2 AA. Every interactive primitive needs default, hover, focus-visible, active, and disabled behavior when supported. Automated axe checks supplement manual review.

- Use links for navigation and buttons for actions, with accessible names and visible keyboard focus. Never remove a focus indicator without an equivalent replacement or communicate state through color alone.
- Preserve the `BaseLayout` skip link and its focusable `#main-content` destination. Verify activation moves focus past navigation.
- Associate form controls with visible labels and connect help/error text with the relevant field.
- When adding a modal, move focus into it, contain keyboard focus while open, support Escape, and restore focus to the trigger on close. Prefer native dialog behavior.
- Hide decoration from assistive technology; supply meaningful alt text for informative images. Icon-only controls need accessible names.
- Verify changed controls and state indicators in forced-colors mode, at 200% zoom, and with reduced motion. Keep keyboard focus distinct from selection.
- Preserve comfortable reading sizes and touch targets. Self-host fonts, optimize raster assets, and avoid runtime dependencies for CSS effects.

## Visual verification

For visual changes, capture and inspect before/after screenshots of affected routes at mobile and desktop widths. Shared-layout changes require 320, 390, 760, 1024, and 1586px checks, including `/system/` specimens. Verify menu/content geometry, backdrop layers, timber/parchment materials, visible link targets, and specimen containment.

Check overflow, wrapping, loading/console errors, keyboard order and focus, reduced motion, and the accessibility states above. For motion changes, include a recording or sampled states. Report intentional differences, approximations, and unavailable checks; a build or DOM assertion alone does not establish visual fidelity. Keep evidence in ignored test artifacts or attach it to the review, never commit generated captures.

## Maintaining `/system/`

The public route must import real production components and read computed CSS variables. It should not maintain a copied palette or recreated button. When a shared visual primitive changes:

1. Update its implementation and tokens.
2. Update the live specimen for every shared component, variant, token, or interaction-state change. Route-only composition needs no specimen unless it changes a shared rule.
3. Update this document if the ownership or rule changes.
4. Run formatting, CSS lint, type, build, browser, accessibility, and responsive checks.

## Shared page geometry and specimen isolation

`tests/design-consistency.spec.ts` enforces the shared geometry, material styles, background layers, keyboard-accessible navigation, and isolated specimen layout at 320, 390, 760, 1024, and 1586 pixels. Extend its route matrix for new content routes and its assertions for new shared primitives. Never weaken assertions to accept drift; intentional contract changes require user direction and matching documentation. GitHub Actions gates deployment on formatting, CSS linting, type checking, production builds, and browser tests; screenshot review remains required for visual changes.

All content routes share `--page-width` (1160px), `--page-top-space`, and `--page-section-gap`. `BaseLayout` owns the top navigation and `SiteFooter`, which follows the main content with the author credit and no social icons. `portfolio.css` owns the common backdrop and content shell, including the 24px gap before the footer; the footer owns its responsive bottom padding. About's former side navigation is intentionally replaced by this shared bar. Books has no background opacity or width override. Codex frames inherit the global timber thickness, and their parchment uses `--surface-parchment`, the same material as `WoodFrame`.

Do not add route-local menus, side rails, positioned navigation, compensating offsets, or overrides of backdrop opacity, timber thickness, and outer panel width. Production navigation remains real links with exactly one current item.

The design-system catalog displays individual components in responsive specimen cells. Layout CSS targets direct specimen children only; it must not override nested component padding, heading styles, or dimensions. The menu specimen uses its own full-width section and static preview mode. The return-to-Personal-Log link remains functional on `/system/`.
