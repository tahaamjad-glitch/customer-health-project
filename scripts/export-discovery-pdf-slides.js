const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs", "discovery", "slides");
const outputPdf = path.join(outDir, "customer-health-discovery-slides.pdf");
const outputHtml = path.join(outDir, "customer-health-discovery-slides.html");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function fileDataUri(relativePath) {
  const absolute = path.join(root, relativePath);
  const ext = path.extname(absolute).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
  return `data:${mime};base64,${fs.readFileSync(absolute).toString("base64")}`;
}

const images = {
  cover: fileDataUri("assets/customer-health-command-center.png"),
  master: fileDataUri("docs/discovery/jpeg/customer-health-master-diagram.jpg"),
  business: fileDataUri("docs/discovery/jpeg/customer-health-business-canvas.jpg"),
  process: fileDataUri("docs/discovery/jpeg/customer-health-process-flow.jpg"),
  architecture: fileDataUri("docs/discovery/jpeg/customer-health-functional-architecture.jpg"),
  integration: fileDataUri("docs/discovery/jpeg/customer-health-integration-diagram.jpg"),
  swimlane: fileDataUri("docs/discovery/jpeg/customer-health-swimlane-diagram.jpg"),
  appDesign: fileDataUri("docs/discovery/jpeg/customer-health-application-design.jpg"),
  prd: fileDataUri("docs/discovery/jpeg/customer-health-prd-requirements.jpg"),
  agent: fileDataUri("docs/discovery/jpeg/customer-health-agent-graph.jpg")
};

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function cards(items) {
  return `<div class="cards">${items.map((item) => `
    <article class="card">
      <strong>${esc(item.title)}</strong>
      <p>${esc(item.text)}</p>
    </article>
  `).join("")}</div>`;
}

function table(headers, rows, className = "") {
  return `<table class="${className}">
    <thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>`;
}

function slide({ kicker, title, body, className = "" }, index) {
  return `<section class="slide ${className}">
    <div class="slide-number">${String(index).padStart(2, "0")}</div>
    ${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ""}
    ${title ? `<h1>${esc(title)}</h1>` : ""}
    ${body}
  </section>`;
}

const artifacts = [
  ["Business Canvas", "Align business problem, value, users, and success metrics."],
  ["Process Flow", "Map the end-to-end operating process."],
  ["Functional Architecture", "Define major application capabilities and boundaries."],
  ["Integration Diagram", "Show internal and external system touchpoints."],
  ["Swimlane Diagram", "Clarify responsibilities across roles."],
  ["Application Design", "Describe screens, modules, data objects, and role behavior."],
  ["PRD", "Convert discovery findings into product requirements."],
  ["Agent Graph", "Define AI-assisted monitoring agents and human review loops."]
];

const slides = [];

