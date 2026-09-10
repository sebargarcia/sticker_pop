# AGENTS.md — StickerPop Native (`apps/native`)

Expo + React Native + expo-router app for creating AI stickers from photos.
Monorepo workspace (`bun`, `turbo`); this guide is scoped to `apps/native`.

## Commands (run from `apps/native` unless noted)

- `bun run dev` — start Expo dev server (from repo root: `bun run dev:native`)
- `bun run ios` / `bun run android` — run on simulator / emulator
- `bun run check-types` — `tsc --noEmit` (run after every change)
- `bunx expo prebuild` — regenerate native projects (needed after changing `app.json` plugins/permissions)

## Running on Android emulator

- The project uses a dev client (`com.anonymous.sticker_pop`), NOT Expo Go. If deep
  links open Expo Go instead (red screens about missing native modules), force-stop it
  and launch our client explicitly:
  `adb shell am start -n com.anonymous.sticker_pop/.MainActivity`, then Connect the
  launcher to `http://10.0.2.2:8081` (Metro must be running: it starts with
  `bun run android`, or standalone via `bun run dev`).
- If the UI looks stale (old strings/layout), the app is showing a cached bundle:
  reload from Metro (dev menu or relaunch while Metro runs). Tab option changes need a
  full reload, not just Fast Refresh.
- After adding/upgrading native modules, if the app throws
  "Cannot find native module 'X'" on a fresh-looking build: `rm -rf android/app/build
  android/build android/app/.cxx` then rebuild (`bun run android`, or
  `cd android && ./gradlew assembleDebug` + `adb install -r`). Verify the installed
  binary matches the build: compare `md5` of `app-debug.apk` with
  `adb shell pm path` + `md5sum` on device.

## Env

- Copy `.env.example` to `.env` (gitignored, never commit it).
- `EXPO_PUBLIC_SERVER_URL` is optional: defaults to `http://10.0.2.2:3000` on Android
  emulator, `http://localhost:3000` elsewhere (see `packages/env/src/native.ts`). Only set
  it for physical devices (machine LAN IP) or a deployed backend. v1 never calls it.
