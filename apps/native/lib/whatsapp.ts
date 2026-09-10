import { File } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as Sharing from "expo-sharing";

import { createZip, type ZipEntry } from "./zip";

/**
 * WhatsApp sticker export.
 *
 * Spec (WhatsApp third-party sticker requirements):
 * - stickers: exactly 512x512 px, WebP, <= 100 KB each (static)
 * - tray icon: 96x96 px, static, <= 50 KB
 * - pack: 3-30 stickers, all static (we only produce static)
 *
 * This module converts the app's PNG stickers (Gemini output or saved files)
 * into spec-compliant WebP files, groups them into a pack folder with a
 * WhatsApp `contents.json` manifest and packs that folder into a `.wasticker`
 * archive (a ZIP) that the system sheet can hand to WhatsApp / a sticker app.
 * Sharing stays image-based (`lib/share.ts` is untouched) — this is the
 * separate "valid WhatsApp sticker" path.
 */

export const WHATSAPP_STICKER_SIZE = 512;
export const WHATSAPP_TRAY_SIZE = 96;
export const WHATSAPP_MAX_STICKER_BYTES = 100 * 1024;
export const WHATSAPP_MAX_TRAY_BYTES = 50 * 1024;
export const WHATSAPP_MIN_PACK_SIZE = 3;
export const WHATSAPP_MAX_PACK_SIZE = 30;
export const WHATSAPP_ARCHIVE_NAME = "StickerPop.wasticker";

const COMPRESS_STEPS = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];

export interface WhatsAppStickerSource {
	/** Local file uri (`file://…`) or `data:image/…;base64,…` url. */
	sourceUri: string;
	emotion: string;
}

export interface WhatsAppStickerFile {
	emotion: string;
	emoji: string[];
	/** Final pack file, e.g. `…/whatsapp/pack/sticker-00-happy.webp`. */
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
	/** `contents.json` inside the pack folder. */
	manifestUri: string;
	/** Shareable `.wasticker` archive (the pack folder zipped). */
	archiveUri: string;
	/** How many sources were offered; more than `stickers.length` means the cap hit. */
	sourceCount: number;
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

/** Empties a directory so repeated exports reuse the same paths. */
async function ensureCleanDir(dirUri: string): Promise<void> {
	await FileSystem.deleteAsync(dirUri, { idempotent: true });
	await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
}

async function copyOverwrite(from: string, to: string): Promise<void> {
	await FileSystem.deleteAsync(to, { idempotent: true });
	await FileSystem.copyAsync({ from, to });
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
	await copyOverwrite(rendered.uri, destUri);
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
 * returns the converted file. Re-exporting the same emotion overwrites the
 * previous file, so repeated exports don't accumulate.
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
	const destUri = `${dirUri}sticker-${slugify(emotion)}.webp`;
	return convertToWhatsAppSticker(sourceUri, destUri, emotion);
}

/**
 * Exports sources as a WhatsApp sticker pack:
 * `<documentDirectory>whatsapp/pack/` with `sticker-*.webp`, `tray.png`
 * and `contents.json`, zipped into
 * `<documentDirectory>whatsapp/StickerPop.wasticker`. The pack folder is
 * rebuilt on every export so the output paths stay stable.
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
	const limited = sources.slice(0, WHATSAPP_MAX_PACK_SIZE);

	const id = `stickerpop-${Date.now()}`;
	const rootUri = `${FileSystem.documentDirectory}whatsapp/`;
	const dirUri = `${rootUri}pack/`;
	const archiveUri = `${rootUri}${WHATSAPP_ARCHIVE_NAME}`;
	await ensureCleanDir(dirUri);

	const stickers: WhatsAppStickerFile[] = [];
	for (let i = 0; i < limited.length; i++) {
		const source = limited[i] as WhatsAppStickerSource;
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
		(stickers[0] as WhatsAppStickerFile).fileUri,
		WHATSAPP_TRAY_SIZE,
		SaveFormat.PNG,
		WHATSAPP_MAX_TRAY_BYTES,
	);
	await copyOverwrite(trayRendered.uri, trayUri);
	const traySize = await fileSize(trayUri);

	const manifest = {
		android_play_store_link: "",
		ios_app_download_link: "",
		name: packName,
		publisher: "StickerPop",
		identifier: id,
		tray_image_file: "tray.png",
		image_data_version: "1",
		avoid_cache: false,
		animated_sticker_pack: false,
		stickers: stickers.map((s) => ({
			image_file: s.fileUri.split("/").pop(),
			emojis: s.emoji,
		})),
	};
	const manifestJson = JSON.stringify(manifest, null, 2);
	const manifestUri = `${dirUri}contents.json`;
	await FileSystem.writeAsStringAsync(manifestUri, manifestJson);

	const entries: ZipEntry[] = [
		{ name: "contents.json", data: new TextEncoder().encode(manifestJson) },
		{ name: "tray.png", data: await new File(trayUri).bytes() },
	];
	for (const sticker of stickers) {
		entries.push({
			name: sticker.fileUri.split("/").pop() as string,
			data: await new File(sticker.fileUri).bytes(),
		});
	}
	const archive = new File(archiveUri);
	archive.create({ overwrite: true, intermediates: true });
	archive.write(createZip(entries));

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
		archiveUri,
		sourceCount: sources.length,
		valid,
		validationMessage,
	};
}

/** Shares a local file via the system sheet. */
export async function shareFile(
	fileUri: string,
	options: { mimeType: string; dialogTitle: string; UTI?: string },
): Promise<"shared" | "cancelled"> {
	const available = await Sharing.isAvailableAsync();
	if (!available) throw new Error("Sharing is not available on this device.");
	await Sharing.shareAsync(fileUri, options);
	return "shared";
}

/** Shares a single WebP sticker file via the system sheet (`image/webp`). */
export function shareWebpFile(
	fileUri: string,
	dialogTitle: string,
): Promise<"shared" | "cancelled"> {
	return shareFile(fileUri, {
		mimeType: "image/webp",
		dialogTitle,
		UTI: "org.webmproject.webp",
	});
}
