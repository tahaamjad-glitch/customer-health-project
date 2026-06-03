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

const actors = [
  {
    id: "admin-olivia",
    email: "admin@projecthealth.test",
    name: "Taha Amjad",
    role: "Admin",
    organization: "PMO",
    projectIds: ["all"],
    accessLevel: "All customer project records",
    responsibilities: "Owns system configuration, user access, portfolio governance, and executive reporting."
  },
  {
    id: "pm-maya",
    email: "maya@projecthealth.test",
    name: "Maya Chen",
    role: "Project Manager",
    organization: "Delivery",
    projectIds: ["signal", "rei-blackbook"],
    accessLevel: "Signal and REI Blackbook records",
    responsibilities: "Maintains delivery health, risk response, client communications, and timeline updates."
  },
  {
    id: "pm-sam",
    email: "sam@projecthealth.test",
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
    name: "Elena Ortiz",
    role: "Client/User",
    organization: "Cafe Zupas",
    projectIds: ["cafe-zupas"],
    accessLevel: "Cafe Zupas client-facing records",
    responsibilities: "Reviews project summary, timeline, visible risks, and satisfaction feedback."
  }
];

let projects = [
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
    timeline: {
      start: "Feb 03, 2026",
      milestone: "Security operations pilot",
      delivery: "Jul 31, 2026"
    },
    projectManager: "Maya Chen",
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
    timeline: {
      start: "Mar 12, 2026",
      milestone: "Integration hardening",
      delivery: "Sep 18, 2026"
    },
    projectManager: "Maya Chen",
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
    timeline: {
      start: "Apr 01, 2026",
      milestone: "POS pilot recovery",
      delivery: "Aug 22, 2026"
    },
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
];

const state = {
  search: "",
  status: "All",
  risk: "All",
  selectedId: "signal",
  activeActorId: null,
  acknowledged: new Set(),
  dashboardTheme: "light",
  notificationsOpen: false,
  notificationsRead: false
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const roleMap = Object.fromEntries(roleDefinitions.map((role) => [role.name, role]));
const backendPort = "4174";

function resolveApiBase() {
  if (typeof window.PROJECT_HEALTH_API_BASE === "string") {
    return window.PROJECT_HEALTH_API_BASE.replace(/\/$/, "");
  }
  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    if (window.location.port && window.location.port !== backendPort) {
      return `${window.location.protocol}//${window.location.hostname}:${backendPort}`;
    }
    return "";
  }
  return `http://localhost:${backendPort}`;
}

const apiBase = resolveApiBase();

async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "The backend request failed.");
  }
  return payload;
}

function applyServerState(payload) {
  if (Array.isArray(payload.actors)) {
    actors.length = 0;
    actors.push(...payload.actors);
  }
  if (Array.isArray(payload.projects)) {
    projects = payload.projects;
  } else if (Array.isArray(payload.publicProjects) && !isAuthenticated()) {
    projects = payload.publicProjects.map((project) => ({
      id: project.id,
      name: project.name,
      customer: project.name,
      status: "On Track",
      health: 0,
      progress: 0,
      teamPerformance: 0,
      clientSatisfaction: 0,
      deliveryConfidence: 0,
      riskLevel: "Contained",
      environment: "TBD",
      portfolioShare: 0,
      timeline: { start: "TBD", milestone: "TBD", delivery: "TBD" },
      projectManager: "",
      teamLead: "",
      developers: [],
      clientUser: "",
      scope: "",
      risks: [],
      clientRisks: [],
      issues: [],
      nextActions: [],
      healthTrend: Array.from({ length: 12 }, () => 0),
      lastUpdated: "TBD"
    }));
  }
  if (payload.actor) {
    state.activeActorId = payload.actor.id;
  } else if (payload.authenticated === false) {
    state.activeActorId = null;
  }
  if (Array.isArray(payload.acknowledged)) {
    state.acknowledged = new Set(payload.acknowledged);
  }
  renderProjectFormOptions();
  renderRegistrationProjectOptions(payload.publicProjects);
}

