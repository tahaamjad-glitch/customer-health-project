const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "docs", "discovery", "customer-health-master-diagram.svg");
const outDir = path.join(root, "docs", "discovery", "jpeg");

const baseWidth = 1800;
const baseHeight = 2400;
const scale = 2;

const crops = [
  {
    name: "customer-health-master-diagram.jpg",
    title: "Full master diagram",
    full: true
  },
  {
    name: "customer-health-business-canvas.jpg",
    title: "Business Canvas",
    crop: { left: 50, top: 275, width: 1700, height: 410 }
  },
  {
    name: "customer-health-process-flow.jpg",
    title: "Process Flow",
    crop: { left: 50, top: 705, width: 1700, height: 235 }
  },
  {
    name: "customer-health-functional-architecture.jpg",
    title: "Functional Architecture",
    crop: { left: 50, top: 990, width: 1085, height: 500 }
  },
  {
    name: "customer-health-integration-diagram.jpg",
    title: "Integration Diagram",
    crop: { left: 1120, top: 990, width: 630, height: 500 }
  },
  {
    name: "customer-health-swimlane-diagram.jpg",
    title: "Swimlane Diagram",
    crop: { left: 50, top: 1515, width: 835, height: 465 }
  },
  {
    name: "customer-health-application-design.jpg",
    title: "Application Design",
    crop: { left: 875, top: 1515, width: 875, height: 465 }
  },
  {
    name: "customer-health-prd-requirements.jpg",
    title: "PRD Requirements",
    crop: { left: 50, top: 2000, width: 835, height: 320 }
  },
  {
    name: "customer-health-agent-graph.jpg",
    title: "Agent Graph",
    crop: { left: 875, top: 2000, width: 875, height: 320 }
  }
];

function scaledCrop(crop) {
  return {
    left: Math.round(crop.left * scale),
    top: Math.round(crop.top * scale),
    width: Math.round(crop.width * scale),
    height: Math.round(crop.height * scale)
  };
}

async function main() {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing source SVG: ${source}`);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const rendered = await sharp(source)
    .resize(baseWidth * scale, baseHeight * scale)
    .flatten({ background: "#f6fafb" })
    .png()
    .toBuffer();

  const results = [];
  for (const item of crops) {
    const output = path.join(outDir, item.name);
    let image = sharp(rendered);
    if (item.crop) image = image.extract(scaledCrop(item.crop));
    await image.jpeg({ quality: 92, mozjpeg: true }).toFile(output);
    const metadata = await sharp(output).metadata();
    results.push({
      title: item.title,
      file: output,
      width: metadata.width,
      height: metadata.height,
      bytes: fs.statSync(output).size
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
