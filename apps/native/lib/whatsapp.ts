import * as FileSystem from "expo-file-system/legacy";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as Sharing from "expo-sharing";

/**
 * WhatsApp sticker export.
 *
 * Spec (WhatsApp third-party sticker requirements):
 * - stickers: exactly 512x512 px, WebP, <= 100 KB each (static)
 * - tray icon: 96x96 px, static, <= 50 KB
 * - pack: 3-30 stickers, all static (we only produce static)
 *
 * This module converts the app's PNG stickers (Gemini output or saved files)
 * into spec-compliant WebP files and groups them into an exportable pack
 * folder with a WhatsApp-compatible manifest (`pack.json`, same shape as
 * `contents.json` / `sticker_packs.wasticker` for a future native
 * "Add to WhatsApp" provider). Sharing stays image-based (`lib/share.ts`
 * is untouched) — this is the separate "valid WhatsApp sticker" path.
 */

export const WHATSAPP_STICKER_SIZE = 512;
export const WHATSAPP_TRAY_SIZE = 96;
export const WHATSAPP_MAX_STICKER_BYTES = 100 * 1024;
export const WHATSAPP_MAX_TRAY_BYTES = 50 * 1024;
export const WHATSAPP_MIN_PACK_SIZE = 3;
export const WHATSAPP_MAX_PACK_SIZE = 30;

const COMPRESS_STEPS = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];

export interface WhatsAppStickerSource {
	/** Local file uri (`file://…`) or `data:image/…;base64,…` url. */
	sourceUri: string;
	emotion: string;
}

export interface WhatsAppStickerFile {
	emotion: string;
	emoji: string[];
	/** Final pack file, e.g. `…/whatsapp/<packId>/sticker-00-happy.webp`. */
	fileUri: string;
	size: number;
	width: number;
	height: number;
	withinLimit: boolean;
}

export interface WhatsAppPack {
	id: string;
	name: string;
	dirUri: string;
	stickers: WhatsAppStickerFile[];
	trayUri: string;
	traySize: number;
	manifestUri: string;
	valid: boolean;
	validationMessage: string | null;
}

/** Emoji tags per emotion (WhatsApp search/discovery, max 3 per sticker). */
export function emotionToEmoji(emotion: string): string[] {
	switch (emotion.toLowerCase()) {
		case "happy":
			return ["😄"];
		case "sad":
			return ["😢"];
		case "angry":
			return ["😠"];
		case "surprised":
			return ["😲"];
		case "laughing":
			return ["😂"];
		case "love":
			return ["😍"];
		case "winking":
			return ["😉"];
		case "confused":
			return ["😕"];
		default:
			return ["✨"];
	}
}