function icon(name) {
  return `<svg class="icon"><use href="#icon-${name}"></use></svg>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function average(items, key) {
  if (!items.length) {
    return 0;
  }
  return Math.round(items.reduce((sum, item) => sum + Number(item[key] || 0), 0) / items.length);
}

function formatCompactNumber(value) {
  const number = Number(value) || 0;
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  return String(number);
}

function selectedActor() {
  return actors.find((actor) => actor.id === state.activeActorId) || actors[0] || {
    id: "",
    name: "Guest",
    role: "Client/User",
    organization: "",
    projectIds: [],
    accessLevel: "",
    responsibilities: ""
  };
}

function isAuthenticated() {
  return Boolean(state.activeActorId && actors.some((actor) => actor.id === state.activeActorId));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function renderSession() {
  const actor = selectedActor();
  $("#sessionRole").textContent = actor.role;
  $("#sessionName").textContent = actor.name;
}

function showLogin() {
  document.documentElement.classList.remove("app-scroll-mode");
  document.body.classList.add("auth-locked");
  document.body.classList.remove("is-authenticated");
  closeMobileNav();
  const activeForm = $("#registerForm").hidden ? $("#loginEmail") : $("#registerName");
  activeForm.focus();
}

function showApp() {
  document.documentElement.classList.remove("app-scroll-mode");
  document.body.classList.remove("auth-locked");
  document.body.classList.add("is-authenticated");
  renderSession();
}

function setAuthMode(mode) {
  const isRegister = mode === "register";
  $("#loginForm").hidden = isRegister;
  $("#registerForm").hidden = !isRegister;
  $("#authCardTitle").textContent = isRegister ? "Create account" : "Welcome back";
  $$(".auth-tabs button").forEach((button) => {
    const selected = button.dataset.authTab === mode;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  $("#loginStatus").textContent = "";
  $("#registerStatus").textContent = "";
  window.setTimeout(() => {
    (isRegister ? $("#registerName") : $("#loginEmail")).focus();
  }, 0);
}

function logInActor(actor, payload = null) {
  if (payload) {
    applyServerState(payload);
  }
  state.activeActorId = actor.id;
  state.notificationsOpen = false;
  state.notificationsRead = false;
  resetProjectFilters();
  applyHashTarget();
  const visible = visibleProjectsForActor();
  state.selectedId = visible.find((project) => project.id === state.selectedId)?.id || visible[0]?.id || projects[0].id;
  $("#loginStatus").textContent = "";
  $("#loginForm").reset();
  showApp();
  renderAll();
  scrollToHashTarget();
  updateActiveNav();
}

function logOutActor() {
  state.activeActorId = null;
  state.search = "";
  state.status = "All";
  state.risk = "All";
  state.selectedId = "signal";
  state.acknowledged.clear();
  state.notificationsOpen = false;
  state.notificationsRead = false;
  $("#loginStatus").textContent = "You have been logged out.";
  showLogin();
}

function selectedRole() {
  return roleMap[selectedActor().role];
}

function isAdmin(actor = selectedActor()) {
  return actor.role === "Admin";
}

function hasAssignedAccess(project, actor = selectedActor()) {
  return actor.projectIds.includes("all") || actor.projectIds.includes(project.id);
}

function canViewProject(project, actor = selectedActor()) {
  return isAdmin(actor) || hasAssignedAccess(project, actor);
}

function canCreateProjects(actor = selectedActor()) {
  return actor.role === "Admin" || actor.role === "Project Manager";
}

function canExportReports(actor = selectedActor()) {
  return actor.role === "Admin" || actor.role === "Project Manager";
}

function canAcknowledgeRisk(project, actor = selectedActor()) {
  return ["Admin", "Project Manager"].includes(actor.role) && hasAssignedAccess(project, actor);
}

function canEditProject(project, actor = selectedActor()) {
  return ["Admin", "Project Manager", "Team Lead", "Developer"].includes(actor.role) && hasAssignedAccess(project, actor);
}

function canSeeInternalMetrics(actor = selectedActor()) {
  return actor.role !== "Client/User";
}

function canSeeClientSatisfaction(actor = selectedActor()) {
  return actor.role !== "Developer";
}

function visibleProjectsForActor() {
  const actor = selectedActor();
  return projects.filter((project) => canViewProject(project, actor));
}

function scopedMetricProjects() {
  const visible = visibleProjectsForActor();
  return visible.length ? visible : projects;
}

function filteredProjects() {
  const term = state.search.trim().toLowerCase();
  return visibleProjectsForActor().filter((project) => {
    const searchable = [
      project.name,
      project.customer,
      project.status,
      project.riskLevel,
      project.projectManager,
      project.teamLead,
      project.clientUser,
      ...project.developers
    ].join(" ").toLowerCase();
    const matchesTerm = !term || searchable.includes(term);
    const matchesStatus = state.status === "All" || project.status === state.status;
    const matchesRisk = state.risk === "All" || project.riskLevel === state.risk;
    return matchesTerm && matchesStatus && matchesRisk;
  });
}

function selectedProject() {
  const visible = visibleProjectsForActor();
  return visible.find((project) => project.id === state.selectedId) || visible[0] || projects[0];
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function riskClass(risk) {
  return risk.toLowerCase();
}

function initials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "TBD";
  }
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function scrollPageTo(target, behavior = "smooth") {
  const main = $("main");
  const mainCanScroll = main
    && main.contains(target)
    && main.scrollHeight > main.clientHeight
    && getComputedStyle(main).overflowY !== "visible";

  if (document.body.classList.contains("is-authenticated") && mainCanScroll) {
    const mainRect = main.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top = main.scrollTop + targetRect.top - mainRect.top;
    if (behavior === "auto") {
      main.scrollTop = Math.max(0, top);
    } else if (typeof main.scrollTo === "function") {
      main.scrollTo({ top: Math.max(0, top), behavior });
    } else {
      main.scrollTop = Math.max(0, top);
    }
    return;
  }

  const root = document.scrollingElement || document.documentElement;
  const scrollMargin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const top = root.scrollTop + target.getBoundingClientRect().top - scrollMargin;
  if (behavior === "auto") {
    root.scrollTop = Math.max(0, top);
  } else if (typeof root.scrollTo === "function") {
    root.scrollTo({ top: Math.max(0, top), behavior });
  } else {
    root.scrollTop = Math.max(0, top);
  }
}

function readDashboardTheme() {
  try {
    return localStorage.getItem("vertexAiDashboardTheme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function saveDashboardTheme(theme) {
  try {
    localStorage.setItem("vertexAiDashboardTheme", theme);
  } catch {
    // The toggle remains functional for the current session when storage is blocked.
  }
}

function applyDashboardTheme() {
  const isDark = state.dashboardTheme === "dark";
  document.body.classList.toggle("dashboard-dark-mode", isDark);

  const themeToggle = $("#themeToggle");
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light dashboard theme" : "Switch to dark dashboard theme");
    themeToggle.title = isDark ? "Switch to light theme" : "Switch to dark theme";
  }

  const themeMeta = document.querySelector("meta[name='theme-color']");
  if (themeMeta) {
    themeMeta.setAttribute("content", isDark ? "#0F172A" : "#F8FAFC");
  }
}

function toggleDashboardTheme() {
  state.dashboardTheme = state.dashboardTheme === "dark" ? "light" : "dark";
  saveDashboardTheme(state.dashboardTheme);
  applyDashboardTheme();
}

function calculateHealth(project) {
  const riskPenalty = project.riskLevel === "Critical" ? 12 : project.riskLevel === "Elevated" ? 6 : 0;
  return clamp(
    Math.round(
      project.progress * 0.28 +
      project.teamPerformance * 0.24 +
      project.clientSatisfaction * 0.22 +
      project.deliveryConfidence * 0.26 -
      riskPenalty
    )
  );
}

function uniqueProjectId(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  let id = base;
  let suffix = 2;
  while (projects.some((project) => project.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function assignProjectToActor(actorName, projectId) {
  const actor = actors.find((item) => item.name === actorName);
  if (actor && !actor.projectIds.includes("all") && !actor.projectIds.includes(projectId)) {
    actor.projectIds.push(projectId);
    actor.accessLevel = actor.accessLevel.includes(projectId) ? actor.accessLevel : `${actor.accessLevel}; assigned ${projectId}`;
  }
}

function roleScopeLabel(actor = selectedActor()) {
  if (actor.projectIds.includes("all")) {
    return "All records";
  }
  return `${actor.projectIds.length} assigned record${actor.projectIds.length === 1 ? "" : "s"}`;
}

function renderProjectFormOptions() {
  const byRole = (role) => actors.filter((actor) => actor.role === role);
  const options = (list) => list.map((actor) => `<option>${escapeHtml(actor.name)}</option>`).join("");
  $("#projectManagerSelect").innerHTML = options(byRole("Project Manager"));
  $("#teamLeadSelect").innerHTML = options(byRole("Team Lead"));
  $("#developerSelect").innerHTML = options(byRole("Developer"));
  $("#clientUserSelect").innerHTML = options(byRole("Client/User"));
}

function renderRegistrationProjectOptions(projectOptions = projects) {
  $("#registerProject").innerHTML = projectOptions.map((project) => `
    <option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>
  `).join("");
}

function renderHeroSummary() {
  const visible = visibleProjectsForActor();
  const elevated = visible.filter((project) => project.riskLevel !== "Contained").length;
  $("#heroHealth").textContent = average(visible, "health");
  $("#heroProjects").textContent = visible.length;
  $("#heroRisk").textContent = elevated;
  $("#heroDelivery").textContent = `${average(visible, "deliveryConfidence")}%`;
}

function dashboardPredictionTrend(multiplier = 1) {
  const source = scopedMetricProjects();
  const labels = ["May 12", "May 13", "May 14", "May 15", "May 16", "May 17", "May 18"];

  return labels.map((label, index) => {
    const trendIndex = index + 5;
    const predictions = source.reduce((sum, project) => {
      const health = Number(project.healthTrend?.[trendIndex] ?? project.health ?? 75);
      const openSignalCount = (project.risks?.length || 0) + (project.issues?.length || 0);
      const statusWeight = project.status === "At Risk" ? 7 : project.status === "Watch" ? 4 : 2;
      const riskWeight = project.riskLevel === "Critical" ? 6 : project.riskLevel === "Elevated" ? 4 : 2;
      const healthPressure = Math.max(1, Math.round((100 - health) / 8));
      return sum + openSignalCount + statusWeight + riskWeight + healthPressure;
    }, 0);

    return {
      label,
      predictions: Math.max(source.length, Math.round(predictions * multiplier))
    };
  });
}

function dashboardModelMetrics() {
  const source = scopedMetricProjects();
  const totalProjects = source.length;
  const deployedModels = source.length;
  const predictionTotal = dashboardPredictionTrend().reduce((sum, point) => sum + point.predictions, 0);
  const activeModels = source.length;

  return {
    totalProjects,
    deployedModels,
    predictionScore: formatCompactNumber(predictionTotal),
    activeModels
  };
}

function realtimeDashboardMetrics() {
  const modelMetrics = dashboardModelMetrics();
  return [
    { label: "Total Projects", value: modelMetrics.totalProjects, delta: "Live customer records", icon: "calendar", tone: "blue", href: "#projects" },
    { label: "Models Deployed", value: modelMetrics.deployedModels, delta: "1 model per project", icon: "cube", tone: "purple", href: "#deployments" },
    { label: "Total Predictions", value: modelMetrics.predictionScore, delta: "7-day risk checks", icon: "activity", tone: "green", href: "#prediction-overview" },
    { label: "Active Models", value: modelMetrics.activeModels, delta: "All currently running", icon: "layers", tone: "orange", href: "#deployments" }
  ];
}

function dashboardResourceMetrics() {
  const source = scopedMetricProjects();
  const colors = {
    signal: "#2563EB",
    "cafe-zupas": "#F59E0B",
    "rei-blackbook": "#06B6D4"
  };
  const workload = source.map((project) => {
    const openSignals = (project.risks?.length || 0) + (project.issues?.length || 0);
    const statusWeight = project.status === "At Risk" ? 26 : project.status === "Watch" ? 16 : 8;
    const riskWeight = project.riskLevel === "Critical" ? 26 : project.riskLevel === "Elevated" ? 16 : 6;
    const progressPressure = Math.round((100 - Number(project.progress || 0)) * 0.45);
    const healthPressure = Math.round((100 - Number(project.health || 0)) * 0.35);
    const deliveryPressure = Math.round((100 - Number(project.deliveryConfidence || 0)) * 0.16);
    const clientPressure = Math.round((100 - Number(project.clientSatisfaction || 0)) * 0.14);
    const issuePressure = openSignals * 3;
    const calculatedShare = Math.max(8, statusWeight + riskWeight + progressPressure + healthPressure + deliveryPressure + clientPressure + issuePressure);
    const value = Number(project.portfolioShare || 0) > 0 ? Number(project.portfolioShare) : calculatedShare;

    return {
      label: project.name,
      score: value,
      color: colors[project.id] || "#7C3AED"
    };
  }).sort((a, b) => b.score - a.score);
  const totalScore = workload.reduce((sum, item) => sum + item.score, 0) || 1;
  let assigned = 0;
  const segments = workload.map((item, index) => {
    const isLast = index === workload.length - 1;
    const value = isLast ? 100 - assigned : Math.round((item.score / totalScore) * 100);
    assigned += value;
    return {
      label: item.label,
      value,
      color: item.color
    };
  });
  const used = segments.reduce((sum, item) => sum + item.value, 0);

  return { segments, used };
}

function realtimeStatsCardsHtml(cardClass = "metric-card ai-stat-card") {
  return realtimeDashboardMetrics().map((metric) => `
    <a class="${escapeHtml(cardClass)} is-${escapeHtml(metric.tone)}" href="${escapeHtml(metric.href)}" data-stat-link aria-label="Open ${escapeHtml(metric.label)} details">
      <div class="metric-top">
        <span class="metric-icon">${icon(metric.icon)}</span>
        <span class="metric-delta">${icon("activity")} ${escapeHtml(metric.delta)}</span>
      </div>
      <strong>${escapeHtml(metric.value)}</strong>
      <span>${escapeHtml(metric.label)}</span>
    </a>
  `).join("");
}

function bindDashboardStatLinks(scope = document) {
  scope.querySelectorAll("[data-stat-link]").forEach((link) => {
    if (link.dataset.boundStatLink) {
      return;
    }

    link.dataset.boundStatLink = "true";
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const target = href && href.length > 1 ? document.querySelector(href) : null;
      if (!target) {
        return;
      }

      event.preventDefault();
      closeMobileNav();
      scrollPageTo(target);
      history.pushState(null, "", href);
      window.setTimeout(updateActiveNav, 350);
    });
  });
}

function renderMetrics() {
  $("#metricGrid").innerHTML = realtimeStatsCardsHtml();
  bindDashboardStatLinks($("#metricGrid"));

  if ($("#roleScopePill")) {
    $("#roleScopePill").textContent = roleScopeLabel();
  }
}

function renderProposalRealtimeStats() {
  const container = $("#proposalRealtimeStats");
  if (!container) {
    return;
  }

  const resource = dashboardResourceMetrics();
  container.innerHTML = `
    <div class="proposal-realtime-grid">
      ${realtimeStatsCardsHtml("metric-card ai-stat-card proposal-realtime-card")}
    </div>
    <div class="proposal-resource-strip" aria-label="Live resource usage">
      ${[
        ...resource.segments,
        { label: "Portfolio Total", value: resource.used }
      ].map((item) => `
        <div>
          <span>${escapeHtml(item.label)}</span>
          <strong>${item.value}%</strong>
        </div>
      `).join("")}
    </div>
  `;
  bindDashboardStatLinks(container);
}

function renderTrendChart(multiplier = 1) {
  const trend = dashboardPredictionTrend(multiplier);
  const width = 720;
  const height = 278;
  const left = 54;
  const right = 28;
  const top = 28;
  const bottom = 44;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxPredictions = Math.max(10, ...trend.map((point) => point.predictions));
  const maxTick = Math.ceil(maxPredictions / 10) * 10;
  const ticks = Array.from({ length: 5 }, (_, index) => Math.round((maxTick / 4) * index));
  const points = trend.map((point, index) => ({
      x: left + (chartWidth / (trend.length - 1)) * index,
      y: top + chartHeight - (point.predictions / maxTick) * chartHeight,
      predictions: point.predictions,
      label: point.label
    }));
  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const areaPath = `${path} L ${points[points.length - 1].x.toFixed(1)} ${height - bottom} L ${points[0].x.toFixed(1)} ${height - bottom} Z`;
  const focusPoint = points[3] || points[0];

  $("#trendChart").innerHTML = `
    <svg class="prediction-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Risk prediction checks from May 12 to May 18">
      <defs>
        <linearGradient id="predictionArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#111111" stop-opacity="0.14" />
          <stop offset="1" stop-color="#111111" stop-opacity="0" />
        </linearGradient>
      </defs>
      ${ticks.map((tick) => {
        const y = top + chartHeight - (tick / maxTick) * chartHeight;
        return `
          <g class="chart-gridline">
            <line x1="${left}" y1="${y.toFixed(1)}" x2="${width - right}" y2="${y.toFixed(1)}"></line>
            <text x="${left - 16}" y="${(y + 4).toFixed(1)}">${escapeHtml(tick)}</text>
          </g>
        `;
      }).join("")}
      <path class="prediction-area" d="${areaPath}"></path>
      <path class="prediction-line" d="${path}"></path>
      ${points.map((point) => `
        <circle class="prediction-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4"></circle>
      `).join("")}
      <g class="prediction-tooltip" transform="translate(${(focusPoint.x - 72).toFixed(1)} ${(focusPoint.y - 62).toFixed(1)})">
        <rect width="144" height="44" rx="8"></rect>
        <text x="72" y="18">${escapeHtml(focusPoint.label)}</text>
        <text x="72" y="33">${escapeHtml(focusPoint.predictions.toLocaleString())} predictions</text>
      </g>
      ${points.map((point) => `
        <text class="chart-x-label" x="${point.x.toFixed(1)}" y="${height - 14}">${escapeHtml(point.label)}</text>
      `).join("")}
    </svg>
  `;
}

function renderDeliveryStack() {
  const resource = dashboardResourceMetrics();
  $("#deliveryStack").innerHTML = `
    <div class="resource-total-row">
      <span>Portfolio Total</span>
      <strong>${resource.used}%</strong>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${resource.used}%"></div>
      </div>
      <small>of 100%</small>
    </div>
  `;
}

function renderRiskDonut() {
  const resource = dashboardResourceMetrics();
  let start = 0;
  const gradientStops = resource.segments.map((item) => {
    const end = start + item.value;
    const stop = `${item.color} ${start}% ${end}%`;
    start = end;
    return stop;
  }).join(", ");

  $("#riskDonut").style.background = `conic-gradient(${gradientStops})`;
  $("#riskDonut").innerHTML = `<span><strong>${resource.used}%</strong><small>Portfolio</small></span>`;
  $("#riskLegend").innerHTML = resource.segments.map((item) => `
    <div class="legend-item resource-legend-item">
      <span><span class="legend-dot" style="display:inline-block; background: ${item.color}; margin-right: 8px"></span>${escapeHtml(item.label)}</span>
      <strong>${item.value}%</strong>
    </div>
  `).join("");
}

function renderRecentDeployments() {
  const container = $("#deploymentRows");
  if (!container) {
    return;
  }

  const source = scopedMetricProjects();
  const modelNames = {
    signal: "Signal Security Ops Model",
    "rei-blackbook": "REI Blackbook Migration Risk Model",
    "cafe-zupas": "Cafe Zupas Staging Risk Model"
  };
  const icons = ["shield", "cube", "activity"];
  const rows = source.map((project, index) => {
    return {
      name: modelNames[project.id] || `${project.name} Escalation Model`,
      status: "Active",
      environment: project.environment || "Staging",
      date: project.lastUpdated,
      icon: icons[index % icons.length]
    };
  });

  container.innerHTML = rows.map((row) => `
    <tr>
      <td>
        <span class="model-cell-icon">${icon(row.icon)}</span>
        <span>${escapeHtml(row.name)}</span>
      </td>
      <td><span class="deployment-status ${row.status === "Active" ? "is-active" : "is-stopped"}">${escapeHtml(row.status)}</span></td>
      <td><span class="environment-pill">${escapeHtml(row.environment)}</span></td>
      <td>${escapeHtml(row.date)}</td>
      <td>
        <button class="icon-button table-action" type="button" aria-label="More actions for ${escapeHtml(row.name)}">${icon("more")}</button>
      </td>
    </tr>
  `).join("");
}

function renderActivityFeed() {
  const container = $("#activityFeed");
  if (!container) {
    return;
  }

  const source = scopedMetricProjects();
  const mainProject = source[0] || projects[0];
  const nextProject = source[1] || mainProject;
  const recoveryProject = source.find((project) => project.status === "At Risk") || source[source.length - 1] || mainProject;
  const events = [
    { icon: "shield", tone: "blue", text: `${mainProject.name} escalation model refreshed from live project signals.`, time: "2 minutes ago" },
    { icon: "activity", tone: "purple", text: `${nextProject.name} risk prediction checks recalculated.`, time: "10 minutes ago" },
    { icon: "calendar", tone: "green", text: `${source.length} project records synchronized for dashboard reporting.`, time: "1 hour ago" },
    { icon: "bar-chart", tone: "orange", text: `${recoveryProject.name} recovery indicators reviewed against escalation drivers.`, time: "2 hours ago" }
  ];

  container.innerHTML = events.map((event) => `
    <div class="activity-item is-${escapeHtml(event.tone)}">
      <span class="activity-icon">${icon(event.icon)}</span>
      <div>
        <strong>${escapeHtml(event.text)}</strong>
        <span>${escapeHtml(event.time)}</span>
      </div>
    </div>
  `).join("");
}

function notificationSeverity(project) {
  if (project.riskLevel === "Critical" || project.status === "At Risk") {
    return "critical";
  }
  if (project.riskLevel === "Elevated" || project.status === "Watch" || Number(project.progress) < 60) {
    return "warning";
  }
  return "info";
}

function notificationLabel(severity) {
  return severity === "critical" ? "High priority" : severity === "warning" ? "Watchlist" : "Monitoring";
}

function dashboardNotifications() {
  const actor = selectedActor();
  const severityOrder = { critical: 0, warning: 1, info: 2 };

  return visibleProjectsForActor()
    .map((project) => {
      const severity = notificationSeverity(project);
      const riskMessage = actor.role === "Client/User" ? project.clientRisks[0] : project.risks[0] || project.issues[0];
      const fallbackMessage = project.status === "On Track"
        ? "Portfolio signals are synced and ready for review."
        : "Project health signals need delivery review.";
      return {
        projectId: project.id,
        projectName: project.name,
        severity,
        title: `${project.name} ${severity === "info" ? "monitoring update" : "needs attention"}`,
        message: riskMessage || fallbackMessage,
        meta: `${project.progress}% progress | ${project.riskLevel} risk | ${project.environment || "Staging"}`
      };
    })
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.projectName.localeCompare(b.projectName));
}

function setNotificationsOpen(isOpen) {
  state.notificationsOpen = isOpen;
  renderNotifications();
}

function openNotificationProject(projectId) {
  state.notificationsRead = true;
  state.notificationsOpen = false;
  resetProjectFilters();
  selectProject(projectId);
  history.pushState(null, "", `#project-${projectId}`);
  scrollPageTo(document.querySelector("#projects"));
  renderNotifications();
  window.setTimeout(updateActiveNav, 350);
}

