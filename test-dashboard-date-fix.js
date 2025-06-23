const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";

async function testDashboardDateFix() {
  try {
    console.log("Testing dashboard date formatting fix...\n");

    // Step 1: Check if backend is accessible
    console.log("1. Checking backend accessibility...");
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 5000,
      });
      console.log("✅ Backend is accessible");
    } catch (error) {
      console.log(
        "❌ Backend is not accessible. Please start the backend server."
      );
      console.log("Run: cd backend && npm run dev");
      return;
    }

    // Step 2: Login to get a token
    console.log("\n2. Logging in...");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "test@example.com",
      password: "password123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful");

    // Step 3: Test dashboard upcoming games endpoint
    console.log("\n3. Testing dashboard upcoming games...");
    const gamesResponse = await axios.get(
      `${API_BASE_URL}/dashboard/upcoming-games`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Upcoming games API call successful");
    console.log("Games data:", JSON.stringify(gamesResponse.data, null, 2));

    // Step 4: Check for date formatting issues
    console.log("\n4. Checking for date formatting issues...");
    const games = gamesResponse.data;

    if (games.length === 0) {
      console.log(
        "ℹ️  No upcoming games found - this is normal if no games are scheduled"
      );
    } else {
      games.forEach((game, index) => {
        console.log(`Game ${index + 1}:`);
        console.log(`  Title: ${game.title}`);
        console.log(`  Date: ${game.date} (type: ${typeof game.date})`);
        console.log(`  Time: ${game.time} (type: ${typeof game.time})`);

        // Test the date formatting logic
        if (game.date && game.time) {
          try {
            let dateStr = game.date;
            if (!game.date.includes("T")) {
              let timeStr = game.time;
              if (game.time && !game.time.includes(":")) {
                if (game.time.length === 4) {
                  timeStr = `${game.time.substring(0, 2)}:${game.time.substring(
                    2,
                    4
                  )}`;
                }
              }
              dateStr = `${game.date}T${timeStr}`;
            }

            const gameDate = new Date(dateStr);
            if (isNaN(gameDate.getTime())) {
              console.log(`  ❌ Invalid date: ${dateStr}`);
            } else {
              const formattedDate = gameDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              console.log(`  ✅ Valid date: ${formattedDate}`);
            }
          } catch (error) {
            console.log(`  ❌ Error formatting date: ${error.message}`);
          }
        } else {
          console.log(`  ⚠️  Missing date or time data`);
        }
        console.log("");
      });
    }

    console.log("🎉 Dashboard date formatting test completed!");
    console.log("\nNext steps:");
    console.log("1. Open your browser and go to the dashboard");
    console.log("2. Check the browser console for debug logs");
    console.log(
      "3. Verify that upcoming games show proper dates instead of 'Invalid Date'"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

testDashboardDateFix();