slides.push((index) => slide({
  kicker: "Discovery Phase",
  title: "Customer Health Discovery and Solution Design",
  className: "cover-slide",
  body: `
    <div class="cover-grid">
      <div>
        <p class="lead">A presentation-ready PDF covering the full discovery pack: business canvas, process flow, architecture, integrations, swimlanes, application design, PRD, agent graph, and delivery roadmap.</p>
        <div class="metric-row">
          <span><strong>8</strong> artifacts</span>
          <span><strong>5</strong> roles</span>
          <span><strong>3</strong> seeded customers</span>
        </div>
      </div>
      <img class="cover-image" src="${images.cover}" alt="Customer Health command center" />
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Executive Summary",
  title: "Customer Health gives delivery teams one place to detect risk early.",
  body: `
    <div class="two-col">
      <div>
        <h2>Problem</h2>
        ${list([
          "Risk signals are scattered across updates, client feedback, technical blockers, and status reports.",
          "Delivery teams need role-scoped visibility, not a heavy project management replacement.",
          "Client-facing users need trusted status and a safe feedback path."
        ])}
      </div>
      <div>
        <h2>Solution</h2>
        ${list([
          "A governed dashboard for project health, ownership, alerts, feedback, and reporting.",
          "A weighted health score using progress, team performance, client satisfaction, delivery confidence, and risk level.",
          "AI-assisted monitoring with human review before escalation or external communication."
        ])}
      </div>
    </div>
    <div class="bottom-callout">Target outcome: fewer unresolved escalations, faster acknowledgement, better delivery confidence, and stronger customer trust.</div>`
}, index));

slides.push((index) => slide({
  kicker: "Artifact Register",
  title: "The discovery pack covers business, process, architecture, product, and AI design.",
  body: `
    ${table(["Artifact", "Purpose"], artifacts, "artifact-table")}
    <div class="note">These artifacts are prepared as part of the discovery and solution design process.</div>`
}, index));

slides.push((index) => slide({
  kicker: "Business Canvas",
  title: "The business case centers on early-warning visibility and accountable recovery.",
  body: `
    <div class="image-plus">
      <img src="${images.business}" alt="Business canvas diagram" />
      <div class="side-panel">
        <h2>Core canvas points</h2>
        ${list([
          "Target users: Admins, Project Managers, Team Leads, Developers, and Client/Users.",
          "Value: one governed workspace for health, ownership, alerts, feedback, and reporting.",
          "Success: faster acknowledgement, better client satisfaction, improved delivery confidence."
        ])}
      </div>
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Customer Records",
  title: "Seeded customer examples show contained, elevated, and critical delivery scenarios.",
  body: `
    <div class="customer-grid">
      <article class="customer healthy">
        <span>Contained</span>
        <h2>Signal</h2>
        <p>AI-powered security service provider platform covering patrolling, shifts, live tracking, incidents, billing, and analytics.</p>
        <strong>Health 86 | Production</strong>
      </article>
      <article class="customer watch">
        <span>Elevated</span>
        <h2>REI Blackbook</h2>
        <p>Retail intelligence migration with data normalization, API integration, analytics rollout, and ownership gaps.</p>
        <strong>Health 72 | UAT</strong>
      </article>
      <article class="customer risk">
        <span>Critical</span>
        <h2>Cafe Zupas</h2>
        <p>Cafe systems rollout covering POS integration, location readiness, reporting, training, and pilot recovery.</p>
        <strong>Health 58 | Staging</strong>
      </article>
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Process Flow",
  title: "The operating loop moves from scoped access to scoring, alerts, and recovery.",
  body: `
    <img class="wide-diagram" src="${images.process}" alt="Process flow diagram" />
    <div class="process-notes">
      ${cards([
        { title: "Scoped first", text: "Role and project access are applied before data is shown." },
        { title: "Updates feed score", text: "Project updates and client feedback change the project health score." },
        { title: "Risk loop", text: "Alerts are acknowledged by Admins or Project Managers, then folded into reports and monitoring." }
      ])}
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Functional Architecture",
  title: "The current baseline is a focused web app, Node API, and local data layer.",
  body: `
    <div class="image-plus architecture-slide">
      <img src="${images.architecture}" alt="Functional architecture diagram" />
      <div class="side-panel">
        <h2>Current capabilities</h2>
        ${list([
          "Local login, registration, session cookies, and role-based access.",
          "Project, feedback, acknowledgement, and report APIs.",
          "Health score recalculation and risk alert refresh from the app state."
        ])}
      </div>
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Integration Diagram",
  title: "The target design connects Customer Health to the systems where signals already live.",
  body: `
    <div class="image-plus integration-slide">
      <img src="${images.integration}" alt="Integration diagram" />
      <div class="side-panel">
        <h2>Integration decisions</h2>
        ${list([
          "Identity provider: confirm SSO provider, role claims, and group mappings.",
          "CRM and PM tools: confirm customer, milestone, task, blocker, and owner sources.",
          "Support and comms: confirm incident fields, SLA signals, alert channels, and digest cadence.",
          "BI: confirm reporting granularity, retention, audit, and schema ownership."
        ])}
      </div>
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Swimlane Diagram",
  title: "Each role has a clear ownership lane in the health-monitoring workflow.",
  body: `
    <div class="image-plus swimlane-slide">
      <img src="${images.swimlane}" alt="Swimlane diagram" />
      <div class="side-panel">
        <h2>Role summary</h2>
        ${list([
          "Admin: configuration, governance, access, and portfolio reporting.",
          "Project Manager: health, risk response, timeline, and stakeholder updates.",
          "Team Lead and Developer: progress, blockers, technical issues, and readiness.",
          "Client/User: project summary review and satisfaction feedback."
        ])}
      </div>
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Application Design",
  title: "The application structure supports repeated health review without overloading users.",
  body: `
    <div class="image-plus app-slide">
      <img src="${images.appDesign}" alt="Application design diagram" />
      <div class="side-panel">
        <h2>Product surface</h2>
        ${list([
          "Dashboard: portfolio health, risk, delivery, activity, and predictions.",
          "Projects: filters, selected project profile, create/update workflows.",
          "Health Metrics and Risk Alerts: score explanation, driver list, and acknowledgement.",
          "Reports and Proposal: forecast, stakeholder brief, escalation prevention drivers."
        ])}
      </div>
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Health Score",
  title: "The scoring model is transparent enough for stakeholder review and calibration.",
  body: `
    <div class="formula">Health = progress × 28% + team performance × 24% + client satisfaction × 22% + delivery confidence × 26% − risk penalty</div>
    <div class="two-col">
      <div>
        <h2>Risk penalty</h2>
        ${table(["Risk Level", "Penalty"], [
          ["Contained", "0"],
          ["Elevated", "6"],
          ["Critical", "12"]
        ])}
      </div>
      <div>
        <h2>Role behavior</h2>
        ${list([
          "Admin sees all records and can manage access, risks, and reports.",
          "Project Managers can create and edit assigned records.",
          "Team Leads and Developers can update assigned delivery details.",
          "Client/Users see their own project and submit feedback only."
        ])}
      </div>
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "PRD",
  title: "The first release focuses on role-scoped visibility, health updates, risk alerts, and reporting.",
  body: `
    <div class="image-plus prd-slide">
      <img src="${images.prd}" alt="PRD requirements diagram" />
      <div class="side-panel">
        <h2>Must-have requirements</h2>
        ${list([
          "Users can log in and receive role-scoped application state.",
          "Authorized users can create and update customer project records.",
          "Client/Users can submit satisfaction feedback for their own project.",
          "The system recalculates health and surfaces risk alerts after updates."
        ])}
      </div>
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Acceptance Criteria",
  title: "The MVP succeeds when the workflow is scoped, explainable, and action-oriented.",
  body: `
    ${table(["Scenario", "Acceptance Criteria"], [
      ["Role-scoped login", "Admins see all projects; Project Managers see assigned projects; Client/Users see their own project."],
      ["Health update", "Progress or risk changes update score and dashboard state without page reload."],
      ["Client feedback", "Satisfaction feedback updates the record and adjusts health scoring."],
      ["Risk acknowledgement", "Only Admins and Project Managers can acknowledge visible risk alerts."],
      ["Report export", "Export prepares a scoped report response for the signed-in actor."],
      ["Deployment", "/api/health returns operational status from the deployed environment."]
    ], "acceptance-table")}`
}, index));

