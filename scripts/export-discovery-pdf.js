const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "docs", "discovery", "customer-health-discovery-artifacts.md");
const outputPath = path.join(root, "docs", "discovery", "customer-health-discovery-artifacts.pdf");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function diagramProcessFlow() {
  return `
<figure class="diagram-block">
  <figcaption>Process Flow</figcaption>
  <div class="flow-grid process-flow">
    <div class="node primary">User signs in</div>
    <div class="arrow">→</div>
    <div class="node primary">Load role and project scope</div>
    <div class="arrow">→</div>
    <div class="node decision">Role route</div>
    <div class="flow-branch">
      <div class="node">Admin / PM<br><span>Create or manage project</span></div>
      <div class="node">Lead / Developer<br><span>Update progress and blockers</span></div>
      <div class="node">Client/User<br><span>Submit feedback</span></div>
    </div>
    <div class="arrow down">↓</div>
    <div class="node primary wide">Project record saved</div>
    <div class="arrow">→</div>
    <div class="node primary">Health score recalculates</div>
    <div class="arrow">→</div>
    <div class="node primary">Dashboard and alerts refresh</div>
    <div class="arrow">→</div>
    <div class="node decision">Risk requires attention?</div>
    <div class="flow-branch two">
      <div class="node alert">Yes<br><span>Acknowledge, recover, report</span></div>
      <div class="node calm">No<br><span>Continue monitoring</span></div>
    </div>
  </div>
</figure>`;
}

function diagramFunctionalArchitecture() {
  const columns = [
    ["Web Application", ["Dashboard", "Projects", "Health Metrics", "Risks", "Access Control", "Reports"]],
    ["Node Backend", ["HTTP Router", "Session Cookies", "RBAC", "Project APIs", "Health Scoring"]],
    ["Data Layer", ["data/db.json", "Seed Actors", "Seed Projects", "Acknowledgements", "Sessions"]]
  ];

  return `
<figure class="diagram-block">
  <figcaption>Functional Architecture</figcaption>
  <div class="architecture-grid">
    ${columns.map((column, index) => `
      <section class="architecture-column">
        <h4>${column[0]}</h4>
        <div class="component-stack">
          ${column[1].map((item) => `<span>${item}</span>`).join("")}
        </div>
      </section>
      ${index < columns.length - 1 ? `<div class="architecture-arrow">→</div>` : ""}
    `).join("")}
  </div>
</figure>`;
}

function diagramIntegration() {
  return `
<figure class="diagram-block">
  <figcaption>Integration Diagram</figcaption>
  <div class="integration-grid">
    <section class="integration-current">
      <h4>Current App</h4>
      <div class="integration-stack">
        <span>Customer Health Web UI</span>
        <span>Node API</span>
        <span>JSON Data Store</span>
      </div>
    </section>
    <div class="integration-arrow">→</div>
    <section class="integration-targets">
      <h4>Target Integrations</h4>
      <div class="target-grid">
        <span>Identity Provider</span>
        <span>CRM / Customer Master</span>
        <span>Project Management</span>
        <span>Support / Ticketing</span>
        <span>Email / Slack / Teams</span>
        <span>BI / Data Warehouse</span>
      </div>
    </section>
  </div>
</figure>`;
}

function diagramSwimlane() {
  const lanes = [
    ["Admin", "Configure users, roles, and portfolio access"],
    ["Project Manager", "Create or update customer project"],
    ["Team Lead", "Update progress, team performance, and blockers"],
    ["Developer", "Add technical issue notes and implementation progress"],
    ["Client/User", "Submit satisfaction feedback and visible risk notes"],
    ["System", "Recalculate health score and surface alerts"],
    ["Project Manager", "Acknowledge risk and update recovery plan"],
    ["Admin", "Export portfolio report"],
    ["System", "Show scoped summaries and client-visible risks"]
  ];

  return `
<figure class="diagram-block">
  <figcaption>Swimlane Diagram</figcaption>
  <div class="swimlane">
    ${lanes.map((lane, index) => `
      <div class="lane-step">
        <span class="step-number">${index + 1}</span>
        <strong>${lane[0]}</strong>
        <p>${lane[1]}</p>
      </div>
    `).join("")}
  </div>
</figure>`;
}

function diagramAgentGraph() {
  const stages = [
    ["Data Ingestion", "Collect delivery, support, CRM, and feedback signals"],
    ["Signal Normalization", "Map raw events into common project health fields"],
    ["Health Scoring", "Calculate transparent score and confidence trend"],
    ["Risk Detection", "Identify critical, elevated, and watchlist signals"],
    ["Explanation", "Explain score movement and driver impact"],
    ["Recommendation", "Propose owner, urgency, and next action"],
    ["Human Review", "Approve escalation and client-facing communication"],
    ["Notify and Report", "Route alerts, summaries, and executive reports"]
  ];

  return `
<figure class="diagram-block">
  <figcaption>Agent Graph</figcaption>
  <div class="agent-graph">
    ${stages.map((stage, index) => `
      <div class="agent-node ${index === 6 ? "human" : ""}">
        <strong>${stage[0]}</strong>
        <span>${stage[1]}</span>
      </div>
      ${index < stages.length - 1 ? `<div class="agent-arrow">→</div>` : ""}
    `).join("")}
  </div>
</figure>`;
}