function renderNotifications() {
  const panel = $("#notificationPanel");
  const toggle = $("#notificationToggle");
  const dot = $("#notificationDot");
  if (!panel || !toggle || !dot) {
    return;
  }

  const notifications = dashboardNotifications();
  const unreadCount = state.notificationsRead ? 0 : notifications.length;
  dot.hidden = unreadCount === 0;
  dot.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
  toggle.classList.toggle("has-unread", unreadCount > 0);
  toggle.setAttribute("aria-expanded", String(state.notificationsOpen));
  toggle.setAttribute("aria-label", state.notificationsOpen ? "Close notifications" : `${unreadCount} unread notifications`);
  panel.hidden = !state.notificationsOpen;

  panel.innerHTML = `
    <div class="notification-panel-header">
      <div>
        <p class="eyebrow">Notifications</p>
        <h3>Project signal alerts</h3>
      </div>
      <button class="button quiet notification-read-button" type="button" data-mark-notifications-read>Mark read</button>
    </div>
    <div class="notification-list">
      ${notifications.map((item) => `
        <button class="notification-item is-${escapeHtml(item.severity)}" type="button" data-notification-project="${escapeHtml(item.projectId)}">
          <span>${icon(item.severity === "critical" ? "alert" : item.severity === "warning" ? "bell" : "activity")}</span>
          <span>
            <strong>${escapeHtml(item.title)}</strong>
            <em>${escapeHtml(notificationLabel(item.severity))}</em>
            <small>${escapeHtml(item.message)}</small>
            <b>${escapeHtml(item.meta)}</b>
          </span>
        </button>
      `).join("")}
    </div>
    <a class="notification-footer" href="#risk-alerts" data-notification-risk-center>
      Open risk center ${icon("chevron")}
    </a>
  `;

  panel.querySelector("[data-mark-notifications-read]").addEventListener("click", () => {
    state.notificationsRead = true;
    renderNotifications();
  });

  panel.querySelectorAll("[data-notification-project]").forEach((button) => {
    button.addEventListener("click", () => openNotificationProject(button.dataset.notificationProject));
  });

  panel.querySelector("[data-notification-risk-center]").addEventListener("click", (event) => {
    event.preventDefault();
    state.notificationsRead = true;
    state.notificationsOpen = false;
    scrollPageTo(document.querySelector("#risk-alerts"));
    history.pushState(null, "", "#risk-alerts");
    renderNotifications();
    window.setTimeout(updateActiveNav, 350);
  });
}

