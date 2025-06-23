const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";

async function testAdminFunctionality() {
  try {
    console.log("Testing admin functionality...\n");

    // Step 1: Login as admin
    console.log("1. Logging in as admin...");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "admin@example.com",
      password: "admin123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Admin login successful\n");

    // Step 2: Test getting users
    console.log("2. Testing get users...");
    const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Get users successful");
    console.log(`Found ${usersResponse.data.users.length} users`);
    console.log("");

    // Step 3: Test getting user stats
    console.log("3. Testing get user stats...");
    const statsResponse = await axios.get(`${API_BASE_URL}/admin/users/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Get stats successful");
    console.log("Stats:", statsResponse.data);
    console.log("");

    // Step 4: Test getting a specific user
    if (usersResponse.data.users.length > 0) {
      const firstUser = usersResponse.data.users[0];
      console.log("4. Testing get user by ID...");
      const userResponse = await axios.get(
        `${API_BASE_URL}/admin/users/${firstUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Get user by ID successful");
      console.log("User:", userResponse.data);
      console.log("");

      // Step 5: Test updating user role (if not admin)
      if (firstUser.role !== "admin") {
        console.log("5. Testing update user role...");
        const updateRoleResponse = await axios.patch(
          `${API_BASE_URL}/admin/users/${firstUser.id}/role`,
          { role: "moderator" },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("✅ Update user role successful");
        console.log("Response:", updateRoleResponse.data);
        console.log("");

        // Step 6: Test updating admin notes
        console.log("6. Testing update admin notes...");
        const updateNotesResponse = await axios.patch(
          `${API_BASE_URL}/admin/users/${firstUser.id}/notes`,
          { notes: "Test admin note from script" },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("✅ Update admin notes successful");
        console.log("Response:", updateNotesResponse.data);
        console.log("");

        // Step 7: Test bulk operations
        console.log("7. Testing bulk operations...");
        const bulkResponse = await axios.post(
          `${API_BASE_URL}/admin/users/bulk/roles`,
          {
            userIds: [firstUser.id],
            role: "user",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("✅ Bulk update roles successful");
        console.log("Response:", bulkResponse.data);
        console.log("");
      }
    }

    console.log("🎉 All admin functionality tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.error(
        "Access denied - make sure you're logged in as an admin user"
      );
    }
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
  await testAdminFunctionality();
}

main();
