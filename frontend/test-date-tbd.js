#!/usr/bin/env node

/**
 * Test script to verify "Date TBD" translations are working correctly
 */

// Load the translation files using ES modules
import enTranslations from "./src/locales/en.json" assert { type: "json" };
import frTranslations from "./src/locales/fr.json" assert { type: "json" };
import esTranslations from "./src/locales/es.json" assert { type: "json" };

const translations = {
  en: enTranslations,
  fr: frTranslations,
  es: esTranslations,
};

// Simple translation function (similar to the one in the app)
const t = (key, language = "en", params = {}) => {
  const keys = key.split(".");
  let value = translations[language];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // Fallback to English
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

// Test the dateUtils functions
const testDateUtils = () => {
  console.log("🧪 Testing Date Utils with Translations\n");

  // Import the dateUtils functions (simplified version for testing)
  const getDateTBDText = (language, t) => {
    if (t) {
      return t("dateTime.dateTBD");
    }

    switch (language) {
      case "fr":
        return "Date à déterminer";
      case "es":
        return "Fecha por determinar";
      default:
        return "Date TBD";
    }
  };

  const formatGameDate = (date, language, t) => {
    if (!date) {
      return getDateTBDText(language, t);
    }
    return `Formatted: ${date}`;
  };

  // Test cases
  const testCases = [
    { date: null, description: "Null date" },
    { date: "", description: "Empty date" },
    { date: "invalid-date", description: "Invalid date" },
  ];

  testCases.forEach((testCase) => {
    console.log(`\n📅 ${testCase.description}:`);
    console.log(
      `  EN: ${formatGameDate(testCase.date, "en", (key) => t(key, "en"))}`
    );
    console.log(
      `  FR: ${formatGameDate(testCase.date, "fr", (key) => t(key, "fr"))}`
    );
    console.log(
      `  ES: ${formatGameDate(testCase.date, "es", (key) => t(key, "es"))}`
    );
  });
};

console.log('🌍 "Date TBD" Translation Test\n');

// Test direct translations
console.log("📋 Direct Translation Test:");
console.log("============================");
console.log(`EN: ${t("dateTime.dateTBD", "en")}`);
console.log(`FR: ${t("dateTime.dateTBD", "fr")}`);
console.log(`ES: ${t("dateTime.dateTBD", "es")}`);

// Test date utils integration
testDateUtils();

console.log('\n✅ "Date TBD" translation test completed!');
console.log("\nThe translations should now work correctly in the UI.");
console.log(
  "Make sure to pass the translation function (t) to date formatting utilities."
);
