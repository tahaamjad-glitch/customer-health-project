const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "docs", "discovery", "slides", "customer-health-discovery-slides.html");
const previewDir = path.join(root, "docs", "discovery", "slides", "preview");
const contactSheet = path.join(previewDir, "customer-health-discovery-slides-contact-sheet.jpg");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  fs.mkdirSync(previewDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "load" });
    const slides = await page.locator(".slide").count();
    const thumbs = [];
    for (let index = 0; index < slides; index += 1) {
      const slidePath = path.join(previewDir, `slide-${String(index + 1).padStart(2, "0")}.jpg`);
      await page.locator(".slide").nth(index).screenshot({ path: slidePath, type: "jpeg", quality: 88 });
      const buffer = await sharp(slidePath).resize(320, 180).toBuffer();
      thumbs.push(buffer);
    }

    const cols = 3;
    const rows = Math.ceil(thumbs.length / cols);
    const composites = thumbs.map((input, index) => ({
      input,
      left: (index % cols) * 340 + 20,
      top: Math.floor(index / cols) * 210 + 20
    }));

    await sharp({
      create: {
        width: cols * 340 + 20,
        height: rows * 210 + 20,
        channels: 3,
        background: "#eef5f6"
      }
    })
      .composite(composites)
      .jpeg({ quality: 90 })
      .toFile(contactSheet);

    console.log(JSON.stringify({
      slides,
      contactSheet,
      bytes: fs.statSync(contactSheet).size
    }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
