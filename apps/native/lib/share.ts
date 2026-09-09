import * as ExpoSharing from "expo-sharing";
import { Alert } from "react-native";
import Share, { Social } from "react-native-share";

import i18n from "./i18n";

export const WHATSAPP_GREEN = "#25D366";

function isCancelError(e: unknown): boolean {
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return msg.includes("cancel") || msg.includes("dismiss") || msg.includes("did not share");
}

/**
 * Sends a local image file straight to WhatsApp (contact picker opens in app).
 * Falls back to the system share sheet when WhatsApp is missing or the direct
 * share fails — WhatsApp still appears there if installed.
 * NOTE: requires a dev build (react-native-share is a native module, not in Expo Go).
 */
export async function shareImageToWhatsApp(
	fileUri: string,
	message?: string,
): Promise<"shared" | "cancelled"> {
	try {
		await Share.shareSingle({
			title: i18n.t("share.whatsappTitle"),
			message: message ?? i18n.t("share.defaultMessage"),
			url: fileUri,
			type: "image/png",
			social: Social.Whatsapp,
		});
		return "shared";
	} catch (e) {
		if (isCancelError(e)) return "cancelled";
		return shareImageFile(fileUri, i18n.t("share.whatsappTitle"));
	}
}

/** Generic system share sheet for a local image file. */
export async function shareImageFile(
  fileUri: string,
  dialogTitle: string,
): Promise<"shared" | "cancelled"> {
  try {
		const available = await ExpoSharing.isAvailableAsync();
		if (!available) {
			Alert.alert(i18n.t("share.unavailableTitle"), i18n.t("share.unavailableMessage"));
			return "cancelled";
		}
		await ExpoSharing.shareAsync(fileUri, { mimeType: "image/png", dialogTitle });
		return "shared";
	} catch (e) {
		if (isCancelError(e)) return "cancelled";
		Alert.alert(i18n.t("share.failedTitle"), i18n.t("share.failedMessage"));
		return "cancelled";
	}
}
