---
name: StickerPop
description: Turn photos into funny die-cut stickers in seconds.
colors:
  pop-yellow: "#FFD600"
  sticker-navy: "#0B1533"
  burst-cyan: "#00B8E6"
  leaf-green: "#34C759"
  bubblegum-pink: "#FF4D8D"
  tang-orange: "#FF9F1C"
  paper-bg: "#F5F7FA"
  sheet-cream: "#FFF8DC"
  white: "#FFFFFF"
  ink-muted: "#6B7280"
  line-soft: "#E2E6EB"
  disabled-bg: "#F1F2F4"
  disabled-border: "#C9CDD3"
  disabled-text: "#9AA0A8"
  tab-inactive: "#8A8F98"
  whatsapp: "#25D366"
  error: "#D92D20"
  error-bg: "#FFF1F0"
  error-border: "#F3B7B3"
typography:
  display:
    fontFamily: "Poppins Black, Poppins, sans-serif"
    fontSize: "28px"
    fontWeight: 900
    lineHeight: 1.15
  headline:
    fontFamily: "Poppins ExtraBold, Poppins, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.23
  title:
    fontFamily: "Poppins Bold, Poppins, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Poppins Regular, Poppins, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Poppins SemiBold, Poppins, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.01em"
rounded:
  pill: "9999px"
  hero: "28px"
  tile: "24px"
  card: "20px"
  cell: "18px"
  field: "16px"
  mini: "14px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.pop-yellow}"
    textColor: "{colors.sticker-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.sticker-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  button-dark:
    backgroundColor: "{colors.sticker-navy}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  button-disabled:
    backgroundColor: "{colors.disabled-bg}"
    textColor: "{colors.disabled-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
---

# Design System: StickerPop

## Overview

**Creative North Star: "Pop! Instant Joy"**

StickerPop is a die-cut playground, not a photo editor. Every screen behaves like a sticker sheet: chunky outlines, soft lift, confetti accents, and one yellow button that begs to be tapped. The interface recedes so the user's face — turned into eight laughing emotions — is always the hero.

The philosophy is playful and instant: thick navy contours carry structure, white die-cut borders carry charm, and motion never lingers longer than a pop. Nothing here whispers corporate, whispers luxury, or hides behind glass; it is a premium children's-consumer craft with generous spacing, confident headings, and zero chrome between idea and laugh.

**Key Characteristics:**
- Sticker logic everywhere: white borders, navy outlines, soft lift
- One yellow hero action per screen; everything else is white or navy
- Chunky Poppins at every role; weight is baked into the family
- Flat surfaces at rest; shadows only confirm touch and lift stickers

## Colors

Candy on paper: a joyful yellow hero and deep navy ink on an airy light ground, with four candy accents reserved for bursts, effects, and delight.

