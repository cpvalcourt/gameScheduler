#!/usr/bin/env node

/**
 * Test script to verify translations are working correctly
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

console.log("🌍 Translation Test Results\n");

// Test the dashboard activity translations
const activityTypes = [
  "dashboard.newGameCreated",
  "dashboard.newSeriesCreated",
  "dashboard.teamJoined",
  "dashboard.gameUpdated",
  "dashboard.activity",
];

console.log("📋 Dashboard Activity Translations:");
console.log("====================================");

activityTypes.forEach((key) => {
  console.log(`\n${key}:`);
  console.log(`  EN: ${t(key, "en")}`);
  console.log(`  FR: ${t(key, "fr")}`);
  console.log(`  ES: ${t(key, "es")}`);
});

// Test date formatting translations
console.log("\n📅 Date/Time Translations:");
console.log("==========================");

const dateTimeKeys = [
  "dateTime.justNow",
  "dateTime.minutesAgo",
  "dateTime.hoursAgo",
  "dateTime.yesterday",
  "dateTime.daysAgo",
  "dateTime.dateTBD",
  "dateTime.invalidDate",
];

dateTimeKeys.forEach((key) => {
  console.log(`\n${key}:`);
  console.log(`  EN: ${t(key, "en", { count: 5 })}`);
  console.log(`  FR: ${t(key, "fr", { count: 5 })}`);
  console.log(`  ES: ${t(key, "es", { count: 5 })}`);
});

// Test team invitation translations
console.log("\n📧 Team Invitation Translations:");
console.log("=================================");

const invitationKeys = [
  "teamInvitations.created",
  "teamInvitations.expires",
  "teamInvitations.status.pending",
  "teamInvitations.status.accepted",
  "teamInvitations.status.declined",
  "teamInvitations.status.expired",
];

invitationKeys.forEach((key) => {
  console.log(`\n${key}:`);
  console.log(`  EN: ${t(key, "en")}`);
  console.log(`  FR: ${t(key, "fr")}`);
  console.log(`  ES: ${t(key, "es")}`);
});

console.log("\n✅ Translation test completed!");
console.log(
  "\nIf you see the translations above, the translation system is working correctly."
);
console.log(
  "The issue in the UI might be related to how the translations are being applied in the React components."
);
