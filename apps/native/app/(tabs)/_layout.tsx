import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { cn } from "heroui-native";

import { StickerPopColors } from "@/lib/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: StickerPopColors.navy,
        tabBarInactiveTintColor: "#8A8F98",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={cn(
                "w-14 h-14 rounded-full items-center justify-center -mb-3 border-[3px] shadow",
                focused ? "bg-pop-yellow border-pop-navy" : "bg-pop-navy border-pop-yellow",
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
          title: "My Stickers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

/**
 * StyleSheet remains ONLY for React Navigation's tabBarStyle/tabBarLabelStyle,
 * which require plain style objects and cannot take className.
 * Everything else in this file uses Uniwind className.
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
  tabLabel: {
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
  },
});
