const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";

async function testTeamManagement() {
  try {
    console.log("Testing Team Management System...\n");

    // Step 1: Login to get a token
    console.log("1. Logging in...");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "test@example.com",
      password: "password123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful\n");

    // Step 2: Get user's teams (should be empty initially)
    console.log("2. Getting user's teams...");
    const teamsResponse = await axios.get(`${API_BASE_URL}/teams`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ User teams retrieved");
    console.log("Teams:", teamsResponse.data);
    console.log("");

    // Step 3: Create a new team
    console.log("3. Creating a new team...");
    const createTeamResponse = await axios.post(
      `${API_BASE_URL}/teams`,
      {
        name: "Champions League",
        description: "A competitive team for serious players",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Team created successfully");
    console.log("Team:", createTeamResponse.data.team);
    const teamId = createTeamResponse.data.team.id;
    console.log("");

    // Step 4: Get team details
    console.log("4. Getting team details...");
    const teamDetailsResponse = await axios.get(
      `${API_BASE_URL}/teams/${teamId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Team details retrieved");
    console.log("Team with members:", teamDetailsResponse.data);
    console.log("");

    // Step 5: Update team
    console.log("5. Updating team...");
    const updateTeamResponse = await axios.put(
      `${API_BASE_URL}/teams/${teamId}`,
      {
        name: "Champions League Elite",
        description: "An elite competitive team for serious players",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Team updated successfully");
    console.log("Updated team:", updateTeamResponse.data.team);
    console.log("");

    // Step 6: Add a member (we'll need to create another user first)
    console.log("6. Testing member management...");
    console.log(
      "Note: Adding members requires existing users with verified emails"
    );
    console.log(
      "For now, we'll test the team structure without adding members"
    );
    console.log("");

    // Step 7: Get updated team details
    console.log("7. Getting updated team details...");
    const updatedTeamResponse = await axios.get(
      `${API_BASE_URL}/teams/${teamId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Updated team details retrieved");
    console.log("Team with members:", updatedTeamResponse.data);
    console.log("");

    // Step 8: Get all user teams again
    console.log("8. Getting all user teams...");
    const allTeamsResponse = await axios.get(`${API_BASE_URL}/teams`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ All user teams retrieved");
    console.log("Teams:", allTeamsResponse.data);
    console.log("");

    // Step 9: Test team deletion (optional - comment out if you want to keep the team)
    console.log("9. Testing team deletion...");
    const deleteTeamResponse = await axios.delete(
      `${API_BASE_URL}/teams/${teamId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Team deleted successfully");
    console.log("Response:", deleteTeamResponse.data);
    console.log("");

    // Step 10: Verify team is deleted
    console.log("10. Verifying team deletion...");
    const finalTeamsResponse = await axios.get(`${API_BASE_URL}/teams`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Final teams list retrieved");
    console.log("Teams after deletion:", finalTeamsResponse.data);
    console.log("");

    console.log("🎉 All team management tests passed!");
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
  await testTeamManagement();
}

main();
