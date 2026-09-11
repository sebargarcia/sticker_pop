import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { emotionLabel } from "@/lib/i18n";
import { STICKER_EMOTIONS } from "@/lib/sticker-styles";

interface Props {
	selected: string[];
	onToggle: (emotion: string) => void;
	onSelectAll: () => void;
	onClearAll: () => void;
}

export function EmotionSelector({
	selected,
	onToggle,
	onSelectAll,
	onClearAll,
}: Props) {
	const { t } = useTranslation();
	const allSelected = selected.length === STICKER_EMOTIONS.length;
	return (
		<View>
			<View className="flex-row items-end justify-between">
				<Text className="font-poppins-extrabold text-pop-navy text-xl">
					{t("create.selectEmotions")}
				</Text>
				<Text className="font-poppins-semibold text-gray-500 text-xs">
					{t("create.selectedCount", { count: selected.length })}
				</Text>
			</View>
			<Text className="mt-1 font-poppins-regular text-[13px] text-gray-500">
				{t("create.selectEmotionsHint")}
			</Text>
			<View className="mt-3 flex-row flex-wrap gap-2">
				{STICKER_EMOTIONS.map((emotion) => {
					const active = selected.includes(emotion.key);
					return (
						<Pressable
							key={emotion.key}
							onPress={() => onToggle(emotion.key)}
							accessibilityRole="checkbox"
							accessibilityState={{ checked: active }}
							accessibilityLabel={emotionLabel(emotion.key)}
							className={cn(
								"flex-row items-center gap-1.5 rounded-full border-2 px-3.5 py-2 active:opacity-80",
								active
									? "border-pop-navy bg-pop-navy"
									: "border-[#E2E6EB] bg-white",
							)}
						>
							<Ionicons
								name={active ? "checkmark-circle" : "ellipse-outline"}
								size={18}
								color={active ? "#FFFFFF" : "#9AA0A8"}
							/>
							<Text
								className={cn(
									"text-[14px]",
									active
										? "font-poppins-bold text-white"
										: "font-poppins-semibold text-pop-navy",
								)}
							>
								{emotionLabel(emotion.key)}
							</Text>
						</Pressable>
					);
				})}
			</View>
			<View className="mt-2 flex-row gap-4">
				<Pressable
					onPress={onSelectAll}
					disabled={allSelected}
					className="active:opacity-80 disabled:opacity-40"
				>
					<Text className="font-poppins-semibold text-[13px] text-pop-navy underline">
						{t("create.selectAll")}
					</Text>
				</Pressable>
				<Pressable
					onPress={onClearAll}
					disabled={selected.length === 0}
					className="active:opacity-80 disabled:opacity-40"
				>
					<Text className="font-poppins-semibold text-[13px] text-pop-navy underline">
						{t("create.clearAll")}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}
