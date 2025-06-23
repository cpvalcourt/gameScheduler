const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";

async function setupAdminUser() {
  try {
    console.log("Setting up admin user for testing...\n");

    // Step 1: Register admin user
    console.log("1. Registering admin user...");
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      first_name: "Admin",
      last_name: "User",
    });

    console.log("✅ Admin user registered successfully");
    console.log("User ID:", registerResponse.data.user.id);
    console.log("");

    // Step 2: Login to get token
    console.log("2. Logging in as admin...");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "admin@example.com",
      password: "admin123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful\n");

    // Step 3: Update user role to admin (you'll need to do this manually in the database)
    console.log("3. IMPORTANT: Manual step required!");
    console.log(
      "You need to manually update the user role to 'admin' in the database."
    );
    console.log("Run this SQL command in your database:");
    console.log(
      `UPDATE USERS SET role = 'admin' WHERE email = 'admin@example.com';`
    );
    console.log("");

    console.log("🎉 Admin user setup instructions completed!");
    console.log(
      "After updating the database, you can test admin functionality with:"
    );
    console.log("node test-admin-functionality.js");
  } catch (error) {
    if (error.response?.status === 409) {
      console.log("✅ Admin user already exists");
      console.log("You can proceed to test admin functionality with:");
      console.log("node test-admin-functionality.js");
    } else {
      console.error("❌ Setup failed:", error.response?.data || error.message);
      process.exit(1);
    }
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
  await setupAdminUser();
}

main();
