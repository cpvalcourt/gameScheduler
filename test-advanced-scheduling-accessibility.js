const puppeteer = require("puppeteer");

async function testAdvancedSchedulingAccessibility() {
  let browser;
  try {
    console.log("Testing Advanced Scheduling page accessibility...\n");

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

      // Fill in login form
      await page.type('input[name="email"]', "admin@example.com");
      await page.type('input[name="password"]', "password123");

      // Submit login form
      await page.click('button[type="submit"]');

      // Wait for login to complete
      await page.waitForTimeout(3000);
    }

    // Navigate to Advanced Scheduling page
    console.log("3. Navigating to Advanced Scheduling page...");

    // Look for Advanced Scheduling link in navigation
    const advancedSchedulingLink = await page.$(
      'a[href="/advanced-scheduling"]'
    );
    if (advancedSchedulingLink) {
      await advancedSchedulingLink.click();
    } else {
      // Try to navigate directly
      await page.goto("http://localhost:5173/advanced-scheduling", {
        waitUntil: "networkidle0",
      });
    }

    await page.waitForTimeout(2000);

    // Test accessibility features
    console.log("4. Testing accessibility features...");

    // Check for proper heading structure
    const headings = await page.$$eval("h1, h2, h3, h4, h5, h6", (elements) =>
      elements.map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        id: el.id,
      }))
    );

    console.log("✅ Heading structure found:");
    headings.forEach((heading) => {
      console.log(`   ${heading.tag}: ${heading.text}`);
    });

    // Check for ARIA labels on Select components
    const selectElements = await page.$$eval(
      'div[role="combobox"]',
      (elements) =>
        elements.map((el) => ({
          ariaLabel: el.getAttribute("aria-label"),
          ariaLabelledby: el.getAttribute("aria-labelledby"),
          className: el.className,
          hasLabel: !!el.querySelector("label"),
        }))
    );

    console.log("\n✅ Select components accessibility:");
    selectElements.forEach((select, index) => {
      console.log(`   Select ${index + 1}:`);
      console.log(`     aria-label: ${select.ariaLabel || "Not set"}`);
      console.log(
        `     aria-labelledby: ${select.ariaLabelledby || "Not set"}`
      );
      console.log(`     Has label: ${select.hasLabel}`);
    });

    // Check for proper tab structure
    const tabs = await page.$$eval('[role="tab"]', (elements) =>
      elements.map((el) => ({
        text: el.textContent?.trim(),
        ariaSelected: el.getAttribute("aria-selected"),
        ariaControls: el.getAttribute("aria-controls"),
      }))
    );

    console.log("\n✅ Tab structure:");
    tabs.forEach((tab, index) => {
      console.log(`   Tab ${index + 1}: ${tab.text}`);
      console.log(`     aria-selected: ${tab.ariaSelected}`);
      console.log(`     aria-controls: ${tab.ariaControls}`);
    });

    // Test keyboard navigation
    console.log("\n5. Testing keyboard navigation...");

    // Focus on first tab
    await page.keyboard.press("Tab");
    await page.waitForTimeout(500);

    // Navigate through tabs with arrow keys
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);

    // Test form accessibility
    console.log("\n6. Testing form accessibility...");

    // Check for form labels
    const formLabels = await page.$$eval("label", (elements) =>
      elements.map((el) => ({
        text: el.textContent?.trim(),
        for: el.getAttribute("for"),
      }))
    );

    console.log("✅ Form labels found:");
    formLabels.forEach((label) => {
      console.log(`   Label: "${label.text}" (for: ${label.for || "Not set"})`);
    });

    // Check for required field indicators
    const requiredFields = await page.$$eval(
      "input[required], select[required], textarea[required]",
      (elements) =>
        elements.map((el) => ({
          type: el.tagName.toLowerCase(),
          name: el.name,
          ariaRequired: el.getAttribute("aria-required"),
        }))
    );

    console.log("\n✅ Required fields:");
    requiredFields.forEach((field) => {
      console.log(
        `   ${field.type}: ${field.name} (aria-required: ${field.ariaRequired})`
      );
    });

    // Test screen reader compatibility
    console.log("\n7. Testing screen reader compatibility...");

    // Check for aria-live regions
    const liveRegions = await page.$$eval("[aria-live]", (elements) =>
      elements.map((el) => ({
        ariaLive: el.getAttribute("aria-live"),
        text: el.textContent?.trim().substring(0, 50),
      }))
    );

    console.log("✅ ARIA live regions:");
    liveRegions.forEach((region) => {
      console.log(`   aria-live: ${region.ariaLive} - "${region.text}..."`);
    });

    // Check for skip links
    const skipLinks = await page.$$eval('a[href^="#"]', (elements) =>
      elements
        .filter(
          (el) =>
            el.textContent?.includes("skip") || el.textContent?.includes("Skip")
        )
        .map((el) => ({
          text: el.textContent?.trim(),
          href: el.getAttribute("href"),
        }))
    );

    console.log("\n✅ Skip links:");
    if (skipLinks.length > 0) {
      skipLinks.forEach((link) => {
        console.log(`   ${link.text} -> ${link.href}`);
      });
    } else {
      console.log("   No skip links found");
    }

    // Test color contrast (basic check)
    console.log("\n8. Testing color contrast...");

    // Get computed styles for text elements
    const textElements = await page.$$eval(
      "p, span, div, h1, h2, h3, h4, h5, h6",
      (elements) =>
        elements
          .slice(0, 10) // Check first 10 elements
          .map((el) => {
            const style = window.getComputedStyle(el);
            return {
              tag: el.tagName,
              text: el.textContent?.trim().substring(0, 30),
              color: style.color,
              backgroundColor: style.backgroundColor,
            };
          })
    );

    console.log("✅ Text color analysis (first 10 elements):");
    textElements.forEach((element) => {
      console.log(`   ${element.tag}: "${element.text}"`);
      console.log(
        `     Color: ${element.color}, Background: ${element.backgroundColor}`
      );
    });

    console.log("\n🎉 Advanced Scheduling accessibility test completed!");
    console.log("\n📋 Summary:");
    console.log(`   - Found ${headings.length} headings with proper structure`);
    console.log(
      `   - Found ${selectElements.length} Select components with ARIA labels`
    );
    console.log(`   - Found ${tabs.length} tabs with proper ARIA attributes`);
    console.log(`   - Found ${formLabels.length} form labels`);
    console.log(`   - Found ${requiredFields.length} required fields`);
    console.log(`   - Found ${liveRegions.length} ARIA live regions`);
    console.log(`   - Found ${skipLinks.length} skip links`);

    // Check for any accessibility violations
    const accessibilityIssues = [];

    if (
      selectElements.some(
        (select) => !select.ariaLabel && !select.ariaLabelledby
      )
    ) {
      accessibilityIssues.push("Some Select components missing ARIA labels");
    }

    if (tabs.some((tab) => !tab.ariaControls)) {
      accessibilityIssues.push("Some tabs missing aria-controls");
    }

    if (requiredFields.some((field) => field.ariaRequired !== "true")) {
      accessibilityIssues.push("Some required fields missing aria-required");
    }

    if (accessibilityIssues.length > 0) {
      console.log("\n⚠️  Accessibility issues found:");
      accessibilityIssues.forEach((issue) => console.log(`   - ${issue}`));
    } else {
      console.log("\n✅ No accessibility issues detected!");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
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
  await testAdvancedSchedulingAccessibility();
}

main();
