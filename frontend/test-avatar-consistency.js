/**
 * Test script to verify avatar initial consistency
 * Run with: node test-avatar-consistency.js
 */

// Mock the avatar utility function
const getAvatarInitial = (user) => {
  if (!user) return "U";

  // Try to extract a display name from email first
  if (user.email) {
    const emailName = user.email.split("@")[0];

    // If email name looks like a name (starts with letter, reasonable length)
    if (emailName && emailName.length > 0 && /^[a-zA-Z]/.test(emailName)) {
      return emailName.charAt(0).toUpperCase();
    }
  }

  // Fallback to username
  if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }

  // Fallback to name
  if (user.name) {
    return user.name.charAt(0).toUpperCase();
  }

  // Final fallback
  return "U";
};

// Test cases
const testCases = [
  {
    name: "User with email cpvalcourt@gmail.com",
    user: { email: "cpvalcourt@gmail.com", username: "user123" },
    expected: "C",
  },
  {
    name: "User with email only",
    user: { email: "john.doe@example.com" },
    expected: "J",
  },
  {
    name: "User with username only",
    user: { username: "alice" },
    expected: "A",
  },
  {
    name: "User with name only",
    user: { name: "Bob Smith" },
    expected: "B",
  },
  {
    name: "User with email starting with number",
    user: { email: "123user@example.com", username: "testuser" },
    expected: "T",
  },
  {
    name: "User with no valid data",
    user: {},
    expected: "U",
  },
  {
    name: "No user data",
    user: null,
    expected: "U",
  },
];

console.log("Testing Avatar Initial Consistency\n");
console.log("=".repeat(50));

let allPassed = true;

testCases.forEach((testCase, index) => {
  const result = getAvatarInitial(testCase.user);
  const passed = result === testCase.expected;

  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Input:`, testCase.user);
  console.log(`  Expected: "${testCase.expected}"`);
  console.log(`  Got: "${result}"`);
  console.log(`  Status: ${passed ? "✅ PASS" : "❌ FAIL"}`);
  console.log("");

  if (!passed) {
    allPassed = false;
  }
});

console.log("=".repeat(50));
console.log(
  `Overall Result: ${
    allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"
  }`
);

// Test the specific case from the user
console.log("\n" + "=".repeat(50));
console.log("SPECIFIC USER CASE TEST");
console.log("=".repeat(50));

const userData = { email: "cpvalcourt@gmail.com", username: "user123" };
const initial = getAvatarInitial(userData);
console.log(`User data:`, userData);
console.log(`Extracted initial: "${initial}"`);
console.log(`Expected: "C"`);
console.log(`Result: ${initial === "C" ? "✅ CORRECT" : "❌ INCORRECT"}`);

if (initial !== "C") {
  console.log("\n🔍 DEBUGGING INFO:");
  console.log(`Email: "${userData.email}"`);
  console.log(`Email before @: "${userData.email.split("@")[0]}"`);
  console.log(
    `Starts with letter: ${/^[a-zA-Z]/.test(userData.email.split("@")[0])}`
  );
  console.log(`Username: "${userData.username}"`);
}