- `EXPO_PUBLIC_GEMINI_API_KEY` is required for generation (https://aistudio.google.com).
  Missing key surfaces as an inline error in Create, never a boot crash — keep it that way:
  env validation must never throw for a missing optional var, or every route fails to load.

## Structure

- `app/` — expo-router routes. Root `Stack` → `(drawer)` → `(tabs)`: `index` (Home), `create` (Create), `my-stickers` (My Stickers). `modal.tsx`, `+not-found.tsx` are scaffold leftovers.
- `components/` — `sticker-pop-button.tsx`, `style-carousel.tsx`, `sticker-grid.tsx`, `sticker-sheet.tsx` (StickerPop UI). `container.tsx`, `sign-in/up.tsx`, `theme-toggle.tsx` are scaffold/auth leftovers.
- `lib/` — `gemini.ts` (generation API), `sticker-styles.ts` (9 styles + 8 emotions, local assets), `stickers-store.ts` (AsyncStorage index + FileSystem files), `image-utils.ts` (base64 helpers), `theme.ts` (hex constants — see Styling), `auth-client.ts` (Better-Auth, unused by v1).
- `assets/stickers/` — copied from `docs/assets` (`sticker_pop_logo.png` + 9 style thumbs). Loaded via `require()`, never remote URLs.
- `contexts/app-theme-context.tsx` — light/dark toggle backed by Uniwind.

## Styling — Uniwind (mandatory)

Uniwind is the ONLY styling system. Verified working: `uniwind` in `package.json`,
`withUniwindConfig` in `metro.config.js` (with `./global.css` entry), `@import "uniwind"`
in `global.css`, `useUniwind`/`Uniwind.setTheme` in the theme context.

Rules for all new/edited UI code:

1. **Use `className`, never `StyleSheet.create`.** Scaffold components (`container`, `sign-in`, modal, drawer) already do this — follow them.
2. **Brand colors = theme tokens** defined via `@theme` in `global.css`:
   `bg-pop-yellow`, `text-pop-navy`, `border-pop-navy`, `bg-pop-bg`, `bg-pop-sheet`,
   plus `pop-cyan`, `pop-green`, `pop-pink`, `pop-orange`. To add a color, extend the
   `@theme` block — do not hardcode hex in `className` (arbitrary `bg-[#...]` only for
   one-off system shades like `#F1F2F4`).
3. **`lib/theme.ts` hex constants are for style-object-only APIs**: React Navigation
   `tabBarStyle`, `ViewShot` wrapper, icon `color` props, `ActivityIndicator`. Never use
   them for layout/component styling where `className` works.
4. **Accepted `style`-prop exceptions** (documented inline where used): `tabBarStyle` /
   `tabBarLabelStyle`, `ScrollView contentContainerStyle` (safe-area insets), `FlatList`
   content padding, third-party components without `className` (`ViewShot` — wrap: outer
   keeps `style`, everything inside uses `className`; use `withUniwind` from `uniwind`
   for icon components as in `theme-toggle.tsx`), and truly dynamic values (per-item
   rotation in `style-carousel.tsx`).
5. Pressed states: `active:` variant (`active:opacity-80`, `active:scale-[0.97]`).
   Overlays: `bg-pop-navy/70`. Conditional classes: `cn()` from `heroui-native`.
6. Fonts: Poppins is loaded in `app/_layout.tsx` via `useFonts` (all 6 weights,
   splash held until ready). Weight is baked into the family — use `font-poppins-regular`
   / `medium` / `semibold` / `bold` / `extrabold` / `black` (tokens in `global.css` `@theme`)
   INSTEAD of `font-bold` etc., which break custom fonts on Android when combined with
   `fontFamily`. Mapping per design doc: headings extrabold/black, buttons semibold,
   labels medium/semibold, body regular. `tabBarLabelStyle` takes `fontFamily:
   "Poppins_700Bold"` directly. Scaffold leftovers (sign-in, modal) still use system
   weights — migrate them to `font-poppins-*` when touched.

## i18n (Spanish default, English available)

- `lib/i18n.ts` + `lib/locales/es.json` / `en.json`, powered by `i18next` +
  `react-i18next` + `expo-localization`. Language resolves at launch: English only when
  the device locale is English, **Spanish otherwise** (default + fallback `es`).
- In components/screens: `const { t } = useTranslation()` and `t("create.title")`.
  Outside React (`lib/share.ts`, `lib/gemini.ts`): `import i18n from "./i18n"` then
  `i18n.t(...)` — init is synchronous on import, always safe to call.
- Emotion keys (`Happy`, `Sad`, ...) stay English — they feed the Gemini prompts and
  filenames. Display them only via `emotionLabel(key)` from `lib/i18n.ts`. Same rule for
  style ids: `STICKER_STYLES` carries `labelKey`, translated as `t('styles.' + labelKey)`.
- Technical error text (exception messages) stays untranslated; all user-facing copy
  lives in the locale files under `tabs.*`, `home.*`, `create.*`, `grid.*`, `sheet.*`,
  `myStickers.*`, `share.*`, `styles.*`, `emotions.*`, `gemini.*`.
- `setAppLanguage` / `loadSavedLanguage` persist a manual choice (loaded in
  `app/_layout.tsx`) — ready for a future settings toggle; there is no toggle UI yet.

## Generation API (Gemini)

- Model `gemini-2.5-flash-image-preview` via REST `generateContent?key=`, direct from the
  app (user decision for v1). Prompts in `lib/gemini.ts` are ported 1:1 from
  `docs/gemstickers_app.tsx` — do not reword without comparing to the web original.
- 1 tap = 8 parallel calls (one per emotion), 3 attempts with exponential backoff.
- Key: `EXPO_PUBLIC_GEMINI_API_KEY` in `apps/native/.env`, schema in
  `packages/env/src/native.ts`. Never commit the key. Before public release, move calls
  behind the Hono server (`apps/server`) — a client-bundled key is extractable.

## Storage & native APIs

- My Stickers: PNGs in `FileSystem.documentDirectory/stickers/` (`expo-file-system/legacy`
  API), index in AsyncStorage (`stickers-store.ts`). Generation auto-saves; Create and My
  Stickers share the store — keep them in sync via `useFocusEffect` reload.
- Photo input: `expo-image-picker` for gallery + camera. Save: `expo-media-library`.
  Sharing: `lib/share.ts` — `shareImageToWhatsApp` sends straight to WhatsApp via
  `react-native-share` (native module: requires a dev build, NOT Expo Go), falling back
  to the system sheet (`expo-sharing`, WhatsApp appears there too) when WhatsApp is
  missing. `shareImageFile` is the generic sheet. After adding any native module,
  rebuild the dev client (`bun run android` / `bun run ios`).
- WhatsApp sticker export: `lib/whatsapp.ts` — converts PNGs to spec-compliant
  stickers (512x512 WebP ≤ 100 KB via `expo-image-manipulator`, adaptive quality
  steps; 96x96 PNG tray ≤ 50 KB; packs cap at 30 stickers) into
  `FileSystem.documentDirectory/whatsapp/pack/` with a WhatsApp `contents.json`
  manifest, then zips it into `whatsapp/StickerPop.wasticker` (`lib/zip.ts`, a
  STORE-method ZIP writer). Single stickers share via `shareWebpFile`
  (`image/webp` system sheet); packs share the `.wasticker` archive via
  `shareFile` for WhatsApp / a sticker app. `expo-image-manipulator` is a
  native module — rebuild the dev client after install.
- Sheet export: `react-native-view-shot` `capture()` (view must be mounted/visible). Permissions live in `app.json` plugin configs.

## Conventions

- TypeScript strict, `tsc --noEmit` clean before finishing. Path alias `@/*` → `./*`.
- Brand voice: short, playful copy (`lib/theme.ts` → `StickerPopCopy`).
- Sticker look: thick white die-cut border + navy outline + soft shadow (`shadow` utility).
- Do not reintroduce `two.tsx`-style placeholder tabs; routes are Home / Create / My Stickers.
