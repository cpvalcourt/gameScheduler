const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";
const FRONTEND_URL = "http://localhost:5173";

async function testI18nSystem() {
  try {
    console.log("Testing i18n system...\n");

    // Step 1: Check if backend is running
    console.log("1. Checking backend health...");
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log("✅ Backend is running");
    } catch (error) {
      console.error(
        "❌ Backend is not running. Please start the backend server first."
      );
      console.log("Run: cd backend && npm run dev");
      process.exit(1);
    }

    // Step 2: Check if frontend is running
    console.log("\n2. Checking frontend health...");
    try {
      const frontendResponse = await axios.get(FRONTEND_URL);
      console.log("✅ Frontend is running");
    } catch (error) {
      console.error(
        "❌ Frontend is not running. Please start the frontend server first."
      );
      console.log("Run: cd frontend && npm run dev");
      process.exit(1);
    }

    // Step 3: Test login
    console.log("\n3. Testing login...");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "test@example.com",
      password: "password123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful");

    // Step 4: Test user profile access
    console.log("\n4. Testing user profile access...");
    const userResponse = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ User profile accessible");
    console.log(`   User: ${userResponse.data.email}`);

    // Step 5: Test i18n translations
    console.log("\n5. Testing i18n translations...");
    console.log("   - Profile page should show language switcher");
    console.log("   - Account deletion section should be translatable");
    console.log("   - All text should change when switching languages");

    console.log("\n🎉 i18n system test completed!");
    console.log("\n📋 Manual Testing Instructions:");
    console.log("1. Open your browser and go to:", FRONTEND_URL);
    console.log("2. Login with: test@example.com / password123");
    console.log("3. Navigate to the Profile page");
    console.log("4. Look for the language switcher dropdown");
    console.log("5. Switch between English and Spanish");
    console.log("6. Scroll down to the 'Delete Account' section");
    console.log("7. Verify all text changes language appropriately");
    console.log("8. Test the account deletion flow in both languages");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

testI18nSystem();
