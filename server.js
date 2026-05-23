const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 4174);
const HOST = process.env.HOST || "0.0.0.0";
const DISPLAY_HOST = HOST === "0.0.0.0" ? "localhost" : HOST;
const PUBLIC_ORIGIN = (process.env.PUBLIC_ORIGIN || `http://${DISPLAY_HOST}:${PORT}`).replace(/\/$/, "");
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true" || PUBLIC_ORIGIN.startsWith("https://");
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const PROJECT_DOMAIN = process.env.PROJECT_DOMAIN || "www.projecthealth.com";
const CANONICAL_ORIGIN = (process.env.CANONICAL_ORIGIN || `https://${PROJECT_DOMAIN}`).replace(/\/$/, "");
const configuredOrigins = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = new Set([
  PUBLIC_ORIGIN,
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  CANONICAL_ORIGIN,
  `https://${PROJECT_DOMAIN}`,
  `http://${PROJECT_DOMAIN}`,
  ...configuredOrigins
]);

const roleDefinitions = [
  {
    name: "Admin",
    accessLevel: "Full portfolio access",
    responsibilities: "Configure users, create and edit all project records, manage permissions, acknowledge risk, and export portfolio reports.",
    permissions: ["View all records", "Create projects", "Edit all records", "Manage users", "Acknowledge risks", "Export reports"]
  },
  {
    name: "Project Manager",
    accessLevel: "Assigned portfolio access",
    responsibilities: "Own customer delivery, maintain status, progress, risks, issues, satisfaction, and timelines for assigned projects.",
    permissions: ["View assigned records", "Create projects", "Edit assigned records", "Acknowledge risks", "Export assigned reports"]
  },
  {
    name: "Team Lead",
    accessLevel: "Assigned delivery access",
    responsibilities: "Update progress, team performance, delivery blockers, and technical risks for assigned projects.",
    permissions: ["View assigned records", "Update progress", "Update risks/issues", "Update team performance"]
  },
  {
    name: "Developer",
    accessLevel: "Assigned task access",
    responsibilities: "View assigned project delivery details, update technical progress, and add implementation issue notes.",
    permissions: ["View assigned records", "Update technical progress", "Add issue notes"]
  },
  {
    name: "Client/User",
    accessLevel: "Own project summary access",
    responsibilities: "View their project summary, delivery timeline, client-visible risks, and submit satisfaction feedback.",
    permissions: ["View own project", "Submit satisfaction feedback"]
  }
];

