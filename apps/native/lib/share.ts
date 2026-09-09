import * as ExpoSharing from "expo-sharing";
import { Alert } from "react-native";
import Share, { Social } from "react-native-share";

export const WHATSAPP_GREEN = "#25D366";

const DEFAULT_MESSAGE = "Made with StickerPop";

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
  message: string = DEFAULT_MESSAGE,
): Promise<"shared" | "cancelled"> {
  try {
    await Share.shareSingle({
      title: "Share sticker via WhatsApp",
      message,
      url: fileUri,
			type: "image/png",
			social: Social.Whatsapp,
		});
    return "shared";
  } catch (e) {
    if (isCancelError(e)) return "cancelled";
    return shareImageFile(fileUri, "Share sticker");
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
      Alert.alert("Sharing unavailable", "Sharing is not available on this device.");
      return "cancelled";
    }
    await ExpoSharing.shareAsync(fileUri, { mimeType: "image/png", dialogTitle });
    return "shared";
  } catch (e) {
    if (isCancelError(e)) return "cancelled";
    Alert.alert("Share failed", e instanceof Error ? e.message : "Could not share.");
    return "cancelled";
  }
}
