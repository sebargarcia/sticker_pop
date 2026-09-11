import { requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";

interface NativeWhatsAppStickersModule {
	/** Opens WhatsApp's "add sticker pack" preview for the given pack. */
	addStickerPack(identifier: string, name: string): Promise<void>;
}

let cached: NativeWhatsAppStickersModule | null | undefined;

function resolveNativeModule(): NativeWhatsAppStickersModule | null {
	if (cached !== undefined) return cached;
	if (Platform.OS !== "android") {
		cached = null;
		return cached;
	}
	cached =
		requireOptionalNativeModule<NativeWhatsAppStickersModule>(
			"StickerPopWhatsApp",
		) ?? null;
	return cached;
}

/** True when this binary can hand a sticker pack straight to WhatsApp. */
export function canAddStickerPackToWhatsApp(): boolean {
	return resolveNativeModule() != null;
}

/**
 * Opens WhatsApp's "add sticker pack" preview for a pack already written to
 * disk. Rejects with `code === "ERR_WHATSAPP_NOT_INSTALLED"` when no WhatsApp
 * app can handle the intent.
 */
export async function addStickerPackToWhatsApp(
	identifier: string,
	name: string,
): Promise<void> {
	const module = resolveNativeModule();
	if (!module) {
		throw new Error("WhatsApp sticker packs are not available in this build.");
	}
	await module.addStickerPack(identifier, name);
}
