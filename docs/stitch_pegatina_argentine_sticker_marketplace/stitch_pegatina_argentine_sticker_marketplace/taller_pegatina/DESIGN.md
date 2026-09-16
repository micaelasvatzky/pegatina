---
name: Taller Pegatina
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1b1c'
  on-surface-variant: '#4f4633'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#817660'
  outline-variant: '#d2c5ac'
  surface-tint: '#775a00'
  primary: '#775a00'
  on-primary: '#ffffff'
  primary-container: '#fdc623'
  on-primary-container: '#6e5300'
  inverse-primary: '#f5bf19'
  secondary: '#944a00'
  on-secondary: '#ffffff'
  secondary-container: '#fe8e30'
  on-secondary-container: '#663100'
  tertiary: '#2c6385'
  on-tertiary: '#ffffff'
  tertiary-container: '#a0d4fb'
  on-tertiary-container: '#235c7e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf97'
  primary-fixed-dim: '#f5bf19'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5a4400'
  secondary-fixed: '#ffdcc5'
  secondary-fixed-dim: '#ffb784'
  on-secondary-fixed: '#301400'
  on-secondary-fixed-variant: '#713700'
  tertiary-fixed: '#c8e6ff'
  tertiary-fixed-dim: '#98cdf3'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#084b6c'
  background: '#fcf9f8'
  on-background: '#1b1b1c'
  surface-variant: '#e5e2e1'
  paper-canvas: '#FBFAE1'
  paper-card: '#FFFFFF'
  kraft-accent: '#D4A373'
  stamp-ink: '#1E1E1E'
  washi-tape: rgba(253, 198, 35, 0.45)
  wash-sky-muted: '#E5EEF5'
typography:
  display-hero:
    fontFamily: Epilogue
    fontSize: 56px
    fontWeight: '900'
    lineHeight: 60px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Epilogue
    fontSize: 36px
    fontWeight: '900'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Epilogue
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 46px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Epilogue
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Epilogue
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Epilogue
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Work Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-stamp:
    fontFamily: Epilogue
    fontSize: 11px
    fontWeight: '800'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.75rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system translates the raw, tactile vitality of Argentine indie zines and neighborhood art fairs (*ferias de arte gráfico*) into a curated, high-craft digital gallery. It balances playful collage energy with disciplined editorial proportions. The brand tone is warm, communal, and unapologetically expressive—grounded in maker culture while delivering frictionless e-commerce mechanics.

The aesthetic philosophy is **Artisanal Tactile & Editorial Collage**:
- **Cut-Paper Architecture**: Surfaces evoke high-grade sketchbook paper (`#FBFAE1`), vellum cutouts, and physical paper stock rather than flat, synthetic pixels.
- **Physical Fasteners**: Micro-details feature washi tape clips, stamped ink accents, and slight, intentional rotational offsets (-1.5° to 2°) that mimic physical curation on an art gallery pinning board.
- **Ink & Pigment**: High-contrast graphic marker ink (`#1E1E1E`) anchors the visual weight, pairing bold display lettering with solar warmth and soft sky highlights.
- **Accessible Craft**: Playful and textured without devolving into visual chaos; content grids and checkout flows remain rigorous, legible, and conversion-focused.

## Colors

The palette reproduces physical art supplies: solar block-print yellow, warm screen-printing orange, weathered sky blue, and dense marker ink on porous sketchbook cream.

### Palette Architecture
- **Primary (`#FDC623`)**: Solar gold/warm cadmium yellow. Used for hero interaction triggers, primary sticker badges, celebratory accents, and translucent washi tape overlays.
- **Secondary (`#EA7F20`)**: Saturated terracotta orange. Serves as the active CTA driver, price tags, and urgent interactive highlights.
- **Tertiary (`#71A5CA`)**: Weathered cerulean sky. Provides cooling visual balance across secondary badges, artist residency tags, filter chips, and category headers.
- **Neutral Base (`#1E1E1E`)**: Indian ink / chisel-tip marker black. Powers typography, tactile 1.5px architectural borders, and drop-shadow stamps.
- **Canvas Base (`#FBFAE1`)**: Natural sketchbook cream. Applied to the foundational viewport background to eliminate cold digital glare and establish tactile authenticity.

### Usage Guidelines
- Never place `#FDC623` directly on pure white without a `#1E1E1E` border or sufficient dark ink contrast.
- Cards, drawers, and modals use crisp paper white (`#FFFFFF`) against the sketchbook canvas (`#FBFAE1`) to produce subtle physical contrast before shadows are applied.
- Ink black (`#1E1E1E`) is never substituted with soft slate grays; hierarchy is maintained via line weight and subtle opacity steps, not muddy grays.

## Typography

Typography establishes an editorial tension between expressive, bold wooden poster type (`Epilogue`) and structural, highly legible modern grotesque proportions (`Work Sans`).

- **Display & Headlines (`Epilogue`)**: Chunky, human, and tight. Provides distinctive handmade personality reminiscent of screenprinted gig posters and linocut headers. Used at weights `700` through `900`.
- **Body & Functional Text (`Work Sans`)**: Grounded, crystal-clear, and rhythmic. Ensures catalog navigation, product descriptions, pricing in ARS, and shipping logistics remain effortless to read.
- **Label Stamp (`Epilogue 800 uppercase`)**: Dedicated to artist badges, price tags, and inventory indicators ("EN STOCK", "EDICIÓN LIMITADA").