const seedData = {
  actors: [
    {
      id: "admin-olivia",
      email: "admin@projecthealth.test",
      password: "Admin@123",
      name: "Taha Amjad",
      role: "Admin",
      organization: "PMO",
      projectIds: ["all"],
      accessLevel: "All customer project records",
      responsibilities: "Owns system configuration, user access, portfolio governance, and executive reporting."
    },
    {
      id: "pm-lareeb",
      email: "lareeb@projecthealth.test",
      password: "Manager@123",
      name: "Dr. Lareeb Saleem",
      role: "Project Manager",
      organization: "Delivery",
      projectIds: ["signal", "rei-blackbook"],
      accessLevel: "Signal and REI Blackbook records",
      responsibilities: "Maintains delivery health, risk response, client communications, and timeline updates."
    },
    {
      id: "pm-sam",
      email: "sam@projecthealth.test",
      password: "Manager@123",
      name: "Sam Rivera",
      role: "Project Manager",
      organization: "Delivery",
      projectIds: ["cafe-zupas"],
      accessLevel: "Cafe Zupas records",
      responsibilities: "Owns project status, escalations, stakeholder updates, and delivery forecasting."
    },
    {
      id: "lead-ari",
      email: "ari@projecthealth.test",
      password: "Lead@123",
      name: "Ari Khan",
      role: "Team Lead",
      organization: "Engineering",
      projectIds: ["signal"],
      accessLevel: "Signal delivery records",
      responsibilities: "Updates engineering progress, team performance, sprint risks, and implementation blockers."
    },
    {
      id: "lead-noor",
      email: "noor@projecthealth.test",
      password: "Lead@123",
      name: "Noor Patel",
      role: "Team Lead",
      organization: "Engineering",
      projectIds: ["rei-blackbook"],
      accessLevel: "REI Blackbook delivery records",
      responsibilities: "Updates team throughput, integration risks, delivery blockers, and issue resolution."
    },
    {
      id: "lead-leah",
      email: "leah@projecthealth.test",
      password: "Lead@123",
      name: "Leah Brooks",
      role: "Team Lead",
      organization: "Engineering",
      projectIds: ["cafe-zupas"],
      accessLevel: "Cafe Zupas delivery records",
      responsibilities: "Updates task progress, resource constraints, technical issues, and release readiness."
    },
    {
      id: "dev-alex",
      email: "alex@projecthealth.test",
      password: "Dev@123",
      name: "Alex Lee",
      role: "Developer",
      organization: "Engineering",
      projectIds: ["signal"],
      accessLevel: "Signal implementation records",
      responsibilities: "Updates assigned delivery progress and adds implementation issue notes."
    },
    {
      id: "dev-priya",
      email: "priya@projecthealth.test",
      password: "Dev@123",
      name: "Priya Shah",
      role: "Developer",
      organization: "Engineering",
      projectIds: ["rei-blackbook"],
      accessLevel: "REI Blackbook implementation records",
      responsibilities: "Updates integration progress, defects, and technical issue notes."
    },
    {
      id: "dev-ben",
      email: "ben@projecthealth.test",
      password: "Dev@123",
      name: "Ben Cole",
      role: "Developer",
      organization: "Engineering",
      projectIds: ["cafe-zupas"],
      accessLevel: "Cafe Zupas implementation records",
      responsibilities: "Updates assigned build progress and release issue notes."
    },
    {
      id: "client-jenna",
      email: "jenna@signal.test",
      password: "Client@123",
      name: "Jenna Mills",
      role: "Client/User",
      organization: "Signal",
      projectIds: ["signal"],
      accessLevel: "Signal client-facing records",
      responsibilities: "Reviews project summary, timeline, visible risks, and satisfaction feedback."
    },
    {
      id: "client-marcus",
      email: "marcus@reiblackbook.test",
      password: "Client@123",
      name: "Marcus Reed",
      role: "Client/User",
      organization: "REI Blackbook",
      projectIds: ["rei-blackbook"],
      accessLevel: "REI Blackbook client-facing records",
      responsibilities: "Reviews project summary, timeline, visible risks, and satisfaction feedback."
    },
    {
      id: "client-elena",
      email: "elena@cafezupas.test",
      password: "Client@123",
      name: "Elena Ortiz",
      role: "Client/User",
      organization: "Cafe Zupas",
      projectIds: ["cafe-zupas"],
      accessLevel: "Cafe Zupas client-facing records",
      responsibilities: "Reviews project summary, timeline, visible risks, and satisfaction feedback."
    }
  ],
  projects: [
    {
      id: "signal",
      name: "Signal",
      customer: "Signal",
      status: "On Track",
      health: 88,
      progress: 74,
      teamPerformance: 91,
      clientSatisfaction: 86,
      deliveryConfidence: 94,
      riskLevel: "Contained",
      environment: "Production",
      portfolioShare: 45,
      timeline: { start: "Feb 03, 2026", milestone: "Security operations pilot", delivery: "Jul 31, 2026" },
      projectManager: "Dr. Lareeb Saleem",
      teamLead: "Ari Khan",
      developers: ["Alex Lee", "Nadia Park"],
      clientUser: "Jenna Mills",
      scope: "AI-powered security service provider platform for patrolling, dedicated shifts, guard operations, live tracking, incidents, billing, and analytics.",
      details: {
        category: "AI-powered security service provider platform",
        summary: "Signal is designed to manage and optimize modern security operations through automation, real-time monitoring, and intelligent resource allocation.",
        architecture: "The project is divided into focused modules so patrolling, dedicated shifts, guard operations, tracking, incidents, billing, reporting, and AI monitoring can scale with better performance, maintainability, and user experience.",
        serviceTypes: ["Patrolling", "Dedicated Shifts"],
        users: ["Admins", "Clients", "Supervisors", "Security guards"],
        modules: [
          { name: "Authentication & User Management", responsibility: "Handles registration, login, role-based access, and account management for admins, clients, supervisors, and security guards." },
          { name: "Guard Management Module", responsibility: "Manages guard profiles, availability, skills, certifications, and assignments." },
          { name: "Dedicated Shift Management", responsibility: "Schedules and manages fixed security shifts for guards assigned to specific locations or clients." },
          { name: "Patrolling Management Module", responsibility: "Tracks patrol routes, checkpoints, timings, and guard movement during patrol operations." },
          { name: "Client Management Module", responsibility: "Maintains client records, security requirements, assigned guards, and service history." },
          { name: "Attendance & Real-Time Tracking", responsibility: "Monitors guard attendance, check-ins, check-outs, GPS tracking, and live location updates." },
          { name: "Incident Reporting System", responsibility: "Allows guards and supervisors to report incidents, emergencies, and suspicious activity with documentation." },
          { name: "Communication & Notifications Module", responsibility: "Sends alerts, emergency messages, notifications, and shift reminders to relevant users." },
          { name: "Billing & Payment Management", responsibility: "Handles invoices, service charges, payment tracking, and financial reporting." },
          { name: "Reports & Analytics Dashboard", responsibility: "Provides performance reports, patrol summaries, attendance analytics, and security statistics." },
          { name: "AI & Monitoring Features", responsibility: "Uses intelligent analysis to improve security efficiency, threat detection, and operational decision-making." }
        ],
        outcomes: ["Reliable security coverage", "Transparent operations", "Efficient resource allocation", "Faster threat detection"]
      },
      risks: ["Patrol GPS/checkpoint accuracy must be validated before client rollout", "Dedicated shift scheduling rules need supervisor approval"],
      clientRisks: ["Patrolling routes and dedicated shift coverage rules are being validated with client supervisors"],
      issues: ["Complete guard availability and certification import validation", "Validate live attendance, GPS tracking, and checkpoint timing accuracy", "Finalize billing rules for patrolling and dedicated shifts"],
      nextActions: ["Run security operations pilot for patrolling and dedicated shifts", "Complete incident notification SLA and emergency alert testing"],
      healthTrend: [81, 82, 83, 85, 84, 86, 87, 88, 89, 88, 88, 90],
      lastUpdated: "May 15, 2026"
    },
    {
      id: "rei-blackbook",
      name: "REI Blackbook",
      customer: "REI Blackbook",
      status: "Watch",
      health: 72,
      progress: 58,
      teamPerformance: 78,
      clientSatisfaction: 69,
      deliveryConfidence: 72,
      riskLevel: "Elevated",
      environment: "UAT",
      portfolioShare: 22,
      timeline: { start: "Mar 12, 2026", milestone: "Integration hardening", delivery: "Sep 18, 2026" },
      projectManager: "Dr. Lareeb Saleem",
      teamLead: "Noor Patel",
      developers: ["Priya Shah", "Owen Brooks"],
      clientUser: "Marcus Reed",
      scope: "Retail intelligence platform migration with data normalization, API integration, and analytics rollout.",
      risks: ["Legacy data mapping is behind baseline", "Client analytics review has unresolved field-level ownership gaps"],
      clientRisks: ["Data mapping decisions are pending for the next analytics review"],
      issues: ["Resolve duplicate SKU mapping", "Close payment feed retry defects"],
      nextActions: ["Run migration dry run", "Confirm field ownership with client analytics"],
      healthTrend: [76, 75, 74, 73, 72, 71, 72, 73, 72, 72, 73, 72],
      lastUpdated: "May 14, 2026"
    },
    {
      id: "cafe-zupas",
      name: "Cafe Zupas",
      customer: "Cafe Zupas",
      status: "At Risk",
      health: 58,
      progress: 43,
      teamPerformance: 63,
      clientSatisfaction: 55,
      deliveryConfidence: 49,
      riskLevel: "Critical",
      environment: "Staging",
      portfolioShare: 33,
      timeline: { start: "Apr 01, 2026", milestone: "POS pilot recovery", delivery: "Aug 22, 2026" },
      projectManager: "Sam Rivera",
      teamLead: "Leah Brooks",
      developers: ["Ben Cole", "Iris Gomez"],
      clientUser: "Elena Ortiz",
      scope: "Cafe systems rollout covering POS integration, location readiness, reporting, and training enablement.",
      risks: ["POS pilot defects are blocking location expansion", "Training content is not approved for franchise rollout"],
      clientRisks: ["POS pilot defects are blocking location expansion"],
      issues: ["Reproduce receipt sync failure", "Replace missing franchise training assets", "Replan August release milestone"],
      nextActions: ["Open recovery plan with executive sponsor", "Create defect burn-down target for the next sprint"],
      healthTrend: [66, 64, 63, 61, 60, 59, 57, 58, 56, 58, 57, 58],
      lastUpdated: "May 16, 2026"
    }
  ],
  acknowledgements: {},
  sessions: {}
};

function ensureDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(seedData, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function isLoopbackOrigin(origin) {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

function applyCorsHeaders(req, res) {
  const origin = req.headers.origin?.replace(/\/$/, "");
  if (!origin) {
    return true;
  }
  if (!allowedOrigins.has(origin) && !isLoopbackOrigin(origin)) {
    return false;
  }
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  return true;
}

function sendJson(res, status, payload, req) {
  applyCorsHeaders(req, res);
  res.setHeader("Content-Type", "application/json");
  res.writeHead(status);
  res.end(JSON.stringify(payload));
}

function sendError(res, status, message, req) {
  sendJson(res, status, { error: message }, req);
}

function shouldUseCanonicalUrl(req, url) {
  const host = String(req.headers.host || "").split(":")[0].toLowerCase();
  return host === PROJECT_DOMAIN && (url.pathname === "/index.html" || url.search);
}

function redirectToCanonical(res) {
  res.writeHead(308, {
    Location: CANONICAL_ORIGIN,
    "Cache-Control": "no-store"
  });
  res.end();
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return [decodeURIComponent(item.slice(0, index)), decodeURIComponent(item.slice(index + 1))];
      })
  );
}

function getSessionActor(req, data) {
  const sessionId = parseCookies(req).ph_session;
  if (!sessionId || !data.sessions?.[sessionId]) {
    return null;
  }
  const session = data.sessions[sessionId];
  if (Date.now() > session.expiresAt) {
    delete data.sessions[sessionId];
    writeDb(data);
    return null;
  }
  return data.actors.find((actor) => actor.id === session.actorId) || null;
}

