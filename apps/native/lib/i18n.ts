import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";

/** Spanish, always (explicit product decision) — English strings exist for a future toggle. */
const LANGUAGE = "es";

if (!i18n.isInitialized) {
	i18n.use(initReactI18next).init({
		resources: {
			es: { translation: es },
			en: { translation: en },
		},
		lng: LANGUAGE,
		fallbackLng: "es",
		interpolation: { escapeValue: false },
	});
}

/** Translated display label for an emotion key (keys stay English for the API). */
export function emotionLabel(emotionKey: string): string {
	return i18n.t(`emotions.${emotionKey.toLowerCase()}`, {
		defaultValue: emotionKey,
	});
}

export default i18n;
