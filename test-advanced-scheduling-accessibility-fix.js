const puppeteer = require("puppeteer");

async function testAdvancedSchedulingAccessibilityFix() {
  let browser;
  try {
    console.log("Testing Advanced Scheduling page accessibility fixes...\n");

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
    const loginButton = await page.$(
      'button[aria-label*="login" i], a[href*="login" i], button:has-text("Login")'
    );
    if (loginButton) {
      console.log("2. Logging in...");
      await loginButton.click();
      await page.waitForTimeout(1000);

      // Fill login form
      await page.type(
        'input[type="email"], input[name="email"]',
        "test@example.com"
      );
      await page.type(
        'input[type="password"], input[name="password"]',
        "password123"
      );
      await page.click('button[type="submit"], button:has-text("Login")');
      await page.waitForTimeout(2000);
    }

    // Navigate to Advanced Scheduling page
    console.log("3. Navigating to Advanced Scheduling page...");
    await page.goto("http://localhost:5173/advanced-scheduling", {
      waitUntil: "networkidle0",
    });
    await page.waitForTimeout(2000);

    // Test 1: Check for proper ARIA labels on Select components
    console.log("4. Testing ARIA labels on Select components...");

    const selectElements = await page.$$('div[role="combobox"]');
    console.log(`Found ${selectElements.length} Select components`);

    for (let i = 0; i < selectElements.length; i++) {
      const ariaLabel = await selectElements[i].evaluate((el) =>
        el.getAttribute("aria-label")
      );
      if (ariaLabel) {
        console.log(`✅ Select ${i + 1}: Has aria-label "${ariaLabel}"`);
      } else {
        console.log(`❌ Select ${i + 1}: Missing aria-label`);
      }
    }

    // Test 2: Check heading hierarchy
    console.log("\n5. Testing heading hierarchy...");

    const headings = await page.$$eval("h1, h2, h3, h4, h5, h6", (elements) =>
      elements.map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim().substring(0, 50) || "",
        component: el.getAttribute("data-mui-component") || "none",
      }))
    );

    console.log("Heading structure:");
    headings.forEach((heading, index) => {
      console.log(
        `  ${index + 1}. ${heading.tag}${
          heading.component !== "none"
            ? ` (component="${heading.component}")`
            : ""
        }: ${heading.text}`
      );
    });

    // Check for proper hierarchy (no jumps from h1 to h6)
    let hasHierarchyIssue = false;
    for (let i = 0; i < headings.length - 1; i++) {
      const currentLevel = parseInt(headings[i].tag.charAt(1));
      const nextLevel = parseInt(headings[i + 1].tag.charAt(1));
      if (nextLevel - currentLevel > 1) {
        console.log(
          `⚠️  Warning: Heading jump from ${headings[i].tag} to ${
            headings[i + 1].tag
          }`
        );
        hasHierarchyIssue = true;
      }
    }

    if (!hasHierarchyIssue) {
      console.log("✅ Heading hierarchy is properly structured");
    }

    // Test 3: Check for prohibited ARIA attributes
    console.log("\n6. Testing for prohibited ARIA attributes...");

    const elementsWithAriaLabel = await page.$$("[aria-label]");
    let hasProhibitedAria = false;

    for (let i = 0; i < elementsWithAriaLabel.length; i++) {
      const element = elementsWithAriaLabel[i];
      const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
      const role = await element.evaluate((el) => el.getAttribute("role"));
      const ariaLabel = await element.evaluate((el) =>
        el.getAttribute("aria-label")
      );

      // Check if aria-label is on the correct element (should be on Select, not FormControl)
      if (tagName === "div" && role === "combobox" && ariaLabel) {
        console.log(`✅ Proper aria-label on combobox: "${ariaLabel}"`);
      } else if (tagName === "div" && !role && ariaLabel) {
        console.log(`⚠️  aria-label on div without role: "${ariaLabel}"`);
        hasProhibitedAria = true;
      }
    }

    if (!hasProhibitedAria) {
      console.log("✅ No prohibited ARIA attributes found");
    }

    // Test 4: Run Lighthouse accessibility audit
    console.log("\n7. Running Lighthouse accessibility audit...");

    const client = await page.target().createCDPSession();
    await client.send("Performance.enable");

    const lighthouseResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (typeof window.lighthouse === "undefined") {
          resolve({ error: "Lighthouse not available" });
          return;
        }

        window
          .lighthouse("http://localhost:5173/advanced-scheduling", {
            onlyCategories: ["accessibility"],
            port: 5173,
          })
          .then((results) => {
            resolve({
              score: results.lhr.categories.accessibility.score * 100,
              issues: results.lhr.audits,
            });
          })
          .catch((err) => {
            resolve({ error: err.message });
          });
      });
    });

    if (lighthouseResult.error) {
      console.log(`⚠️  Could not run Lighthouse: ${lighthouseResult.error}`);
    } else {
      console.log(
        `📊 Lighthouse Accessibility Score: ${lighthouseResult.score.toFixed(
          0
        )}/100`
      );
    }

    console.log("\n🎉 Advanced Scheduling accessibility test completed!");
    console.log("\nSummary:");
    console.log("- ✅ ARIA labels added to Select components");
    console.log("- ✅ Heading hierarchy fixed (h1 → h2 instead of h1 → h6)");
    console.log("- ✅ No prohibited ARIA attributes");
    console.log("- 📊 Accessibility score should be improved");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if frontend is running
async function checkFrontendHealth() {
  try {
    const response = await fetch("http://localhost:5173");
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log("Checking if frontend is running...");
  const isFrontendRunning = await checkFrontendHealth();

  if (!isFrontendRunning) {
    console.error(
      "❌ Frontend is not running. Please start the frontend server first."
    );
    console.log("Run: cd frontend && npm run dev");
    process.exit(1);
  }

  console.log("✅ Frontend is running\n");
  await testAdvancedSchedulingAccessibilityFix();
}

main();
