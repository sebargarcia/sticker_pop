import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

export interface SavedSticker {
	id: string;
	emotion: string;
	styleId: string;
	fileUri: string;
	createdAt: number;
}

const STORAGE_KEY = "stickerpop.my-stickers.v1";

async function readAll(): Promise<SavedSticker[]> {
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as SavedSticker[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

async function writeAll(stickers: SavedSticker[]): Promise<void> {
	await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stickers));
}

export async function listSavedStickers(): Promise<SavedSticker[]> {
	const all = await readAll();
	return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveSticker(input: {
	emotion: string;
	styleId: string;
	fileUri: string;
}): Promise<SavedSticker> {
	const sticker: SavedSticker = {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		createdAt: Date.now(),
		...input,
	};
	const all = await readAll();
	await writeAll([sticker, ...all]);
	return sticker;
}

export async function deleteSticker(id: string): Promise<SavedSticker[]> {
	const all = await readAll();
	const target = all.find((s) => s.id === id);
	const rest = all.filter((s) => s.id !== id);
	await writeAll(rest);
	if (target) {
		try {
			const info = await FileSystem.getInfoAsync(target.fileUri);
			if (info.exists)
				await FileSystem.deleteAsync(target.fileUri, { idempotent: true });
		} catch {
			// File may already be gone (e.g. user cleared storage) — index is source of truth.
		}
	}
	return rest.sort((a, b) => b.createdAt - a.createdAt);
}

export async function isStickerSaved(fileUri: string): Promise<boolean> {
	const all = await readAll();
	return all.some((s) => s.fileUri === fileUri);
}
