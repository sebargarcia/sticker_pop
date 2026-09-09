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
	label: string;
	image: ImageSourcePropType;
	rotation: number;
}

export interface StickerEmotion {
	key: string;
	label: string;
}

// Local assets copied from docs/assets (1:1 with the web example).
export const STICKER_STYLES: StickerStyle[] = [
	{
		id: "pop-art",
		label: "Pop Art",
		image: require("@/assets/stickers/pop_art_love_out.png"),
		rotation: -4,
	},
	{
		id: "japanese-matchbox",
		label: "Retro Matchbox",
		image: require("@/assets/stickers/matchbox.png"),
		rotation: 3,
	},
	{
		id: "cartoon-dino",
		label: "Cartoon Dino",
		image: require("@/assets/stickers/dragon.png"),
		rotation: -3,
	},
	{
		id: "pixel-art",
		label: "Pixel Art",
		image: require("@/assets/stickers/pixel.png"),
		rotation: 4,
	},
	{
		id: "royal",
		label: "Royal",
		image: require("@/assets/stickers/royal.png"),
		rotation: -2,
	},
	{
		id: "football-sticker",
		label: "Football",
		image: require("@/assets/stickers/football.png"),
		rotation: 5,
	},
	{
		id: "claymation",
		label: "Claymation",
		image: require("@/assets/stickers/claymation.png"),
		rotation: -5,
	},
	{
		id: "vintage-bollywood",
		label: "Bollywood",
		image: require("@/assets/stickers/bolly.png"),
		rotation: 2,
	},
	{
		id: "sticker-bomb",
		label: "Sticker Bomb",
		image: require("@/assets/stickers/bomb.png"),
		rotation: -3,
	},
];

export const STICKER_EMOTIONS: StickerEmotion[] = [
	{ key: "Happy", label: "Happy" },
	{ key: "Sad", label: "Sad" },
	{ key: "Angry", label: "Angry" },
	{ key: "Surprised", label: "Surprised" },
	{ key: "Laughing", label: "Laughing" },
	{ key: "Love", label: "Love" },
	{ key: "Winking", label: "Winking" },
	{ key: "Confused", label: "Confused" },
];

export const STICKERPOP_LOGO = require("@/assets/stickers/sticker_pop_logo.png");
