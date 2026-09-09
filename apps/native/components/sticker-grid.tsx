import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

import type { GeneratedSticker } from "@/lib/gemini";

interface Props {
	stickers: GeneratedSticker[];
	onPreview: (sticker: GeneratedSticker) => void;
	onRegenerate: (emotion: string) => void;
	onSave: (sticker: GeneratedSticker) => void;
}

export function StickerGrid({
	stickers,
	onPreview,
	onRegenerate,
	onSave,
}: Props) {
	if (stickers.length === 0) return null;
	return (
		<View className="-mx-1.5 flex-row flex-wrap">
			{stickers.map((sticker) => (
				<View key={sticker.emotion} className="w-1/2 p-1.5">
					{sticker.isLoading ? (
						<View className="aspect-square w-full items-center justify-center rounded-[18px] border-2 border-[#C9CDD3] border-dashed bg-[#F1F2F4]">
							<ActivityIndicator size="large" color="#0B1533" />
							<Text className="mt-2 font-poppins-bold text-pop-navy">
								Generating
							</Text>
							<Text className="font-poppins-regular text-pop-navy">
								{sticker.emotion}
							</Text>
						</View>
					) : sticker.imageUrl ? (
						<View>
							<Pressable
								onPress={() => onPreview(sticker)}
								className="rounded-[20px] border-[3px] border-white bg-white shadow"
							>
								<Image
									source={{ uri: sticker.imageUrl }}
									className="aspect-square w-full rounded-[18px] bg-white"
								/>
							</Pressable>
							<View className="absolute bottom-[34px] flex-row items-center self-center rounded-full border border-[#E2E6EB] bg-white px-1.5 py-1 shadow">
								<Pressable
									onPress={() => onSave(sticker)}
									className="p-2"
									accessibilityLabel={`Save ${sticker.emotion} sticker`}
								>
									<Ionicons name="download-outline" size={18} color="#0B1533" />
								</Pressable>
								<View className="mx-0.5 h-[18px] w-px bg-[#E2E6EB]" />
								<Pressable
									onPress={() => onRegenerate(sticker.emotion)}
									className="p-2"
									accessibilityLabel={`Regenerate ${sticker.emotion} sticker`}
								>
									<Ionicons name="refresh-outline" size={18} color="#0B1533" />
								</Pressable>
							</View>
							<Text className="mt-2 text-center font-poppins-semibold text-pop-navy">
								{sticker.emotion}
							</Text>
						</View>
					) : (
						<View className="aspect-square w-full items-center justify-center rounded-[18px] border-2 border-[#F3B7B3] border-dashed bg-[#FFF1F0] p-4">
							<Ionicons name="alert-circle-outline" size={32} color="#D92D20" />
							<Text className="mt-1 font-poppins-bold text-[#D92D20]">
								Failed
							</Text>
							<Text className="font-poppins-regular text-pop-navy">
								{sticker.emotion}
							</Text>
							<Pressable
								onPress={() => onRegenerate(sticker.emotion)}
								className="mt-2 rounded-full bg-[#D92D20] px-3.5 py-1.5"
							>
								<Text className="font-poppins-bold text-white text-xs">
									Retry
								</Text>
							</Pressable>
						</View>
					)}
				</View>
			))}
		</View>
	);
}
