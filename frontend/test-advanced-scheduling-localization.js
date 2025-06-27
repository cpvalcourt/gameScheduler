const puppeteer = require("puppeteer");

async function testAdvancedSchedulingLocalization() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log("Testing Advanced Scheduling Page Localization...");

    // Navigate to the app
    await page.goto("http://localhost:5173");

    // Wait for the page to load
    await page.waitForSelector("body", { timeout: 10000 });

    // Check if we need to login first
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      console.log("Logging in...");
      await page.type('input[type="email"]', "test@example.com");
      await page.type('input[type="password"]', "password123");
      await loginButton.click();
      await page.waitForNavigation();
    }

    // Navigate to Advanced Scheduling
    console.log("Navigating to Advanced Scheduling...");
    const advancedSchedulingLink = await page.$(
      'a[href="/advanced-scheduling"]'
    );
    if (advancedSchedulingLink) {
      await advancedSchedulingLink.click();
      await page.waitForNavigation();
    } else {
      console.log(
        "Advanced Scheduling link not found, trying to navigate directly..."
      );
      await page.goto("http://localhost:5173/advanced-scheduling");
    }

    // Wait for the page to load
    await page.waitForSelector("h1", { timeout: 10000 });

    // Check the title
    const title = await page.$eval("h1", (el) => el.textContent);
    console.log("Page title:", title);

    // Check the subtitle
    const subtitle = await page.$eval("p", (el) => el.textContent);
    console.log("Page subtitle:", subtitle);

    // Check tab labels
    const tabs = await page.$$eval('[role="tab"]', (tabs) =>
      tabs.map((tab) => tab.textContent)
    );
    console.log("Tab labels:", tabs);

    // Test language switching
    console.log("\nTesting language switching...");

    // Find and click language selector
    const languageButton = await page.$(
      'button[aria-label*="language" i], button[aria-label*="Language" i]'
    );
    if (languageButton) {
      await languageButton.click();
      await page.waitForTimeout(1000);

      // Try to switch to Spanish
      const spanishOption = await page.$(
        'button[data-value="es"], li[data-value="es"]'
      );
      if (spanishOption) {
        await spanishOption.click();
        await page.waitForTimeout(2000);

        // Check if the title changed
        const spanishTitle = await page.$eval("h1", (el) => el.textContent);
        console.log("Spanish title:", spanishTitle);

        // Check if the subtitle changed
        const spanishSubtitle = await page.$eval("p", (el) => el.textContent);
        console.log("Spanish subtitle:", spanishSubtitle);

        // Check if tab labels changed
        const spanishTabs = await page.$$eval('[role="tab"]', (tabs) =>
          tabs.map((tab) => tab.textContent)
        );
        console.log("Spanish tab labels:", spanishTabs);
      }
    }

    console.log("\nLocalization test completed!");
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    await browser.close();
  }
}

testAdvancedSchedulingLocalization();