slides.push((index) => slide({
  kicker: "Agent Graph",
  title: "AI assistance should summarize, detect, and recommend while humans approve escalation.",
  body: `
    <div class="image-plus agent-slide">
      <img src="${images.agent}" alt="Agent graph diagram" />
      <div class="side-panel">
        <h2>Guardrails</h2>
        ${list([
          "Ingestion connectors start read-only during pilot.",
          "Health scoring uses transparent, versioned weights.",
          "Detected signals remain separate from approved escalations.",
          "Human review is required before alerts become stakeholder communication."
        ])}
      </div>
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Release Plan",
  title: "The roadmap moves from discovery to MVP, integrations, AI assist, and scale.",
  body: `
    <div class="timeline">
      ${[
        ["Discovery", "Confirm personas, workflows, integrations, scoring model, data sensitivity, and reporting needs."],
        ["MVP", "Role-scoped dashboard, project health records, scoring, risk alerts, feedback, and reports."],
        ["Integration Pilot", "Add one source integration for project status and one for support or incidents."],
        ["AI Assist", "Add summaries, recommendation review, and notification routing."],
        ["Scale", "Move to managed database, audit logs, SSO, and BI export pipeline."]
      ].map((item, i) => `<div class="timeline-item"><span>${i + 1}</span><strong>${esc(item[0])}</strong><p>${esc(item[1])}</p></div>`).join("")}
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Risks And Dependencies",
  title: "The discovery phase should resolve score calibration, source-of-truth, and audit expectations.",
  body: `
    <div class="two-col">
      <div>
        <h2>Key risks</h2>
        ${list([
          "Score model may not match stakeholder judgment.",
          "External systems may have inconsistent data quality.",
          "Client-visible data may expose internal details.",
          "Alert fatigue may reduce adoption.",
          "Local JSON storage is not production-grade."
        ])}
      </div>
      <div>
        <h2>Mitigations</h2>
        ${list([
          "Calibrate thresholds with historical project outcomes.",
          "Pilot read-only integrations with a data quality review.",
          "Keep internal risks separate from clientRisks.",
          "Define severity thresholds and acknowledgement rules.",
          "Plan migration to a managed database before production scale."
        ])}
      </div>
    </div>`
}, index));

