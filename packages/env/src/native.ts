import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Dev-server default: the API host reachable from the runtime.
 * EXPO_OS is inlined by Expo CLI at bundle time ('android' | 'ios' | 'web').
 * - Android emulator runs behind its own NAT: the dev machine is 10.0.2.2.
 * - iOS simulator shares the Mac network: localhost works.
 * - Physical devices need the machine's LAN IP (set EXPO_PUBLIC_SERVER_URL).
 * v1 is local-only and never calls the server, so this default only needs
 * to be a valid URL — never leave the app unable to boot for lack of .env.
 */
const DEFAULT_SERVER_URL =
  process.env.EXPO_OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export const env = createEnv({
  clientPrefix: "EXPO_PUBLIC_",
	client: {
		EXPO_PUBLIC_SERVER_URL: z.url(),
		EXPO_PUBLIC_GEMINI_API_KEY: z.string().min(1).optional(),
		EXPO_PUBLIC_GEMINI_MODEL: z.string().min(1).optional(),
	},
	runtimeEnv: {
		EXPO_PUBLIC_SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL ?? DEFAULT_SERVER_URL,
		EXPO_PUBLIC_GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
		EXPO_PUBLIC_GEMINI_MODEL: process.env.EXPO_PUBLIC_GEMINI_MODEL,
	},
  emptyStringAsUndefined: true,
});
