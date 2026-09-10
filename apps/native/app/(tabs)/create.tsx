import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ViewShotRef } from "react-native-view-shot";
import { StickerGrid } from "@/components/sticker-grid";
import { StickerPopButton } from "@/components/sticker-pop-button";
import { StickerSheetView } from "@/components/sticker-sheet";
import { StyleCarousel } from "@/components/style-carousel";
import {
	type GeneratedSticker,
	generateSingleSticker,
	generateStickerSet,
	type SourcePhoto,
} from "@/lib/gemini";
import { emotionLabel } from "@/lib/i18n";
import { dataUrlToFile, uriToSourcePhoto } from "@/lib/image-utils";
import { shareImageFile, shareImageToWhatsApp } from "@/lib/share";
import { STICKER_EMOTIONS, type StickerStyleId } from "@/lib/sticker-styles";
import { saveSticker } from "@/lib/stickers-store";
import {
	exportSingleSticker,
	exportStickerPack,
	shareFile,
	shareWebpFile,
} from "@/lib/whatsapp";

export default function CreateScreen() {
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	const [photo, setPhoto] = useState<SourcePhoto | null>(null);
	const [style, setStyle] = useState<StickerStyleId>("pop-art");
	const [stickers, setStickers] = useState<GeneratedSticker[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<GeneratedSticker | null>(null);
	const [showSheet, setShowSheet] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const sheetRef = useRef<ViewShotRef>(null);

	async function pickImage(useCamera: boolean) {
		setError(null);
		try {
			const permission = useCamera
				? await ImagePicker.requestCameraPermissionsAsync()
				: await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!permission.granted) {
				setError(
					useCamera
						? t("create.cameraPermission")
						: t("create.libraryPermission"),
				);
				return;
			}
			const result = useCamera
				? await ImagePicker.launchCameraAsync({
						allowsEditing: true,
						aspect: [1, 1],
						quality: 0.9,
					})
				: await ImagePicker.launchImageLibraryAsync({
						mediaTypes: ["images"],
						allowsEditing: true,
						aspect: [1, 1],
						quality: 0.9,
						base64: true,
					});
			if (result.canceled || result.assets.length === 0) return;
			const asset = result.assets[0];
			if (asset.base64) {
				const mimeType = asset.mimeType ?? "image/jpeg";
				setPhoto({ uri: asset.uri, base64: asset.base64, mimeType });
			} else {
				const source = await uriToSourcePhoto(asset.uri);
				setPhoto(source);
			}
			setStickers([]);
		} catch (e) {
			setError(e instanceof Error ? e.message : t("create.loadImageError"));
		}
	}

	async function handleGenerate() {
		if (!photo) {
			setError(t("create.needPhoto"));
			return;
		}
		setIsLoading(true);
		setError(null);
		setStickers(
			STICKER_EMOTIONS.map((e) => ({
				emotion: e.key,
				imageUrl: null,
				isLoading: true,
			})),
		);
		try {
			const promises = generateStickerSet(
				photo,
				style,
				STICKER_EMOTIONS.map((e) => e.key),
			);
			const results = await Promise.all(promises);
			setStickers(results);
			const firstError = results.find((r) => r.error)?.error;
			if (firstError && results.every((r) => !r.imageUrl)) {
				setError(firstError);
			}
			// Persist successful ones to My Stickers automatically.
			for (const r of results) {
				if (r.imageUrl) {
					try {
						const fileUri = await dataUrlToFile(
							r.imageUrl,
							`sticker-${r.emotion.toLowerCase()}-${Date.now()}.png`,
						);
						await saveSticker({ emotion: r.emotion, styleId: style, fileUri });
					} catch {
						// Saving locally must never break the generate flow.
					}
				}
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : t("create.generatingError"));
		} finally {
			setIsLoading(false);
		}
	}

	async function handleRegenerate(emotion: string) {
		if (!photo) return;
		setStickers((prev) =>
			prev.map((s) =>
				s.emotion === emotion
					? { ...s, isLoading: true, imageUrl: null, error: undefined }
					: s,
			),
		);
		const result = await generateSingleSticker(photo, style, emotion).catch(
			(e) => ({
				emotion,
				imageUrl: null as string | null,
				isLoading: false,
				error: e instanceof Error ? e.message : t("create.generatingError"),
			}),
		);
		setStickers((prev) =>
			prev.map((s) => (s.emotion === emotion ? result : s)),
		);
		if (result.imageUrl) {
			try {
				const fileUri = await dataUrlToFile(
					result.imageUrl,
					`sticker-${emotion.toLowerCase()}-${Date.now()}.png`,
				);
				await saveSticker({ emotion, styleId: style, fileUri });
			} catch {
				// ignore
			}
		}
	}

	async function handleSave(sticker: GeneratedSticker) {
		if (!sticker.imageUrl) return;
		try {
			const { status } = await MediaLibrary.requestPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					t("create.permissionNeeded"),
					t("create.permissionMessage"),
				);
				return;
			}
			const fileUri = await dataUrlToFile(
				sticker.imageUrl,
				`sticker-${sticker.emotion.toLowerCase()}-${Date.now()}.png`,
			);
			await MediaLibrary.saveToLibraryAsync(fileUri);
			await saveSticker({ emotion: sticker.emotion, styleId: style, fileUri });
			Alert.alert(t("create.savedTitle"), t("create.savedMessage"));
		} catch (e) {
			Alert.alert(
				t("share.failedTitle"),
				e instanceof Error ? e.message : t("create.saveFailed"),
			);
		}
	}

	async function captureSheetUri(): Promise<string | null> {
		try {
			const uri = await sheetRef.current?.capture?.();
			if (!uri) {
				Alert.alert(t("share.notReadyTitle"), t("share.notReadyMessage"));
				return null;
			}
			return uri;
		} catch (e) {
			Alert.alert(
				t("share.failedTitle"),
				e instanceof Error ? e.message : t("share.failedMessage"),
			);
			return null;
		}
	}

	async function handleShareSheet() {
		const uri = await captureSheetUri();
		if (!uri) return;
		await shareImageFile(uri, t("share.sheetDialog"));
	}

	async function handleShareSheetToWhatsApp() {
		const uri = await captureSheetUri();
		if (!uri) return;
		await shareImageToWhatsApp(uri, t("share.sheetMessage"));
	}

	async function handleShareStickerToWhatsApp(sticker: GeneratedSticker) {
		if (!sticker.imageUrl) return;
		try {
			const fileUri = await dataUrlToFile(
				sticker.imageUrl,
				`sticker-${sticker.emotion.toLowerCase()}-${Date.now()}.png`,
			);
			await shareImageToWhatsApp(
				fileUri,
				t("share.stickerMessage", { emotion: emotionLabel(sticker.emotion) }),
			);
		} catch (e) {
			Alert.alert(
				t("share.failedTitle"),
				e instanceof Error ? e.message : t("share.failedMessage"),
			);
		}
	}

	/**
	 * Exports one sticker as a spec-compliant WhatsApp sticker
	 * (512x512 WebP, <= 100 KB) and opens the system sheet for it.
	 * Image sharing above is untouched — this is the separate sticker path.
	 */
	async function handleExportSticker(sticker: GeneratedSticker) {
		if (!sticker.imageUrl || isExporting) return;
		setIsExporting(true);
		try {
			const file = await exportSingleSticker(sticker.imageUrl, sticker.emotion);
			if (!file.withinLimit) {
				Alert.alert(
					t("whatsapp.partialTitle"),
					t("whatsapp.partialMessage", { valid: 0, count: 1 }),
				);
				return;
			}
			await shareWebpFile(file.fileUri, t("whatsapp.shareDialog"));
		} catch (e) {
			Alert.alert(
				t("whatsapp.failedTitle"),
				e instanceof Error ? e.message : t("whatsapp.failedMessage"),
			);
		} finally {
			setIsExporting(false);
		}
	}

	/** Exports all generated stickers as a validated WhatsApp pack. */
	async function handleExportPack() {
		if (isExporting) return;
		const ready = stickers.filter((s) => s.imageUrl);
		if (ready.length < 3) {
			Alert.alert(t("whatsapp.tooFewTitle"), t("whatsapp.tooFewMessage"));
			return;
		}
		setIsExporting(true);
		try {
			const pack = await exportStickerPack(
				ready.map((s) => ({
					sourceUri: s.imageUrl as string,
					emotion: s.emotion,
				})),
				t("whatsapp.packName"),
			);
			if (!pack.valid) {
				const validCount = pack.stickers.filter((s) => s.withinLimit).length;
				Alert.alert(
					t("whatsapp.partialTitle"),
					t("whatsapp.partialMessage", {
						valid: validCount,
						count: pack.stickers.length,
					}),
				);
				return;
			}
			await shareFile(pack.archiveUri, {
				mimeType: "application/octet-stream",
				dialogTitle: t("whatsapp.packDialog"),
			});
			Alert.alert(
				t("whatsapp.successTitle"),
				pack.stickers.length < pack.sourceCount
					? t("whatsapp.cappedMessage", {
							count: pack.stickers.length,
							total: pack.sourceCount,
						})
					: t("whatsapp.successMessage", { count: pack.stickers.length }),
			);
		} catch (e) {
			Alert.alert(
				t("whatsapp.failedTitle"),
				e instanceof Error ? e.message : t("whatsapp.failedMessage"),
			);
		} finally {
			setIsExporting(false);
		}
	}

	const hasResults = stickers.some((s) => s.imageUrl);

	return (
		<ScrollView
			className="flex-1 bg-pop-bg"
			contentContainerStyle={{
				padding: 20,
				paddingBottom: 40,
				paddingTop: insets.top + 16,
			}}
		>
			<Text className="text-center font-poppins-black text-[28px] text-pop-navy">
				{t("create.title")}
			</Text>
			<Text className="mt-1 mb-4 text-center font-poppins-semibold text-gray-500">
				{t("create.subtitle")}
			</Text>

			{/* Photo sources */}
			<View className="flex-row gap-3">
				<Pressable
					onPress={() => pickImage(true)}
					className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-pop-navy bg-white py-3.5 active:opacity-80"
				>
					<Ionicons name="camera-outline" size={22} color="#0B1533" />
					<Text className="font-poppins-bold text-pop-navy">
						{photo ? t("create.retakePhoto") : t("create.takePhoto")}
					</Text>
				</Pressable>
				<Pressable
					onPress={() => pickImage(false)}
					className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-pop-navy bg-white py-3.5 active:opacity-80"
				>
					<Ionicons name="cloud-upload-outline" size={22} color="#0B1533" />
					<Text className="font-poppins-bold text-pop-navy">
						{photo ? t("create.changePhoto") : t("create.uploadPhoto")}
					</Text>
				</Pressable>
			</View>

			{photo ? (
				<View className="mt-4 items-center">
					<Image
						source={{ uri: photo.uri }}
						className="h-[140px] w-[140px] -rotate-6 rounded-3xl border-[3px] border-white"
					/>
				</View>
			) : (
				<View className="mt-4 items-center gap-2 rounded-[20px] border-2 border-[#C9CDD3] border-dashed bg-white p-6">
					<Ionicons name="image-outline" size={40} color="#9AA0A8" />
					<Text className="font-poppins-semibold text-gray-500">
						{t("create.addPhotoHint")}
					</Text>
				</View>
			)}

			<View className="mt-4">
				<StyleCarousel selected={style} onSelect={setStyle} />
			</View>

			<StickerPopButton
				title={isLoading ? t("create.generating") : t("create.generate")}
				icon="sparkles"
				loading={isLoading}
				disabled={!photo || isLoading}
				onPress={handleGenerate}
				className="mt-4"
			/>

			{error ? (
				<View className="mt-4 flex-row items-center gap-2 rounded-[14px] border border-[#F3B7B3] bg-[#FFF1F0] p-3">
					<Ionicons name="alert-circle-outline" size={22} color="#D92D20" />
					<Text className="flex-1 font-poppins-semibold text-[#D92D20]">
						{error}
					</Text>
				</View>
			) : null}

			{isLoading && stickers.length === 0 ? (
				<View className="mt-4 flex-row items-center justify-center gap-2">
					<ActivityIndicator color="#0B1533" />
					<Text className="font-poppins-bold text-pop-navy">
						{t("create.magicMoment")}
					</Text>
				</View>
			) : null}

			{stickers.length > 0 ? (
				<View className="mt-5">
					<StickerGrid
						stickers={stickers}
						onPreview={setPreview}
						onRegenerate={handleRegenerate}
						onSave={handleSave}
					/>
					{hasResults && !isLoading ? (
						<View className="mt-4">
							<StickerPopButton
								title={t("create.viewSheet")}
								variant="secondary"
								onPress={() => setShowSheet(true)}
							/>
						</View>
					) : null}
				</View>
			) : (
				<View className="mt-5 items-center rounded-[20px] border-2 border-[#E8ECF1] bg-white p-6">
					<Text className="font-poppins-extrabold text-base text-pop-navy">
						{t("create.emptyTitle")}
					</Text>
					<Text className="mt-1 font-poppins-regular text-gray-500">
						{t("create.emptySubtitle")}
					</Text>
				</View>
			)}

			{/* Preview modal */}
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
						{preview?.imageUrl ? (
							<Image
								source={{ uri: preview.imageUrl }}
								className="aspect-square w-full rounded-2xl"
								resizeMode="contain"
							/>
						) : null}
						<Text className="font-poppins-extrabold text-lg text-pop-navy">
							{preview ? emotionLabel(preview.emotion) : ""}
						</Text>
						<StickerPopButton
							title={t("create.saveToLibrary")}
							icon="download-outline"
							onPress={() => {
								if (preview) handleSave(preview);
							}}
							className="w-full"
						/>
						<StickerPopButton
							title={t("create.sendWhatsApp")}
							icon="logo-whatsapp"
							variant="whatsapp"
							onPress={() => {
								if (preview) handleShareStickerToWhatsApp(preview);
							}}
							className="w-full"
						/>
						<StickerPopButton
							title={
								isExporting
									? t("whatsapp.exporting")
									: t("whatsapp.exportSingle")
							}
							icon="logo-whatsapp"
							variant="dark"
							loading={isExporting}
							onPress={() => {
								if (preview) handleExportSticker(preview);
							}}
							className="w-full"
						/>
					</View>
				</Pressable>
			</Modal>

			{/* Sheet modal */}
			<Modal
				visible={showSheet}
				transparent
				animationType="slide"
				onRequestClose={() => setShowSheet(false)}
			>
				<View className="flex-1 justify-end bg-pop-navy/70">
					<View className="max-h-[90%] rounded-t-[28px] bg-white p-5">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-poppins-extrabold text-pop-navy text-xl">
								{t("create.sheetTitle")}
							</Text>
							<Pressable
								onPress={() => setShowSheet(false)}
								className="rounded-full bg-[#F1F2F4] p-2"
							>
								<Ionicons name="close" size={24} color="#0B1533" />
							</Pressable>
						</View>
						{/* Rendered visibly so capture() works reliably */}
						<StickerSheetView ref={sheetRef} stickers={stickers} />
						<View className="mt-4 gap-3">
							<StickerPopButton
								title={t("create.shareSheet")}
								icon="share-outline"
								onPress={handleShareSheet}
							/>
							<StickerPopButton
								title={t("create.sendWhatsApp")}
								icon="logo-whatsapp"
								variant="whatsapp"
								onPress={handleShareSheetToWhatsApp}
							/>
							<StickerPopButton
								title={
									isExporting
										? t("whatsapp.exporting")
										: t("whatsapp.exportPack")
								}
								icon="albums-outline"
								variant="dark"
								loading={isExporting}
								onPress={handleExportPack}
							/>
							<Text className="text-center font-poppins-regular text-gray-500 text-xs">
								{t("whatsapp.howTo")}
							</Text>
						</View>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}