### Primary
- **Pop Yellow** (#FFD600): primary CTA background, active states, Create FAB when focused, app icon and splash ground. Always paired with navy text or navy outline.
- **Sticker Navy** (#0B1533): main text, outlines, icons, navigation, tab active tint, overlays at 70% over modals. The structural color; borders are almost always this.

### Secondary
- **Paper BG** (#F5F7FA): app background and secondary surfaces across Home, Create, and My Stickers.
- **White** (#FFFFFF): cards, sticker interiors, tab bar, button-secondary ground, main content surfaces.
- **Sheet Cream** (#FFF8DC): printable sticker-sheet ground only. Never a general surface.

### Tertiary
- **Burst Cyan** (#00B8E6): decorative bursts, sticker effects, secondary illustration accents.
- **Leaf Green** (#34C759): success states, decorative elements, WhatsApp-adjacent delight (the WhatsApp button itself stays official green below).
- **Bubblegum Pink** (#FF4D8D): emotional and fun UI states, decorative hearts and bursts.
- **Tang Orange** (#FF9F1C): highlights and decorative warmth.

### Neutral
- **Ink Muted** (#6B7280): subtitles, hints, counts, and helper copy (Tailwind gray-500 in code).
- **Line Soft** (#E2E6EB): hairline dividers, unselected chip and tile borders, action-pill separators.
- **Disabled Cloud** (#F1F2F4): disabled button ground; paired with Disabled Border and Disabled Text only.
- **Disabled Border** (#C9CDD3): disabled button outline and dashed empty-state borders.
- **Disabled Text** (#9AA0A8): disabled button labels and empty-state iconography.
- **Tab Ghost** (#8A8F98): inactive tab icons only.
- **WhatsApp Green** (#25D366): WhatsApp share actions only. Never a general accent.
- **Error Red** (#D92D20): failures, retry buttons, error text and icons. Ground is Error Wash with Error Blush borders.
- **Error Wash** (#FFF1F0): error banner and failed-cell ground.
- **Error Blush** (#F3B7B3): error banner and failed-cell border.

### Named Rules
**The One Yellow Rule.** One yellow primary action per screen. Its rarity is the point; everything else stays white or navy.
**The Navy Carries Structure Rule.** If it draws a boundary — card, button, tab bar, tile — the boundary is navy. Gray borders mean unselected or disabled, never a third voice.

## Typography

**Display Font:** Poppins Black / ExtraBold (with system sans fallback)
**Body Font:** Poppins Regular / Medium (with system sans fallback)
**Label/Mono Font:** Poppins SemiBold / Bold; no separate mono face in v1

**Character:** Rounded, friendly, and loud at the top, calm underneath. Headings shout with joy; body and hints stay quiet so the stickers stay loud. Weight is baked into the family — never combine a custom Poppins family with a system weight.

### Hierarchy
- **Display** (Black 900, 28px, 1.15): screen titles — Crea un Sticker, Mis Stickers — and the STICKERPOP sheet masthead (with wide tracking). One per screen, always centered, always navy.
- **Headline** (ExtraBold 800, 20–26px, 1.23): hero tagline at 26px/32px on Home, section headings (Elige un estilo, Elige las reacciones) and empty-state titles at 20px.
- **Title** (Bold 700, 17–18px, 1.3): preview emotion names at 18px, button labels at 17px Semibold, card titles at 16–20px ExtraBold.
- **Body** (Regular 400 / Medium 500, 13–15px, 1.45): subtitles at 15px Medium muted, hints and helper copy at 13px Regular muted, sheet how-to at 12px.
- **Label** (SemiBold 600 / Bold 700, 11–14px, 0.01em tracking): chips at 14px, tab labels at 12px Bold, sticker captions at 11–12px Bold, toggles (Todas / Ninguna) at 13px Semibold underlined.

### Named Rules
**The Baked-Weight Rule.** Use `font-poppins-regular/medium/semibold/bold/extrabold/black` tokens; never `font-bold` with a custom family — it breaks on Android.
**The Navy-First Type Rule.** Headings and buttons are navy or white-on-navy. Muted gray is for subtitles and hints only, never for primary actions.

## Layout

Portrait phone, single-column sheet over an airy ground. Screens breathe inside safe-area insets (`insets.top + 16`, `paddingBottom 40`); content never hides behind the notch, home indicator, or — on Android edge-to-edge — the system navigation bar (the tab bar extends by the live inset).

The spatial model is card-on-paper: a hero card (`px-5` screen, `p-6`/`p-8` card) on Home and empty states; a scrolling column (`p-5`/`20px` gutters) on Create and My Stickers. Grids are tight and tactile: results at 2 columns (`-mx-1.5`, `w-1/2 p-1.5`), library at 3 columns (`w-1/3 p-1.5`), sheet at 4 columns (`w-1/4`). The style carousel is a horizontal FlatList with `16px` horizontal and `8px` vertical padding; tiles are fixed at `120px` columns with `104px` art.

Rhythm is `6 / 8 / 16 / 20 / 24px`: `6px` grid gutters, `8px` chip gaps, `16px` section gaps, `20px` screen gutters and modals, `24px` card padding. Density is generous — large touch targets (`min-h 54px` buttons, `54px` round icon buttons, `56px` Create FAB) clear both the 44pt iOS and 48dp Android floors with breathing room.

## Elevation & Depth

Flat with pop-lift. Surfaces sit flat at rest on Paper BG; depth arrives only as a soft ambient lift under stickers, buttons, cards, and sheets. Borders — not shadows — carry structure: `2px` navy around cards and buttons, `3px` white around sticker art, `3px` navy or soft gray around tiles.

### Shadow Vocabulary
- **Sticker lift** (Tailwind `shadow` utility): under sticker cells, hero cards, empty states, FAB, and action pills. When to use it: anything that should feel peelable.
- **Tile whisper** (Tailwind `shadow-sm` utility): under style-carousel tiles only. When to use it: selectable art that has not been chosen yet.
- **Scrim** (`bg-pop-navy/70`): full-screen modal and sheet dim. No blur, no hand-rolled glass.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Lift appears only on stickers, raised actions, and open modals — never as page decoration.

## Shapes

Pills, rounded cards, and die-cut stickers. Buttons, chips, and FABs are fully round (`9999px`); the Create FAB is a `56px` circle with a `3px` outline that flips yellow-on-navy when focused. Cards speak in four radii: hero `28px`, standard card and sheet `20px`, sticker cells `18px`, fields and photo pickers `16px` (`rounded-2xl`), banners and footers `14px` (`mini`). Style tiles use the large `24px` (`rounded-3xl`) tile radius with a `3px` border; selected tiles tilt per-item (`rotation` degrees, the one sanctioned inline style) and warm to `#FFF6CC`.

Every sticker keeps the physical die-cut silhouette: colorful art, thick white outer border (`2–3px`), optional navy outline, small soft shadow. Photo previews tilt `-6deg` for playfulness; generated art stays straight so the grid reads clean.

## Components

Tactile and confident: pill buttons with hard navy outlines that squash to `0.97` on press. No hover exists on this platform — `active:` states are the entire interaction language.

### Buttons
- **Shape:** pill (`9999px`), `2px` navy border, `min-h 54px`, `14px 28px` padding, icon `20px` with `8px` gap.
- **Primary:** yellow ground, navy Afghan-label text. The one hero action per screen.
- **Hover / Focus:** no hover on native. Press is `active:scale-[0.97]` + `active:opacity-90`; loading keeps the variant ground with a spinner (navy on light, white on dark).
- **Secondary / Dark / WhatsApp:** white ground navy text; navy ground white text (export packs, export singles); official WhatsApp green ground white text (share paths only). Disabled (any variant) goes cloud ground, gray border, gray text.
- **Icon button:** `54px` circle, white ground, `2px` navy border (delete in preview).

### Chips
- **Style:** emotion filter chips are pills with `2px` borders, `14px 10px`-ish padding (`px-3.5 py-2`), icon + label.
- **State:** selected is navy ground, white Bold label, white checkmark; unselected is white ground, navy Semibold label, gray outline icon. Text toggles (Todas / Ninguna) are underlined navy `13px` with `40%` opacity when disabled.

### Cards / Containers
- **Corner Style:** hero and empty states `28px`; content cards and sheets `20px`; modals `24–28px` (`rounded-3xl`, sheetmodal `rounded-t-[28px]`).
- **Background:** white on Paper BG; sheet ground is Sheet Cream.
- **Shadow Strategy:** sticker lift; see Elevation & Depth.
- **Border:** `2px` navy for hero and empty states; `2px` soft gray or dashed gray for placeholders; `1px` blush for errors.
- **Internal Padding:** `24–32px` hero, `20px` modals and empty results, `16px` sheets, `12px` banners.

### Navigation
- Bottom tab bar, 3 destinations (Inicio / Crear / Mis Stickers), labels hidden, icons navy with ghost inactive. Bar is white with a `2px` navy top border, `84px` + live bottom inset tall, `8px` top / `20px` + inset bottom padding, `Poppins_700Bold 12px` labels. The center Create action is a raised `56px` FAB (`-mb-3`, `3px` outline, lift shadow): navy ground yellow border when idle, yellow ground navy border when focused, `26px` sparkle icon. No drawer, no custom global nav; system Back and edge-swipe Back always work.

### Style Tile (signature)
`104px` art in a `120px` column, `24px` radius, `3px` border, white ground, whisper shadow, per-item tilt. Unselected border is soft gray with gray Semibold caption; selected border is navy with warm `#FFF6CC` ground and navy ExtraBold caption.

### Sticker Cell (signature)
Art sits in a white cell with a `3px` white border and lift shadow (`18–20px` radius); caption below is navy Bold `11–12px`. Three states share one footprint: loading (dashed gray border, `#F1F2F4` ground, navy spinner + Generando), ready (die-cut white + floating save/regenerate pill: white, hairline border, lift, `18px` navy icons), failed (dashed blush border, Error Wash ground, red icon + Falló + retry pill in Error Red).

### Sticker Sheet (signature)
Cream sheet (`20px` radius, `2px` navy border, `16px` padding): Black `28px` STICKERPOP masthead with wide tracking, Semibold muted tagline, 4-column art with `14px` white-bordered thumbs and `11px` Bold captions, white footer (`14px` radius) with ExtraBold title and Regular muted strapline. Captured via ViewShot — the wrapper keeps a plain style object; everything inside uses className.

## Do's and Don'ts

Concrete guardrails grounded in the shipped implementation. Product strategy stays in PRODUCT.md; these are visual only.

### Do:
- **Do** style with Uniwind `className` and `@theme` tokens (`bg-pop-yellow`, `text-pop-navy`, `border-pop-navy`); extend `@theme` to add a color.
- **Do** keep every sticker die-cut: white border, navy outline where framed, soft lift shadow.
- **Do** keep one yellow primary action per screen and full-width hero CTAs (`w-full`, `mt-[18px]` rhythm).
- **Do** use `font-poppins-*` weight tokens and `Poppins_700Bold` directly for `tabBarLabelStyle`.
- **Do** lay out inside safe-area insets and extend the tab bar by the live bottom inset on Android edge-to-edge.
- **Do** keep press feedback on every tappable (`active:scale-[0.97]` / `active:opacity-80/90`).
- **Do** honor Reduce Motion / Remove animations with the existing fade modals and instant cuts.

### Don't:
- **Don't** use `StyleSheet.create` for layout or component styling — reserve style objects for `tabBarStyle`, ViewShot wrappers, icon colors, spinners, and truly dynamic values (documented inline where used).
- **Don't** hardcode hex in `className` (one-off system shades like `#F1F2F4` are the only exception); never invent a new brand hex.
- **Don't** combine a custom Poppins family with `font-bold` — it breaks on Android.
- **Don't** ship hover-only affordances, web-shaped buttons, custom global nav, or reinvented switches/dialogs — use platform sheets, alerts, and action patterns.
- **Don't** use dark-heavy screens, thin typography, complex gradients, or glassmorphism; the world is light, chunky, and flat-with-pop-lift.
- **Don't** redesign the yellow winking mascot or promote sheet-cream, WhatsApp green, or error red into general surfaces.
- **Don't** fabricate testimonials, counts, press, or proof — empty states stay honest (`¡Aún no hay stickers!` + Crear Sticker).
