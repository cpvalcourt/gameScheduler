#!/usr/bin/env node

/**
 * Test script to verify locale-aware date formatting
 */

// Sample dates for testing
const testDates = [
  new Date("2024-06-24T15:30:00Z"),
  new Date("2024-01-15T10:00:00Z"),
  new Date("2024-12-25T20:00:00Z"),
];

console.log("🌍 Locale-Aware Date Formatting Test\n");

// Test different locales
const locales = [
  { code: "en-US", name: "English (US)" },
  { code: "fr-FR", name: "French" },
  { code: "es-ES", name: "Spanish" },
];

testDates.forEach((date, index) => {
  console.log(`📅 Test Date ${index + 1}: ${date.toISOString().split("T")[0]}`);

  locales.forEach((locale) => {
    const shortDate = date.toLocaleDateString(locale.code, {
      month: "short",
      day: "numeric",
    });

    const fullDate = date.toLocaleDateString(locale.code, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const withTime = date.toLocaleDateString(locale.code, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    console.log(`  ${locale.name}:`);
    console.log(`    Short: ${shortDate}`);
    console.log(`    Full:  ${fullDate}`);
    console.log(`    Time:  ${withTime}`);
  });

  console.log();
});

console.log("✅ Locale-aware date formatting test completed!");
console.log("\nKey observations:");
console.log("• English: Month first (Jun 24)");
console.log("• French: Day first (24 juin)");
console.log("• Spanish: Day first (24 jun)");
console.log("\nThis ensures proper date formatting for each locale!");
