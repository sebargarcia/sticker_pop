# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Primary: kids/teens & families, plus casual messaging users. Situation: casual, playful creation on mobile for sharing humor with friends/family. Job: turn a personal photo or idea into a funny sticker and share it on WhatsApp / messaging apps in seconds, with almost no explanation.

## Product Purpose

StickerPop turns photos and ideas into funny, expressive stickers. It exists to deliver instant gratification and social sharing: create, customize and share stickers in seconds. Success means a first-time user can open the app, tap Crear Sticker, pick a photo, generate emotion variants, and save/share to WhatsApp in only a few intuitive steps.

## Positioning

One tap turns a photo into 8 emotion variants via Gemini `gemini-2.5-flash-image` (8 parallel calls, one per emotion, with retries), auto-saved locally and WhatsApp-ready. A neighboring sticker maker without direct photo-to-multi-emotion AI generation plus instant die-cut + WhatsApp pack export could not truthfully copy this.

## Operating Context

Workflows: Home (Inicio: hero "Convierte tus ideas en stickers divertidos." + Crear Sticker CTA + Popular examples) → Create (Crear: add selfie/photo via gallery or camera → choose style + choose reactions → Crear Stickers → grid → sheet) → My Stickers (Mis Stickers: grid library, tap preview, share/save/delete). Export: single sticker or full sheet via system share, direct to WhatsApp, save to Photos, WhatsApp `.wasticker` pack export.

Environments: mobile portrait, camera + photo library, local files + share sheet + WhatsApp. Spanish-only UI (forced to Spanish at launch). Expo dev client (`com.anonymous.sticker_pop`), not Expo Go. Metro dev server required. v1 never calls the Hono server.

## Capabilities and Constraints

Confirmed functionality: 3 tabs (Inicio / Crear / Mis Stickers); 9 styles (Pop Art, Retro, Dino, Pixel Art, Realeza, Fútbol, Plastilina, Bollywood, Bomba) + 8 emotions (Feliz, Triste, Enojado, Sorprendido, Riendo, Amor, Guiño, Confundido); photo input via `expo-image-picker`; generation via Gemini REST direct from app; PNGs in `FileSystem.documentDirectory/stickers/` + AsyncStorage index, shared between Create and My Stickers via focus reload; sharing via `expo-sharing` system sheet + `react-native-share` direct to WhatsApp with fallback; WhatsApp export WebP 512x512 ≤100 KB, 96x96 PNG tray ≤50 KB, packs 3–30 stickers into `.wasticker` STORE zip; sheet capture via `react-native-view-shot` (view must be mounted/visible).

Technical constraints: `EXPO_PUBLIC_GEMINI_API_KEY` required for generation, missing key is an inline error in Create never a boot crash; client-bundled key is extractable — move behind Hono server before public release; native modules require dev-client rebuild after install; portrait orientation; env validation must never throw for missing optional vars.

Terminology: emotion keys (`Happy`, `Sad`, …) and style ids stay English for Gemini prompts and filenames; display only via `emotionLabel()` / `t('styles.' + labelKey)`. Technical exception text stays untranslated; all user-facing copy lives in locale files.

Explicitly undecided: Profile tab from the design brief is not built; Better-Auth client exists but is unused by v1; server-backed generation / accounts / favorites counts are future work, not v1 truth.

## Brand Commitments

Name StickerPop. Tagline "Small moments. Big laughs." / "Momentos pequeños. Risas grandes." Secondary: "Create. Share. Stick." / "Crea. Comparte. Pega." Voice: short, playful, friendly Spanish (e.g. "Hagamos algo divertido.", "¡Buenísimo!", "Esto merece un sticker.").

Identity constraints: yellow `#FFD600`, navy `#0B1533`, cyan `#00B8E6`, green `#34C759`, pink `#FF4D8D`, orange `#FF9F1C`, light bg `#F5F7FA`, white `#FFFFFF`, sheet `#FFF8DC`; Poppins (headings extrabold/black, buttons semibold, labels medium/semibold, body regular; `font-poppins-*` tokens, never `font-bold` with custom family); yellow winking sticker mascot with thick navy outline, white sticker border, colorful bursts — do not redesign unless necessary; every sticker: thick white die-cut border + navy outline + soft shadow. Styling via Uniwind `className` only plus `@theme` tokens (`bg-pop-yellow`, `text-pop-navy`, etc.); `lib/theme.ts` hex only for style-object-only APIs. Assets in `apps/native/assets/stickers/` loaded via `require()`, never remote URLs.

## Evidence on Hand

Real: working Home / Create / My Stickers flows; Spanish copy in `apps/native/lib/locales/es.json` (`en.json` kept unreachable for a future toggle); style thumbs + logo in `apps/native/assets/stickers/`; brand + UX source in `docs/StickerPop — Mobile App Design & Development Prompt.md`; generation prompts ported 1:1 from `docs/gemstickers_app.tsx` in `apps/native/lib/gemini.ts`.

Absences future work must not fabricate: no real testimonials, customers, press, benchmarks, pricing, or usage stats.

## Product Principles

1. Seconds to laughter: every flow must shorten photo-to-shared-sticker, never add editor friction.
2. Zero-explanation playful: a first-timer succeeds without instructions; humor leads, chrome recedes.
3. Share-ready by default: outputs leave the app sized, bordered, and packaged for messaging.
4. Honest playfulness: short Spanish copy, real states for missing key / permissions / failures, never fake proof or promises.

## Accessibility & Inclusion

High contrast navy text on light backgrounds; large touch targets; rounded readable Poppins; clear labels; support dynamic text sizing where possible; never rely on color alone to communicate state. Camera / photo-library / save permissions requested with explanatory copy.
