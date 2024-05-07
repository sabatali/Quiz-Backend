// search.js

const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function search(query) {
  const options = new chrome.Options();
  options.addArguments("--headless");
  options.addArguments("--disable-gpu");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    await driver.get(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`
    );

    const searchResults = await driver.findElements(By.css(".tF2Cxc"));
    const results = [];
    for (let i = 0; i < Math.min(4, searchResults.length); i++) {
      const titleElement = await searchResults[i].findElement(By.css("h3"));
      const urlElement = await searchResults[i].findElement(By.css("a"));
      const title = await titleElement.getText();
      const url = await urlElement.getAttribute("href");
      results.push({ title, url });
    }

    return results;
  } finally {
    await driver.quit();
  }
}

module.exports = search;