function createSession(res, data, actor) {
  const sessionId = crypto.randomBytes(24).toString("hex");
  data.sessions[sessionId] = { actorId: actor.id, expiresAt: Date.now() + SESSION_TTL_MS };
  res.setHeader("Set-Cookie", sessionCookie(`ph_session=${encodeURIComponent(sessionId)}`, 28800));
}

function clearSession(req, res, data) {
  const sessionId = parseCookies(req).ph_session;
  if (sessionId) {
    delete data.sessions[sessionId];
  }
  res.setHeader("Set-Cookie", sessionCookie("ph_session=", 0));
}

function sessionCookie(value, maxAge) {
  return [
    value,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAge}`,
    COOKIE_DOMAIN ? `Domain=${COOKIE_DOMAIN}` : "",
    COOKIE_SECURE ? "Secure" : ""
  ].filter(Boolean).join("; ");
}

function publicActor(actor) {
  const { password, ...safeActor } = actor;
  return safeActor;
}

function canViewProject(project, actor) {
  return actor.role === "Admin" || actor.projectIds.includes("all") || actor.projectIds.includes(project.id);
}

function visibleProjects(data, actor) {
  return data.projects.filter((project) => canViewProject(project, actor));
}

function canCreate(actor) {
  return actor.role === "Admin" || actor.role === "Project Manager";
}

function canEdit(project, actor) {
  return ["Admin", "Project Manager", "Team Lead", "Developer"].includes(actor.role) && canViewProject(project, actor);
}

function canAcknowledge(project, actor) {
  return ["Admin", "Project Manager"].includes(actor.role) && canViewProject(project, actor);
}

function calculateHealth(project) {
  const riskPenalty = project.riskLevel === "Critical" ? 12 : project.riskLevel === "Elevated" ? 6 : 0;
  return Math.max(0, Math.min(100, Math.round(
    Number(project.progress || 0) * 0.28 +
    Number(project.teamPerformance || 0) * 0.24 +
    Number(project.clientSatisfaction || 0) * 0.22 +
    Number(project.deliveryConfidence || 0) * 0.26 -
    riskPenalty
  )));
}

function appState(data, actor) {
  return {
    authenticated: true,
    actor: publicActor(actor),
    actors: data.actors.map(publicActor),
    projects: visibleProjects(data, actor),
    publicProjects: data.projects.map(({ id, name }) => ({ id, name })),
    roleDefinitions,
    acknowledged: data.acknowledgements?.[actor.id] || []
  };
}

function publicState(data) {
  return {
    authenticated: false,
    publicProjects: data.projects.map(({ id, name }) => ({ id, name })),
    roleDefinitions
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function uniqueId(items, prefix, name) {
  const base = `${prefix}-${String(name || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item"}`;
  let id = base;
  let suffix = 2;
  while (items.some((item) => item.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function uniqueProjectId(items, name) {
  const base = String(name || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  let id = base;
  let suffix = 2;
  while (items.some((item) => item.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function roleResponsibilities(role, projectName) {
  const responsibilities = {
    "Project Manager": `Maintains ${projectName} project status, risks, stakeholders, and delivery timeline.`,
    "Team Lead": `Updates ${projectName} delivery progress, team performance, blockers, and implementation risks.`,
    Developer: `Updates assigned ${projectName} implementation progress and technical issue notes.`,
    "Client/User": `Reviews ${projectName} project summary, delivery timeline, client-visible risks, and satisfaction feedback.`
  };
  return responsibilities[role] || responsibilities["Client/User"];
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large."));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
  });
}

function assignProjectToActor(data, actorName, projectId) {
  const actor = data.actors.find((item) => item.name === actorName);
  if (actor && !actor.projectIds.includes("all") && !actor.projectIds.includes(projectId)) {
    actor.projectIds.push(projectId);
    actor.accessLevel = `${actor.accessLevel}; assigned ${projectId}`;
  }
}

function formatDate(dateValue) {
  if (!dateValue) return "TBD";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    const allowed = applyCorsHeaders(req, res);
    if (!allowed) {
      res.writeHead(403);
      res.end("Origin not allowed");
      return;
    }
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
    res.writeHead(204);
    res.end();
    return;
  }

  const data = readDb();
  const actor = getSessionActor(req, data);

  if (url.pathname === "/api/health" && req.method === "GET") {
    sendJson(res, 200, {
      status: "ok",
      domain: PROJECT_DOMAIN,
      publicOrigin: PUBLIC_ORIGIN,
      canonicalOrigin: CANONICAL_ORIGIN
    }, req);
    return;
  }

  if (url.pathname === "/api/session" && req.method === "GET") {
    sendJson(res, 200, actor ? appState(data, actor) : publicState(data), req);
    return;
  }

  if (url.pathname === "/api/login" && req.method === "POST") {
    const body = await parseBody(req);
    const foundActor = data.actors.find((item) => item.email === normalizeEmail(body.email) && item.password === String(body.password || ""));
    if (!foundActor) {
      sendError(res, 401, "Invalid email or password.", req);
      return;
    }
    createSession(res, data, foundActor);
    writeDb(data);
    sendJson(res, 200, appState(data, foundActor), req);
    return;
  }

  if (url.pathname === "/api/register" && req.method === "POST") {
    const body = await parseBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    const organization = String(body.organization || "").trim();
    const role = ["Client/User", "Developer", "Team Lead", "Project Manager"].includes(body.role) ? body.role : "Client/User";
    const project = data.projects.find((item) => item.id === body.projectId) || data.projects[0];

    if (!name || !email || !organization) {
      sendError(res, 400, "Name, email, and organization are required.", req);
      return;
    }
    if (password.length < 8) {
      sendError(res, 400, "Password must be at least 8 characters.", req);
      return;
    }
    if (data.actors.some((item) => item.email === email)) {
      sendError(res, 409, "An account already exists for this email.", req);
      return;
    }

    const newActor = {
      id: uniqueId(data.actors, "user", name),
      email,
      password,
      name,
      role,
      organization,
      projectIds: [project.id],
      accessLevel: `${project.name} ${role.toLowerCase()} records`,
      responsibilities: roleResponsibilities(role, project.name),
      registered: true
    };

    data.actors.push(newActor);
    createSession(res, data, newActor);
    writeDb(data);
    sendJson(res, 201, appState(data, newActor), req);
    return;
  }

  if (url.pathname === "/api/logout" && req.method === "POST") {
    clearSession(req, res, data);
    writeDb(data);
    sendJson(res, 200, publicState(data), req);
    return;
  }

  if (!actor) {
    sendError(res, 401, "Authentication required.", req);
    return;
  }

  if (url.pathname === "/api/projects" && req.method === "POST") {
    if (!canCreate(actor)) {
      sendError(res, 403, "Create access is not available for this user.", req);
      return;
    }
    const body = await parseBody(req);
    const name = String(body.name || "").trim();
    const customer = String(body.customer || "").trim();
    if (!name || !customer) {
      sendError(res, 400, "Project name and client are required.", req);
      return;
    }

    const project = {
      id: uniqueProjectId(data.projects, name),
      name,
      customer,
      status: String(body.status || "On Track"),
      health: 0,
      progress: Math.max(0, Math.min(100, Number(body.progress || 0))),
      teamPerformance: 76,
      clientSatisfaction: 72,
      deliveryConfidence: body.status === "At Risk" ? 48 : body.status === "Watch" ? 70 : 86,
      riskLevel: String(body.riskLevel || "Contained"),
      environment: "Staging",
      portfolioShare: 0,
      timeline: { start: "May 17, 2026", milestone: "Project kickoff", delivery: formatDate(body.deliveryDate) },
      projectManager: String(body.projectManager || actor.name),
      teamLead: String(body.teamLead || ""),
      developers: [String(body.developer || "")].filter(Boolean),
      clientUser: String(body.clientUser || ""),
      scope: `${customer} customer project record for delivery tracking, health monitoring, risks, roles, and timeline management.`,
      risks: body.riskLevel === "Contained" ? ["No major delivery risks recorded"] : ["New project risk requires owner review"],
      clientRisks: body.riskLevel === "Contained" ? ["No major client-visible risks recorded"] : ["A delivery risk is under review"],
      issues: ["Initial project plan needs detailed work breakdown"],
      nextActions: ["Confirm kickoff owners", "Publish baseline delivery plan"],
      healthTrend: Array.from({ length: 12 }, (_, index) => Math.max(0, Math.min(100, Number(body.progress || 0) - 5 + index))),
      lastUpdated: "May 17, 2026"
    };
    project.health = calculateHealth(project);
    data.projects.push(project);
    [project.projectManager, project.teamLead, ...project.developers, project.clientUser].forEach((nameToAssign) => assignProjectToActor(data, nameToAssign, project.id));
    if (actor.role === "Project Manager" && !actor.projectIds.includes(project.id)) actor.projectIds.push(project.id);
    writeDb(data);
    sendJson(res, 201, appState(data, actor), req);
    return;
  }

  const projectMatch = url.pathname.match(/^\/api\/projects\/([^/]+)(?:\/([^/]+))?$/);
  if (projectMatch) {
    const project = data.projects.find((item) => item.id === decodeURIComponent(projectMatch[1]));
    const action = projectMatch[2];
    if (!project) {
      sendError(res, 404, "Project not found.", req);
      return;
    }

    if (req.method === "PATCH" && !action) {
      if (!canEdit(project, actor)) {
        sendError(res, 403, "Edit access is not available for this project.", req);
        return;
      }
      const body = await parseBody(req);
      ["status", "riskLevel"].forEach((key) => {
        if (body[key]) project[key] = String(body[key]);
      });
      ["progress", "teamPerformance", "clientSatisfaction", "deliveryConfidence"].forEach((key) => {
        if (body[key] !== undefined && body[key] !== "") project[key] = Math.max(0, Math.min(100, Number(body[key])));
      });
      if (body.issueNote) project.issues.unshift(`${actor.name}: ${String(body.issueNote).trim()}`);
      project.health = calculateHealth(project);
      project.lastUpdated = "May 17, 2026";
      writeDb(data);
      sendJson(res, 200, appState(data, actor), req);
      return;
    }

    if (req.method === "POST" && action === "feedback") {
      if (!canViewProject(project, actor)) {
        sendError(res, 403, "Feedback access is not available for this project.", req);
        return;
      }
      const body = await parseBody(req);
      project.clientSatisfaction = Math.max(0, Math.min(100, Number(body.satisfaction || project.clientSatisfaction)));
      if (body.feedback) project.clientRisks.unshift(String(body.feedback).trim());
      project.health = calculateHealth(project);
      project.lastUpdated = "May 17, 2026";
      writeDb(data);
      sendJson(res, 200, appState(data, actor), req);
      return;
    }

    if (req.method === "POST" && action === "ack") {
      if (!canAcknowledge(project, actor)) {
        sendError(res, 403, "Acknowledge access is not available for this project.", req);
        return;
      }
      data.acknowledgements[actor.id] = Array.from(new Set([...(data.acknowledgements[actor.id] || []), project.id]));
      writeDb(data);
      sendJson(res, 200, appState(data, actor), req);
      return;
    }
  }

  if (url.pathname === "/api/reports/export" && req.method === "POST") {
    sendJson(res, 200, { message: `Report export prepared for ${actor.name}.`, ...appState(data, actor) }, req);
    return;
  }

  sendError(res, 404, "API route not found.", req);
}

function serveStatic(req, res, url) {
  const relative = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(ROOT, relative));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml"
    };
    res.writeHead(200, {
      "Content-Type": types[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(content);
  });
}

ensureDb();

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (shouldUseCanonicalUrl(req, url)) {
      redirectToCanonical(res);
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(req, res, url);
  } catch (error) {
    sendError(res, 500, error.message || "Server error.", req);
  }
}).listen(PORT, HOST, () => {
  console.log(`Customer Health Projection Agent server running at ${PUBLIC_ORIGIN}`);
  console.log(`Listening on ${HOST}:${PORT}`);
});