function renderVisibilityBanner() {
  const actor = selectedActor();
  const text = `${actor.name} is viewing as ${actor.role}: ${actor.accessLevel}.`;
  $("#visibilityBanner").innerHTML = `
    <span>${icon("shield")} ${escapeHtml(text)}</span>
    <strong>${escapeHtml(roleScopeLabel(actor))}</strong>
  `;
}

function renderProjects() {
  const list = filteredProjects();
  const actor = selectedActor();
  const rows = list.map((project) => {
    const riskItems = actor.role === "Client/User" ? project.clientRisks : project.risks.concat(project.issues);
    const teamValue = canSeeInternalMetrics(actor) ? `${project.teamPerformance}%` : "Restricted";
    const clientValue = canSeeClientSatisfaction(actor) ? `${project.clientSatisfaction}%` : "Restricted";

    return `
      <tr id="project-${escapeHtml(project.id)}" data-id="${escapeHtml(project.id)}" class="${project.id === state.selectedId ? "is-selected" : ""}" tabindex="0">
        <td>
          <a class="record-link customer-name" href="#project-${escapeHtml(project.id)}" data-project-link="${escapeHtml(project.id)}">${escapeHtml(project.name)}</a>
          <small>${escapeHtml(project.projectManager)} | ${escapeHtml(project.teamLead)}</small>
        </td>
        <td><span class="status-badge ${statusClass(project.status)}">${escapeHtml(project.status)}</span></td>
        <td><span class="environment-pill">${escapeHtml(project.environment || "Staging")}</span></td>
        <td>${project.progress}%</td>
        <td>${project.health}</td>
        <td><span class="risk-badge ${riskClass(project.riskLevel)}">${escapeHtml(project.riskLevel)}</span> <small>${riskItems.length}</small></td>
        <td>${escapeHtml(teamValue)}</td>
        <td>${escapeHtml(clientValue)}</td>
        <td>${escapeHtml(project.timeline.delivery)}</td>
      </tr>
    `;
  }).join("");

  $("#projectRows").innerHTML = rows || `
    <tr>
      <td colspan="9">No project records match this actor and filter set.</td>
    </tr>
  `;

  $$("#projectRows tr[data-id]").forEach((row) => {
    row.addEventListener("click", () => selectProject(row.dataset.id));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectProject(row.dataset.id);
      }
    });
  });

  $$("[data-project-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      selectProject(link.dataset.projectLink);
      history.pushState(null, "", `#project-${link.dataset.projectLink}`);
      scrollPageTo(document.querySelector("#projects"));
      window.setTimeout(updateActiveNav, 350);
    });
  });
}

