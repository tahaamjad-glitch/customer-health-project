const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "docs", "discovery", "customer-health-master-diagram.svg");

const W = 1800;
const H = 2400;

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function textLines(lines, x, y, options = {}) {
  const {
    size = 22,
    weight = 500,
    fill = "#253642",
    lineHeight = Math.round(size * 1.35),
    anchor = "start",
    className = ""
  } = options;
  return `<text ${className ? `class="${className}" ` : ""}x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">
${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`).join("\n")}
</text>`;
}

function panel({
  x,
  y,
  w,
  h,
  title,
  subtitle,
  items = [],
  fill = "#ffffff",
  stroke = "#cfdee3",
  accent = "#2f7d86",
  maxChars = 34,
  titleSize = 26,
  subtitleSize = 16,
  itemSize = 16
}) {
  const radius = 18;
  let svg = `
<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
  <rect x="${x}" y="${y}" width="${w}" height="10" rx="${radius}" fill="${accent}"/>
  ${textLines(wrapText(title, maxChars), x + 24, y + 45, { size: titleSize, weight: 800, fill: "#143642", lineHeight: Math.round(titleSize * 1.2) })}
`;
  let cursor = y + 76;
  if (subtitle) {
    svg += textLines(wrapText(subtitle, maxChars + 10), x + 24, cursor, { size: subtitleSize, weight: 600, fill: "#63727c", lineHeight: Math.round(subtitleSize * 1.35) });
    cursor += Math.max(30, wrapText(subtitle, maxChars + 10).length * Math.round(subtitleSize * 1.35) + 12);
  }
  items.forEach((item) => {
    const itemLines = wrapText(item, maxChars);
    svg += `<circle cx="${x + 32}" cy="${cursor - 6}" r="5" fill="${accent}"/>`;
    svg += textLines(itemLines, x + 48, cursor, { size: itemSize, weight: 500, fill: "#253642", lineHeight: Math.round(itemSize * 1.35) });
    cursor += itemLines.length * Math.round(itemSize * 1.35) + 9;
  });
  svg += "</g>";
  return svg;
}

function pill({ x, y, w, h = 56, label, fill = "#eaf5f5", stroke = "#9bc8cd", text = "#143642" }) {
  return `
<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
  ${textLines(wrapText(label, Math.max(12, Math.floor(w / 15))), x + w / 2, y + h / 2 + 7, { size: 18, weight: 800, fill: text, anchor: "middle", lineHeight: 20 })}
</g>`;
}

function arrow({ x1, y1, x2, y2, color = "#b45f3c", width = 3, dashed = false }) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dashed ? 'stroke-dasharray="10 8"' : ""} marker-end="url(#arrow)"/>`;
}

function sectionLabel(label, x, y) {
  return `<text x="${x}" y="${y}" fill="#b45f3c" font-size="18" font-weight="900" letter-spacing="2">${esc(label.toUpperCase())}</text>`;
}

const processSteps = [
  "Sign in",
  "Load role scope",
  "Create / update / feedback",
  "Recalculate score",
  "Refresh alerts",
  "Acknowledge / report",
  "Monitor next update"
];

const roles = [
  ["Admin", "Configure users, permissions, governance, reports"],
  ["Project Manager", "Own health, risk response, timelines, stakeholders"],
  ["Team Lead", "Update progress, team performance, blockers"],
  ["Developer", "Add implementation progress and issue notes"],
  ["Client/User", "Review summary and submit satisfaction feedback"],
  ["System", "Enforce access, score health, surface alerts"]
];

const appModules = [
  "Login / registration",
  "Dashboard",
  "Projects",
  "Health Metrics",
  "Risk Alerts",
  "Access Control",
  "Reports",
  "Proposal"
];

const agentStages = [
  "Data Ingestion",
  "Signal Normalization",
  "Health Scoring",
  "Risk Detection",
  "Explanation",
  "Recommendation",
  "Human Review",
  "Notify / Report"
];

