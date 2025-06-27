#!/usr/bin/env node

const axios = require("axios");

const BASE_URL = "http://localhost:3001/api";

// Test configuration
const TEST_CONFIG = {
  captain: {
    email: "testuser@example.com",
    password: "password123",
  },
  invitedUser: {
    email: "inviteduser@example.com",
    password: "password123",
  },
  teamId: 1,
};

let captainToken = "";
let invitedUserToken = "";
let invitationToken = "";

async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data.token;
  } catch (error) {
    console.error(
      `Login failed for ${email}:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

async function sendInvitation(token, teamId, email, role = "player") {
  try {
    const response = await axios.post(
      `${BASE_URL}/team-invitations/send`,
      {
        teamId,
        email,
        role,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Send invitation failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function getInvitationDetails(token, invitationToken) {
  try {
    const response = await axios.get(
      `${BASE_URL}/team-invitations/service/token/${invitationToken}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Get invitation details failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function acceptInvitation(token, invitationToken) {
  try {
    const response = await axios.post(
      `${BASE_URL}/team-invitations/service/accept/${invitationToken}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Accept invitation failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function declineInvitation(token, invitationToken) {
  try {
    const response = await axios.post(
      `${BASE_URL}/team-invitations/service/decline/${invitationToken}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Decline invitation failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function getUserInvitations(token) {
  try {
    const response = await axios.get(
      `${BASE_URL}/team-invitations/my-invitations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Get user invitations failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function runTests() {
  console.log("🚀 Starting Team Invitation Acceptance Tests\n");

  try {
    // Step 1: Login as team captain
    console.log("1. Logging in as team captain...");
    captainToken = await login(
      TEST_CONFIG.captain.email,
      TEST_CONFIG.captain.password
    );
    console.log("✅ Captain logged in successfully\n");

    // Step 2: Login as invited user
    console.log("2. Logging in as invited user...");
    invitedUserToken = await login(
      TEST_CONFIG.invitedUser.email,
      TEST_CONFIG.invitedUser.password
    );
    console.log("✅ Invited user logged in successfully\n");

    // Step 3: Send invitation
    console.log("3. Sending team invitation...");
    const invitationResponse = await sendInvitation(
      captainToken,
      TEST_CONFIG.teamId,
      TEST_CONFIG.invitedUser.email,
      "player"
    );
    invitationToken = invitationResponse.invitation.token;
    console.log("✅ Invitation sent successfully");
    console.log(`   Token: ${invitationToken}\n`);

    // Step 4: Get invitation details
    console.log("4. Getting invitation details...");
    const invitationDetails = await getInvitationDetails(
      invitedUserToken,
      invitationToken
    );
    console.log("✅ Invitation details retrieved");
    console.log(`   Team: ${invitationDetails.data.invitation.team_name}`);
    console.log(`   Role: ${invitationDetails.data.invitation.invited_role}`);
    console.log(`   Status: ${invitationDetails.data.invitation.status}\n`);

    // Step 5: Accept invitation
    console.log("5. Accepting invitation...");
    const acceptResponse = await acceptInvitation(
      invitedUserToken,
      invitationToken
    );
    console.log("✅ Invitation accepted successfully");
    console.log(`   Team: ${acceptResponse.data.team.name}`);
    console.log(`   User: ${acceptResponse.data.user.username}\n`);

    // Step 6: Check user's invitations
    console.log("6. Checking user invitations...");
    const userInvitations = await getUserInvitations(invitedUserToken);
    console.log("✅ User invitations retrieved");
    console.log(`   Total invitations: ${userInvitations.invitations.length}`);
    userInvitations.invitations.forEach((inv) => {
      console.log(`   - ${inv.team_name} (${inv.status})`);
    });

    console.log("\n🎉 All tests passed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Team Invitation Acceptance Test Script

Usage: node test-invitation-acceptance.js [options]

Options:
  --help, -h     Show this help message
  --decline      Test invitation decline instead of accept
  --config       Show current test configuration

Examples:
  node test-invitation-acceptance.js
  node test-invitation-acceptance.js --decline
  node test-invitation-acceptance.js --config
`);
  process.exit(0);
}

if (args.includes("--config")) {
  console.log("Current test configuration:");
  console.log(JSON.stringify(TEST_CONFIG, null, 2));
  process.exit(0);
}

if (args.includes("--decline")) {
  console.log("Testing invitation decline...");
  // Modify the test to decline instead of accept
  runTests().then(async () => {
    console.log("\n7. Testing invitation decline...");
    try {
      const declineResponse = await declineInvitation(
        invitedUserToken,
        invitationToken
      );
      console.log("✅ Invitation declined successfully");
      console.log(`   Status: ${declineResponse.data.invitation.status}`);
    } catch (error) {
      console.error(
        "❌ Decline test failed:",
        error.response?.data || error.message
      );
    }
  });
} else {
  runTests();
}
