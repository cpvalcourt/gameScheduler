#!/usr/bin/env node

/**
 * Debug script for avatar initials issue
 * This script helps troubleshoot why the avatar is showing "U" instead of "C"
 */

console.log("🔍 Debugging Avatar Initials Issue");
console.log("==================================\n");

console.log("📋 Debug Steps:");
console.log("1. Open your browser and navigate to the app");
console.log("2. Open Developer Tools (F12)");
console.log("3. Go to the Console tab");
console.log("4. Run the following commands one by one:\n");

console.log("🔍 Step 1: Check localStorage data");
console.log("Run this in the browser console:");
console.log('console.log("Token:", localStorage.getItem("token"));');
console.log(
  'console.log("User data:", JSON.parse(localStorage.getItem("user")));\n'
);

console.log("🔍 Step 2: Check user object from AuthContext");
console.log("Run this in the browser console:");
console.log(
  "// You can access this through React DevTools or by adding a console.log in the component"
);
console.log("// Look for the user object in the AuthContext\n");

console.log("🔍 Step 3: Test the avatar logic manually");
console.log("Run this in the browser console:");
console.log(`
const user = JSON.parse(localStorage.getItem('user'));
console.log('User object:', user);
console.log('Email:', user?.email);
console.log('Username:', user?.username);

if (user?.email) {
  const emailName = user.email.split('@')[0];
  console.log('Email name (before @):', emailName);
  console.log('Starts with letter:', /^[a-zA-Z]/.test(emailName));
  console.log('First letter:', emailName.charAt(0).toUpperCase());
} else {
  console.log('No email found in user data');
}

console.log('Username first letter:', user?.username?.charAt(0).toUpperCase());
`);

console.log("🔍 Step 4: Check if the component is re-rendering");
console.log("Add this to NavigationHeader.tsx temporarily:");
console.log(`
console.log('NavigationHeader render - User:', user);
console.log('NavigationHeader render - Email:', user?.email);
console.log('NavigationHeader render - Username:', user?.username);
`);

console.log("\n🎯 Expected Results:");
console.log("- Email should be: cpvalcourt@gmail.com");
console.log("- Email name should be: cpvalcourt");
console.log("- First letter should be: C");
console.log("- Avatar should show: C");

console.log("\n❓ Possible Issues:");
console.log("1. User data not loaded properly");
console.log("2. Email field missing from user object");
console.log("3. Component not re-rendering after user data loads");
console.log("4. Caching issue with the component");

console.log("\n🔧 Quick Fix to Try:");
console.log("1. Clear browser cache completely");
console.log("2. Log out and log back in");
console.log("3. Check if the user object has the email field");
console.log("4. Force a page refresh (Ctrl+Shift+R)");

console.log("\n📞 If the issue persists, please share:");
console.log("- The output from Step 1 (user data)");
console.log("- The output from Step 3 (avatar logic test)");
console.log("- Any console errors you see");