let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">Customer Health Discovery and Solution Design Master Diagram</title>
<desc id="desc">A consolidated diagram covering the business canvas, process flow, functional architecture, integrations, swimlane responsibilities, application design, PRD requirements, and AI agent graph for the Customer Health project.</desc>
<defs>
  <marker id="arrow" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto" markerUnits="strokeWidth">
    <path d="M2,2 L12,7 L2,12 Z" fill="#b45f3c"/>
  </marker>
  <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
    <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#143642" flood-opacity="0.12"/>
  </filter>
</defs>
<rect width="${W}" height="${H}" fill="#f6fafb"/>
<rect x="0" y="0" width="${W}" height="22" fill="#2f7d86"/>
<g filter="url(#shadow)">
  <rect x="70" y="70" width="1660" height="180" rx="26" fill="#ffffff" stroke="#d7e5e8" stroke-width="2"/>
  ${textLines(["Customer Health Discovery and Solution Design"], 110, 140, { size: 50, weight: 900, fill: "#143642", lineHeight: 58 })}
  ${textLines(wrapText("Complete discovery artifact map: business canvas, workflow, architecture, integrations, roles, application design, PRD, and AI-assisted agent graph.", 92), 112, 185, { size: 22, weight: 600, fill: "#63727c", lineHeight: 30 })}
  ${pill({ x: 1390, y: 105, w: 285, h: 78, label: "Discovery Phase Artifact Pack", fill: "#fff6eb", stroke: "#e2b67f", text: "#8a4a2f" })}
</g>

${sectionLabel("Business Canvas", 90, 305)}
${panel({
  x: 70,
  y: 325,
  w: 400,
  h: 330,
  title: "Business Context",
  subtitle: "Why the product exists",
  accent: "#2f7d86",
  items: [
    "Problem: risk signals are scattered across delivery updates, client feedback, blockers, and reports.",
    "Value: one governed workspace for health, ownership, alerts, and reporting.",
    "Users: Admins, Project Managers, Team Leads, Developers, Client/Users."
  ],
  maxChars: 34,
  itemSize: 15
})}
${panel({
  x: 495,
  y: 325,
  w: 400,
  h: 330,
  title: "Success Measures",
  subtitle: "How value is measured",
  accent: "#799a3f",
  items: [
    "Fewer unresolved escalations.",
    "Faster risk acknowledgement.",
    "Improved delivery confidence and client satisfaction.",
    "Better adoption by project roles."
  ],
  maxChars: 34,
  itemSize: 15
})}
${panel({
  x: 920,
  y: 325,
  w: 380,
  h: 330,
  title: "Customer Examples",
  subtitle: "Seeded delivery records",
  accent: "#b45f3c",
  items: [
    "Signal: contained risk and production rollout.",
    "REI Blackbook: elevated migration and analytics risk.",
    "Cafe Zupas: critical POS recovery risk."
  ],
  maxChars: 32,
  itemSize: 15
})}
${panel({
  x: 1325,
  y: 325,
  w: 405,
  h: 330,
  title: "Discovery Questions",
  subtitle: "Decisions before scale",
  accent: "#715f93",
  items: [
    "Which systems are sources of truth?",
    "Which thresholds trigger escalation?",
    "What audit trail is required?",
    "What is safe for client-facing views?"
  ],
  maxChars: 34,
  itemSize: 15
})}

${sectionLabel("End-to-End Process Flow", 90, 730)}
<g filter="url(#shadow)">
  <rect x="70" y="750" width="1660" height="190" rx="22" fill="#ffffff" stroke="#d7e5e8" stroke-width="2"/>
  ${processSteps.map((step, index) => pill({
    x: 110 + index * 228,
    y: 800,
    w: 176,
    h: 72,
    label: step,
    fill: index === 4 ? "#fff1ec" : "#eaf5f5",
    stroke: index === 4 ? "#d99c83" : "#9bc8cd",
    text: "#143642"
  })).join("")}
  ${processSteps.slice(0, -1).map((_, index) => arrow({ x1: 289 + index * 228, y1: 836, x2: 326 + index * 228, y2: 836 })).join("")}
  ${textLines(["Core cycle: updates and feedback feed health scoring, alerts, acknowledgement, reporting, and the next monitoring loop."], 110, 908, { size: 19, weight: 600, fill: "#63727c" })}
