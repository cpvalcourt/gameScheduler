#!/usr/bin/env node

/**
 * Test script for Avatar initials logic
 * This script tests the logic for displaying user-friendly initials in the avatar
 */

console.log("👤 Testing Avatar Initials Logic");
console.log("===============================\n");

// Test cases
const testUsers = [
  { email: "cpvalcourt@gmail.com", username: "cpvalcourt", expected: "C" },
  { email: "john.doe@example.com", username: "johndoe", expected: "J" },
  { email: "sarah_smith@company.com", username: "sarahsmith", expected: "S" },
  { email: "mike123@test.com", username: "mike123", expected: "M" },
  { email: "user@domain.com", username: "user", expected: "U" },
  { email: "test@example.com", username: "testuser", expected: "T" },
  { email: "admin@company.org", username: "admin", expected: "A" },
  { email: "123user@test.com", username: "user123", expected: "U" }, // Falls back to username
  { email: "", username: "testuser", expected: "T" },
  { email: null, username: "testuser", expected: "T" },
  { email: "cpvalcourt@gmail.com", username: "", expected: "C" },
  { email: "cpvalcourt@gmail.com", username: null, expected: "C" },
];

// Function to get avatar initial (same logic as in NavigationHeader)
const getAvatarInitial = (user) => {
  // Try to extract a display name from email first
  if (user?.email) {
    const emailName = user.email.split("@")[0];
    // If email name looks like a name (starts with letter, reasonable length)
    if (emailName && emailName.length > 0 && /^[a-zA-Z]/.test(emailName)) {
      return emailName.charAt(0).toUpperCase();
    }
  }
  // Fallback to username
  return user?.username?.charAt(0).toUpperCase() || "U";
};

console.log("✅ Testing Avatar Initial Logic:");
console.log(
  "   | Email                    | Username   | Expected | Actual | Match |"
);
console.log(
  "   |--------------------------|------------|----------|--------|-------|"
);

testUsers.forEach((testCase, index) => {
  const actual = getAvatarInitial(testCase);
  const match = actual === testCase.expected ? "✅" : "❌";
  const email = testCase.email || "(empty)";
  const username = testCase.username || "(empty)";

  console.log(
    `   | ${email.padEnd(24)} | ${username.padEnd(
      10
    )} | ${testCase.expected.padEnd(8)} | ${actual.padEnd(6)} | ${match} |`
  );
});

console.log("\n🔧 Logic Explanation:");
console.log("   1. First tries to extract name from email (before @ symbol)");
console.log("   2. Checks if email name starts with a letter");
console.log("   3. Falls back to username if email extraction fails");
console.log('   4. Shows "U" as final fallback');

console.log("\n🎯 Benefits:");
console.log(
  '   - More user-friendly initials (e.g., "C" for cpvalcourt@gmail.com)'
);
console.log("   - Handles edge cases gracefully");
console.log("   - Maintains backward compatibility");

console.log("\n📋 Test Results Summary:");
const passed = testUsers.filter(
  (tc) => getAvatarInitial(tc) === tc.expected
).length;
const total = testUsers.length;
console.log(`   Passed: ${passed}/${total} tests`);

if (passed === total) {
  console.log(
    "✅ All tests passed! Avatar initials logic is working correctly."
  );
} else {
  console.log("❌ Some tests failed. Please review the logic.");
}
