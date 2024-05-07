const express = require("express");
const bodyParser = require("body-parser");
const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

async function search(query) {
  const options = new chrome.Options();
  options.addArguments("--headless"); // Run Chrome in headless mode (no GUI)
  options.addArguments("--disable-gpu"); // Disable GPU acceleration

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
      const ContentElement = await searchResults[i].findElement(By.css("span"));
      const title = await titleElement.getText();
      const url = await urlElement.getAttribute("href");
      const Content = await ContentElement.getText();
      results.push({ title, url, Content });
    }

    return results;
  } finally {
    await driver.quit();
  }
}

app.post("/search", async (req, res) => {
  try {
    const searchText = req.body.text;
    const searchResults = await search(searchText);
    res.json({ success: true, results: searchResults });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