function renderProjectControls(project) {
  const actor = selectedActor();

  if (actor.role === "Client/User") {
    return `
      <form class="record-form" id="clientFeedbackForm">
        <label>
          <span>Client satisfaction</span>
          <input name="satisfaction" type="number" min="0" max="100" value="${project.clientSatisfaction}" />
        </label>
        <label>
          <span>Feedback note</span>
          <input name="feedback" type="text" placeholder="Optional client note" />
        </label>
        <button class="button primary" type="submit">${icon("check")}Submit Feedback</button>
      </form>
      <p class="form-status" id="projectActionStatus" role="status"></p>
    `;
  }

  if (!canEditProject(project, actor)) {
    return `
      <div class="record-permission">
        <strong>Read-only access</strong>
        <span>${escapeHtml(actor.role)} can view this record but cannot update project health.</span>
      </div>
    `;
  }

  if (actor.role === "Developer") {
    return `
      <form class="record-form" id="projectUpdateForm">
        <label>
          <span>Progress</span>
          <input name="progress" type="number" min="0" max="100" value="${project.progress}" />
        </label>
        <label>
          <span>Issue note</span>
          <input name="issueNote" type="text" placeholder="Implementation update" />
        </label>
        <button class="button primary" type="submit">${icon("check")}Save Update</button>
      </form>
      <p class="form-status" id="projectActionStatus" role="status"></p>
    `;
  }

  const managerFields = actor.role === "Admin" || actor.role === "Project Manager"
    ? `
      <label>
        <span>Status</span>
        <select name="status">
          ${["On Track", "Watch", "At Risk"].map((status) => `<option ${status === project.status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Client satisfaction</span>
        <input name="clientSatisfaction" type="number" min="0" max="100" value="${project.clientSatisfaction}" />
      </label>
      <label>
        <span>Delivery confidence</span>
        <input name="deliveryConfidence" type="number" min="0" max="100" value="${project.deliveryConfidence}" />
      </label>
    `
    : "";

  return `
    <form class="record-form" id="projectUpdateForm">
      ${managerFields}
      <label>
        <span>Progress</span>
        <input name="progress" type="number" min="0" max="100" value="${project.progress}" />
      </label>
      <label>
        <span>Risk level</span>
        <select name="riskLevel">
          ${["Contained", "Elevated", "Critical"].map((risk) => `<option ${risk === project.riskLevel ? "selected" : ""}>${risk}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Team performance</span>
        <input name="teamPerformance" type="number" min="0" max="100" value="${project.teamPerformance}" />
      </label>
      <button class="button primary" type="submit">${icon("check")}Save Health Update</button>
    </form>
    <p class="form-status" id="projectActionStatus" role="status"></p>
  `;
}

function renderDetailChips(label, values = []) {
  const items = Array.isArray(values) ? values.filter(Boolean) : [];
  if (!items.length) {
    return "";
  }

  return `
    <div class="project-detail-group">
      <span>${escapeHtml(label)}</span>
      <div class="project-detail-chips">
        ${items.map((item) => `<em>${escapeHtml(item)}</em>`).join("")}
      </div>
    </div>
  `;
}

function renderProjectDetails(project) {
  const details = project.details;
  if (!details) {
    return "";
  }

  const modules = Array.isArray(details.modules) ? details.modules.filter(Boolean) : [];
  return `
    <section class="project-detail-block" aria-label="${escapeHtml(project.name)} platform details">
      <div class="project-detail-heading">
        <span>Project details</span>
        <strong>${escapeHtml(details.category || `${project.name} platform`)}</strong>
        <p>${escapeHtml(details.summary || project.scope)}</p>
      </div>
      ${details.architecture ? `<p class="project-detail-architecture">${escapeHtml(details.architecture)}</p>` : ""}
      ${renderDetailChips("Service types", details.serviceTypes)}
      ${renderDetailChips("Actors / users", details.users)}
      ${renderDetailChips("Operational outcomes", details.outcomes)}
      ${modules.length ? `
        <div class="project-detail-group">
          <span>Core modules</span>
          <div class="project-module-list">
            ${modules.map((moduleItem) => `
              <div>
                <strong>${escapeHtml(moduleItem.name || moduleItem)}</strong>
                ${moduleItem.responsibility ? `<small>${escapeHtml(moduleItem.responsibility)}</small>` : ""}
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}
    </section>
  `;
}

function renderProfile() {
  const project = selectedProject();
  const actor = selectedActor();
  const riskItems = actor.role === "Client/User" ? project.clientRisks : project.risks.concat(project.issues);
  const teamValue = canSeeInternalMetrics(actor) ? `${project.teamPerformance}%` : "Restricted";
  const clientValue = canSeeClientSatisfaction(actor) ? `${project.clientSatisfaction}%` : "Restricted";

  $("#projectProfile").innerHTML = `
    <div class="profile-header">
      <span class="avatar">${escapeHtml(initials(project.name))}</span>
      <div>
        <strong>${escapeHtml(project.name)}</strong>
        <span>${escapeHtml(project.projectManager)} | ${escapeHtml(project.teamLead)}</span>
      </div>
    </div>
    <div class="record-badge-row">
      <span class="status-badge ${statusClass(project.status)}">${escapeHtml(project.status)}</span>
      <span class="risk-badge ${riskClass(project.riskLevel)}">${escapeHtml(project.riskLevel)} risk</span>
      <span class="environment-pill">${escapeHtml(project.environment || "Staging")}</span>
    </div>
    <p class="profile-scope">${escapeHtml(project.scope)}</p>
    ${renderProjectDetails(project)}
    <div class="profile-stats">
      <div><span>Progress</span><strong>${project.progress}%</strong></div>
      <div><span>Health</span><strong>${project.health}</strong></div>
      <div><span>Team</span><strong>${escapeHtml(teamValue)}</strong></div>
      <div><span>Client</span><strong>${escapeHtml(clientValue)}</strong></div>
    </div>
    <div class="renewal-detail">
      <span>Delivery timeline</span>
      <strong>${escapeHtml(project.timeline.milestone)} by ${escapeHtml(project.timeline.delivery)}</strong>
      <span>Started ${escapeHtml(project.timeline.start)} | last updated ${escapeHtml(project.lastUpdated)}</span>
    </div>
    <ul class="signal-list">
      ${riskItems.map((item) => `<li>${icon("alert")}<span>${escapeHtml(item)}</span></li>`).join("")}
    </ul>
    <div class="next-action-list">
      ${project.nextActions.map((action) => `<span>${icon("check")}${escapeHtml(action)}</span>`).join("")}
    </div>
    ${renderProjectControls(project)}
  `;

  bindProfileForms(project);
}

function bindProfileForms(project) {
  const updateForm = $("#projectUpdateForm");
  if (updateForm) {
    updateForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(updateForm);
      try {
        const payload = await apiRequest(`/api/projects/${encodeURIComponent(project.id)}`, {
          method: "PATCH",
          body: Object.fromEntries(formData.entries())
        });
        applyServerState(payload);
        renderAll();
        $("#projectActionStatus").textContent = "Project record updated.";
      } catch (error) {
        $("#projectActionStatus").textContent = error.message;
      }
    });
  }

  const feedbackForm = $("#clientFeedbackForm");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(feedbackForm);
      try {
        const payload = await apiRequest(`/api/projects/${encodeURIComponent(project.id)}/feedback`, {
          method: "POST",
          body: Object.fromEntries(formData.entries())
        });
        applyServerState(payload);
        renderAll();
        $("#projectActionStatus").textContent = "Client feedback saved.";
      } catch (error) {
        $("#projectActionStatus").textContent = error.message;
      }
    });
  }
}

function renderProjectWorkspace() {
  const list = filteredProjects();
  const visible = visibleProjectsForActor();
  const selectedIsVisible = visible.some((project) => project.id === state.selectedId);

  if (!selectedIsVisible && visible.length > 0) {
    state.selectedId = visible[0].id;
  }

  if (!list.some((project) => project.id === state.selectedId) && list.length > 0) {
    state.selectedId = list[0].id;
  }

  renderVisibilityBanner();
  renderProjects();
  renderProfile();
  renderHealthScore();
}

function renderManagePanel() {
  const actor = selectedActor();
  const panel = $("#projectManagerPanel");
  const status = $("#projectFormStatus");
  const form = $("#projectForm");

  if (canCreateProjects(actor)) {
    panel.classList.remove("is-restricted");
    form.hidden = false;
    $("#createAccessPill").textContent = `${actor.role} create access`;
    status.textContent = "";
  } else {
    panel.classList.add("is-restricted");
    form.hidden = true;
    $("#createAccessPill").textContent = "Read-only";
    status.textContent = `${actor.role} cannot create new project records.`;
  }
}

function selectProject(id) {
  state.selectedId = id;
  renderProjectWorkspace();
  renderAlerts();
  renderReports();
}

function resetProjectFilters() {
  state.search = "";
  state.status = "All";
  state.risk = "All";
  $("#projectSearch").value = "";
  $("#statusFilter").value = "All";
  $("#riskFilter").value = "All";
}

function renderHealthScore() {
  const project = selectedProject();
  const riskQuality = project.riskLevel === "Critical" ? 38 : project.riskLevel === "Elevated" ? 66 : 90;
  const drivers = [
    { label: "Project status", value: project.status === "On Track" ? 92 : project.status === "Watch" ? 70 : 44, weight: "20%" },
    { label: "Progress tracking", value: project.progress, weight: "20%" },
    { label: "Risks/issues", value: riskQuality, weight: "20%" },
    { label: "Team performance", value: project.teamPerformance, weight: "15%" },
    { label: "Client satisfaction", value: project.clientSatisfaction, weight: "15%" },
    { label: "Delivery timeline", value: project.deliveryConfidence, weight: "10%" }
  ];

  $("#scoreGauge").style.setProperty("--score", project.health);
  $("#scoreValue").textContent = project.health;
  $("#scoreProject").textContent = project.name;
  $("#scoreSummary").textContent = `${project.name} is ${project.status.toLowerCase()} with ${project.progress}% progress, ${project.riskLevel.toLowerCase()} risk, and ${project.deliveryConfidence}% delivery confidence.`;
  $("#driverList").innerHTML = drivers.map((driver) => `
    <div class="driver-row">
      <span>${escapeHtml(driver.label)}</span>
      <div class="progress-track"><div class="progress-fill" style="width: ${driver.value}%; background: ${driver.value < 55 ? "var(--red)" : driver.value < 75 ? "var(--amber)" : "var(--teal)"}"></div></div>
      <strong>${escapeHtml(driver.weight)}</strong>
    </div>
  `).join("");
}