slides.push((index) => slide({
  kicker: "Master Diagram",
  title: "All discovery artifacts connect into one solution-design view.",
  body: `<img class="master-image" src="${images.master}" alt="Customer Health master diagram" />`
}, index));

slides.push((index) => slide({
  kicker: "Next Steps",
  title: "Use the deck to align stakeholders, then lock the MVP scope and integration pilot.",
  body: `
    <div class="next-grid">
      ${cards([
        { title: "1. Review", text: "Walk stakeholders through the business canvas, roles, score model, and risk workflow." },
        { title: "2. Decide", text: "Confirm thresholds, client-visible content, audit needs, and source-of-truth systems." },
        { title: "3. Prioritize", text: "Lock the MVP requirements and identify the first integration pilot." },
        { title: "4. Build", text: "Move from local JSON demo to managed persistence, SSO, audit, and notification routing." }
      ])}
    </div>
    <div class="bottom-callout">Prepared from: Customer Health Discovery Phase Artifacts, master diagram, and JPEG diagram set.</div>`
}, index));

function html() {
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Customer Health Discovery Slides</title>
  <style>
    @page { size: 13.333in 7.5in; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f4f8f9;
      color: #143642;
      font-family: "Segoe UI", Arial, sans-serif;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .slide {
      position: relative;
      width: 13.333in;
      height: 7.5in;
      padding: 0.48in 0.58in;
      background:
        linear-gradient(90deg, rgba(47,125,134,0.12), transparent 36%),
        #f8fbfb;
      page-break-after: always;
      overflow: hidden;
    }
    .slide::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 9px;
      background: #2f7d86;
    }
    .slide-number {
      position: absolute;
      right: 0.45in;
      bottom: 0.28in;
      color: #91a4ad;
      font-size: 12px;
      font-weight: 700;
    }
    .kicker {
      margin: 0 0 10px;
      color: #b45f3c;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    h1 {
      max-width: 10.5in;
      margin: 0 0 22px;
      color: #143642;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 34px;
      line-height: 1.08;
      letter-spacing: 0;
    }
    h2 {
      margin: 0 0 10px;
      color: #143642;
      font-size: 18px;
      line-height: 1.2;
    }
    p { margin: 0; }
    .lead {
      color: #52616b;
      font-size: 22px;
      line-height: 1.45;
      max-width: 5.2in;
      margin-top: 0.2in;
    }
    ul {
      margin: 0;
      padding-left: 22px;
      color: #253642;
      font-size: 18px;
      line-height: 1.45;
    }
    li { margin: 0 0 10px; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 10px 24px rgba(20, 54, 66, 0.08);
      border-radius: 12px;
      overflow: hidden;
      font-size: 15px;
    }
    th, td {
      border: 1px solid #d6e5e8;
      padding: 10px 12px;
      text-align: left;
      vertical-align: top;
    }
    th {
      color: white;
      background: #143642;
      font-weight: 800;
    }
    tbody tr:nth-child(even) td { background: #f4f8f9; }
    .artifact-table td:first-child { width: 28%; font-weight: 800; color: #143642; }
    .acceptance-table td:first-child { width: 25%; font-weight: 800; color: #143642; }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .two-col > div,
    .side-panel,
    .card,
    .customer,
    .timeline-item,
    .bottom-callout,
    .formula,
    .note {
      background: rgba(255,255,255,0.92);
      border: 1px solid #d6e5e8;
      border-radius: 16px;
      box-shadow: 0 10px 22px rgba(20, 54, 66, 0.08);
    }
    .two-col > div { padding: 22px; min-height: 3.8in; }
    .bottom-callout {
      margin-top: 24px;
      padding: 18px 22px;
      border-left: 8px solid #2f7d86;
      color: #143642;
      font-size: 19px;
      font-weight: 800;
      line-height: 1.35;
    }
    .note {
      margin-top: 16px;
      padding: 14px 18px;
      color: #52616b;
      font-size: 16px;
      font-weight: 700;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .card {
      padding: 18px;
      min-height: 1.2in;
    }
    .card strong {
      display: block;
      color: #143642;
      font-size: 17px;
      margin-bottom: 8px;
    }
    .card p {
      color: #52616b;
      font-size: 15px;
      line-height: 1.35;
    }
    .cover-slide {
      background: #0f2f3a;
      color: #fff;
    }
    .cover-slide::before { background: #b45f3c; }
    .cover-slide h1 {
      color: #fff;
      font-size: 48px;
      max-width: 5.8in;
      margin-top: 0.35in;
    }
    .cover-slide .kicker { color: #f0b58d; }
    .cover-grid {
      display: grid;
      grid-template-columns: 0.88fr 1.12fr;
      gap: 28px;
      align-items: center;
    }
    .cover-image {
      width: 100%;
      height: 5.75in;
      object-fit: cover;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.28);
      box-shadow: 0 18px 44px rgba(0,0,0,0.28);
    }
    .metric-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 34px;
    }
    .metric-row span {
      display: block;
      padding: 16px;
      border-radius: 14px;
      background: rgba(255,255,255,0.1);
      color: #d9e7ea;
      font-size: 13px;
      font-weight: 700;
    }
    .metric-row strong {
      display: block;
      color: #fff;
      font-size: 32px;
      line-height: 1;
    }
    .image-plus {
      display: grid;
      grid-template-columns: 1.28fr 0.72fr;
      gap: 22px;
      align-items: stretch;
    }
    .image-plus img,
    .wide-diagram,
    .master-image {
      width: 100%;
      border-radius: 14px;
      box-shadow: 0 12px 26px rgba(20, 54, 66, 0.12);
      border: 1px solid #d6e5e8;
      background: white;
    }
    .image-plus img {
      height: 4.65in;
      object-fit: contain;
    }
    .side-panel {
      padding: 20px;
      min-height: 4.65in;
    }
    .side-panel ul { font-size: 16px; }
    .wide-diagram {
      height: 2.35in;
      object-fit: contain;
    }
    .process-notes { margin-top: 22px; }
    .customer-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 16px;
    }
    .customer {
      min-height: 4.6in;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }
    .customer::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 8px;
      background: #2f7d86;
    }
    .customer.watch::before { background: #b45f3c; }
    .customer.risk::before { background: #8f3f37; }
    .customer span {
      display: inline-block;
      padding: 7px 10px;
      border-radius: 999px;
      background: #eaf5f5;
      color: #143642;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .customer h2 {
      margin: 24px 0 16px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 30px;
    }
    .customer p {
      color: #52616b;
      font-size: 18px;
      line-height: 1.45;
      min-height: 1.9in;
    }
    .customer strong {
      display: block;
      margin-top: 18px;
      color: #143642;
      font-size: 18px;
    }
    .formula {
      padding: 22px 26px;
      margin-bottom: 24px;
      color: #143642;
      font-size: 24px;
      line-height: 1.35;
      font-weight: 900;
      border-left: 8px solid #b45f3c;
    }
    .timeline {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      margin-top: 12px;
    }
    .timeline-item {
      min-height: 4.4in;
      padding: 20px;
      position: relative;
    }
    .timeline-item span {
      display: inline-flex;
      width: 34px;
      height: 34px;
      align-items: center;
      justify-content: center;
      background: #2f7d86;
      color: white;
      border-radius: 50%;
      font-weight: 900;
      margin-bottom: 18px;
    }
    .timeline-item strong {
      display: block;
      color: #143642;
      font-size: 20px;
      margin-bottom: 12px;
    }
    .timeline-item p {
      color: #52616b;
      font-size: 15px;
      line-height: 1.38;
    }
    .master-image {
      height: 5.55in;
      object-fit: contain;
      object-position: top center;
    }
    .next-grid .cards {
      grid-template-columns: repeat(4, 1fr);
    }
    .next-grid .card {
      min-height: 3.3in;
    }
    .next-grid .card strong { font-size: 21px; }
    .next-grid .card p { font-size: 16px; }
  </style>
</head>
<body>
  ${slides.map((render, index) => render(index + 1)).join("\n")}
  <script>document.title = "Customer Health Discovery Slides - ${esc(now)}";</script>
</body>
</html>`;
}

async function main() {
  if (!fs.existsSync(chromePath)) throw new Error(`Chrome not found at ${chromePath}`);
  fs.mkdirSync(outDir, { recursive: true });
  const deckHtml = html();
  fs.writeFileSync(outputHtml, deckHtml, "utf8");

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    await page.setContent(deckHtml, { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: outputPdf,
      width: "13.333in",
      height: "7.5in",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: true
    });
  } finally {
    await browser.close();
  }

  const pdfBytes = fs.readFileSync(outputPdf);
  const pages = (pdfBytes.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  console.log(JSON.stringify({
    outputPdf,
    outputHtml,
    pages,
    bytes: fs.statSync(outputPdf).size
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
