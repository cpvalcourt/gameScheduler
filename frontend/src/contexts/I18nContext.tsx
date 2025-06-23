import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import enTranslations from "../locales/en.json";
import esTranslations from "../locales/es.json";
import frTranslations from "../locales/fr.json";

const translations = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
};

type Language = "en" | "es" | "fr";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState("en" as Language);

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem("language") as Language;
    if (
      savedLanguage &&
      (savedLanguage === "en" ||
        savedLanguage === "es" ||
        savedLanguage === "fr")
    ) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return the key if translation not found
          }
        }
        break;
      }
    }

    let result = typeof value === "string" ? value : key;

    // Handle string interpolation
    if (params && typeof result === "string") {
      Object.keys(params).forEach((paramKey) => {
        const regex = new RegExp(`\\{${paramKey}\\}`, "g");
        result = result.replace(regex, String(params[paramKey]));
      });
    }

    return result;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