function renderAlerts() {
  const actor = selectedActor();
  const riskyProjects = visibleProjectsForActor().filter((project) => project.riskLevel !== "Contained" || project.issues.length);
  const openAlerts = riskyProjects.filter((project) => !state.acknowledged.has(project.id));
  $("#alertCount").textContent = `${openAlerts.length} open`;

  $("#alertList").innerHTML = riskyProjects.map((project) => {
    const acknowledged = state.acknowledged.has(project.id);
    const canAck = canAcknowledgeRisk(project, actor);
    const riskMessage = actor.role === "Client/User" ? project.clientRisks[0] : project.risks[0] || project.issues[0];
    const criticalClass = project.riskLevel === "Critical" ? " is-critical" : "";
    return `
      <article class="alert-card${criticalClass}">
        <div class="alert-top">
          <div>
            <h3>${escapeHtml(project.name)}</h3>
            <p>${escapeHtml(project.projectManager)} | ${project.progress}% progress | delivery ${escapeHtml(project.timeline.delivery)}</p>
          </div>
          <span class="risk-badge ${riskClass(project.riskLevel)}">${escapeHtml(project.riskLevel)}</span>
        </div>
        <p>${escapeHtml(riskMessage || "No active risk message.")}</p>
        <div class="alert-actions">
          <a class="button quiet" href="#project-${escapeHtml(project.id)}" data-select-alert="${escapeHtml(project.id)}">${icon("users")}View Record</a>
          <button class="button ${acknowledged ? "quiet" : "primary"}" data-ack="${escapeHtml(project.id)}" ${canAck ? "" : "disabled"}>
            ${acknowledged ? icon("check") + "Acknowledged" : icon("bell") + (canAck ? "Acknowledge" : "No Ack Access")}
          </button>
        </div>
      </article>
    `;
  }).join("") || `
    <article class="alert-card empty-state">
      <h3>No visible risk alerts</h3>
      <p>The current actor has no open project risks in scope.</p>
    </article>
  `;

  $$("[data-select-alert]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      resetProjectFilters();
      selectProject(button.dataset.selectAlert);
      history.pushState(null, "", `#project-${button.dataset.selectAlert}`);
      scrollPageTo(document.querySelector("#projects"));
      window.setTimeout(updateActiveNav, 350);
    });
  });

  $$("[data-ack]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.disabled) {
        return;
      }
      try {
        const payload = await apiRequest(`/api/projects/${encodeURIComponent(button.dataset.ack)}/ack`, { method: "POST" });
        applyServerState(payload);
        renderAll();
      } catch (error) {
        $("#alertCount").textContent = error.message;
      }
    });
  });
}

function renderRoleOverview() {
  const actor = selectedActor();
  const role = selectedRole();
  $("#activeRolePill").textContent = actor.role;
  $("#roleOverview").innerHTML = `
    <div class="profile-header">
      <span class="avatar">${escapeHtml(initials(actor.name))}</span>
      <div>
        <strong>${escapeHtml(actor.name)}</strong>
        <span>${escapeHtml(actor.organization)} | ${escapeHtml(actor.role)}</span>
      </div>
    </div>
    <div class="renewal-detail">
      <span>Access level</span>
      <strong>${escapeHtml(actor.accessLevel)}</strong>
      <span>${escapeHtml(actor.responsibilities)}</span>
    </div>
    <ul class="signal-list">
      ${role.permissions.map((permission) => `<li>${icon("check")}<span>${escapeHtml(permission)}</span></li>`).join("")}
    </ul>
  `;
}

function renderActors() {
  $("#actorRows").innerHTML = actors.map((actor) => `
    <tr class="${actor.id === state.activeActorId ? "is-selected" : ""}">
      <td>
        <div class="customer-name">${escapeHtml(actor.name)}</div>
        <small>${escapeHtml(actor.organization)}</small>
      </td>
      <td>${escapeHtml(actor.role)}</td>
      <td>${escapeHtml(actor.accessLevel)}</td>
      <td>${escapeHtml(actor.responsibilities)}</td>
    </tr>
  `).join("");
}

function renderPermissionGrid() {
  const permissions = ["View Records", "Create", "Edit", "Manage Users", "Acknowledge Risk", "Export"];
  const allowed = {
    Admin: ["View Records", "Create", "Edit", "Manage Users", "Acknowledge Risk", "Export"],
    "Project Manager": ["View Records", "Create", "Edit", "Acknowledge Risk", "Export"],
    "Team Lead": ["View Records", "Edit"],
    Developer: ["View Records", "Edit"],
    "Client/User": ["View Records"]
  };

  $("#permissionGrid").innerHTML = `
    <div class="permission-cell permission-head">Role</div>
    ${permissions.map((permission) => `<div class="permission-cell permission-head">${escapeHtml(permission)}</div>`).join("")}
    ${roleDefinitions.map((role) => `
      <div class="permission-cell permission-role">${escapeHtml(role.name)}</div>
      ${permissions.map((permission) => `
        <div class="permission-cell ${allowed[role.name].includes(permission) ? "is-allowed" : "is-denied"}">
          ${allowed[role.name].includes(permission) ? icon("check") : icon("lock")}
        </div>
      `).join("")}
    `).join("")}
  `;
}

function renderAccessControl() {
  renderRoleOverview();
  renderActors();
  renderPermissionGrid();
}

function renderReports() {
  const visible = visibleProjectsForActor();
  const reportProjects = visible.length ? visible : projects;
  $("#forecastChart").innerHTML = reportProjects.map((project) => `
    <div class="forecast-bar">
      <div class="forecast-fill" style="height: ${Math.max(44, project.deliveryConfidence * 1.8)}px; background: ${project.deliveryConfidence < 60 ? "var(--red)" : project.deliveryConfidence < 80 ? "var(--amber)" : "var(--blue)"}"></div>
      <span>${escapeHtml(project.name)}<br>${project.deliveryConfidence}%</span>
    </div>
  `).join("");

  const statusGroups = ["On Track", "Watch", "At Risk"].map((status) => {
    const count = visible.filter((project) => project.status === status).length;
    const value = visible.length ? Math.round((count / visible.length) * 100) : 0;
    return { label: status, count, value };
  });

  $("#statusReport").innerHTML = statusGroups.map((status) => `
    <div class="segment-row">
      <span>${escapeHtml(status.label)}</span>
      <div class="progress-track"><div class="progress-fill" style="width: ${status.value}%; background: ${status.label === "At Risk" ? "var(--red)" : status.label === "Watch" ? "var(--amber)" : "var(--teal)"}"></div></div>
      <strong>${status.count}</strong>
    </div>
  `).join("");

  const highRisk = visible.filter((project) => project.riskLevel !== "Contained");
  const lowest = [...visible].sort((a, b) => a.health - b.health)[0];
  const brief = [
    `${visible.length} project record${visible.length === 1 ? "" : "s"} visible to ${selectedActor().name}.`,
    highRisk.length ? `${highRisk.length} project${highRisk.length === 1 ? "" : "s"} need risk review.` : "No elevated risks are visible in the current scope.",
    lowest ? `${lowest.name} has the lowest visible health score at ${lowest.health}.` : "No projects are visible for reporting."
  ];

  $("#briefList").innerHTML = brief.map((item) => `<li>${icon("check")}<span>${escapeHtml(item)}</span></li>`).join("");

  const exportButton = $("#exportReport");
  exportButton.disabled = !canExportReports();
  if (!canExportReports()) {
    $("#reportNote").textContent = "Export requires Admin or Project Manager access.";
  } else if (!$("#reportNote").textContent.includes("prepared")) {
    $("#reportNote").textContent = "";
  }
}

function escalationPriority(project) {
  if (project.status === "At Risk" || project.riskLevel === "Critical" || project.deliveryConfidence < 60 || project.clientSatisfaction < 60) {
    return "High";
  }

  if (project.status === "Watch" || project.riskLevel === "Elevated" || project.progress < 65 || project.deliveryConfidence < 80) {
    return "Medium";
  }

  return "Low";
}

function escalationTrigger(project) {
  const signals = [];

  if (project.riskLevel !== "Contained") {
    signals.push(`${project.riskLevel.toLowerCase()} risk`);
  }
  if (project.status !== "On Track") {
    signals.push(`${project.status.toLowerCase()} status`);
  }
  if (project.progress < 65) {
    signals.push(`${project.progress}% progress`);
  }
  if (project.deliveryConfidence < 80) {
    signals.push(`${project.deliveryConfidence}% delivery confidence`);
  }
  if (project.clientSatisfaction < 75) {
    signals.push(`${project.clientSatisfaction}% client satisfaction`);
  }

  return signals.length ? signals.join(" + ") : "Healthy trend with watchlist monitoring";
}

