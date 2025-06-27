#!/usr/bin/env node

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "sports_scheduler",
};

async function setupTestData() {
  let connection;

  try {
    console.log("🔧 Setting up test data for team invitations...\n");

    // Connect to database
    connection = await mysql.createConnection(DB_CONFIG);
    console.log("✅ Connected to database\n");

    // Create test users
    console.log("1. Creating test users...");

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create team captain
    await connection.execute(
      `
            INSERT INTO users (username, email, password, email_verified, created_at, updated_at)
            VALUES (?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            username = VALUES(username),
            password = VALUES(password),
            email_verified = VALUES(email_verified)
        `,
      ["testuser", "testuser@example.com", hashedPassword, true]
    );

    // Create invited user
    await connection.execute(
      `
            INSERT INTO users (username, email, password, email_verified, created_at, updated_at)
            VALUES (?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            username = VALUES(username),
            password = VALUES(password),
            email_verified = VALUES(email_verified)
        `,
      ["inviteduser", "inviteduser@example.com", hashedPassword, true]
    );

    console.log("✅ Test users created/updated\n");

    // Get user IDs
    const [captainRows] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      ["testuser@example.com"]
    );
    const [invitedUserRows] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      ["inviteduser@example.com"]
    );

    const captainId = captainRows[0].id;
    const invitedUserId = invitedUserRows[0].id;

    console.log(`   Captain ID: ${captainId}`);
    console.log(`   Invited User ID: ${invitedUserId}\n`);

    // Create test team
    console.log("2. Creating test team...");

    await connection.execute(
      `
            INSERT INTO teams (name, description, sport_type, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            description = VALUES(description),
            sport_type = VALUES(sport_type)
        `,
      ["Test Team", "A test team for invitation testing", "soccer", captainId]
    );

    const [teamRows] = await connection.execute(
      "SELECT id FROM teams WHERE name = ?",
      ["Test Team"]
    );
    const teamId = teamRows[0].id;

    console.log(`✅ Test team created with ID: ${teamId}\n`);

    // Add captain to team
    console.log("3. Adding captain to team...");

    await connection.execute(
      `
            INSERT INTO team_members (team_id, user_id, role, joined_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
            role = VALUES(role)
        `,
      [teamId, captainId, "captain"]
    );

    console.log("✅ Captain added to team\n");

    // Clean up any existing invitations
    console.log("4. Cleaning up existing invitations...");

    await connection.execute(
      "DELETE FROM team_invitations WHERE invited_email IN (?, ?)",
      ["testuser@example.com", "inviteduser@example.com"]
    );

    console.log("✅ Existing invitations cleaned up\n");

    // Create a test invitation
    console.log("5. Creating test invitation...");

    const invitationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    await connection.execute(
      `
            INSERT INTO team_invitations (
                team_id, invited_email, invited_role, token, status, 
                expires_at, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
      [
        teamId,
        "inviteduser@example.com",
        "player",
        invitationToken,
        "pending",
        expiresAt,
      ]
    );

    console.log("✅ Test invitation created");
    console.log(`   Token: ${invitationToken}`);
    console.log(`   Expires: ${expiresAt.toISOString()}\n`);

    // Display summary
    console.log("📋 Test Data Summary:");
    console.log("=====================");
    console.log(`Team Captain: testuser@example.com (ID: ${captainId})`);
    console.log(`Invited User: inviteduser@example.com (ID: ${invitedUserId})`);
    console.log(`Team: Test Team (ID: ${teamId})`);
    console.log(`Invitation Token: ${invitationToken}`);
    console.log(`Password for both users: password123`);
    console.log("\n🎉 Test data setup complete!");
    console.log("\nYou can now run: node test-invitation-acceptance.js");
  } catch (error) {
    console.error("❌ Error setting up test data:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Team Invitation Test Data Setup Script

Usage: node setup-invitation-test-data.js [options]

Options:
  --help, -h     Show this help message
  --clean        Clean up all test data before setup

This script creates:
- Test users (captain and invited user)
- Test team
- Test invitation
- Proper team membership for captain

Examples:
  node setup-invitation-test-data.js
  node setup-invitation-test-data.js --clean
`);
  process.exit(0);
}

if (args.includes("--clean")) {
  console.log("🧹 Cleaning up existing test data...");
  // Add cleanup logic here if needed
}

setupTestData();
