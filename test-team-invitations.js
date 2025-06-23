const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";

async function testTeamInvitations() {
  try {
    console.log("Testing team invitation functionality...\n");

    // Step 1: Login as admin
    console.log("1. Logging in as admin...");
    const adminLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "admin@example.com",
      password: "admin123",
    });

    const adminToken = adminLoginResponse.data.token;
    console.log("✅ Admin login successful\n");

    // Step 2: Get teams
    console.log("2. Getting teams...");
    const teamsResponse = await axios.get(`${API_BASE_URL}/teams`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const teams = teamsResponse.data;
    let teamId;

    if (teams.length === 0) {
      console.log("❌ No teams found. Creating a test team...");

      const createTeamResponse = await axios.post(
        `${API_BASE_URL}/teams`,
        {
          name: "Test Team for Invitations",
          description: "A test team for invitation functionality",
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      teamId = createTeamResponse.data.team.id;
      console.log(`✅ Created test team with ID: ${teamId}\n`);
    } else {
      teamId = teams[0].id;
      console.log(`✅ Using existing team with ID: ${teamId}\n`);
    }

    // Step 3: Send invitation
    console.log("3. Sending team invitation...");
    const invitationResponse = await axios.post(
      `${API_BASE_URL}/team-invitations/send`,
      {
        teamId: teamId,
        email: "test-invitation@example.com",
        role: "player",
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    console.log("✅ Invitation sent successfully");
    console.log("Response:", invitationResponse.data);
    console.log("");

    // Step 4: Get team invitations
    console.log("4. Getting team invitations...");
    const invitationsResponse = await axios.get(
      `${API_BASE_URL}/team-invitations/team/${teamId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    console.log("✅ Team invitations retrieved");
    console.log("Invitations:", invitationsResponse.data);
    console.log("");

    // Step 5: Test sending invitation to existing user
    console.log("5. Sending invitation to existing user...");
    const existingUserInvitationResponse = await axios.post(
      `${API_BASE_URL}/team-invitations/send`,
      {
        teamId: teamId,
        email: "test@example.com",
        role: "captain",
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    console.log("✅ Invitation to existing user sent successfully");
    console.log("Response:", existingUserInvitationResponse.data);
    console.log("");

    // Step 6: Get my invitations (as the invited user)
    console.log("6. Getting my invitations as invited user...");
    const myInvitationsResponse = await axios.get(
      `${API_BASE_URL}/team-invitations/my-invitations`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    console.log("✅ My invitations retrieved");
    console.log("My invitations:", myInvitationsResponse.data);
    console.log("");

    console.log("🎉 All team invitation tests passed!");
    console.log(
      "\nNote: To test accepting/declining invitations, you would need to:"
    );
    console.log("1. Login with the invited user's account");
    console.log("2. Use the invitation token from the email");
    console.log("3. Call the accept/decline endpoints");
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
  await testTeamInvitations();
}

main();
