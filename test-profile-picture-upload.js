const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_BASE_URL = "http://localhost:3002/api";

async function testProfilePictureUpload() {
  try {
    console.log("Testing profile picture upload functionality...\n");

    // Step 1: Login to get a token
    console.log("1. Logging in...");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "test@example.com",
      password: "password123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful\n");

    // Step 2: Test profile picture upload
    console.log("2. Testing profile picture upload...");

    // Create a simple test image using a data URL approach
    // This creates a 1x1 pixel transparent PNG
    const testImageDataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    // Convert data URL to buffer
    const base64Data = testImageDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const testImageBuffer = Buffer.from(base64Data, "base64");

    const formData = new FormData();
    formData.append("image", testImageBuffer, {
      filename: "test.png",
      contentType: "image/png",
    });

    const uploadResponse = await axios.post(
      `${API_BASE_URL}/users/profile-picture`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    console.log("✅ Profile picture upload successful");
    console.log("Response:", uploadResponse.data);
    console.log(
      "Profile picture URL:",
      uploadResponse.data.user.profile_picture_url
    );
    console.log("");

    // Step 3: Test profile picture deletion
    console.log("3. Testing profile picture deletion...");

    const deleteResponse = await axios.delete(
      `${API_BASE_URL}/users/profile-picture`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Profile picture deletion successful");
    console.log("Response:", deleteResponse.data);
    console.log("");

    // Step 4: Verify user profile still exists
    console.log("4. Verifying user profile...");

    const userResponse = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ User profile verification successful");
    console.log("User data:", userResponse.data);
    console.log("");

    console.log("🎉 All profile picture upload tests passed!");
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
  await testProfilePictureUpload();
}

main();