</g>

${sectionLabel("Functional Architecture and Integrations", 90, 1015)}
<g filter="url(#shadow)">
  <rect x="70" y="1035" width="1040" height="430" rx="24" fill="#ffffff" stroke="#d7e5e8" stroke-width="2"/>
  ${textLines(["Functional Architecture"], 110, 1085, { size: 30, weight: 900, fill: "#143642" })}
  ${panel({
    x: 110,
    y: 1115,
    w: 285,
    h: 255,
    title: "Web Application",
    accent: "#2f7d86",
    items: ["Dashboard", "Projects", "Health metrics", "Risks", "Access control", "Reports"],
    maxChars: 22
  })}
  ${panel({
    x: 425,
    y: 1115,
    w: 300,
    h: 255,
    title: "Node Backend",
    accent: "#b45f3c",
    items: ["HTTP router", "Session cookies", "RBAC", "Project APIs", "Health scoring"],
    maxChars: 23
  })}
  ${panel({
    x: 755,
    y: 1115,
    w: 295,
    h: 255,
    title: "Data Layer",
    accent: "#715f93",
    items: ["data/db.json", "Actors", "Projects", "Acknowledgements", "Sessions"],
    maxChars: 23
  })}
  ${arrow({ x1: 397, y1: 1245, x2: 423, y2: 1245 })}
  ${arrow({ x1: 727, y1: 1245, x2: 753, y2: 1245 })}
  ${textLines(["Score = progress 28% + team performance 24% + client satisfaction 22% + delivery confidence 26% - risk penalty"], 115, 1420, { size: 18, weight: 700, fill: "#143642" })}
</g>
<g filter="url(#shadow)">
  <rect x="1145" y="1035" width="585" height="430" rx="24" fill="#ffffff" stroke="#d7e5e8" stroke-width="2"/>
  ${textLines(["Target Integrations"], 1185, 1085, { size: 30, weight: 900, fill: "#143642" })}
  ${[
    ["Identity Provider", "SSO, roles, groups"],
    ["CRM / Customer Master", "accounts, contacts, renewals"],
    ["Project Management", "milestones, tasks, blockers"],
    ["Support / Ticketing", "incidents, defects, SLA signals"],
    ["Email / Slack / Teams", "alerts, digests, escalation routing"],
    ["BI / Data Warehouse", "snapshots, audit data, dashboards"]
  ].map((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    return panel({
      x: 1185 + col * 265,
      y: 1120 + row * 95,
      w: 238,
      h: 76,
      title: item[0],
      subtitle: item[1],
      accent: "#799a3f",
      items: [],
      maxChars: 22,
      titleSize: 21,
      subtitleSize: 14
    });
  }).join("")}
</g>

${sectionLabel("Role Swimlanes", 90, 1540)}
<g filter="url(#shadow)">
  <rect x="70" y="1560" width="790" height="390" rx="24" fill="#ffffff" stroke="#d7e5e8" stroke-width="2"/>
  ${roles.map((role, index) => {
    const y = 1605 + index * 55;
    return `
    <rect x="110" y="${y}" width="710" height="42" rx="12" fill="${index % 2 === 0 ? "#f3f8f9" : "#ffffff"}" stroke="#d7e5e8"/>
    ${textLines([role[0]], 130, y + 27, { size: 18, weight: 900, fill: "#143642" })}
    ${textLines(wrapText(role[1], 52), 330, y + 27, { size: 17, weight: 600, fill: "#52616b", lineHeight: 21 })}
    `;
  }).join("")}
</g>