## Layout & Spacing

Layout adheres to a responsive 12-column grid system (4 columns on mobile, 8 on tablet, 12 on desktop) bounded by a maximum content container width of `1280px`.

### Rhythmic Alignment
- Vertical and horizontal rhythm adheres strictly to an 8px sub-grid (with 4px for fine label offsets).
- Component margins (`space-md` through `space-xl`) create intentional whitespace breathing room around tactile sticker items, preventing the collage feel from degrading into visual clutter.
- Asymmetrical arrangements (e.g., sticker card tilt offsets) must respect card bounding boxes to ensure layout grids never trigger horizontal overflows or broken tap targets.

## Elevation & Depth

Visual hierarchy does not use cold, artificial blur dropshadows. Instead, elevation relies on **Hard Paper Cutout Castings** and **Layered Stock Levels**:

1. **Flat / Sketchbook Surface (`Level 0`)**:
   - Canvas background `#FBFAE1` with zero shadow. Static metadata sections, footer, and grid baseboards.
2. **Cutout Paper Card (`Level 1`)**:
   - Solid `#FFFFFF` background with a crisp border: `1.5px solid #1E1E1E`.
   - Shadow: `3px 3px 0px #1E1E1E`. Simulates cardboard stock placed directly on the desk.
3. **Lifted Sticker / Interactive Hover (`Level 2`)**:
   - Applied during hover states or active interactive elements.
   - Translation: `translate(-2px, -2px)`.
   - Shadow: `5px 5px 0px #1E1E1E`.
4. **Modal / Overlay Sheet (`Level 3`)**:
   - High-priority overlays, checkout drawers, and zoomed sticker viewports.
   - Border: `2px solid #1E1E1E`.
   - Shadow: `8px 8px 0px #1E1E1E`.
   - Backdrop: Warm semi-opaque scrim (`rgba(30, 30, 30, 0.45)`).

## Shapes

The roundedness token is set to **`1` (Soft)**, yielding a foundational radius of `0.25rem` (`4px`), `rounded-lg` at `0.5rem` (`8px`), and `rounded-xl` at `0.75rem` (`12px`).

### Stylistic Directives
- **Precision vs. Organic Tension**: Structural shells (drawers, modal sheets, grid containers, inputs) use strict soft corners (`0.25rem` to `0.5rem`) to maintain architectural stability.
- **Die-Cut Stickers**: Individual sticker thumbnails inside cards may use organic SVG clipping paths or die-cut contours, contained safely within the geometric bounds of the card.
- **Washi Tape Elements**: Rectangular tape bands (`rounded-none` or `rounded-xs`) positioned across card tops at an angle (`-2°` to `2°`) with semi-translucent opacity (`rgba(253, 198, 35, 0.65)`).

## Components

### Buttons
- **Primary Button**: Background `#EA7F20`, text `#FFFFFF` (`label-lg`), border `1.5px solid #1E1E1E`, shadow `3px 3px 0px #1E1E1E`, corner radius `4px`. Hover lifts to `translate(-2px, -2px)` with shadow `5px 5px 0px #1E1E1E`. Active state pushes down to `translate(1px, 1px)` with shadow `1px 1px 0px #1E1E1E`.
- **Secondary Button**: Background `#FDC623`, text `#1E1E1E`, border `1.5px solid #1E1E1E`, shadow `3px 3px 0px #1E1E1E`.
- **Ghost/Draft Button**: Background `#FBFAE1`, text `#1E1E1E`, border `1.5px solid #1E1E1E`, hover fills with `#FFFFFF`.

### Sticker Cards (Marketplace Grid)
- Background `#FFFFFF`, border `1.5px solid #1E1E1E`, shadow `3px 3px 0px #1E1E1E`, radius `6px`.
- Card head includes an absolute-positioned simulated washi tape strip (`width: 48px; height: 14px; background: rgba(253, 198, 35, 0.5); top: -7px; left: 50%; transform: translateX(-50%) rotate(-1deg)`).
- Sticker artwork is centered within a padded inset (`#FAF8ED`) with a subtle `-1.5deg` alternating tilt on even child elements.
- Bottom footer contains artist badge and localized price formatted in Argentine Pesos (`$ 1.800 ARS`).

### Chips & Badges
- **Artist/Category Chip**: Background `#FFFFFF`, border `1px solid #1E1E1E`, shadow `1.5px 1.5px 0px #1E1E1E`, padding `4px 10px`, typography `label-md`. Active state turns background `#71A5CA` with `#FFFFFF` text.
- **Stamp Tag**: Rotated pill badge (`transform: rotate(3deg)`), background `#EA7F20`, text `#FFFFFF`, typography `label-stamp`.

### Form Inputs
- Background `#FFFFFF`, border `1.5px solid #1E1E1E`, corner radius `4px`, padding `10px 14px`, text `#1E1E1E`, placeholder `#717171`. Focus state renders a bright `#FDC623` ring (`box-shadow: 0 0 0 3px #FDC623`).

### Checkboxes & Radio Controls
- Square box (`18x18px`) for checkboxes and circle for radios with `1.5px solid #1E1E1E` border. Checked state fills with `#EA7F20` and presents an ink-black tick icon.

### Price Tags & Cart Badges
- Modeled as hardware store / stationary stickers: notched corner badge with a simulated hole punch, `#FDC623` fill, and bold `Epilogue` typography.