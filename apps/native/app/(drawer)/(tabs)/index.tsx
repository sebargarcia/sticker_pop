import { useRouter } from "expo-router";
import { Image, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StickerPopButton } from "@/components/sticker-pop-button";
import { STICKER_STYLES, STICKERPOP_LOGO } from "@/lib/sticker-styles";
import { StickerPopCopy } from "@/lib/theme";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-pop-bg"
      contentContainerStyle={{ padding: 20, paddingBottom: 32, paddingTop: insets.top + 16 }}
    >
      <View className="bg-white rounded-[28px] border-2 border-pop-navy p-6 items-center shadow">
        <Image source={STICKERPOP_LOGO} className="w-[200px] h-[120px]" resizeMode="contain" />
        <Text className="mt-2 text-[26px] leading-8 font-poppins-black text-pop-navy text-center">
          {StickerPopCopy.tagline}
        </Text>
        <Text className="mt-2 text-[15px] text-gray-500 text-center font-poppins-semibold">
          {StickerPopCopy.subtagline}
        </Text>
        <StickerPopButton
          title="Create Sticker"
          icon="sparkles"
          onPress={() => router.push("/(drawer)/(tabs)/create")}
          className="mt-[18px] w-full"
        />
      </View>

      <Text className="mt-6 mb-3 text-xl font-poppins-extrabold text-pop-navy">
        Popular Stickers
      </Text>
      <View className="flex-row flex-wrap -mx-1.5">
        {STICKER_STYLES.slice(0, 8).map((style) => (
          <View key={style.id} className="w-1/4 p-1.5">
            <Image
              source={style.image}
              className="w-full aspect-square rounded-[20px] bg-white border-[3px] border-white"
              resizeMode="contain"
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