function proposalProfileFor(project) {
  const profiles = {
    signal: {
      workflow: "AI-powered security service provider platform for managing patrolling, dedicated shifts, guard operations, live tracking, incidents, billing, and analytics.",
      services: ["Patrolling", "Dedicated Shifts"],
      modules: [
        "Authentication & User Management",
        "Guard Management Module",
        "Dedicated Shift Management",
        "Patrolling Management Module",
        "Client Management Module",
        "Attendance & Real-Time Tracking",
        "Incident Reporting System",
        "Communication & Notifications Module",
        "Billing & Payment Management",
        "Reports & Analytics Dashboard",
        "AI & Monitoring Features"
      ],
      riskAreas: [
        "Patrol route/checkpoint timing accuracy",
        "Guard attendance, GPS tracking, and live location reliability",
        "Dedicated shift scheduling, guard assignment, and supervisor approval",
        "Incident/emergency notification SLA and documentation quality",
        "Billing accuracy across patrolling and fixed-shift service charges"
      ],
      clientBehavior: "Security clients care about coverage transparency, verified guard presence, incident response speed, and clear billing history for patrolling and dedicated shifts.",
      operationalContext: "Security operations pilot is the current milestone, so early warning should monitor missed checkpoints, late check-ins, unfilled dedicated shifts, incident-response delays, and billing mismatches.",
      alerts: [
        "Missed patrol checkpoint or route timing threshold",
        "Unassigned dedicated shift or late guard check-in",
        "Incident report lacks required documentation or supervisor review",
        "Emergency notification SLA is not acknowledged",
        "Billing variance appears between assigned service hours and invoiced charges"
      ]
    },
    "rei-blackbook": {
      workflow: "Retail intelligence migration with legacy data normalization, SKU mapping, payment feed retries, and analytics ownership review.",
      riskAreas: [
        "Legacy SKU and field mapping gaps",
        "Analytics ownership decisions",
        "Payment feed retry defects during integration hardening"
      ],
      clientBehavior: "Multi-stakeholder analytics review; client decisions slow down when ownership of fields or reporting definitions is unresolved.",
      operationalContext: "Integration hardening is active, so escalation prevention should watch migration dry-run quality and unresolved data-governance decisions.",
      alerts: [
        "Migration dry run exposes duplicate SKU mapping",
        "Client analytics review leaves field ownership unresolved",
        "Payment feed retry defects remain open near hardening checkpoint"
      ]
    },
    "cafe-zupas": {
      workflow: "POS pilot recovery with location readiness, receipt sync validation, franchise training assets, and August release replanning.",
      riskAreas: [
        "POS pilot defects blocking expansion",
        "Franchise training content approval",
        "Receipt sync defects and release milestone replanning"
      ],
      clientBehavior: "Operational approval pattern; restaurant rollout cannot expand until franchise training and pilot defects are resolved together.",
      operationalContext: "The project is in recovery mode, so alerts should prioritize blockers that prevent location expansion and executive sponsor alignment.",
      alerts: [
        "POS receipt sync defect blocks location rollout",
        "Franchise training assets not approved for field teams",
        "August milestone needs replanning with executive sponsor"
      ]
    }
  };

  return profiles[project.id] || {
    workflow: project.scope,
    riskAreas: project.risks,
    clientBehavior: "Client behavior should be learned from satisfaction feedback, approval velocity, and visible risk acknowledgements.",
    operationalContext: project.timeline.milestone,
    alerts: project.risks.concat(project.issues).slice(0, 3)
  };
}

const escalationDriverGroups = [
  {
    title: "Delivery, Scope & Planning",
    summary: "Early warnings for timeline pressure, unclear direction, and delayed decisions.",
    items: [
      "Delay in project timelines or missed deadlines",
      "Unclear requirements or frequent scope changes",
      "Lack of proper project planning or risk management",
      "Delays in approvals, feedback, or decision-making from stakeholders"
    ]
  },
  {
    title: "Communication, Ownership & Alignment",
    summary: "Signals that teams, stakeholders, or owners are no longer moving together.",
    items: [
      "Poor communication between teams or stakeholders",
      "Misalignment between business and technical teams",
      "Lack of ownership or accountability within the team",
      "Inadequate documentation or knowledge transfer gaps"
    ]
  },
  {
    title: "Quality, Operations & Compliance",
    summary: "Product, reliability, testing, security, and operational health risks.",
    items: [
      "Quality issues or recurring bugs",
      "Performance or scalability issues in the system",
      "Security concerns or compliance issues",
      "Incomplete testing or deployment failures",
      "Frequent production incidents or downtime"
    ]
  },
  {
    title: "Resources, Budget & Dependencies",
    summary: "Capacity, skill, cost, and external dependency blockers.",
    items: [
      "Resource unavailability or lack of skilled team members",
      "Budget overruns or unexpected costs",
      "Dependency blockers from third-party services or teams"
    ]
  },
  {
    title: "Client, Support & Visibility",
    summary: "Client experience, support speed, issue resolution, and monitoring visibility.",
    items: [
      "Client dissatisfaction or unmet expectations",
      "Slow response time from the development/support team",
      "Inefficient issue tracking and resolution process",
      "Real-time monitoring/reporting issues causing delayed visibility into problems"
    ]
  }
];

function escalationDriverCount() {
  return escalationDriverGroups.reduce((sum, group) => sum + group.items.length, 0);
}

function renderEscalationDrivers() {
  const container = $("#proposalEscalationDrivers");
  if (!container) {
    return;
  }

  container.innerHTML = escalationDriverGroups.map((group) => `
    <article class="proposal-driver-card">
      <div>
        <span>${group.items.length} signals</span>
        <h4>${escapeHtml(group.title)}</h4>
        <p>${escapeHtml(group.summary)}</p>
      </div>
      <ul>
        ${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
  `).join("");
}

function renderProposal() {
  const visible = visibleProjectsForActor();
  const source = visible.length ? visible : projects;
  const highPriority = source.filter((project) => escalationPriority(project) === "High").length;
  const mediumPriority = source.filter((project) => escalationPriority(project) === "Medium").length;
  const avgDelivery = average(source, "deliveryConfidence");
  const avgSatisfaction = average(source, "clientSatisfaction");

  if ($("#proposalScopePill")) {
    $("#proposalScopePill").textContent = roleScopeLabel();
  }

  renderProposalRealtimeStats();
  renderEscalationDrivers();

  $("#proposalSignalGrid").innerHTML = source.map((project) => {
    const priority = escalationPriority(project);
    const profile = proposalProfileFor(project);
    const nextAction = project.nextActions[0] || "Continue monitoring current workflow signals.";
    return `
      <article class="proposal-signal-card is-${priority.toLowerCase()}">
        <div class="proposal-card-head">
          <div>
            <span class="proposal-priority">${escapeHtml(priority)} priority</span>
            <h4>${escapeHtml(project.name)}</h4>
          </div>
          <strong>${project.health}</strong>
        </div>
        <div class="proposal-workflow-summary">
          <span>Workflow</span>
          <p>${escapeHtml(profile.workflow)}</p>
        </div>
        ${profile.services ? `
          <div class="proposal-chip-section">
            <span>Service types</span>
            <div>${profile.services.map((service) => `<em>${escapeHtml(service)}</em>`).join("")}</div>
          </div>
        ` : ""}
        ${profile.modules ? `
          <div class="proposal-chip-section">
            <span>Core modules</span>
            <div>${profile.modules.map((moduleName) => `<em>${escapeHtml(moduleName)}</em>`).join("")}</div>
          </div>
        ` : ""}
        <dl>
          <div>
            <dt>Alert signals</dt>
            <dd>
              <ul class="proposal-alert-list">
                ${profile.alerts.map((alert) => `<li>${escapeHtml(alert)}</li>`).join("")}
              </ul>
            </dd>
          </div>
          <div>
            <dt>Risk areas</dt>
            <dd>
              <ul class="proposal-alert-list">
                ${profile.riskAreas.map((riskArea) => `<li>${escapeHtml(riskArea)}</li>`).join("")}
              </ul>
            </dd>
          </div>
          <div>
            <dt>Score inputs</dt>
            <dd>${escapeHtml(escalationTrigger(project))}</dd>
          </div>
          <div>
            <dt>Client behavior</dt>
            <dd>${escapeHtml(profile.clientBehavior)}</dd>
          </div>
          <div>
            <dt>Delivery / operations</dt>
            <dd>${escapeHtml(`${project.status} | ${project.progress}% progress | ${project.deliveryConfidence}% delivery confidence. ${profile.operationalContext}`)}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>${escapeHtml(project.projectManager)} with ${escapeHtml(project.teamLead)}</dd>
          </div>
          <div>
            <dt>Prevention action</dt>
            <dd>${escapeHtml(nextAction)}</dd>
          </div>
        </dl>
      </article>
    `;
  }).join("");

  $("#proposalMetrics").innerHTML = [
    { label: "Tracked escalation drivers", value: escalationDriverCount() },
    { label: "Driver categories", value: escalationDriverGroups.length },
    { label: "High-priority escalation candidates", value: highPriority },
    { label: "Medium-priority watchlist projects", value: mediumPriority },
    { label: "Average delivery confidence", value: `${avgDelivery}%` },
    { label: "Average client satisfaction", value: `${avgSatisfaction}%` }
  ].map((metric) => `
    <div>
      <strong>${escapeHtml(metric.value)}</strong>
      <span>${escapeHtml(metric.label)}</span>
    </div>
  `).join("");
}

