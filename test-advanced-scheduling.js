const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";

async function testAdvancedScheduling() {
  try {
    console.log("Testing Advanced Game Scheduling functionality...\n");

    // Step 1: Login to get a token
    console.log("1. Logging in...");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "test@example.com",
      password: "password123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful\n");

    // Step 2: Get or create a game series
    console.log("2. Getting game series...");
    const seriesResponse = await axios.get(`${API_BASE_URL}/game-series`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let seriesId;
    if (seriesResponse.data.length > 0) {
      seriesId = seriesResponse.data[0].id;
      console.log(`✅ Using existing series: ${seriesResponse.data[0].name}`);
    } else {
      console.log("❌ No game series found. Please create a series first.");
      return;
    }

    // Step 3: Create a recurring pattern
    console.log("\n3. Creating recurring pattern...");
    const patternData = {
      name: "Weekly Basketball",
      description: "Weekly basketball games every Sunday",
      frequency: "weekly",
      interval: 1,
      day_of_week: 0, // Sunday
      start_time: "14:00",
      end_time: "16:00",
      location: "Community Center Court",
      min_players: 8,
      max_players: 20,
      start_date: "2024-01-01",
      end_date: "2024-12-31",
    };

    const patternResponse = await axios.post(
      `${API_BASE_URL}/advanced-scheduling/series/${seriesId}/recurring-patterns`,
      patternData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Recurring pattern created successfully");
    console.log("Pattern:", patternResponse.data.pattern);
    const patternId = patternResponse.data.pattern.id;

    // Step 4: Generate games from pattern
    console.log("\n4. Generating games from pattern...");
    const generateResponse = await axios.post(
      `${API_BASE_URL}/advanced-scheduling/recurring-patterns/${patternId}/generate-games`,
      {
        start_date: "2024-01-01",
        end_date: "2024-01-31",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Games generated successfully");
    console.log(
      `Generated ${generateResponse.data.generatedGameIds.length} games`
    );
    console.log("Game IDs:", generateResponse.data.generatedGameIds);

    // Step 5: Set player availability
    console.log("\n5. Setting player availability...");
    const availabilityData = {
      date: "2024-01-07", // First Sunday
      time_slot: "14:00-16:00",
      status: "available",
      notes: "Looking forward to the game!",
    };

    const availabilityResponse = await axios.post(
      `${API_BASE_URL}/advanced-scheduling/availability`,
      availabilityData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Player availability set successfully");
    console.log("Availability:", availabilityResponse.data.availability);

    // Step 6: Get player availability
    console.log("\n6. Getting player availability...");
    const getAvailabilityResponse = await axios.get(
      `${API_BASE_URL}/advanced-scheduling/availability/${loginResponse.data.user.id}?start_date=2024-01-01&end_date=2024-01-31`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Player availability retrieved successfully");
    console.log("Availability records:", getAvailabilityResponse.data.length);

    // Step 7: Find optimal time slot
    console.log("\n7. Finding optimal time slot...");
    const optimalSlotResponse = await axios.post(
      `${API_BASE_URL}/advanced-scheduling/series/${seriesId}/optimal-time-slot`,
      {
        date: "2024-01-08", // Monday
        duration: 120, // 2 hours
        min_players: 8,
        max_players: 20,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Optimal time slot found");
    console.log("Optimal slot:", optimalSlotResponse.data.optimalSlot);

    // Step 8: Get recurring patterns
    console.log("\n8. Getting recurring patterns...");
    const patternsResponse = await axios.get(
      `${API_BASE_URL}/advanced-scheduling/series/${seriesId}/recurring-patterns`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Recurring patterns retrieved successfully");
    console.log(`Found ${patternsResponse.data.length} patterns`);

    // Step 9: Test conflict detection (if we have games)
    if (generateResponse.data.generatedGameIds.length > 0) {
      console.log("\n9. Testing conflict detection...");
      const gameId = generateResponse.data.generatedGameIds[0];

      const conflictsResponse = await axios.get(
        `${API_BASE_URL}/advanced-scheduling/games/${gameId}/conflicts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Conflict detection completed");
      console.log(`Found ${conflictsResponse.data.conflictCount} conflicts`);
      if (conflictsResponse.data.conflicts.length > 0) {
        console.log("Conflicts:", conflictsResponse.data.conflicts);
      }
    }

    console.log("\n🎉 All Advanced Game Scheduling tests passed!");
    console.log("\nFeatures tested:");
    console.log("  ✅ Recurring pattern creation");
    console.log("  ✅ Game generation from patterns");
    console.log("  ✅ Player availability management");
    console.log("  ✅ Optimal time slot finding");
    console.log("  ✅ Conflict detection");
    console.log("  ✅ Pattern retrieval");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error("Server error details:", error.response.data);
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
  await testAdvancedScheduling();
}

main();
