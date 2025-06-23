const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";
const FRONTEND_URL = "http://localhost:5173";

async function testI18nFunctionality() {
  try {
    console.log("Testing i18n functionality...\n");

    // Step 1: Check if frontend is running
    console.log("1. Checking if frontend is running...");
    try {
      const frontendResponse = await axios.get(FRONTEND_URL);
      console.log("✅ Frontend is running\n");
    } catch (error) {
      console.error("❌ Frontend is not running");
      return;
    }

    // Step 2: Check if backend is running
    console.log("2. Checking if backend is running...");
    try {
      const backendResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log("✅ Backend is running\n");
    } catch (error) {
      console.error("❌ Backend is not running");
      return;
    }

    // Step 3: Test login to access profile page
    console.log("3. Testing login to access profile page...");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "test@example.com",
      password: "password123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful\n");

    // Step 4: Test profile page access
    console.log("4. Testing profile page access...");
    const profileResponse = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ Profile access successful");
    console.log("User data:", profileResponse.data);
    console.log("");

    console.log("🎉 i18n system is ready for testing!");
    console.log("📝 Manual testing steps:");
    console.log("1. Open http://localhost:5173 in your browser");
    console.log("2. Login with test@example.com / password123");
    console.log("3. Navigate to the Profile page");
    console.log("4. Look for the language switcher dropdown");
    console.log("5. Try switching between English and Spanish");
    console.log("6. Verify that the text changes accordingly");
    console.log("");
    console.log("🔧 If you see any issues:");
    console.log("- Check browser console for errors");
    console.log("- Verify that the language switcher appears");
    console.log("- Check that translations are working");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

testI18nFunctionality();
