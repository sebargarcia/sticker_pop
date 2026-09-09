import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StickerPopButton } from "@/components/sticker-pop-button";
import { STICKERPOP_LOGO } from "@/lib/sticker-styles";

export default function Home() {
	const router = useRouter();
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();

	return (
		<View
			className="flex-1 justify-center bg-pop-bg px-5"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<View className="items-center rounded-[28px] border-2 border-pop-navy bg-white p-6 shadow">
				<Image
					source={STICKERPOP_LOGO}
					className="h-[120px] w-[200px]"
					resizeMode="contain"
				/>
				<Text className="mt-2 text-center font-poppins-black text-[26px] leading-8 text-pop-navy">
					{t("home.tagline")}
				</Text>
				<Text className="mt-2 text-center font-poppins-medium text-[15px] text-gray-500">
					{t("home.subtitle")}
				</Text>
				<StickerPopButton
					title={t("home.createCta")}
					icon="sparkles"
					onPress={() => router.push("/(tabs)/create")}
					className="mt-[18px] w-full"
				/>
			</View>
		</View>
	);
}