const diagramRenderers = [
  diagramProcessFlow,
  diagramFunctionalArchitecture,
  diagramIntegration,
  diagramSwimlane,
  diagramAgentGraph
];

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(markdown) {
  let diagramIndex = 0;
  const prepared = markdown.replace(/```mermaid\s+([\s\S]*?)```/g, () => {
    const renderer = diagramRenderers[diagramIndex++];
    return renderer ? renderer() : "";
  });

  marked.setOptions({
    gfm: true,
    breaks: false,
    mangle: false,
    headerIds: false
  });

  const renderer = new marked.Renderer();
  renderer.code = (code, language) => {
    const langClass = language ? ` class="language-${htmlEscape(language)}"` : "";
    return `<pre${langClass}><code>${htmlEscape(code)}</code></pre>`;
  };

  const content = marked(prepared, { renderer });
  const generatedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Customer Health Discovery Phase Artifacts</title>
  <style>
    @page {
      size: Letter;
      margin: 0.55in 0.55in 0.65in;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #1f2933;
      background: #ffffff;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 9.4pt;
      line-height: 1.43;
    }

    .cover {
      min-height: 9.45in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0.12in 0.08in;
      break-after: page;
      border-top: 8px solid #2f7d86;
      border-bottom: 2px solid #e7eef2;
    }

    .eyebrow {
      color: #b45f3c;
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 1.4px;
      margin: 0 0 14px;
      text-transform: uppercase;
    }

    .cover h1 {
      color: #143642;
      font-size: 35pt;
      line-height: 1.02;
      margin: 0;
      max-width: 7.4in;
    }

    .cover .subtitle {
      color: #52616b;
      font-size: 13pt;
      max-width: 6.7in;
      margin: 18px 0 0;
    }

    .cover-meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 44px;
      max-width: 7.1in;
    }

    .cover-meta div {
      border: 1px solid #d8e3e7;
      border-radius: 8px;
      padding: 12px;
      background: #f7fafb;
    }

    .cover-meta span {
      color: #677681;
      display: block;
      font-size: 8pt;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .cover-meta strong {
      color: #143642;
      font-size: 10.5pt;
    }

    main {
      padding: 0;
    }

    h1, h2, h3, h4 {
      color: #143642;
      font-weight: 700;
      line-height: 1.18;
      break-after: avoid;
    }

    main > h1 {
      display: none;
    }

    h2 {
      margin: 22px 0 8px;
      padding-top: 8px;
      border-top: 1px solid #d9e5e8;
      font-size: 15.5pt;
    }

    h3 {
      margin: 16px 0 7px;
      font-size: 11.5pt;
    }

    h4 {
      margin: 0 0 8px;
      font-size: 10pt;
    }

    p {
      margin: 0 0 8px;
    }

    ol, ul {
      margin: 5px 0 12px 18px;
      padding: 0;
    }

    li {
      margin: 2px 0 4px;
      padding-left: 2px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 14px;
      table-layout: fixed;
      break-inside: auto;
      font-size: 8.2pt;
    }

    thead {
      display: table-header-group;
    }

    tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    th {
      background: #143642;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
    }

    th, td {
      border: 1px solid #d5e1e5;
      padding: 5px 6px;
      vertical-align: top;
      overflow-wrap: anywhere;
    }

    tbody tr:nth-child(even) td {
      background: #f7fafb;
    }

    code {
      font-family: Consolas, "Liberation Mono", monospace;
      font-size: 8.1pt;
    }

    pre {
      background: #f4f7f8;
      border: 1px solid #d8e3e7;
      border-left: 4px solid #2f7d86;
      border-radius: 6px;
      margin: 8px 0 13px;
      padding: 9px 10px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      break-inside: avoid;
    }

    .diagram-block {
      margin: 10px 0 16px;
      padding: 12px;
      border: 1px solid #d8e3e7;
      border-radius: 10px;
      background: #fbfdfd;
      break-inside: avoid;
    }

    .diagram-block figcaption {
      color: #143642;
      font-size: 10.5pt;
      font-weight: 700;
      margin: 0 0 10px;
    }

    .node, .architecture-column, .integration-current, .integration-targets, .agent-node, .lane-step {
      border: 1px solid #c9dbe0;
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 1px 0 rgba(20, 54, 66, 0.05);
    }

    .flow-grid {
      display: grid;
      grid-template-columns: 1fr 22px 1.15fr 22px 0.9fr;
      gap: 8px;
      align-items: center;
    }

    .flow-branch {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .flow-branch.two {
      grid-template-columns: repeat(2, 1fr);
    }

    .node {
      min-height: 42px;
      padding: 9px 10px;
      color: #143642;
      font-weight: 700;
      text-align: center;
    }

    .node span {
      color: #52616b;
      display: block;
      font-size: 7.8pt;
      font-weight: 500;
      margin-top: 2px;
    }

    .node.primary {
      background: #eaf5f5;
      border-color: #9bc8cd;
    }

    .node.decision {
      background: #fff6eb;
      border-color: #e2b67f;
    }

    .node.alert {
      background: #fff1ec;
      border-color: #d99c83;
    }

    .node.calm {
      background: #edf8f1;
      border-color: #a4ccb2;
    }

    .node.wide {
      grid-column: 1 / 2;
    }

    .arrow, .architecture-arrow, .integration-arrow, .agent-arrow {
      color: #b45f3c;
      font-weight: 800;
      text-align: center;
      font-size: 14pt;
    }

    .arrow.down {
      grid-column: 1 / -1;
      line-height: 1;
    }

    .architecture-grid {
      display: grid;
      grid-template-columns: 1fr 24px 1fr 24px 1fr;
      gap: 8px;
      align-items: stretch;
    }

    .architecture-column {
      padding: 10px;
      background: #ffffff;
    }

    .component-stack {
      display: grid;
      gap: 6px;
    }

    .component-stack span, .integration-stack span, .target-grid span {
      display: block;
      border-radius: 6px;
      background: #f3f8f9;
      border: 1px solid #d7e5e8;
      color: #244651;
      padding: 6px 7px;
      font-size: 8pt;
    }

    .integration-grid {
      display: grid;
      grid-template-columns: 1fr 28px 2fr;
      gap: 10px;
      align-items: center;
    }

    .integration-current, .integration-targets {
      padding: 10px;
    }

    .integration-stack {
      display: grid;
      gap: 7px;
    }

    .target-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 7px;
    }

    .swimlane {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .lane-step {
      min-height: 78px;
      padding: 9px;
      position: relative;
    }

    .lane-step strong {
      color: #143642;
      display: block;
      margin-left: 24px;
    }

    .lane-step p {
      color: #52616b;
      margin: 5px 0 0 24px;
      font-size: 8pt;
    }

    .step-number {
      align-items: center;
      background: #2f7d86;
      border-radius: 50%;
      color: #ffffff;
      display: inline-flex;
      font-size: 7.5pt;
      font-weight: 700;
      height: 20px;
      justify-content: center;
      left: 8px;
      position: absolute;
      top: 8px;
      width: 20px;
    }

    .agent-graph {
      display: grid;
      grid-template-columns: 1fr 18px 1fr 18px 1fr 18px 1fr;
      gap: 7px;
      align-items: center;
    }

    .agent-node {
      min-height: 68px;
      padding: 8px;
      background: #f7fbfc;
    }

    .agent-node.human {
      background: #fff6eb;
      border-color: #e2b67f;
    }

    .agent-node strong {
      color: #143642;
      display: block;
      font-size: 8.7pt;
      margin-bottom: 4px;
    }

    .agent-node span {
      color: #52616b;
      display: block;
      font-size: 7.6pt;
    }

    .agent-arrow:nth-of-type(8) {
      display: none;
    }

    a {
      color: #2f7d86;
      text-decoration: none;
    }

    .footer-note {
      color: #6b7a84;
      font-size: 8pt;
      margin-top: 18px;
      padding-top: 8px;
      border-top: 1px solid #d9e5e8;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      h2 {
        break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <section class="cover">
    <p class="eyebrow">Discovery Phase Artifact Pack</p>
    <h1>Customer Health Discovery and Solution Design</h1>
    <p class="subtitle">Business canvas, process flow, architecture, integrations, swimlanes, application design, PRD, and AI agent graph for the Customer Health project.</p>
    <div class="cover-meta">
      <div><span>Project</span><strong>Customer Health</strong></div>
      <div><span>Phase</span><strong>Discovery</strong></div>
      <div><span>Generated</span><strong>${generatedOn}</strong></div>
    </div>
  </section>
  <main>
    ${content}
    <p class="footer-note">Prepared as part of the Customer Health discovery and solution design process.</p>
  </main>
</body>
</html>`;
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source markdown: ${sourcePath}`);
  }

  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome was not found at ${chromePath}`);
  }

  const markdown = fs.readFileSync(sourcePath, "utf8");
  const html = buildHtml(markdown);
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
    await page.setContent(html, { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: outputPath,
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `
        <div style="width:100%; font-family:Segoe UI, Arial, sans-serif; font-size:7px; color:#6b7a84; padding:0 0.55in; display:flex; justify-content:space-between;">
          <span>Customer Health Discovery Phase Artifacts</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`,
      margin: {
        top: "0.55in",
        right: "0.55in",
        bottom: "0.65in",
        left: "0.55in"
      }
    });
  } finally {
    await browser.close();
  }

  const pdfBytes = fs.readFileSync(outputPath);
  const pageCount = (pdfBytes.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  const stat = fs.statSync(outputPath);
  console.log(JSON.stringify({
    outputPath,
    pages: pageCount,
    bytes: stat.size
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
