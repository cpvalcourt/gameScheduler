/**
 * Test script to verify login flow and avatar logic
 * Run this in the browser console after logging in
 */

console.log("🔍 LOGIN FLOW & AVATAR TEST");
console.log("=".repeat(50));

// Test the avatar logic function
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

// Check current state
console.log("1. CURRENT STATE CHECK");
console.log("-".repeat(30));

const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

console.log("Token exists:", !!token);
console.log("User data exists:", !!userData);

if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log("Parsed user data:", user);
    console.log("User email:", user.email);
    console.log("User username:", user.username);

    const expectedInitial = getAvatarInitial(user);
    console.log("Expected avatar initial:", expectedInitial);
  } catch (error) {
    console.error("Error parsing user data:", error);
  }
}

// Check what's currently displayed
console.log("\n2. CURRENT DISPLAY CHECK");
console.log("-".repeat(30));

const navAvatar = document.querySelector(
  '[role="button"][aria-haspopup="true"]'
);
if (navAvatar) {
  const navInitial = navAvatar.textContent?.trim();
  console.log("Navigation avatar shows:", navInitial);
} else {
  console.log("Navigation avatar not found");
}

// Test login flow simulation
console.log("\n3. LOGIN FLOW SIMULATION");
console.log("-".repeat(30));

const testUser = {
  email: "cpvalcourt@gmail.com",
  username: "cpvalcourt",
  is_verified: true,
  role: "admin",
};

console.log("Test user data:", testUser);
const testInitial = getAvatarInitial(testUser);
console.log("Test user should show initial:", testInitial);

// Check if this matches what we expect
if (testInitial === "C") {
  console.log("✅ Avatar logic is working correctly");
} else {
  console.log("❌ Avatar logic is not working correctly");
}

console.log("\n" + "=".repeat(50));
console.log("Test complete! Check the output above.");