function updateActiveNav() {
  const headerOffset = $("#topNav").getBoundingClientRect().bottom + 32;
  const sections = $$("main section[id]");
  let activeId = "";

  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= headerOffset) {
      activeId = section.id;
    }
  });

  $$("#topNav a[href^='#']").forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function closeMobileNav() {
  $("#topNav").classList.remove("is-open");
  $("#navToggle").setAttribute("aria-expanded", "false");
}

function bindSectionLinks() {
  $$("a[href^='#']").forEach((link) => {
    if (link.dataset.projectLink || link.dataset.selectAlert) {
      return;
    }

    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const target = href && href.length > 1 ? document.querySelector(href) : null;

      if (!target) {
        return;
      }

      event.preventDefault();
      closeMobileNav();
      scrollPageTo(target);
      history.pushState(null, "", href);
      updateActiveNav();
      window.setTimeout(updateActiveNav, 350);
    });
  });
}

function applyHashTarget() {
  if (!location.hash.startsWith("#project-")) {
    return;
  }

  const projectId = location.hash.replace("#project-", "");
  const project = visibleProjectsForActor().find((item) => item.id === projectId);
  if (project) {
    state.selectedId = project.id;
  }
}

function scrollToHashTarget() {
  if (!location.hash || location.hash.length <= 1) {
    return;
  }

  const id = location.hash.slice(1);
  const target = location.hash.startsWith("#project-")
    ? $("#projects")
    : document.getElementById(id);

  if (!target) {
    return;
  }

  const runScroll = () => {
    scrollPageTo(target, "auto");
    updateActiveNav();
  };

  window.requestAnimationFrame(runScroll);
  window.setTimeout(runScroll, 120);
}

function renderAll(multiplier = 1) {
  renderHeroSummary();
  renderMetrics();
  renderTrendChart(multiplier);
  renderDeliveryStack();
  renderRiskDonut();
  renderRecentDeployments();
  renderActivityFeed();
  renderNotifications();
  renderProjectWorkspace();
  renderManagePanel();
  renderAlerts();
  renderAccessControl();
  renderReports();
  renderProposal();
}

function bindEvents() {
  $$("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authTab));
  });

  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const payload = await apiRequest("/api/login", {
        method: "POST",
        body: {
          email: formData.get("email"),
          password: formData.get("password")
        }
      });
      logInActor(payload.actor, payload);
    } catch (error) {
      $("#loginStatus").textContent = error.message;
      $("#loginPassword").value = "";
      $("#loginPassword").focus();
    }
  });

  $("#registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = normalizeEmail(formData.get("email"));
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const role = String(formData.get("role") || "Client/User");
    const projectId = String(formData.get("projectId") || projects[0].id);
    const name = String(formData.get("name") || "").trim();
    const organization = String(formData.get("organization") || "").trim();

    if (!name || !email || !organization) {
      $("#registerStatus").textContent = "Name, email, and organization are required.";
      return;
    }

    if (password.length < 8) {
      $("#registerStatus").textContent = "Password must be at least 8 characters.";
      $("#registerPassword").focus();
      return;
    }

    if (password !== confirmPassword) {
      $("#registerStatus").textContent = "Passwords do not match.";
      $("#registerConfirmPassword").value = "";
      $("#registerConfirmPassword").focus();
      return;
    }

    try {
      const payload = await apiRequest("/api/register", {
        method: "POST",
        body: { name, email, password, organization, role, projectId }
      });
      event.currentTarget.reset();
      $("#registerStatus").textContent = "";
      logInActor(payload.actor, payload);
    } catch (error) {
      $("#registerStatus").textContent = error.message;
      $("#registerEmail").focus();
    }
  });

  $("#logoutButton").addEventListener("click", async () => {
    try {
      await apiRequest("/api/logout", { method: "POST" });
    } catch {
      // Local logout still clears the current interface if the backend is unavailable.
    }
    logOutActor();
  });

  $("#navToggle").addEventListener("click", () => {
    const nav = $("#topNav");
    const isOpen = nav.classList.toggle("is-open");
    $("#navToggle").setAttribute("aria-expanded", String(isOpen));
  });

  bindSectionLinks();
  window.addEventListener("scroll", updateActiveNav, { passive: true });
  $("main").addEventListener("scroll", updateActiveNav, { passive: true });
  window.addEventListener("load", () => {
    scrollToHashTarget();
    updateActiveNav();
  });
  window.addEventListener("hashchange", () => {
    applyHashTarget();
    scrollToHashTarget();
    updateActiveNav();
  });

  $("#projectSearch").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProjectWorkspace();
  });

  if ($("#dashboardSearch")) {
    $("#dashboardSearch").addEventListener("input", (event) => {
      state.search = event.target.value;
      $("#projectSearch").value = event.target.value;
      renderProjectWorkspace();
    });
  }

  $("#themeToggle").addEventListener("click", toggleDashboardTheme);

  $("#notificationToggle").addEventListener("click", (event) => {
    event.stopPropagation();
    state.notificationsRead = true;
    setNotificationsOpen(!state.notificationsOpen);
  });

  document.addEventListener("click", (event) => {
    const panel = $("#notificationPanel");
    const toggle = $("#notificationToggle");
    if (!state.notificationsOpen || !panel || !toggle) {
      return;
    }
    if (!panel.contains(event.target) && !toggle.contains(event.target)) {
      setNotificationsOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.notificationsOpen) {
      setNotificationsOpen(false);
      $("#notificationToggle").focus();
    }
  });

  $("#statusFilter").addEventListener("change", (event) => {
    state.status = event.target.value;
    renderProjectWorkspace();
  });

  $("#riskFilter").addEventListener("change", (event) => {
    state.risk = event.target.value;
    renderProjectWorkspace();
  });

  $("#resetFilters").addEventListener("click", () => {
    resetProjectFilters();
    renderProjectWorkspace();
  });

  $$(".segmented-control button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".segmented-control button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      const period = Number(button.dataset.period);
      renderAll(period === 30 ? 1 : period === 60 ? 0.97 : 1.03);
    });
  });

  $("#projectForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const actor = selectedActor();
    if (!canCreateProjects(actor)) {
      $("#projectFormStatus").textContent = "Create access is not available for this actor.";
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const customer = String(formData.get("customer") || "").trim();
    if (!name || !customer) {
      $("#projectFormStatus").textContent = "Project name and client are required.";
      return;
    }

    try {
      const payload = await apiRequest("/api/projects", {
        method: "POST",
        body: Object.fromEntries(formData.entries())
      });
      applyServerState(payload);
      const createdProject = projects.find((project) => project.name === name && project.customer === customer);
      state.selectedId = createdProject?.id || projects[projects.length - 1]?.id || state.selectedId;
      renderAll();
      event.currentTarget.reset();
      $("#projectFormStatus").textContent = `${name} was added to the project portfolio.`;
    } catch (error) {
      $("#projectFormStatus").textContent = error.message;
    }
  });

  $("#exportReport").addEventListener("click", async () => {
    if (!canExportReports()) {
      $("#reportNote").textContent = "Export requires Admin or Project Manager access.";
      return;
    }
    try {
      const payload = await apiRequest("/api/reports/export", { method: "POST" });
      $("#reportNote").textContent = payload.message || `Report export prepared for ${selectedActor().name}.`;
    } catch (error) {
      $("#reportNote").textContent = error.message;
    }
  });
}

async function init() {
  state.dashboardTheme = readDashboardTheme();
  applyDashboardTheme();
  bindEvents();
  try {
    const payload = await apiRequest("/api/session");
    applyServerState(payload);
  } catch (error) {
    $("#loginStatus").textContent = "Start the backend server, then refresh this page.";
    console.error(error);
  }

  if (isAuthenticated()) {
    applyHashTarget();
    showApp();
    renderAll();
    scrollToHashTarget();
    window.setTimeout(scrollToHashTarget, 500);
    updateActiveNav();
  } else {
    showLogin();
  }
}

init();
