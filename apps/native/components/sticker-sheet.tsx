import { forwardRef } from "react";
import { Image, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import ViewShot, { type ViewShotRef } from "react-native-view-shot";

import type { GeneratedSticker } from "@/lib/gemini";
import { emotionLabel } from "@/lib/i18n";

interface Props {
	stickers: GeneratedSticker[];
}

/**
 * Printable 4x2 sheet. Parent captures it via ViewShot ref -> PNG file
 * for Save / Share. Mirrors the web StickerSheetModal layout.
 *
 * NOTE: ViewShot is a third-party component without className support,
 * so its wrapper keeps a plain style object; everything inside uses Uniwind.
 */
export const StickerSheetView = forwardRef<ViewShotRef, Props>(
	({ stickers }, ref) => {
		const { t } = useTranslation();
		const ready = stickers.filter((s) => s.imageUrl).slice(0, 8);
		return (
			<ViewShot
				ref={ref}
				options={{ format: "png", quality: 1 }}
				style={{ width: "100%" }}
			>
				<View className="rounded-[20px] border-2 border-pop-navy bg-pop-sheet p-4">
					<Text className="text-center font-poppins-black text-[28px] text-pop-navy tracking-wider">
						STICKERPOP
					</Text>
					<Text className="mb-3 text-center font-poppins-semibold text-gray-500">
						{t("sheet.subtitle")}
					</Text>
					<View className="-mx-1.5 flex-row flex-wrap">
						{ready.map((s) => (
							<View key={s.emotion} className="w-1/4 items-center p-1.5">
								<Image
									source={{ uri: s.imageUrl ?? undefined }}
									className="aspect-square w-full rounded-[14px] border-2 border-white bg-white"
								/>
								<Text className="mt-1 font-poppins-bold text-[11px] text-pop-navy">
									{emotionLabel(s.emotion)}
								</Text>
							</View>
						))}
					</View>
				<View className="mt-3 items-center rounded-[14px] bg-white p-3">
					<Text className="font-poppins-extrabold text-pop-navy text-base">
						{t("sheet.footerBold")}
					</Text>
					<Text className="font-poppins-regular text-gray-500 text-xs">
						{t("sheet.footerSmall")}
					</Text>
				</View>
				</View>
			</ViewShot>
		);
	},
);

StickerSheetView.displayName = "StickerSheetView";
