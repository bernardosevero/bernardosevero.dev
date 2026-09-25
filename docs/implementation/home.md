# Home / Personal Log

Historical implementation notes. The source mockups were retired on 2026-09-24; use the [design system](../design-system.md) for current UI work.

## Scope

This first implementation covered only `src/pages/index.astro`, based on the retired `home.png` mockup. It preserved the nameplate, left four-button menu, right character panel, profile labels, and welcome message. The other four screens were not yet implemented.

The menu opens native modal dialogs with short section introductions and explicit availability messages. This avoids dead links or claiming unfinished pages exist. Native dialog focus handling, Escape dismissal, visible keyboard focus, arrow-key selection, Home/End selection, and a skip link are supported. There are no third-party browser scripts or external font requests.

## Implementation choices

All headings, profile values, buttons, panels, corners, foliage ornaments, and selection indicators are HTML/CSS. The wood grain and parchment shading use layered CSS gradients. The bolts, inset edges, leaf silhouettes, and golden gem use borders, shadows, pseudo-elements, and clipped shapes. No reference PNG is served as interface artwork or used beneath transparent controls.

Desktop composition was compared at the reference size of 1586 × 992. The main panels are approximately 350px and 659px wide with a 24px gap. At smaller widths, the profile precedes the menu visually and text can wrap. At narrow phone widths, the menu becomes a single column; otherwise it uses two columns on mobile.

The reference does not name its fonts. Self-hosted [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) (700) and [VT323](https://fonts.google.com/specimen/VT323) (400) are implementation choices, not claims to be the exact source fonts. Font license files are included in `public/licenses/`.

This is a faithful structural interpretation, not a pixel-identical reproduction: procedural CSS wood grain, leaf details, letter shapes, and the newly reconstructed background differ from the original raster mockup. User visual approval is still needed.

## Decorative scenery

- Production asset: `public/images/village.webp` (1584 × 993, lossless WebP).
- Method: built-in image-generation tool, editing the supplied reference to remove all interface overlays. The resulting image was inspected for embedded text and controls, then encoded as lossless WebP without resizing or visual changes.
- Use: decorative fixed background with an empty semantic footprint, preloaded locally. The entire functional interface is rendered separately.

### Generation prompt

> Use case: precise-object-edit. Asset type: decorative background artwork for a real HTML/CSS portfolio. Edit target: attached medieval pixel art village mockup. Remove ALL interface overlays completely: the central large wood/parchment personal details panel, left main menu panel with buttons, and top wooden nameplate. Inpaint their entire areas with uninterrupted natural medieval village scenery: winding cobblestone village lanes, grass, shrubs, flowers, trees and modest timber houses. Preserve the existing outer village composition, stream and stone bridge on left, warm-roof cottages on right, tree canopy, well bottom right, chickens, overall muted sage/olive/teal/ochre palette, warm daylight, fine square-pixel rendering and top-down 2D RPG camera. Must be landscape 1536x1024 or similar. Absolutely NO text, NO letters, NO UI, NO panels, NO menus, NO buttons, NO labels, NO frames, NO watermark anywhere. The center must be coherent village scenery, not a blank patch. This is background scenery ONLY, not a website screenshot.

## Verification

Run `npm run check`, `npm run build`, and `npm test`. Browser tests cover 320, 390, 760, 768, 1024, and 1586px widths, arrow-key wraparound, dialog opening and closing, focus restoration, a skip link, font and background delivery, browser errors, and automated WCAG checks on Home and an open dialog at mobile and desktop sizes with reduced motion enabled.

Inspect the generated screenshots as well: tests alone do not establish visual fidelity, and automated accessibility checks do not replace human keyboard or screen-reader review.
