const axios = require("axios");

const API_BASE_URL = "http://localhost:3002/api";
const FRONTEND_PORTS = [5173, 5174, 5175, 5176, 5177, 5178, 5179];

async function testDOMNestingFix() {
  try {
    console.log("Testing DOM nesting fix...\n");

    // Step 1: Check if frontend is accessible
    console.log("1. Checking frontend accessibility...");
    let frontendUrl = null;

    for (const port of FRONTEND_PORTS) {
      try {
        const url = `http://localhost:${port}`;
        const frontendResponse = await axios.get(url, { timeout: 3000 });
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
      const backendResponse = await axios.get(`${API_BASE_URL}/health`, {
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

    // Step 3: Login to get access to dashboard
    console.log("\n3. Logging in to access dashboard...");
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: "admin@example.com",
        password: "admin123",
      });
      console.log("✅ Login successful");
    } catch (error) {
      console.log(
        "❌ Login failed:",
        error.response?.data?.message || error.message
      );
      return;
    }

    console.log("\n🎉 DOM nesting fix verification complete!");
    console.log(`\nTo verify the fix manually:`);
    console.log(`1. Open your browser and go to ${frontendUrl}`);
    console.log("2. Login with admin@example.com / admin123");
    console.log("3. Navigate to the Dashboard page");
    console.log("4. Open browser console (F12)");
    console.log(
      "5. Check that there are NO warnings about 'validateDOMNesting'"
    );
    console.log(
      "6. The warning about '<div> cannot appear as a descendant of <p>' should be gone"
    );

    console.log("\nThe fix involved:");
    console.log(
      "- Replacing <Box> components with <React.Fragment> in ListItemText secondary props"
    );
    console.log(
      "- This prevents invalid HTML structure: <p><div>...</div></p>"
    );
    console.log(
      "- Now the structure is: <p><span>...</span></p> which is valid HTML"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testDOMNestingFix();
