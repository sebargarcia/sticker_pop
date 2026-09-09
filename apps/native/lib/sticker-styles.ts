import type { ImageSourcePropType } from "react-native";

export type StickerStyleId =
  | "pop-art"
  | "japanese-matchbox"
  | "cartoon-dino"
  | "pixel-art"
  | "royal"
  | "football-sticker"
  | "claymation"
  | "vintage-bollywood"
  | "sticker-bomb";

export interface StickerStyle {
  id: StickerStyleId;
  /** i18n key under `styles.*` (e.g. "popArt"). Translated at render time. */
  labelKey: string;
  image: ImageSourcePropType;
  rotation: number;
}

export interface StickerEmotion {
  /** English key — also sent to the Gemini API. Display via emotionLabel(). */
  key: string;
}

// Local assets copied from docs/assets (1:1 with the web example).
export const STICKER_STYLES: StickerStyle[] = [
  {
    id: "pop-art",
    labelKey: "popArt",
    image: require("@/assets/stickers/pop_art_love_out.png"),
    rotation: -4,
  },
  {
    id: "japanese-matchbox",
    labelKey: "matchbox",
    image: require("@/assets/stickers/matchbox.png"),
    rotation: 3,
  },
  {
    id: "cartoon-dino",
    labelKey: "dino",
    image: require("@/assets/stickers/dragon.png"),
    rotation: -3,
  },
  {
    id: "pixel-art",
    labelKey: "pixel",
    image: require("@/assets/stickers/pixel.png"),
    rotation: 4,
  },
  {
    id: "royal",
    labelKey: "royal",
    image: require("@/assets/stickers/royal.png"),
    rotation: -2,
  },
  {
    id: "football-sticker",
    labelKey: "football",
    image: require("@/assets/stickers/football.png"),
    rotation: 5,
  },
  {
    id: "claymation",
    labelKey: "claymation",
    image: require("@/assets/stickers/claymation.png"),
    rotation: -5,
  },
  {
    id: "vintage-bollywood",
    labelKey: "bollywood",
    image: require("@/assets/stickers/bolly.png"),
    rotation: 2,
  },
  {
    id: "sticker-bomb",
    labelKey: "bomb",
    image: require("@/assets/stickers/bomb.png"),
    rotation: -3,
  },
];

export const STICKER_EMOTIONS: StickerEmotion[] = [
  { key: "Happy" },
  { key: "Sad" },
  { key: "Angry" },
  { key: "Surprised" },
  { key: "Laughing" },
  { key: "Love" },
  { key: "Winking" },
  { key: "Confused" },
];

export const STICKERPOP_LOGO = require("@/assets/stickers/sticker_pop_logo.png");
