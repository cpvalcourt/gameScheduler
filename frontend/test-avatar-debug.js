/**
 * Comprehensive Avatar Debug Script
 * Run this in the browser console to debug avatar inconsistency
 */

console.log("🔍 COMPREHENSIVE AVATAR DEBUG");
console.log("=".repeat(60));

// 1. Check localStorage data
console.log("1. LOCALSTORAGE CHECK");
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
    console.log("User name:", user.name);
  } catch (error) {
    console.error("Error parsing user data:", error);
  }
}

// 2. Test avatar logic
console.log("\n2. AVATAR LOGIC TEST");
console.log("-".repeat(30));

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

if (userData) {
  try {
    const user = JSON.parse(userData);
    const expectedInitial = getAvatarInitial(user);
    console.log("Expected avatar initial:", expectedInitial);

    // Test step by step
    if (user.email) {
      const emailName = user.email.split("@")[0];
      console.log("Email before @:", emailName);
      console.log("Starts with letter:", /^[a-zA-Z]/.test(emailName));
      if (/^[a-zA-Z]/.test(emailName)) {
        console.log("Using email initial:", emailName.charAt(0).toUpperCase());
      }
    }

    if (user.username) {
      console.log("Username initial:", user.username.charAt(0).toUpperCase());
    }
  } catch (error) {
    console.error("Error testing avatar logic:", error);
  }
}

// 3. Check current page avatars
console.log("\n3. CURRENT PAGE AVATARS");
console.log("-".repeat(30));

// Find all avatars on the page
const allAvatars = document.querySelectorAll(".MuiAvatar-root");
console.log("Total avatars found:", allAvatars.length);

allAvatars.forEach((avatar, index) => {
  const avatarText = avatar.textContent?.trim();
  const avatarSrc = avatar.getAttribute("src");
  const avatarRole = avatar.getAttribute("role");
  const avatarAriaLabel = avatar.getAttribute("aria-label");

  console.log(`Avatar ${index + 1}:`);
  console.log(`  Text: "${avatarText}"`);
  console.log(`  Src: ${avatarSrc || "none"}`);
  console.log(`  Role: ${avatarRole || "none"}`);
  console.log(`  Aria-label: ${avatarAriaLabel || "none"}`);
  console.log(`  Classes: ${avatar.className}`);
  console.log("");
});

// 4. Check specific navigation avatar
console.log("4. NAVIGATION AVATAR CHECK");
console.log("-".repeat(30));

const navAvatar = document.querySelector(
  '[role="button"][aria-haspopup="true"]'
);
if (navAvatar) {
  const navInitial = navAvatar.textContent?.trim();
  console.log("Navigation avatar text:", navInitial);
  console.log("Navigation avatar element:", navAvatar);
} else {
  console.log("Navigation avatar not found");
}

// 5. Check profile page avatar
console.log("\n5. PROFILE PAGE AVATAR CHECK");
console.log("-".repeat(30));

const profileAvatars = document.querySelectorAll(".MuiAvatar-root");
const largeAvatars = Array.from(profileAvatars).filter((avatar) => {
  const style = window.getComputedStyle(avatar);
  const width = parseInt(style.width);
  return width > 50; // Profile avatars are typically larger
});

console.log("Large avatars (potential profile avatars):", largeAvatars.length);
largeAvatars.forEach((avatar, index) => {
  const avatarText = avatar.textContent?.trim();
  const avatarSrc = avatar.getAttribute("src");
  console.log(
    `Large avatar ${index + 1}: "${avatarText}" (src: ${avatarSrc || "none"})`
  );
});

// 6. Check AuthContext state
console.log("\n6. AUTH CONTEXT CHECK");
console.log("-".repeat(30));

// Try to access React context (this might not work in console)
try {
  // This is a bit of a hack to try to get React context
  const reactRoot = document.querySelector("#root");
  if (reactRoot && reactRoot._reactInternalFiber) {
    console.log("React root found, but context access limited in console");
  } else {
    console.log("React root not accessible from console");
  }
} catch (error) {
  console.log("Cannot access React context from console");
}

// 7. Recommendations
console.log("\n7. RECOMMENDATIONS");
console.log("-".repeat(30));

console.log("If avatars are inconsistent:");
console.log("1. Clear browser cache and localStorage");
console.log("2. Log out and log back in");
console.log("3. Check if you're on the right page");
console.log("4. Refresh the page");
console.log("5. Check browser console for errors");

console.log("\n" + "=".repeat(60));
console.log("Debug complete! Check the output above for clues.");
