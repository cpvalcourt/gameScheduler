/**
 * Browser debug script for avatar consistency
 * Run this in the browser console to check current state
 */

console.log("🔍 AVATAR DEBUG - Browser Console");
console.log("=".repeat(50));

// Check localStorage
const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

console.log("Token exists:", !!token);
console.log("User data exists:", !!userData);

if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log("Parsed user data:", user);

    // Test our avatar logic
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

    const initial = getAvatarInitial(user);
    console.log("Expected avatar initial:", initial);

    // Check what's currently displayed
    const navAvatar = document.querySelector(
      '[role="button"][aria-haspopup="true"]'
    );
    if (navAvatar) {
      const navInitial = navAvatar.textContent?.trim();
      console.log("Navigation avatar shows:", navInitial);
      console.log(
        "Navigation avatar matches expected:",
        navInitial === initial
      );
    }

    // Check profile page avatar if on profile page
    const profileAvatars = document.querySelectorAll(".MuiAvatar-root");
    console.log("Found avatars on page:", profileAvatars.length);

    profileAvatars.forEach((avatar, index) => {
      const avatarText = avatar.textContent?.trim();
      console.log(`Avatar ${index + 1} shows: "${avatarText}"`);
    });
  } catch (error) {
    console.error("Error parsing user data:", error);
  }
} else {
  console.log("No user data found in localStorage");
}

console.log("=".repeat(50));
console.log("💡 TIPS:");
console.log("1. Clear browser cache and localStorage if needed");
console.log("2. Check if you're logged in");
console.log("3. Refresh the page after clearing cache");
console.log("4. Check both dashboard and profile page");
