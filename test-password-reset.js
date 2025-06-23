const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";

async function testPasswordReset() {
  try {
    console.log("Testing password reset functionality...\n");

    // Step 1: Request password reset
    console.log("1. Requesting password reset...");
    const resetRequestResponse = await axios.post(
      `${API_BASE_URL}/auth/request-password-reset`,
      {
        email: "test@example.com",
      }
    );

    console.log("✅ Password reset request successful");
    console.log("Response:", resetRequestResponse.data);
    console.log("");

    // Step 2: Test with invalid token (should fail)
    console.log("2. Testing with invalid token...");
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token: "invalid-token",
        password: "newpassword123",
      });
      console.log("❌ Should have failed with invalid token");
    } catch (error) {
      console.log("✅ Correctly rejected invalid token");
      console.log("Error:", error.response?.data?.message);
    }
    console.log("");

    console.log("🎉 Password reset functionality is working!");
    console.log(
      "Note: Check your email for the actual reset link to test the complete flow."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

// Check if backend is running
async function checkBackendHealth() {
  try {
    await axios.get(`${API_BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log("Checking if backend is running...");
  const isBackendRunning = await checkBackendHealth();

  if (!isBackendRunning) {
    console.error(
      "❌ Backend is not running. Please start the backend server first."
    );
    console.log("Run: cd backend && npm run dev");
    process.exit(1);
  }

  console.log("✅ Backend is running\n");
  await testPasswordReset();
}

main();
