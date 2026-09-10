import { cn } from "heroui-native";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { STICKER_STYLES, type StickerStyleId } from "@/lib/sticker-styles";

interface Props {
	selected: StickerStyleId;
	onSelect: (id: StickerStyleId) => void;
}

export function StyleCarousel({ selected, onSelect }: Props) {
	const { t } = useTranslation();
	return (
		<View>
			<Text className="mb-3 text-center font-poppins-extrabold text-pop-navy text-xl">
				{t("styles.heading")}
			</Text>
			<FlatList
				data={STICKER_STYLES}
				keyExtractor={(item) => item.id}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
				renderItem={({ item }) => {
					const active = item.id === selected;
					return (
						<Pressable
							onPress={() => onSelect(item.id)}
							className="mx-0.5 w-[120px] items-center active:opacity-80"
						>
							<View
								// rotation is per-item dynamic data -> inline style is the only option
								style={{ transform: [{ rotate: `${item.rotation}deg` }] }}
								className={cn(
									"h-[104px] w-[104px] items-center justify-center rounded-3xl border-[3px] bg-white p-2 shadow-sm",
									active ? "border-pop-navy bg-[#FFF6CC]" : "border-[#E2E6EB]",
								)}
							>
								<Image
									source={item.image}
									className="h-[84px] w-[84px]"
									resizeMode="contain"
								/>
							</View>
							<Text
								className={cn(
									"mt-2 text-center text-[13px]",
									active
										? "font-poppins-extrabold text-pop-navy"
										: "font-poppins-semibold text-gray-500",
								)}
							>
								{t(`styles.${item.labelKey}`)}
							</Text>
						</Pressable>
					);
				}}
			/>
		</View>
	);
}
