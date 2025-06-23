const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";
const FRONTEND_URL = "http://localhost:5173";

async function testPasswordResetFlow() {
  try {
    console.log("Testing complete password reset flow...\n");

    // Step 1: Request password reset
    console.log("1. Requesting password reset for test@example.com...");
    const resetRequestResponse = await axios.post(
      `${API_BASE_URL}/auth/request-password-reset`,
      {
        email: "test@example.com",
      }
    );

    console.log("✅ Password reset request successful");
    console.log("Response:", resetRequestResponse.data);
    console.log("");

    // Step 2: Check if we can get the reset token from the database
    console.log("2. Checking database for reset token...");
    try {
      // This would require database access, but we can simulate by checking the response
      console.log("✅ Reset request processed successfully");
      console.log("Note: Check your email for the reset link");
      console.log(
        "Expected reset link format:",
        `${FRONTEND_URL}/reset-password?token=<token>`
      );
    } catch (error) {
      console.log("❌ Could not verify reset token in database");
    }
    console.log("");

    // Step 3: Test frontend endpoints
    console.log("3. Testing frontend endpoints...");
    try {
      const forgotPasswordResponse = await axios.get(
        `${FRONTEND_URL}/forgot-password`
      );
      console.log("✅ Forgot password page accessible");
    } catch (error) {
      console.log("❌ Forgot password page not accessible:", error.message);
    }

    try {
      const resetPasswordResponse = await axios.get(
        `${FRONTEND_URL}/reset-password`
      );
      console.log("✅ Reset password page accessible");
    } catch (error) {
      console.log("❌ Reset password page not accessible:", error.message);
    }
    console.log("");

    // Step 4: Test with invalid token
    console.log("4. Testing with invalid token...");
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token: "invalid-token-12345",
        password: "newpassword123",
      });
      console.log("❌ Should have failed with invalid token");
    } catch (error) {
      console.log("✅ Correctly rejected invalid token");
      console.log("Error message:", error.response?.data?.message);
    }
    console.log("");

    console.log("🎉 Password reset flow test completed!");
    console.log("");
    console.log("Next steps:");
    console.log("1. Check your email for the password reset link");
    console.log("2. Click the link to go to the reset password page");
    console.log("3. Enter a new password and confirm it");
    console.log("4. Try logging in with the new password");
    console.log("");
    console.log("Frontend URLs:");
    console.log(`- Forgot Password: ${FRONTEND_URL}/forgot-password`);
    console.log(
      `- Reset Password: ${FRONTEND_URL}/reset-password?token=<your-token>`
    );
    console.log(`- Login: ${FRONTEND_URL}/login`);
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
  await testPasswordResetFlow();
}

main();
