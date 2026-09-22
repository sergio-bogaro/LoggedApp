import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "pt-BR"],
    load: "currentOnly",
    debug: false,
    ns: ["common", "themes", "welcome", "media", "auth", "onboarding"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      convertDetectedLanguage: (lng) =>
        lng.toLowerCase().startsWith("pt") ? "pt-BR" : lng,
      caches: ["localStorage"],
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

const applyDocumentLanguage = (lng: string) => {
  document.documentElement.lang = lng.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
};

i18n.on("languageChanged", applyDocumentLanguage);
applyDocumentLanguage(i18n.resolvedLanguage ?? i18n.language ?? "en");

export default i18n;
