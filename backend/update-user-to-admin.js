const mysql = require("mysql2/promise");

async function updateUserToAdmin() {
  try {
    console.log("Updating user to admin role...\n");

    // Database connection configuration
    const connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "game_scheduler_user",
      password: "your_secure_password",
      database: "game_scheduler",
    });

    console.log("✅ Connected to database");

    // Update the user role to admin and set as verified
    const [result] = await connection.execute(
      "UPDATE USERS SET role = ?, is_verified = ? WHERE email = ?",
      ["admin", true, "admin@example.com"]
    );

    if (result.affectedRows > 0) {
      console.log("✅ User role updated to admin successfully!");
      console.log(`Updated ${result.affectedRows} user(s)`);
    } else {
      console.log("⚠️  No user found with email 'admin@example.com'");
      console.log("Make sure you ran the setup-admin-user.js script first");
    }

    await connection.end();
    console.log("\n🎉 Database update completed!");
    console.log("You can now login with admin@example.com / admin123");
    console.log("The admin icon should appear in the navigation header");
  } catch (error) {
    console.error("❌ Error updating user role:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.error("Database connection failed. Make sure MySQL is running.");
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("Access denied. Check your database credentials.");
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error(
        "Database 'game_scheduler' not found. Make sure it exists."
      );
    }

    process.exit(1);
  }
}

updateUserToAdmin();