${sectionLabel("Application Design", 915, 1540)}
<g filter="url(#shadow)">
  <rect x="895" y="1560" width="835" height="390" rx="24" fill="#ffffff" stroke="#d7e5e8" stroke-width="2"/>
  ${textLines(["Information architecture and role-based product surface"], 935, 1610, { size: 24, weight: 800, fill: "#143642" })}
  ${appModules.map((module, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    return pill({
      x: 935 + col * 190,
      y: 1650 + row * 82,
      w: 160,
      h: 58,
      label: module,
      fill: "#f3f8f9",
      stroke: "#c9dbe0"
    });
  }).join("")}
  ${panel({
    x: 935,
    y: 1820,
    w: 745,
    h: 95,
    title: "Key data objects",
    subtitle: "Actor, Project, Timeline, Ownership, Risk model, Acknowledgement, Session",
    accent: "#2f7d86",
    items: [],
    maxChars: 64
  })}
</g>

${sectionLabel("PRD Requirements", 90, 2025)}
<g filter="url(#shadow)">
  <rect x="70" y="2045" width="790" height="245" rx="24" fill="#ffffff" stroke="#d7e5e8" stroke-width="2"/>
  ${panel({
    x: 110,
    y: 2078,
    w: 340,
    h: 190,
    title: "Product Goals",
    accent: "#2f7d86",
    items: [
      "Single source of health visibility.",
      "Detect project risk early.",
      "Turn signals into accountable actions."
    ],
    maxChars: 31,
    itemSize: 15
  })}
  ${panel({
    x: 485,
    y: 2078,
    w: 335,
    h: 190,
    title: "Must-Have Requirements",
    accent: "#b45f3c",
    items: [
      "Role-scoped login and access.",
      "Records, updates, and feedback.",
      "Health scoring and risk alerts."
    ],
    maxChars: 31,
    itemSize: 15
  })}
</g>

${sectionLabel("AI Agent Graph", 915, 2025)}
<g filter="url(#shadow)">
  <rect x="895" y="2045" width="835" height="245" rx="24" fill="#ffffff" stroke="#d7e5e8" stroke-width="2"/>
  ${agentStages.map((stage, index) => {
    const x = 930 + (index % 4) * 195;
    const y = 2088 + Math.floor(index / 4) * 84;
    return pill({
      x,
      y,
      w: 160,
      h: 56,
      label: stage,
      fill: index === 6 ? "#fff6eb" : "#eaf5f5",
      stroke: index === 6 ? "#e2b67f" : "#9bc8cd",
      text: "#143642"
    });
  }).join("")}
  ${[0, 1, 2].map((index) => arrow({ x1: 1092 + index * 195, y1: 2116, x2: 1122 + index * 195, y2: 2116 })).join("")}
  ${arrow({ x1: 1505, y1: 2130, x2: 1505, y2: 2168 })}
  ${[0, 1, 2].map((index) => arrow({ x1: 1482 - index * 195, y1: 2200, x2: 1452 - index * 195, y2: 2200 })).join("")}
  ${textLines(["Human review remains the approval point before escalation, notification, or client-facing communication."], 935, 2265, { size: 18, weight: 700, fill: "#63727c" })}
</g>

${arrow({ x1: 900, y1: 940, x2: 900, y2: 1028, dashed: true })}
${arrow({ x1: 1110, y1: 1245, x2: 1140, y2: 1245, dashed: true })}
${arrow({ x1: 860, y1: 1760, x2: 890, y2: 1760, dashed: true })}
${arrow({ x1: 860, y1: 2168, x2: 890, y2: 2168, dashed: true })}

<text x="90" y="2350" fill="#63727c" font-size="16" font-weight="600">Prepared for the Customer Health discovery and solution design process. Source: docs/discovery/customer-health-discovery-artifacts.md</text>
</svg>`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, svg, "utf8");

console.log(JSON.stringify({
  outputPath,
  bytes: fs.statSync(outputPath).size
}, null, 2));
