/**
 * StickerPop brand palette — hex source of truth.
 *
 * PREFER Uniwind `className` tokens (defined via @theme in global.css)
 * over these constants for component styling:
 *   yellow -> `bg-pop-yellow`, navy -> `text-pop-navy` / `border-pop-navy`, etc.
 *
 * Use the hex constants below ONLY where a style object is required and
 * className is unavailable: React Navigation `tabBarStyle`, ViewShot wrapper,
 * icon `color` props, ActivityIndicator, canvas drawing, etc.
 */
export const StickerPopColors = {
	yellow: "#FFD600",
	navy: "#0B1533",
	cyan: "#00B8E6",
	green: "#34C759",
	pink: "#FF4D8D",
	orange: "#FF9F1C",
	background: "#F5F7FA",
	white: "#FFFFFF",
	lightGray: "#E8ECF1",
	muted: "#6B7280",
} as const;

export const StickerPopCopy = {
	tagline: "Turn your ideas into funny stickers.",
	subtagline: "Create, customize and share stickers in seconds.",
	emptyLibrary: "No stickers yet!",
	emptyLibrarySub: "Let's make your first one.",
} as const;
