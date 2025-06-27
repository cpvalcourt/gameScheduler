#!/usr/bin/env node

/**
 * Test script to demonstrate date formatting differences between locales
 */

// Sample date for testing
const testDate = new Date("2024-06-24T15:30:00Z");

console.log("🌍 Date Formatting Examples by Locale\n");

// English (US) formatting
console.log("🇺🇸 English (US):");
console.log(
  `  Short date: ${testDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`
);
console.log(
  `  Full date: ${testDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}`
);
console.log(
  `  With time: ${testDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`
);
console.log();

// French formatting
console.log("🇫🇷 French:");
console.log(
  `  Short date: ${testDate.toLocaleDateString("fr-FR", {
    month: "short",
    day: "numeric",
  })}`
);
console.log(
  `  Full date: ${testDate.toLocaleDateString("fr-FR", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}`
);
console.log(
  `  With time: ${testDate.toLocaleDateString("fr-FR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`
);
console.log();

// Spanish formatting
console.log("🇪🇸 Spanish:");
console.log(
  `  Short date: ${testDate.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  })}`
);
console.log(
  `  Full date: ${testDate.toLocaleDateString("es-ES", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}`
);
console.log(
  `  With time: ${testDate.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`
);
console.log();

// Different date examples
console.log("📅 Different Date Examples:\n");

const dates = [
  new Date("2024-01-15"),
  new Date("2024-03-08"),
  new Date("2024-12-25"),
];

dates.forEach((date) => {
  console.log(`Date: ${date.toISOString().split("T")[0]}`);
  console.log(
    `  EN: ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`
  );
  console.log(
    `  FR: ${date.toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
    })}`
  );
  console.log(
    `  ES: ${date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    })}`
  );
  console.log();
});

console.log("✨ Key Differences:");
console.log('• English: "Jun 24" format');
console.log('• French: "24 juin" format (day first)');
console.log('• Spanish: "24 jun" format (day first)');
console.log();
console.log(
  "This demonstrates why proper locale-aware date formatting is important!"
);
