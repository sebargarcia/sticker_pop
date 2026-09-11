import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { cn } from "heroui-native";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StickerPopColors } from "@/lib/theme";

const TAB_BAR_HEIGHT = 84;
const TAB_BAR_PADDING_BOTTOM = 20;

export default function TabLayout() {
	const { t } = useTranslation();
	// Edge-to-edge is enforced on Android 15+: the tab bar draws behind the
	// system navigation bar. The navigator's default inset padding is applied
	// before our custom tabBarStyle, so the static values below would wipe it
	// out — extend height + bottom padding by the live inset instead.
	const insets = useSafeAreaInsets();
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarActiveTintColor: StickerPopColors.navy,
				tabBarInactiveTintColor: "#8A8F98",
				tabBarStyle: {
					...styles.tabBar,
					height: TAB_BAR_HEIGHT + insets.bottom,
					paddingBottom: TAB_BAR_PADDING_BOTTOM + insets.bottom,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: t("tabs.home"),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="create"
				options={{
					title: t("tabs.create"),
					tabBarIcon: ({ color, focused }) => (
						<View
							className={cn(
								"-mb-3 h-14 w-14 items-center justify-center rounded-full border-[3px] shadow",
								focused
									? "border-pop-navy bg-pop-yellow"
									: "border-pop-yellow bg-pop-navy",
							)}
						>
							<Ionicons
								name="sparkles"
								size={26}
								color={focused ? StickerPopColors.navy : "#fff"}
							/>
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name="my-stickers"
				options={{
					title: t("tabs.myStickers"),
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="grid" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}

/**
 * StyleSheet remains ONLY for React Navigation's tabBarStyle, which requires
 * a plain style object and cannot take className. Everything else in this
 * file uses Uniwind className.
 * Exception: height/paddingBottom are merged dynamically above so the tab bar
 * clears the Android system navigation bar (static values can't read insets).
 * Titles are kept for accessibility; visible labels are off (tabBarShowLabel).
 */
const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: "#fff",
		borderTopWidth: 2,
		borderTopColor: StickerPopColors.navy,
		height: 84,
		paddingBottom: 20,
		paddingTop: 8,
	},
});
