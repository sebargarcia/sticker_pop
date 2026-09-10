import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";

export type AppLanguage = "es" | "en";

const LANGUAGE_KEY = "stickerpop.language";

/** Spanish, always (explicit product decision) — English strings exist for a future toggle. */
function deviceLanguage(): AppLanguage {
	return "es";
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: deviceLanguage(),
    fallbackLng: "es",
    interpolation: { escapeValue: false },
  });
}

/** Switch language at runtime (persists for next launch; wire to a settings UI). */
export async function setAppLanguage(lng: AppLanguage): Promise<void> {
  await i18n.changeLanguage(lng);
  await AsyncStorage.setItem(LANGUAGE_KEY, lng);
}

/** Applies the saved language, if the user picked one before. */
export async function loadSavedLanguage(): Promise<void> {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (saved === "es" || saved === "en") {
    await i18n.changeLanguage(saved);
  }
}

/** Translated display label for an emotion key (keys stay English for the API). */
export function emotionLabel(emotionKey: string): string {
  return i18n.t(`emotions.${emotionKey.toLowerCase()}`, { defaultValue: emotionKey });
}

export default i18n;