function slugify(emotion: string): string {
	return emotion.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function fileSize(uri: string): Promise<number> {
	const info = await FileSystem.getInfoAsync(uri);
	if (!info.exists) throw new Error(`Missing output file: ${uri}`);
	return (info as { size?: number }).size ?? 0;
}

async function ensureDir(dirUri: string): Promise<void> {
	const info = await FileSystem.getInfoAsync(dirUri);
	if (!info.exists) {
		await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
	}
}

/**
 * Renders `sourceUri` at `targetSize`x`targetSize` and saves it in
 * `format`, lowering quality until it fits `maxBytes` (or steps run out).
 * Returns the temp render uri + metadata. Caller moves it into place.
 */
async function renderFitting(
	sourceUri: string,
	targetSize: number,
	format: SaveFormat,
	maxBytes: number,
): Promise<{ uri: string; size: number; width: number; height: number }> {
	let last: {
		uri: string;
		size: number;
		width: number;
		height: number;
	} | null = null;
	for (const compress of COMPRESS_STEPS) {
		const context = ImageManipulator.manipulate(sourceUri);
		context.resize({ width: targetSize, height: targetSize });
		const imageRef = await context.renderAsync();
		try {
			const result = await imageRef.saveAsync({ format, compress });
			const size = await fileSize(result.uri);
			last = {
				uri: result.uri,
				size,
				width: result.width,
				height: result.height,
			};
			if (size <= maxBytes) return last;
		} finally {
			context.release();
			imageRef.release();
		}
	}
	// Nothing fit — return the smallest attempt so the caller can report it.
	if (!last) throw new Error("Image conversion produced no output.");
	return last;
}

/** Converts one sticker source into a 512x512 WebP file at `destUri`. */
export async function convertToWhatsAppSticker(
	sourceUri: string,
	destUri: string,
	emotion: string,
): Promise<WhatsAppStickerFile> {
	const rendered = await renderFitting(
		sourceUri,
		WHATSAPP_STICKER_SIZE,
		SaveFormat.WEBP,
		WHATSAPP_MAX_STICKER_BYTES,
	);
	await FileSystem.copyAsync({ from: rendered.uri, to: destUri });
	const size = await fileSize(destUri);
	return {
		emotion,
		emoji: emotionToEmoji(emotion),
		fileUri: destUri,
		size,
		width: WHATSAPP_STICKER_SIZE,
		height: WHATSAPP_STICKER_SIZE,
		withinLimit: size <= WHATSAPP_MAX_STICKER_BYTES,
	};
}

/**
 * Converts one sticker into the shared `whatsapp/single/` folder and
 * returns the converted file. Thin wrapper so screens stay declarative.
 */
export async function exportSingleSticker(
	sourceUri: string,
	emotion: string,
): Promise<WhatsAppStickerFile> {
	if (!FileSystem.documentDirectory) {
		throw new Error("File system is not available on this platform.");
	}
	const dirUri = `${FileSystem.documentDirectory}whatsapp/single/`;
	await ensureDir(dirUri);
	const destUri = `${dirUri}sticker-${slugify(emotion)}-${Date.now()}.webp`;
	return convertToWhatsAppSticker(sourceUri, destUri, emotion);
}

/**
 * Exports sources as a WhatsApp sticker pack folder:
 * `<documentDirectory>whatsapp/<packId>/` with `sticker-*.webp`,
 * `tray.png` (96x96) and `pack.json` (WhatsApp `contents.json`-shaped
 * manifest for a future native provider).
 */
export async function exportStickerPack(
	sources: WhatsAppStickerSource[],
	packName: string,
): Promise<WhatsAppPack> {
	if (!FileSystem.documentDirectory) {
		throw new Error("File system is not available on this platform.");
	}
	if (sources.length < WHATSAPP_MIN_PACK_SIZE) {
		throw new Error(
			`Need at least ${WHATSAPP_MIN_PACK_SIZE} stickers for a WhatsApp pack (got ${sources.length}).`,
		);
	}
	if (sources.length > WHATSAPP_MAX_PACK_SIZE) {
		throw new Error(
			`WhatsApp packs hold at most ${WHATSAPP_MAX_PACK_SIZE} stickers (got ${sources.length}).`,
		);
	}

	const id = `stickerpop-${Date.now()}`;
	const dirUri = `${FileSystem.documentDirectory}whatsapp/${id}/`;
	await ensureDir(dirUri);

	const stickers: WhatsAppStickerFile[] = [];
	const limited = sources.slice(0, WHATSAPP_MAX_PACK_SIZE);
	for (let i = 0; i < limited.length; i++) {
		const source = limited[i];
		const fileName = `sticker-${String(i).padStart(2, "0")}-${slugify(source.emotion)}.webp`;
		const destUri = `${dirUri}${fileName}`;
		const sticker = await convertToWhatsAppSticker(
			source.sourceUri,
			destUri,
			source.emotion,
		);
		stickers.push(sticker);
	}

	// Tray icon: 96x96 PNG from the first sticker (PNG keeps the tiny
	// tray well under 50 KB and matches both platform samples).
	const trayUri = `${dirUri}tray.png`;
	const trayRendered = await renderFitting(
		limited[0].sourceUri,
		WHATSAPP_TRAY_SIZE,
		SaveFormat.PNG,
		WHATSAPP_MAX_TRAY_BYTES,
	);
	await FileSystem.copyAsync({ from: trayRendered.uri, to: trayUri });
	const traySize = await fileSize(trayUri);

	const manifest = {
		identifier: id,
		name: packName,
		publisher: "StickerPop",
		tray_image_file: "tray.png",
		image_data_version: "1",
		stickers: stickers.map((s) => ({
			image_file: s.fileUri.split("/").pop(),
			emojis: s.emoji,
		})),
	};
	const manifestUri = `${dirUri}pack.json`;
	await FileSystem.writeAsStringAsync(
		manifestUri,
		JSON.stringify(manifest, null, 2),
	);

	const oversized = stickers.filter((s) => !s.withinLimit);
	const trayOk = traySize <= WHATSAPP_MAX_TRAY_BYTES;
	const valid = oversized.length === 0 && trayOk;
	const validationMessage = valid
		? null
		: oversized.length > 0
			? `${oversized.length} sticker(s) exceed 100 KB even at lowest quality.`
			: "Tray icon exceeds 50 KB.";

	return {
		id,
		name: packName,
		dirUri,
		stickers,
		trayUri,
		traySize,
		manifestUri,
		valid,
		validationMessage,
	};
}

/** Shares a single WebP sticker file via the system sheet (`image/webp`). */
export async function shareWebpFile(
	fileUri: string,
	dialogTitle: string,
): Promise<"shared" | "cancelled"> {
	const available = await Sharing.isAvailableAsync();
	if (!available) throw new Error("Sharing is not available on this device.");
	await Sharing.shareAsync(fileUri, {
		mimeType: "image/webp",
		dialogTitle,
		UTI: "org.webmproject.webp",
	});
	return "shared";
}
