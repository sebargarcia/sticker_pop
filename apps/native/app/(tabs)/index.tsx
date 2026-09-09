import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StickerPopButton } from "@/components/sticker-pop-button";
import { STICKERPOP_LOGO } from "@/lib/sticker-styles";
import { StickerPopCopy } from "@/lib/theme";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-pop-bg justify-center px-5"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="bg-white rounded-[28px] border-2 border-pop-navy p-6 items-center shadow">
        <Image source={STICKERPOP_LOGO} className="w-[200px] h-[120px]" resizeMode="contain" />
        <Text className="mt-2 text-[26px] leading-8 font-poppins-black text-pop-navy text-center">
          {StickerPopCopy.tagline}
        </Text>
        <Text className="mt-2 text-[15px] text-gray-500 text-center font-poppins-medium">
          {StickerPopCopy.subtagline}
        </Text>
        <StickerPopButton
          title="Create Sticker"
          icon="sparkles"
          onPress={() => router.push("/(tabs)/create")}
          className="mt-[18px] w-full"
        />
      </View>
    </View>
  );
}
