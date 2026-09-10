import * as FileSystem from "expo-file-system/legacy";

import type { SourcePhoto } from "./gemini";

function guessMimeType(uri: string): string {
	const lower = uri.toLowerCase();
	if (lower.endsWith(".png")) return "image/png";
	if (lower.endsWith(".webp")) return "image/webp";
	if (lower.endsWith(".heic") || lower.endsWith(".heif")) return "image/heic";
	return "image/jpeg";
}

/** Reads a local image uri into a base64 SourcePhoto for the Gemini API. */
export async function uriToSourcePhoto(uri: string): Promise<SourcePhoto> {
	const base64 = await FileSystem.readAsStringAsync(uri, {
		encoding: FileSystem.EncodingType.Base64,
	});
	return { uri, base64, mimeType: guessMimeType(uri) };
}

/** Persists a data-url PNG to a local file and returns the file uri. */
export async function dataUrlToFile(
	dataUrl: string,
	filename: string,
): Promise<string> {
	const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
	const dir = `${FileSystem.documentDirectory}stickers/`;
	const info = await FileSystem.getInfoAsync(dir);
	if (!info.exists) {
		await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
	}
	const fileUri = `${dir}${filename}`;
	await FileSystem.writeAsStringAsync(fileUri, base64, {
		encoding: FileSystem.EncodingType.Base64,
	});
	return fileUri;
}
