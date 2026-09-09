import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	Alert,
	Image,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StickerPopButton } from "@/components/sticker-pop-button";
import { emotionLabel } from "@/lib/i18n";
import { shareImageFile, shareImageToWhatsApp } from "@/lib/share";
import {
	deleteSticker,
	listSavedStickers,
	type SavedSticker,
} from "@/lib/stickers-store";

export default function MyStickersScreen() {
	const router = useRouter();
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const [stickers, setStickers] = useState<SavedSticker[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const [preview, setPreview] = useState<SavedSticker | null>(null);

	const load = useCallback(async () => {
		const all = await listSavedStickers();
		setStickers(all);
	}, []);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load]),
	);

	async function handleRefresh() {
		setRefreshing(true);
		await load();
		setRefreshing(false);
	}

	function confirmDelete(sticker: SavedSticker) {
		Alert.alert(
			t("myStickers.deleteTitle"),
			t("myStickers.deleteMessage", { emotion: emotionLabel(sticker.emotion) }),
			[
				{ text: t("myStickers.cancel"), style: "cancel" },
				{
					text: t("myStickers.delete"),
					style: "destructive",
					onPress: async () => {
						const rest = await deleteSticker(sticker.id);
						setStickers(rest);
						setPreview(null);
					},
				},
			],
		);
	}

	async function handleShare(sticker: SavedSticker) {
		await shareImageFile(
			sticker.fileUri,
			t("myStickers.shareDialog", { emotion: emotionLabel(sticker.emotion) }),
		);
	}

	async function handleShareToWhatsApp(sticker: SavedSticker) {
		await shareImageToWhatsApp(
			sticker.fileUri,
			t("share.stickerMessage", { emotion: emotionLabel(sticker.emotion) }),
		);
	}

	return (
		<ScrollView
			className="flex-1 bg-pop-bg"
			contentContainerStyle={{
				padding: 20,
				paddingBottom: 40,
				paddingTop: insets.top + 16,
				flexGrow: 1,
			}}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
			}
		>
			<Text className="text-center font-poppins-black text-[28px] text-pop-navy">
				{t("myStickers.title")}
			</Text>
			<Text className="mt-1 mb-4 text-center font-poppins-semibold text-gray-500">
				{stickers.length === 0
					? t("myStickers.subtitleEmpty")
					: t("myStickers.count", { count: stickers.length })}
			</Text>

			{stickers.length === 0 ? (
				<View className="items-center gap-2 rounded-[28px] border-2 border-pop-navy bg-white p-8 shadow">
					<Text className="text-5xl">🎨</Text>
					<Text className="mt-2 font-poppins-extrabold text-pop-navy text-xl">
						{t("myStickers.emptyTitle")}
					</Text>
					<Text className="font-poppins-semibold text-gray-500">
						{t("myStickers.emptySubtitle")}
					</Text>
					<StickerPopButton
						title={t("myStickers.createCta")}
						icon="sparkles"
						onPress={() => router.push("/(tabs)/create")}
						className="mt-4 w-full"
					/>
				</View>
			) : (
				<View className="-mx-1.5 flex-row flex-wrap">
					{stickers.map((sticker) => (
						<View key={sticker.id} className="w-1/3 p-1.5">
							<Pressable
								onPress={() => setPreview(sticker)}
								onLongPress={() => confirmDelete(sticker)}
								className="rounded-[18px] border-[3px] border-white bg-white shadow active:opacity-80"
							>
								<Image
									source={{ uri: sticker.fileUri }}
									className="aspect-square w-full rounded-2xl bg-white"
								/>
							</Pressable>
							<Text className="mt-1.5 text-center font-poppins-bold text-pop-navy text-xs">
								{emotionLabel(sticker.emotion)}
							</Text>
						</View>
					))}
				</View>
			)}

			<Modal
				visible={!!preview}
				transparent
				animationType="fade"
				onRequestClose={() => setPreview(null)}
			>
				<Pressable
					onPress={() => setPreview(null)}
					className="flex-1 items-center justify-center bg-pop-navy/70 p-6"
				>
					<View className="w-full items-center gap-3 rounded-3xl bg-white p-5">
						{preview ? (
							<Image
								source={{ uri: preview.fileUri }}
								className="aspect-square w-full rounded-2xl"
								resizeMode="contain"
							/>
						) : null}
						<Text className="font-poppins-extrabold text-lg text-pop-navy">
							{preview ? emotionLabel(preview.emotion) : ""}
						</Text>
						<StickerPopButton
							title={t("myStickers.whatsapp")}
							icon="logo-whatsapp"
							variant="whatsapp"
							onPress={() => {
								if (preview) handleShareToWhatsApp(preview);
							}}
							className="w-full"
						/>
						<View className="w-full flex-row gap-3">
							<StickerPopButton
								title={t("myStickers.share")}
								icon="share-outline"
								onPress={() => {
									if (preview) handleShare(preview);
								}}
								className="flex-1"
							/>
							<Pressable
								onPress={() => {
									if (preview) confirmDelete(preview);
								}}
								className="h-[54px] w-[54px] items-center justify-center rounded-full border-2 border-pop-navy bg-white active:opacity-80"
								accessibilityLabel={t("myStickers.delete")}
							>
								<Ionicons name="trash-outline" size={22} color="#0B1533" />
							</Pressable>
						</View>
					</View>
				</Pressable>
			</Modal>
		</ScrollView>
	);
}
