import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import { ActivityIndicator, Pressable, Text } from "react-native";

interface Props {
	title: string;
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
	variant?: "primary" | "secondary" | "dark" | "whatsapp";
	icon?: keyof typeof Ionicons.glyphMap;
	className?: string;
}

export function StickerPopButton({
	title,
	onPress,
	disabled,
	loading,
	variant = "primary",
	icon,
	className,
}: Props) {
	const isDisabled = disabled || loading;
	// Keep the variant background while loading so the spinner stays visible;
	// only grey out a genuinely disabled (non-loading) button.
	const isVisuallyDisabled = disabled && !loading;
	const isLightText = variant === "dark" || variant === "whatsapp";
	return (
		<Pressable
			onPress={onPress}
			disabled={isDisabled}
			className={cn(
				"min-h-[54px] flex-row items-center justify-center rounded-full border-2 border-pop-navy px-7 py-3.5 active:scale-[0.97] active:opacity-90",
				variant === "primary" && "bg-pop-yellow",
				variant === "secondary" && "bg-white",
				variant === "dark" && "bg-pop-navy",
				variant === "whatsapp" && "bg-[#25D366]",
				isVisuallyDisabled && "border-[#C9CDD3] bg-[#F1F2F4]",
				className,
			)}
		>
			{loading ? (
				<ActivityIndicator color={isLightText ? "#fff" : "#0B1533"} />
			) : (
				<>
					{icon ? (
						<Ionicons
							name={icon}
							size={20}
							color={isLightText ? "#fff" : "#0B1533"}
							style={{ marginRight: 8 }}
						/>
					) : null}
					<Text
						className={cn(
							"font-poppins-semibold text-[17px] text-pop-navy",
							isLightText && "text-white",
							isVisuallyDisabled && "text-[#9AA0A8]",
						)}
					>
						{title}
					</Text>
				</>
			)}
		</Pressable>
	);
}
