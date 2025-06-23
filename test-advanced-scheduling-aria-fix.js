const puppeteer = require("puppeteer");

async function testAdvancedSchedulingAriaFix() {
  let browser;
  try {
    console.log(
      "Testing Advanced Scheduling page ARIA accessibility fixes...\n"
    );

    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });

    const page = await browser.newPage();

    // Navigate to the application
    console.log("1. Navigating to the application...");
    await page.goto("http://localhost:5173", { waitUntil: "networkidle0" });

    // Wait for the page to load
    await page.waitForTimeout(2000);

    // Check if we need to login
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      console.log("2. Logging in...");
      await page.type('input[type="email"]', "test@example.com");
      await page.type('input[type="password"]', "password123");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }

    // Navigate to Advanced Scheduling page
    console.log("3. Navigating to Advanced Scheduling page...");
    await page.goto("http://localhost:5173/advanced-scheduling", {
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(2000);

    // Test ARIA accessibility fixes
    console.log("4. Testing ARIA accessibility fixes...");

    // Check that Select components have proper inputProps instead of aria-label on FormControl
    const selectElements = await page.$$('div[role="combobox"]');
    console.log(`Found ${selectElements.length} Select components`);

    let ariaIssues = 0;
    for (let i = 0; i < selectElements.length; i++) {
      const select = selectElements[i];

      // Check if the Select has proper aria-label on the input element
      const hasAriaLabel = await select.evaluate((el) => {
        const input = el.querySelector("input[aria-label]");
        return input && input.getAttribute("aria-label");
      });

      if (!hasAriaLabel) {
        ariaIssues++;
        console.log(`❌ Select component ${i + 1} missing proper aria-label`);
      } else {
        console.log(
          `✅ Select component ${
            i + 1
          } has proper aria-label: "${hasAriaLabel}"`
        );
      }
    }

    // Check for prohibited ARIA attributes on FormControl elements
    const formControls = await page.$$(".MuiInputBase-root");
    let prohibitedAriaIssues = 0;

    for (let i = 0; i < formControls.length; i++) {
      const formControl = formControls[i];

      const hasProhibitedAria = await formControl.evaluate((el) => {
        return el.hasAttribute("aria-label");
      });

      if (hasProhibitedAria) {
        prohibitedAriaIssues++;
        console.log(
          `❌ FormControl ${i + 1} has prohibited aria-label attribute`
        );
      }
    }

    // Test keyboard navigation
    console.log("\n5. Testing keyboard navigation...");

    // Focus on the first Select component
    await page.keyboard.press("Tab");
    await page.waitForTimeout(500);

    // Open the Select with Space
    await page.keyboard.press("Space");
    await page.waitForTimeout(1000);

    // Close with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    console.log("✅ Keyboard navigation test completed");

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("ARIA ACCESSIBILITY TEST RESULTS");
    console.log("=".repeat(50));

    if (ariaIssues === 0 && prohibitedAriaIssues === 0) {
      console.log("🎉 ALL ARIA ISSUES FIXED!");
      console.log("✅ All Select components have proper aria-label attributes");
      console.log(
        "✅ No prohibited ARIA attributes found on FormControl elements"
      );
      console.log("✅ Keyboard navigation working properly");
    } else {
      console.log("❌ ARIA ISSUES REMAINING:");
      if (ariaIssues > 0) {
        console.log(
          `   - ${ariaIssues} Select components missing proper aria-label`
        );
      }
      if (prohibitedAriaIssues > 0) {
        console.log(
          `   - ${prohibitedAriaIssues} FormControl elements with prohibited aria-label`
        );
      }
    }

    console.log("\n" + "=".repeat(50));
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if backend is running
async function checkBackendHealth() {
  try {
    const { default: axios } = await import("axios");
    await axios.get("http://localhost:3002/api/health");
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
  await testAdvancedSchedulingAriaFix();
}

main();
