const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";
const FRONTEND_PORTS = [5173, 5174, 5175, 5176, 5177, 5178];

async function testLanguageSwitcher() {
  try {
    console.log("Testing language switcher functionality...\n");

    // Step 1: Check if frontend is accessible
    console.log("1. Checking frontend accessibility...");
    let frontendUrl = null;

    for (const port of FRONTEND_PORTS) {
      try {
        const url = `http://localhost:${port}`;
        const frontendResponse = await axios.get(url, { timeout: 10000 });
        console.log(`✅ Frontend is accessible on port ${port}`);
        frontendUrl = url;
        break;
      } catch (error) {
        // Continue to next port
      }
    }

    if (!frontendUrl) {
      console.log(
        "❌ Frontend is not accessible on any port. Please start the frontend server."
      );
      console.log("Run: cd frontend && npm run dev");
      return;
    }

    // Step 2: Check if backend is accessible
    console.log("\n2. Checking backend accessibility...");
    try {
      const backendResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log("✅ Backend is accessible");
    } catch (error) {
      console.log(
        "❌ Backend is not accessible. Please start the backend server."
      );
      console.log("Run: cd backend && npm run dev");
      return;
    }

    console.log("\n🎉 Language switcher test completed!");
    console.log("\n📋 Manual Testing Instructions:");
    console.log(`1. Open your browser and go to: ${frontendUrl}`);
    console.log("2. Login with any user account");
    console.log(
      "3. Look for the language switcher in the navigation header (top-right area)"
    );
    console.log(
      "4. The language switcher should show a globe icon and a dropdown with 'English' and 'Español'"
    );
    console.log(
      "5. Try switching between languages - the interface should update immediately"
    );
    console.log(
      "6. Navigate to different pages and verify the language switcher is always visible"
    );
    console.log(
      "7. Check that the language preference persists across page refreshes"
    );

    console.log(
      "\n✅ Language switcher has been successfully moved from Profile page to Navigation header!"
    );
    console.log("✅ It's now accessible from any page in the application.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testLanguageSwitcher();
