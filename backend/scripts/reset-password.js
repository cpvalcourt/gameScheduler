const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function resetPassword() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "game_scheduler",
  });

  try {
    // Get user email from command line argument
    const userEmail = process.argv[2];
    const newPassword = process.argv[3] || "password123"; // default password

    if (!userEmail) {
      console.log("Usage: node reset-password.js <email> [new_password]");
      console.log(
        "Example: node reset-password.js user@example.com newpassword123"
      );
      process.exit(1);
    }

    console.log(`Resetting password for user: ${userEmail}`);
    console.log(`New password will be: ${newPassword}`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    const [result] = await connection.execute(
      "UPDATE USERS SET PASSWORD_HASH = ?, UPDATED_AT = NOW() WHERE EMAIL = ?",
      [hashedPassword, userEmail]
    );

    if (result.affectedRows === 0) {
      console.log("❌ User not found with that email address");
    } else {
      console.log("✅ Password reset successfully!");
      console.log(`Email: ${userEmail}`);
      console.log(`New password: ${newPassword}`);
    }
  } catch (error) {
    console.error("Error resetting password:", error);
  } finally {
    await connection.end();
  }
}

resetPassword();
