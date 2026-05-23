const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const STORAGE_KEY = "chpa-demo-user";
const DEMO_PASSWORD = "Demo@2026";

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "portfolio", label: "Portfolio" },
  { id: "customer-detail", label: "Detail" },
  { id: "signals", label: "Signals" },
  { id: "recommendations", label: "Actions" },
  { id: "scoring", label: "Scoring" },
  { id: "workflow", label: "Workflow" },
  { id: "access", label: "Access" },
  { id: "reports", label: "Reports" }
];

const demoSteps = [
  {
    section: "dashboard",
    title: "Portfolio risk scan",
    body: "Open with the executive view: 8 customers, RAG mix, Tier 1 risk, trend, and top Red accounts."
  },
  {
    section: "portfolio",
    title: "Click into the portfolio",
    body: "Use the metric cards or table rows to filter by Green, Amber, Red, Tier, and selected customer."
  },
  {
    section: "customer-detail",
    title: "Explain the account",
    body: "Show Cafe Zupas or Quantum Bank with score breakdown, goals, root causes, evidence, and actions.",
    customerId: "cafe-zupas"
  },
  {
    section: "signals",
    title: "Review signal evidence",
    body: "Walk through Jira, CSAT, MOM, email, AE notes, severity, confidence, and review status."
  },
  {
    section: "recommendations",
    title: "Human review gate",
    body: "Approve, reject, or assign suggested actions so the system stays human-controlled."
  },
  {
    section: "scoring",
    title: "Tune the scoring model",
    body: "Show the weighted formula, RAG thresholds, confidence behavior, and guardrails."
  },
  {
    section: "workflow",
    title: "Integration and agent roadmap",
    body: "Explain specialized agents, real Jira/email/MOM/CSAT integrations, and the MVP-to-production path."
  },
  {
    section: "access",
    title: "Role-based access",
    body: "Switch roles to show navigation, evidence restrictions, approval permissions, and admin controls."
  },
  {
    section: "reports",
    title: "Close with readiness",
    body: "End on MVP acceptance, open questions, and discovery artifacts for POD submission."
  }
];

const roleDefinitions = {
  "C-Level": {
    scope: "Portfolio-level visibility with sensitive evidence restricted.",
    nav: ["dashboard", "portfolio", "customer-detail", "recommendations", "reports"],
    restricted: "Settings, raw email evidence, commercial notes, and integration controls.",
    permissions: {
      viewSensitive: false,
      approveRecommendation: true,
      assignOwner: true,
      changeScoring: false,
      configureIntegrations: false,
      manageUsers: false,
      reviewSignals: false,
      exportReports: true
    }
  },
  "POD Head": {
    scope: "POD portfolio visibility, risk review, and recovery approval.",
    nav: ["dashboard", "portfolio", "customer-detail", "signals", "recommendations", "scoring", "workflow", "reports"],
    restricted: "System integrations and user management unless Admin.",
    permissions: {
      viewSensitive: true,
      approveRecommendation: true,
      assignOwner: true,
      changeScoring: true,
      configureIntegrations: false,
      manageUsers: false,
      reviewSignals: true,
      exportReports: true
    }
  },
  "Account Executive": {
    scope: "Assigned account relationship, sentiment, and recommendation workflow.",
    nav: ["dashboard", "portfolio", "customer-detail", "signals", "recommendations", "reports"],
    restricted: "Global scoring configuration and system integrations.",
    permissions: {
      viewSensitive: true,
      approveRecommendation: true,
      assignOwner: true,
      changeScoring: false,
      configureIntegrations: false,
      manageUsers: false,
      reviewSignals: true,
      exportReports: true
    }
  },
  "Project Manager": {
    scope: "Assigned project delivery signals, blockers, and commitments.",
    nav: ["portfolio", "customer-detail", "signals", "recommendations", "reports"],
    restricted: "Commercial AE notes and global portfolio settings.",
    permissions: {
      viewSensitive: "delivery",
      approveRecommendation: false,
      assignOwner: true,
      changeScoring: false,
      configureIntegrations: false,
      manageUsers: false,
      reviewSignals: true,
      exportReports: true
    }
  },
  "Delivery Manager": {
    scope: "Delivery patterns, at-risk accounts, and team intervention planning.",
    nav: ["dashboard", "portfolio", "customer-detail", "recommendations", "reports"],
    restricted: "Commercial relationship notes and integration settings.",
    permissions: {
      viewSensitive: "delivery",
      approveRecommendation: true,
      assignOwner: true,
      changeScoring: false,
      configureIntegrations: false,
      manageUsers: false,
      reviewSignals: false,
      exportReports: true
    }
  },
  "Customer Success": {
    scope: "Customer pulse, CSAT patterns, non-response, and proactive recovery.",
    nav: ["dashboard", "portfolio", "customer-detail", "signals", "recommendations", "reports"],
    restricted: "System integrations unless Admin.",
    permissions: {
      viewSensitive: true,
      approveRecommendation: true,
      assignOwner: true,
      changeScoring: false,
      configureIntegrations: false,
      manageUsers: false,
      reviewSignals: true,
      exportReports: true
    }
  },
  "QA / Analyst": {
    scope: "Signal evidence validation, confidence review, and scenario testing.",
    nav: ["portfolio", "customer-detail", "signals", "workflow", "reports"],
    restricted: "Approval actions and configuration changes unless assigned.",
    permissions: {
      viewSensitive: "reviewed",
      approveRecommendation: false,
      assignOwner: false,
      changeScoring: false,
      configureIntegrations: false,
      manageUsers: false,
      reviewSignals: true,
      exportReports: true
    }
  },
  Admin: {
    scope: "All screens, demo configuration, and full system controls.",
    nav: navItems.map((item) => item.id),
    restricted: "None in this MVP demo, subject to company policy.",
    permissions: {
      viewSensitive: true,
      approveRecommendation: true,
      assignOwner: true,
      changeScoring: true,
      configureIntegrations: true,
      manageUsers: true,
      reviewSignals: true,
      exportReports: true
    }
  }
};

const demoUsers = [
  {
    id: "executive",
    name: "Ayesha Mir",
    email: "executive@tkxel.com",
    role: "C-Level",
    department: "Leadership",
    assignedCustomerIds: ["all"]
  },
  {
    id: "pod-head",
    name: "Hamza Qureshi",
    email: "pod.head@tkxel.com",
    role: "POD Head",
    department: "AI Delivery POD",
    assignedCustomerIds: ["all"]
  },
  {
    id: "ae",
    name: "Sara Khan",
    email: "ae@tkxel.com",
    role: "Account Executive",
    department: "Accounts",
    assignedCustomerIds: ["cafe-zupas", "quantum-bank", "northstar-health", "urbannest"]
  },
  {
    id: "pm",
    name: "Bilal Ahmed",
    email: "pm@tkxel.com",
    role: "Project Manager",
    department: "Delivery",
    assignedCustomerIds: ["cafe-zupas", "rei-blackbook", "signal"]
  },
  {
    id: "dm",
    name: "Mariam Zafar",
    email: "dm@tkxel.com",
    role: "Delivery Manager",
    department: "Delivery",
    assignedCustomerIds: ["cafe-zupas", "rei-blackbook", "atlas-manufacturing", "signal"]
  },
  {
    id: "cs",
    name: "Noor Fatima",
    email: "cs@tkxel.com",
    role: "Customer Success",
    department: "Customer Success",
    assignedCustomerIds: ["all"]
  },
  {
    id: "qa",
    name: "Zain Abbas",
    email: "qa@tkxel.com",
    role: "QA / Analyst",
    department: "Quality",
    assignedCustomerIds: ["all"]
  },
  {
    id: "admin",
    name: "Taha Amjad",
    email: "admin@tkxel.com",
    role: "Admin",
    department: "Platform",
    assignedCustomerIds: ["all"]
  }
];

let scoringWeights = {
  delivery: 25,
  sentiment: 20,
  csat: 15,
  escalation: 15,
  goal: 15,
  responsiveness: 5,
  relationship: 5
};

const scoreLabels = {
  delivery: "Delivery Health",
  sentiment: "Customer Sentiment",
  csat: "CSAT",
  escalation: "Escalation",
  goal: "Goal Alignment",
  responsiveness: "Responsiveness",
  relationship: "Relationship Confidence"
};

const customers = [
  {
    id: "cafe-zupas",
    name: "Cafe Zupas",
    tier: "Tier 1",
    project: "POS Pilot Recovery",
    accountOwner: "Sara Khan",
    projectManager: "Bilal Ahmed",
    podHead: "Hamza Qureshi",
    domain: "Food Tech",
    engagementType: "Managed delivery",
    currentStatus: "Active escalation",
    summary: "POS pilot defects and delayed training approvals are slowing rollout confidence for franchise expansion.",
    primaryRisk: "POS pilot defects are blocking location expansion.",
    goals: ["Stabilize POS pilot", "Approve franchise training content", "Restore August release confidence"],
    successCriteria: ["Receipt sync defect closed", "Training package approved", "Recovery plan accepted by sponsor"],
    expectedOutcomes: ["Location expansion resumes", "Executive confidence restored", "Escalation pressure reduced"],
    breakdown: { delivery: 39, sentiment: 42, csat: 45, escalation: 25, goal: 46, responsiveness: 55, relationship: 48 },
    trend: [66, 64, 61, 58, 55, 51, 47, 43, 42, 40, 41, 42],
    rootCauses: [
      { title: "Pilot blocker is customer-visible", detail: "Receipt sync and release replanning have appeared in Jira, MOMs, and escalation notes." },
      { title: "Recovery ownership is fragmented", detail: "Training approval, POS defects, and executive sponsor updates are split across different owners." },
      { title: "Sentiment has turned negative", detail: "Recent email summaries show concern about confidence and expansion readiness." }
    ]
  },
  {
    id: "quantum-bank",
    name: "Quantum Bank",
    tier: "Tier 1",
    project: "Compliance Data Modernization",
    accountOwner: "Sara Khan",
    projectManager: "Ibrahim Malik",
    podHead: "Hamza Qureshi",
    domain: "Fintech",
    engagementType: "Dedicated team",
    currentStatus: "Executive watch",
    summary: "Compliance sign-off is stuck and customer executives are questioning governance evidence.",
    primaryRisk: "Compliance evidence is incomplete for the next steering committee.",
    goals: ["Complete audit evidence pack", "Unblock compliance owner sign-off", "Protect renewal expansion conversation"],
    successCriteria: ["Evidence pack accepted", "Compliance owner confirms scope", "Steering committee actions closed"],
    expectedOutcomes: ["Reduced executive escalation", "Renewal confidence protected", "Clear data governance baseline"],
    breakdown: { delivery: 52, sentiment: 34, csat: 30, escalation: 20, goal: 42, responsiveness: 30, relationship: 38 },
    trend: [63, 61, 59, 56, 52, 48, 44, 40, 37, 35, 36, 38],
    rootCauses: [
      { title: "Escalation severity is high", detail: "A PMO escalation and low CSAT response arrived in the same week." },
      { title: "Responsiveness is weak", detail: "Two compliance questions have waited more than five business days." },
      { title: "Goal alignment is unclear", detail: "The business outcome is audit readiness, but delivery artifacts still focus on migration progress." }
    ]
  },
  {
    id: "rei-blackbook",
    name: "REI Blackbook",
    tier: "Tier 2",
    project: "Retail Intelligence Migration",
    accountOwner: "Omar Rafiq",
    projectManager: "Bilal Ahmed",
    podHead: "Hamza Qureshi",
    domain: "Retail",
    engagementType: "Project delivery",
    currentStatus: "Watch",
    summary: "Legacy data mapping and analytics ownership gaps are holding the migration below green status.",
    primaryRisk: "Field-level ownership is unresolved for analytics review.",
    goals: ["Complete migration dry run", "Resolve duplicate SKU mapping", "Confirm analytics ownership"],
    successCriteria: ["Dry run below defect threshold", "Mapping ownership signed off", "Retry defects closed"],
    expectedOutcomes: ["Migration confidence improves", "Analytics review progresses", "UAT readiness restored"],
    breakdown: { delivery: 63, sentiment: 68, csat: 70, escalation: 74, goal: 61, responsiveness: 69, relationship: 72 },
    trend: [76, 75, 73, 72, 70, 68, 66, 65, 64, 65, 66, 66],
    rootCauses: [
      { title: "Delivery is lagging the milestone", detail: "Data mapping is behind baseline and has repeated in Jira plus MOM summaries." },
      { title: "Customer goals need revalidation", detail: "The customer success criteria emphasize analytics usability, not only migration completion." }
    ]
  },
  {
    id: "northstar-health",
    name: "Northstar Health",
    tier: "Tier 1",
    project: "Patient Portal Expansion",
    accountOwner: "Sara Khan",
    projectManager: "Amina Farooq",
    podHead: "Hamza Qureshi",
    domain: "Healthcare",
    engagementType: "Product pod",
    currentStatus: "Needs attention",
    summary: "A security review delay and muted customer responses suggest the portal launch needs proactive alignment.",
    primaryRisk: "Security questions remain open before launch readiness review.",
    goals: ["Complete security review", "Align launch readiness criteria", "Improve stakeholder responsiveness"],
    successCriteria: ["Security questions closed", "Launch plan accepted", "Weekly stakeholder response rate above 80%"],
    expectedOutcomes: ["Launch confidence improves", "Stakeholders regain trust", "Clinical rollout stays on track"],
    breakdown: { delivery: 58, sentiment: 55, csat: 63, escalation: 66, goal: 59, responsiveness: 48, relationship: 61 },
    trend: [72, 70, 68, 66, 64, 62, 60, 58, 59, 60, 61, 60],
    rootCauses: [
      { title: "Non-response is a warning signal", detail: "CSAT and email replies have slowed while the security milestone is active." },
      { title: "Security evidence is incomplete", detail: "Open questions from the customer security team are affecting readiness confidence." }
    ]
  },
  {
    id: "urbannest",
    name: "UrbanNest Realty",
    tier: "Tier 2",
    project: "Broker Experience Platform",
    accountOwner: "Sara Khan",
    projectManager: "Mehak Ali",
    podHead: "Hamza Qureshi",
    domain: "Real Estate",
    engagementType: "Managed delivery",
    currentStatus: "Watch",
    summary: "Relationship sentiment is weakening because demo expectations and backlog prioritization are drifting.",
    primaryRisk: "Demo expectations are not aligned with current sprint scope.",
    goals: ["Reset demo scope", "Prioritize broker workflow gaps", "Clarify acceptance criteria"],
    successCriteria: ["Demo scope approved", "Top five broker gaps triaged", "Acceptance criteria added to backlog"],
    expectedOutcomes: ["Reduced demo friction", "Clear sprint priorities", "Better AE confidence"],
    breakdown: { delivery: 74, sentiment: 62, csat: 66, escalation: 78, goal: 63, responsiveness: 70, relationship: 62 },
    trend: [80, 79, 77, 76, 74, 73, 71, 70, 69, 68, 67, 67],
    rootCauses: [
      { title: "Expectation drift", detail: "AE notes show customer expectations exceed the current sprint demo package." },
      { title: "Backlog language is unclear", detail: "Acceptance criteria for broker workflows need sharper business wording." }
    ]
  },
  {
    id: "signal",
    name: "Signal",
    tier: "Tier 2",
    project: "Security Operations Platform",
    accountOwner: "Omar Rafiq",
    projectManager: "Bilal Ahmed",
    podHead: "Hamza Qureshi",
    domain: "Security Services",
    engagementType: "Dedicated team",
    currentStatus: "Healthy",
    summary: "Delivery confidence is strong, sprint blockers are contained, and the customer is engaged in pilot validation.",
    primaryRisk: "Checkpoint accuracy still needs validation before broader rollout.",
    goals: ["Validate checkpoint accuracy", "Complete pilot readiness", "Publish incident notification SLA"],
    successCriteria: ["Supervisor validation passed", "Pilot checklist complete", "SLA accepted"],
    expectedOutcomes: ["Operational pilot succeeds", "Customer expands coverage", "Trust remains high"],
    breakdown: { delivery: 88, sentiment: 86, csat: 84, escalation: 92, goal: 83, responsiveness: 91, relationship: 87 },
    trend: [79, 80, 81, 83, 84, 84, 85, 86, 86, 87, 86, 86],
    rootCauses: [
      { title: "Healthy but monitored", detail: "A validation risk exists, but customer sentiment and delivery confidence are stable." }
    ]
  },
  {
    id: "atlas-manufacturing",
    name: "Atlas Manufacturing",
    tier: "Tier 3",
    project: "Factory Analytics Rollout",
    accountOwner: "Omar Rafiq",
    projectManager: "Mariam Zafar",
    podHead: "Hamza Qureshi",
    domain: "Manufacturing",
    engagementType: "Project delivery",
    currentStatus: "Healthy",
    summary: "Factory analytics rollout is progressing with stable CSAT and clear goal alignment.",
    primaryRisk: "Data refresh automation needs production verification.",
    goals: ["Verify production refresh", "Complete dashboard handover", "Train plant managers"],
    successCriteria: ["Refresh passes monitoring", "Handover accepted", "Training attendance above 90%"],
    expectedOutcomes: ["Analytics adoption increases", "Plant managers self-serve insights", "Support load stays low"],
    breakdown: { delivery: 82, sentiment: 80, csat: 85, escalation: 90, goal: 79, responsiveness: 82, relationship: 80 },
    trend: [76, 77, 78, 78, 79, 80, 81, 82, 82, 83, 82, 82],
    rootCauses: [
      { title: "Low risk with one verification item", detail: "The account is healthy, pending production refresh validation." }
    ]
  },
  {
    id: "meridian-retail",
    name: "Meridian Retail",
    tier: "Tier 3",
    project: "Loyalty Insights MVP",
    accountOwner: "Noor Fatima",
    projectManager: "Amina Farooq",
    podHead: "Hamza Qureshi",
    domain: "Retail",
    engagementType: "MVP build",
    currentStatus: "Healthy",
    summary: "The MVP is on track with clear business outcomes and positive customer feedback from the latest review.",
    primaryRisk: "Data science handoff must stay aligned with launch metrics.",
    goals: ["Finalize loyalty dashboard", "Confirm launch metrics", "Package data science handoff"],
    successCriteria: ["Dashboard accepted", "Metrics signed off", "Handoff pack complete"],
    expectedOutcomes: ["MVP launch stays on track", "Marketing team sees clear insight value", "Expansion path remains open"],
    breakdown: { delivery: 78, sentiment: 82, csat: 80, escalation: 88, goal: 77, responsiveness: 79, relationship: 82 },
    trend: [71, 72, 74, 75, 76, 77, 78, 78, 79, 78, 79, 79],
    rootCauses: [
      { title: "Healthy launch path", detail: "Customer feedback is positive and launch criteria are understood." }
    ]
  }
];

let signals = [
  {
    id: "sig-001",
    customerId: "cafe-zupas",
    source: "Jira",
    type: "Delivery blocker",
    severity: "Critical",
    sentiment: "Negative",
    risk: "Receipt sync defect is blocking location expansion.",
    confidence: 94,
    status: "Needs review",
    date: "May 21, 2026",
    evidence: "Jira blocker tagged release-critical for POS pilot expansion.",
    sensitive: false,
    sensitiveType: "delivery"
  },
  {
    id: "sig-002",
    customerId: "cafe-zupas",
    source: "Email Summary",
    type: "Customer concern",
    severity: "High",
    sentiment: "Negative",
    risk: "Customer sponsor questioned confidence in August milestone.",
    confidence: 89,
    status: "Needs review",
    date: "May 20, 2026",
    evidence: "Approved shared-mailbox summary mentions loss of confidence and request for recovery plan.",
    sensitive: true,
    sensitiveType: "email"
  },
  {
    id: "sig-003",
    customerId: "quantum-bank",
    source: "Escalation Log",
    type: "Executive escalation",
    severity: "Critical",
    sentiment: "Negative",
    risk: "Compliance evidence is incomplete for steering committee.",
    confidence: 96,
    status: "Needs review",
    date: "May 21, 2026",
    evidence: "PMO board escalation opened by customer compliance sponsor.",
    sensitive: true,
    sensitiveType: "commercial"
  },
  {
    id: "sig-004",
    customerId: "quantum-bank",
    source: "CSAT",
    type: "Low score",
    severity: "High",
    sentiment: "Negative",
    risk: "CSAT score dropped to 2 out of 5 after audit-readiness review.",
    confidence: 92,
    status: "Reviewed",
    date: "May 19, 2026",
    evidence: "Survey response cites unclear ownership and slow governance evidence.",
    sensitive: false,
    sensitiveType: "relationship"
  },
  {
    id: "sig-005",
    customerId: "rei-blackbook",
    source: "MOM",
    type: "Commitment risk",
    severity: "Medium",
    sentiment: "Neutral",
    risk: "Analytics ownership is unresolved for field-level mapping.",
    confidence: 82,
    status: "Reviewed",
    date: "May 18, 2026",
    evidence: "Meeting notes capture pending owner for SKU mapping decisions.",
    sensitive: false,
    sensitiveType: "delivery"
  },
  {
    id: "sig-006",
    customerId: "northstar-health",
    source: "Email Summary",
    type: "Non-response",
    severity: "Medium",
    sentiment: "Negative",
    risk: "Security questions have waited more than five business days.",
    confidence: 78,
    status: "Needs review",
    date: "May 20, 2026",
    evidence: "Approved mailbox summary shows two unanswered security follow-ups.",
    sensitive: true,
    sensitiveType: "email"
  },
  {
    id: "sig-007",
    customerId: "urbannest",
    source: "AE Note",
    type: "Relationship context",
    severity: "Medium",
    sentiment: "Negative",
    risk: "Customer expectations exceed current demo scope.",
    confidence: 81,
    status: "Needs review",
    date: "May 17, 2026",
    evidence: "AE note says sponsor expected broker workflow automation in this demo.",
    sensitive: true,
    sensitiveType: "relationship"
  },
  {
    id: "sig-008",
    customerId: "signal",
    source: "Jira",
    type: "Validation task",
    severity: "Low",
    sentiment: "Neutral",
    risk: "Checkpoint accuracy needs supervisor validation.",
    confidence: 86,
    status: "Reviewed",
    date: "May 16, 2026",
    evidence: "Jira task remains open but is assigned and on schedule.",
    sensitive: false,
    sensitiveType: "delivery"
  },
  {
    id: "sig-009",
    customerId: "atlas-manufacturing",
    source: "CSAT",
    type: "Positive feedback",
    severity: "Low",
    sentiment: "Positive",
    risk: "No immediate dissatisfaction signal.",
    confidence: 88,
    status: "Reviewed",
    date: "May 15, 2026",
    evidence: "Plant manager rated dashboard usefulness 4 out of 5.",
    sensitive: false,
    sensitiveType: "relationship"
  },
  {
    id: "sig-010",
    customerId: "meridian-retail",
    source: "MOM",
    type: "Goal alignment",
    severity: "Low",
    sentiment: "Positive",
    risk: "Launch metrics were accepted in weekly review.",
    confidence: 83,
    status: "Reviewed",
    date: "May 14, 2026",
    evidence: "Meeting notes confirm marketing launch metrics and handoff package.",
    sensitive: false,
    sensitiveType: "delivery"
  }
];

let recommendations = [
  {
    id: "rec-cafe",
    customerId: "cafe-zupas",
    riskLevel: "Red",
    action: "Open executive recovery plan with sponsor, PM, AE, and Delivery Manager.",
    reason: "Critical delivery blocker and negative sponsor sentiment are both active.",
    owner: "Sara Khan",
    dueDate: "May 24, 2026",
    status: "Pending review",
    approvalRequired: true,
    reviewer: ""
  },
  {
    id: "rec-quantum",
    customerId: "quantum-bank",
    riskLevel: "Red",
    action: "Create audit evidence pack and schedule compliance owner alignment.",
    reason: "Escalation severity is high and CSAT dropped after governance review.",
    owner: "Ibrahim Malik",
    dueDate: "May 23, 2026",
    status: "Pending review",
    approvalRequired: true,
    reviewer: ""
  },
  {
    id: "rec-rei",
    customerId: "rei-blackbook",
    riskLevel: "Amber",
    action: "Run migration dry run and confirm analytics field ownership.",
    reason: "Delivery health and goal alignment are the lowest score drivers.",
    owner: "Bilal Ahmed",
    dueDate: "May 27, 2026",
    status: "In progress",
    approvalRequired: false,
    reviewer: "Hamza Qureshi"
  },
  {
    id: "rec-northstar",
    customerId: "northstar-health",
    riskLevel: "Amber",
    action: "Close security Q&A and reset launch readiness criteria with customer stakeholders.",
    reason: "Non-response and launch-readiness risk are suppressing relationship confidence.",
    owner: "Amina Farooq",
    dueDate: "May 28, 2026",
    status: "Pending review",
    approvalRequired: true,
    reviewer: ""
  },
  {
    id: "rec-urbannest",
    customerId: "urbannest",
    riskLevel: "Amber",
    action: "Reset demo scope and add business acceptance criteria to broker workflow backlog.",
    reason: "AE notes indicate expectation drift before the next customer demo.",
    owner: "Mehak Ali",
    dueDate: "May 29, 2026",
    status: "Needs evidence",
    approvalRequired: false,
    reviewer: "Sara Khan"
  }
];

const agents = [
  ["Signal Classifier Agent", "Classifies raw inputs by source and type.", "Rule-based"],
  ["Jira Delivery Agent", "Detects blockers, delays, missed commitments, and SLA risk.", "Mock/rules"],
  ["CSAT Agent", "Interprets low scores and non-response.", "Mock/rules"],
  ["MOM Analysis Agent", "Extracts risks, commitments, and concerns from meeting notes.", "Manual sample"],
  ["Email Sentiment Agent", "Summarizes approved customer communication sentiment.", "Simulated"],
  ["Escalation Agent", "Interprets severity and root cause from escalation logs.", "Mock/rules"],
  ["AE Notes Agent", "Turns relationship context into risk signals.", "Manual notes"],
  ["Health Scoring Agent", "Calculates score, RAG status, and confidence.", "Rule-based"],
  ["Root Cause Agent", "Explains score changes with evidence.", "Template/mock"],
  ["Recommended Action Agent", "Suggests next human-owned action.", "Template/mock"],
  ["Human Review Gate", "Requires review before major action.", "UI workflow"]
];

const integrations = [
  ["Jira REST API", "Issues, blockers, missed commitments, and webhook updates.", "Phase 3"],
  ["Google Workspace / Microsoft Graph", "Approved customer communication summaries only.", "Phase 5"],
  ["MOM Upload / Drive / SharePoint", "Meeting actions, concerns, and commitments.", "Phase 5"],
  ["CSAT Source", "Survey scores, non-response, and account pulse.", "Phase 4"],
  ["PostgreSQL + Prisma", "Persistent customers, signals, scores, recommendations, and audit logs.", "Phase 2"],
  ["LLM / SLM Adapter", "Sentiment, extraction, root cause explanation, and recommendation wording.", "Phase 4"],
  ["Notification Workflows", "Amber/Red alerts to approved internal channels.", "Phase 6"],
  ["SSO + RBAC", "Company identity, role mapping, sessions, and audit trail.", "Phase 6"]
];

const releasePlan = [
  ["Phase 1", "MVP demo with mock data, scoring, signals, root causes, and recommendations."],
  ["Phase 2", "Add PostgreSQL, Prisma, CRUD, score history, users, roles, and audit tables."],
  ["Phase 3", "Connect Jira API and webhooks, then normalize Jira work into signals."],
  ["Phase 4", "Add LLM/SLM provider adapter, prompt templates, and evaluation logs."],
  ["Phase 5", "Add approved email, MOM, CSAT, and privacy-controlled communication ingestion."],
  ["Phase 6", "Add SSO, production RBAC, notification workflows, observability, and security review."]
];

const guardrails = [
  ["Recommendation only", "AI output is suggested and cannot send customer-facing messages."],
  ["Evidence required", "Scores and actions cite root causes, signals, and confidence."],
  ["Low confidence review", "Signals below confidence threshold require human review before scoring impact."],
  ["Approved sources", "No personal inbox scanning. Use approved labels, mailboxes, or manual upload."],
  ["No individual blame", "Customer-facing summaries avoid blaming people or declaring churn as certain."],
  ["Role restrictions", "Sensitive evidence changes by role and assigned customer access."]
];

const successChecklist = [
  "At least 8 sample customers are represented.",
  "Green, Amber, and Red statuses are visible.",
  "Every Red account has root cause and recommended action.",
  "Signal inbox shows multiple source types and confidence.",
  "Health score and scoring rules are explainable.",
  "Human review workflow is visible.",
  "Login and role-based experience is demonstrated.",
  "Sensitive actions are role-aware."
];

const openQuestions = [
  "Which Jira projects and PMO boards are approved first?",
  "Which CSAT source should become the system of record?",
  "Will email ingestion use Gmail API, Microsoft Graph, or manual forwarding?",
  "Which roles can access sensitive evidence by default?",
  "Which LLM/SLM provider is approved internally?",
  "Who owns final approval for Red account recommended actions?",
  "Should access be global, POD-based, account-based, or project-based?"
];

const confidenceBands = [
  ["90-100", "Strong evidence, can affect score and trigger review."],
  ["75-89", "Good evidence, can affect score and recommendation."],
  ["60-74", "Moderate evidence, show in inbox and may require review."],
  ["Below 60", "Weak evidence, do not affect score until reviewed."]
];

const state = {
  currentUser: null,
  selectedCustomerId: "cafe-zupas",
  search: "",
  statusFilter: "All",
  tierFilter: "All",
  signalSource: "All",
  signalReview: "All",
  trendRange: 30,
  demoMode: false,
  demoStepIndex: 0
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function average(items, selector) {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + selector(item), 0) / items.length);
}

function scoreFromBreakdown(customer) {
  const total = Object.entries(scoringWeights).reduce((sum, [key, weight]) => {
    return sum + Number(customer.breakdown[key] || 0) * (Number(weight) / 100);
  }, 0);
  return Math.round(clamp(total));
}

function ragStatus(score) {
  if (score >= 75) return "Green";
  if (score >= 45) return "Amber";
  return "Red";
}

function statusClass(status) {
  return String(status || "").toLowerCase();
}

function statusColor(status) {
  return status === "Green" ? "#1b7f4c" : status === "Amber" ? "#b96b00" : "#b42318";
}

function severityClass(severity) {
  const value = String(severity || "").toLowerCase();
  if (value === "critical" || value === "high") return "red";
  if (value === "medium") return "amber";
  return "green";
}

function normalizeCustomers() {
  customers.forEach((customer) => {
    customer.score = scoreFromBreakdown(customer);
    customer.healthStatus = ragStatus(customer.score);
  });
}

function roleConfig(role = state.currentUser?.role) {
  return roleDefinitions[role] || roleDefinitions["C-Level"];
}

function userCan(permission) {
  return Boolean(roleConfig().permissions[permission]);
}

function canSeeCustomer(customer) {
  const user = state.currentUser;
  if (!user) return false;
  return user.assignedCustomerIds.includes("all") || user.assignedCustomerIds.includes(customer.id);
}

function visibleCustomers() {
  return customers.filter(canSeeCustomer);
}

function filteredCustomers() {
  const term = state.search.trim().toLowerCase();
  return visibleCustomers()
    .filter((customer) => state.statusFilter === "All" || customer.healthStatus === state.statusFilter)
    .filter((customer) => state.tierFilter === "All" || customer.tier === state.tierFilter)
    .filter((customer) => {
      if (!term) return true;
      return [
        customer.name,
        customer.project,
        customer.accountOwner,
        customer.projectManager,
        customer.domain,
        customer.primaryRisk
      ].join(" ").toLowerCase().includes(term);
    })
    .sort((a, b) => a.score - b.score);
}

function selectedCustomer() {
  const visible = visibleCustomers();
  const selected = visible.find((customer) => customer.id === state.selectedCustomerId);
  if (selected) return selected;
  state.selectedCustomerId = visible[0]?.id || customers[0].id;
  return visible[0] || customers[0];
}

function customerById(id) {
  return customers.find((customer) => customer.id === id) || customers[0];
}

function signalsForVisibleCustomers() {
  const visibleIds = new Set(visibleCustomers().map((customer) => customer.id));
  return signals.filter((signal) => visibleIds.has(signal.customerId));
}

function filteredSignals() {
  return signalsForVisibleCustomers()
    .filter((signal) => state.signalSource === "All" || signal.source === state.signalSource)
    .filter((signal) => state.signalReview === "All" || signal.status === state.signalReview)
    .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity));
}

function severityWeight(severity) {
  return { Critical: 4, High: 3, Medium: 2, Low: 1 }[severity] || 0;
}

function canViewSensitiveSignal(signal) {
  if (!signal.sensitive) return true;
  const permission = roleConfig().permissions.viewSensitive;
  if (permission === true) return true;
  if (permission === "delivery") return signal.sensitiveType === "delivery";
  if (permission === "reviewed") return signal.status === "Reviewed";
  return false;
}

function icon(name) {
  return `<svg class="icon"><use href="#icon-${name}"></use></svg>`;
}

function statusPill(label, tone = "neutral") {
  return `<span class="status-pill ${tone}">${escapeHtml(label)}</span>`;
}

function initials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function sparkline(values = [], color = "#1f5fbf") {
  const width = 96;
  const height = 32;
  const points = values.map((value, index) => {
    const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * width;
    const y = height - (clamp(value) / 100) * (height - 3) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return `
    <svg class="sparkline" viewBox="0 0 ${width} ${height}" aria-hidden="true">
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>
  `;
}

function setCustomer(id, shouldScroll = true) {
  if (!visibleCustomers().some((customer) => customer.id === id)) return;
  state.selectedCustomerId = id;
  renderCustomerDetail();
  renderPortfolio();
  if (shouldScroll) {
    $("#customer-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderLoginOptions() {
  const options = demoUsers.map((user) => {
    return `<option value="${escapeHtml(user.id)}">${escapeHtml(user.role)} - ${escapeHtml(user.email)}</option>`;
  }).join("");
  const roleOptions = demoUsers.map((user) => {
    return `<option value="${escapeHtml(user.id)}">${escapeHtml(user.role)}</option>`;
  }).join("");
  $("#demoUserSelect").innerHTML = options;
  $("#viewAsSelect").innerHTML = roleOptions;
  const storedId = localStorage.getItem(STORAGE_KEY) || demoUsers[0].id;
  $("#demoUserSelect").value = demoUsers.some((user) => user.id === storedId) ? storedId : demoUsers[0].id;
  populateLoginFields();
}

function populateLoginFields() {
  const user = demoUsers.find((item) => item.id === $("#demoUserSelect").value) || demoUsers[0];
  $("#loginEmail").value = user.email;
  $("#loginPassword").value = DEMO_PASSWORD;
  $("#rolePreview").innerHTML = `
    <h3>${escapeHtml(user.role)} access</h3>
    <p>${escapeHtml(roleConfig(user.role).scope)}</p>
  `;
}

function signIn(user) {
  state.currentUser = user;
  localStorage.setItem(STORAGE_KEY, user.id);
  $("#login").hidden = true;
  $("#appShell").hidden = false;
  document.body.classList.remove("auth-locked");
  document.body.classList.add("is-authenticated");
  if (!visibleCustomers().some((customer) => customer.id === state.selectedCustomerId)) {
    state.selectedCustomerId = visibleCustomers()[0]?.id || customers[0].id;
  }
  renderAll();
  requestAnimationFrame(() => updateActiveNav());
}

function logOut() {
  state.currentUser = null;
  $("#appShell").hidden = true;
  $("#login").hidden = false;
  document.body.classList.add("auth-locked");
  document.body.classList.remove("is-authenticated");
  $("#loginStatus").textContent = "";
  populateLoginFields();
}

function renderSession() {
  const user = state.currentUser;
  $("#sessionRole").textContent = user.role;
  $("#sessionName").textContent = user.name;
  $("#viewAsSelect").value = user.id;
  $("#roleScopePill").textContent = roleConfig().scope;
}

function renderNav() {
  const allowed = new Set(roleConfig().nav);
  $("#topNav").innerHTML = navItems
    .filter((item) => allowed.has(item.id))
    .map((item) => `<a href="#${item.id}" data-nav="${item.id}">${escapeHtml(item.label)}</a>`)
    .join("");
  navItems.forEach((item) => {
    const section = document.getElementById(item.id);
    if (section) section.hidden = !allowed.has(item.id);
  });
}

function renderMetrics() {
  const source = visibleCustomers();
  const counts = {
    Green: source.filter((customer) => customer.healthStatus === "Green").length,
    Amber: source.filter((customer) => customer.healthStatus === "Amber").length,
    Red: source.filter((customer) => customer.healthStatus === "Red").length
  };
  const tierOneRisk = source.filter((customer) => customer.tier === "Tier 1" && customer.healthStatus !== "Green").length;
  const avgScore = average(source, (customer) => customer.score);
  const openReviews = recommendations.filter((item) => item.status === "Pending review" && source.some((customer) => customer.id === item.customerId)).length;
  const metricCards = [
    ["Total customers", source.length, "Open all accounts", "users", "neutral", "all"],
    ["Green", counts.Green, "Filter healthy accounts", "check", "green", "Green"],
    ["Amber", counts.Amber, "Filter attention list", "alert", "amber", "Amber"],
    ["Red", counts.Red, "Filter high-risk accounts", "bell", "red", "Red"],
    ["Tier 1 risk", tierOneRisk, "Show leadership accounts", "target", "violet", "tier1"],
    ["Average health", avgScore, `${openReviews} review actions`, "activity", "teal", "reviews"]
  ];

  $("#metricGrid").innerHTML = metricCards.map(([label, value, note, iconName, tone, filter]) => `
    <button class="metric-card" type="button" data-metric-filter="${escapeHtml(filter)}">
      <div class="metric-card-top">
        <div>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
        <span class="status-pill ${tone}">${icon(iconName)}</span>
      </div>
      <small>${escapeHtml(note)}</small>
    </button>
  `).join("");
}

function renderExecutiveSummary() {
  const source = visibleCustomers();
  const red = source.filter((customer) => customer.healthStatus === "Red");
  const amber = source.filter((customer) => customer.healthStatus === "Amber");
  const topRisk = [...source].sort((a, b) => a.score - b.score)[0];
  const avgScore = average(source, (customer) => customer.score);
  const restricted = roleConfig().permissions.viewSensitive === false ? " Raw sensitive evidence is restricted for this role." : "";
  $("#executiveSummary").textContent = `${source.length} visible customer accounts average ${avgScore}/100. ${red.length} Red and ${amber.length} Amber accounts need proactive attention, with ${topRisk?.name || "no customer"} currently the lowest health score. The system is recommendation-only and requires human review before major customer-facing action.${restricted}`;

  const actions = recommendations
    .filter((rec) => source.some((customer) => customer.id === rec.customerId))
    .sort((a, b) => (a.riskLevel === "Red" ? -1 : 1) - (b.riskLevel === "Red" ? -1 : 1))
    .slice(0, 3);

  $("#summaryActions").innerHTML = actions.map((rec) => {
    const customer = customerById(rec.customerId);
    return `
      <button class="summary-action" type="button" data-select-customer="${escapeHtml(customer.id)}">
        <span class="icon-badge">${icon(rec.riskLevel === "Red" ? "alert" : "target")}</span>
        <span>
          <strong>${escapeHtml(customer.name)}: ${escapeHtml(rec.owner)}</strong>
          <span>${escapeHtml(rec.action)}</span>
        </span>
      </button>
    `;
  }).join("");
}

function renderTrendChart() {
  const source = visibleCustomers();
  const values = Array.from({ length: 12 }, (_, index) => average(source, (customer) => customer.trend[index] || customer.score));
  const width = 760;
  const height = 250;
  const left = 42;
  const right = 22;
  const top = 20;
  const bottom = 36;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const points = values.map((value, index) => {
    const x = left + (index / (values.length - 1)) * chartWidth;
    const y = top + chartHeight - (value / 100) * chartHeight;
    return { x, y, value };
  });
  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const area = `${path} L ${points[points.length - 1].x.toFixed(1)} ${height - bottom} L ${points[0].x.toFixed(1)} ${height - bottom} Z`;
  const labels = state.trendRange === 30 ? ["W1", "W2", "W3", "W4"] : state.trendRange === 60 ? ["M1", "M2", "M3"] : ["Q start", "Mid", "Now"];
  $("#trendRangeLabel").textContent = `${state.trendRange} days`;
  $("#trendChart").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Average health trend chart">
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#1f5fbf" stop-opacity="0.28"></stop>
          <stop offset="100%" stop-color="#1f5fbf" stop-opacity="0"></stop>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="#f8fafc"></rect>
      ${[25, 50, 75].map((tick) => {
        const y = top + chartHeight - (tick / 100) * chartHeight;
        return `<line x1="${left}" x2="${width - right}" y1="${y}" y2="${y}" stroke="#d7dee8"></line><text x="8" y="${y + 4}" fill="#667085" font-size="12">${tick}</text>`;
      }).join("")}
      <path d="${area}" fill="url(#trendFill)"></path>
      <path d="${path}" fill="none" stroke="#1f5fbf" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
      ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#ffffff" stroke="#1f5fbf" stroke-width="3"></circle>`).join("")}
      ${labels.map((label, index) => {
        const x = left + (index / Math.max(1, labels.length - 1)) * chartWidth;
        return `<text x="${x}" y="${height - 10}" text-anchor="middle" fill="#667085" font-size="12">${escapeHtml(label)}</text>`;
      }).join("")}
    </svg>
  `;
}

function renderRiskDistribution() {
  const source = visibleCustomers();
  const total = Math.max(1, source.length);
  const counts = {
    Green: source.filter((customer) => customer.healthStatus === "Green").length,
    Amber: source.filter((customer) => customer.healthStatus === "Amber").length,
    Red: source.filter((customer) => customer.healthStatus === "Red").length
  };
  const greenEnd = (counts.Green / total) * 100;
  const amberEnd = greenEnd + (counts.Amber / total) * 100;
  $("#riskDonut").style.background = `conic-gradient(var(--green) 0 ${greenEnd}%, var(--amber) ${greenEnd}% ${amberEnd}%, var(--red) ${amberEnd}% 100%)`;
  $("#riskDonut").innerHTML = `<strong>${source.length}</strong>`;
  $("#riskLegend").innerHTML = Object.entries(counts).map(([label, count]) => `
    <div class="legend-row">
      <span><i class="legend-dot" style="background:${statusColor(label)}"></i>${escapeHtml(label)}</span>
      <strong>${count}</strong>
    </div>
  `).join("");
  $("#redCountPill").textContent = `${counts.Red} Red`;
}

function renderAtRiskList() {
  const items = [...visibleCustomers()].sort((a, b) => a.score - b.score).slice(0, 5);
  $("#atRiskList").innerHTML = items.map((customer) => `
    <button class="risk-item" type="button" data-select-customer="${escapeHtml(customer.id)}">
      <span>
        <strong>${escapeHtml(customer.name)}</strong>
        <span>${escapeHtml(customer.primaryRisk)}</span>
      </span>
      ${statusPill(`${customer.score} ${customer.healthStatus}`, statusClass(customer.healthStatus))}
    </button>
  `).join("");
}

function renderActivityFeed() {
  const items = signalsForVisibleCustomers()
    .filter((signal) => ["Critical", "High", "Medium"].includes(signal.severity))
    .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity))
    .slice(0, 5);
  $("#activityFeed").innerHTML = items.map((signal) => {
    const customer = customerById(signal.customerId);
    return `
      <button class="activity-item" type="button" data-select-customer="${escapeHtml(signal.customerId)}">
        <strong>${escapeHtml(customer.name)} - ${escapeHtml(signal.type)}</strong>
        <span>${escapeHtml(signal.date)} | ${escapeHtml(signal.risk)}</span>
      </button>
    `;
  }).join("");
}

function renderDashboard() {
  renderMetrics();
  renderExecutiveSummary();
  renderTrendChart();
  renderRiskDistribution();
  renderAtRiskList();
  renderActivityFeed();
}

function renderPortfolio() {
  const rows = filteredCustomers();
  $("#portfolioCount").textContent = `${rows.length} customers`;
  $("#visibilityBanner").innerHTML = `${icon("shield")} ${escapeHtml(state.currentUser.name)} is viewing as ${escapeHtml(state.currentUser.role)}. ${escapeHtml(roleConfig().scope)}`;
  $("#customerRows").innerHTML = rows.map((customer) => {
    const color = statusColor(customer.healthStatus);
    const isSelected = customer.id === state.selectedCustomerId ? " aria-current=\"true\"" : "";
    return `
      <tr data-row-customer="${escapeHtml(customer.id)}"${isSelected}>
        <td>
          <div class="customer-cell">
            <strong>${escapeHtml(customer.name)}</strong>
            <span>${escapeHtml(customer.project)} | ${escapeHtml(customer.engagementType)}</span>
          </div>
        </td>
        <td>
          <div class="score-cell">
            <strong>${customer.score}</strong>
            <span class="mini-gauge"><span style="width:${customer.score}%;background:${color}"></span></span>
            ${statusPill(customer.healthStatus, statusClass(customer.healthStatus))}
          </div>
        </td>
        <td>${escapeHtml(customer.tier)}</td>
        <td>${escapeHtml(customer.domain)}</td>
        <td>
          <div class="customer-cell">
            <strong>${escapeHtml(customer.accountOwner)}</strong>
            <span>PM: ${escapeHtml(customer.projectManager)}</span>
          </div>
        </td>
        <td>${escapeHtml(customer.primaryRisk)}</td>
        <td>${sparkline(customer.trend, color)}</td>
        <td><button class="button quiet" type="button" data-select-customer="${escapeHtml(customer.id)}">Open</button></td>
      </tr>
    `;
  }).join("");
}

function renderCustomerOverview(customer) {
  $("#customerOverview").innerHTML = `
    <div class="customer-header">
      <div>
        <p class="eyebrow">Customer profile</p>
        <h3>${escapeHtml(customer.name)}</h3>
        <div class="customer-meta">
          ${statusPill(customer.healthStatus, statusClass(customer.healthStatus))}
          ${statusPill(customer.tier, "neutral")}
          ${statusPill(customer.currentStatus, customer.healthStatus === "Red" ? "urgent" : "teal")}
        </div>
      </div>
      <span class="status-pill neutral">${escapeHtml(customer.domain)}</span>
    </div>
    <p class="muted" style="margin-top:14px">${escapeHtml(customer.summary)}</p>
    <div class="meta-grid">
      ${[
        ["Project", customer.project],
        ["Account owner", customer.accountOwner],
        ["Project manager", customer.projectManager],
        ["POD Head", customer.podHead],
        ["Engagement", customer.engagementType],
        ["Expected outcome", customer.expectedOutcomes[0]]
      ].map(([label, value]) => `
        <div class="meta-item">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderScoreCard(customer) {
  const color = statusColor(customer.healthStatus);
  $("#scoreCard").innerHTML = `
    <div class="panel-title">
      <div>
        <p class="eyebrow">Health score</p>
        <h3>Explainable RAG status</h3>
      </div>
      ${statusPill(customer.healthStatus, statusClass(customer.healthStatus))}
    </div>
    <div class="score-hero">
      <div class="score-ring" style="--score:${customer.score};--score-color:${color}">
        <span class="score-ring-content">
          <strong>${customer.score}</strong>
          <span>/ 100</span>
        </span>
      </div>
      <div class="score-copy">
        <strong>${escapeHtml(customer.primaryRisk)}</strong>
        <p>Score combines delivery, sentiment, CSAT, escalation, goal alignment, responsiveness, and relationship confidence.</p>
      </div>
    </div>
    <div class="score-breakdown">
      ${Object.entries(customer.breakdown).map(([key, value]) => `
        <div class="breakdown-row">
          <strong>${escapeHtml(scoreLabels[key])}</strong>
          <span class="bar-track"><span style="width:${value}%;background:${value >= 75 ? "var(--green)" : value >= 45 ? "var(--amber)" : "var(--red)"}"></span></span>
          <span>${value}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderGoals(customer) {
  $("#goalsCard").innerHTML = `
    <div class="panel-title">
      <div>
        <p class="eyebrow">Goals</p>
        <h3>Success criteria and outcomes</h3>
      </div>
      ${icon("target")}
    </div>
    <div class="goal-list">
      ${customer.goals.map((goal, index) => `
        <div class="goal-item">
          <strong>${escapeHtml(goal)}</strong>
          <span>${escapeHtml(customer.successCriteria[index] || customer.expectedOutcomes[index] || "Tracked as customer success criterion.")}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderRootCauses(customer) {
  $("#rootCauseCard").innerHTML = `
    <div class="panel-title">
      <div>
        <p class="eyebrow">Root cause</p>
        <h3>Why the score moved</h3>
      </div>
      ${statusPill("Evidence cited", "teal")}
    </div>
    <div class="root-cause-list">
      ${customer.rootCauses.map((cause) => `
        <div class="root-cause-item">
          <strong>${escapeHtml(cause.title)}</strong>
          <span>${escapeHtml(cause.detail)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderSignalTimeline(customer) {
  const customerSignals = signals.filter((signal) => signal.customerId === customer.id).slice(0, 6);
  $("#signalTimeline").innerHTML = `
    <div class="panel-title">
      <div>
        <p class="eyebrow">Signal timeline</p>
        <h3>Evidence linked to this account</h3>
      </div>
      ${statusPill(`${customerSignals.length} signals`, "neutral")}
    </div>
    <div class="timeline-list">
      ${customerSignals.map((signal) => {
        const evidence = canViewSensitiveSignal(signal)
          ? escapeHtml(signal.evidence)
          : `<span class="locked-evidence">${icon("lock")} Evidence restricted for ${escapeHtml(state.currentUser.role)}</span>`;
        return `
          <div class="timeline-item">
            <strong>${escapeHtml(signal.source)} | ${escapeHtml(signal.type)}</strong>
            <div class="signal-meta">
              ${statusPill(signal.severity, severityClass(signal.severity))}
              ${statusPill(`${signal.confidence}%`, "neutral")}
              ${statusPill(signal.status, signal.status === "Needs review" ? "amber" : "green")}
            </div>
            <p>${escapeHtml(signal.risk)}</p>
            <div class="evidence-box">${evidence}</div>
          </div>
        `;
      }).join("") || `<div class="timeline-item"><strong>No signals</strong><p>No sample signals are attached to this customer yet.</p></div>`}
    </div>
  `;
}

function renderDetailActions(customer) {
  const items = recommendations.filter((rec) => rec.customerId === customer.id);
  $("#detailActions").innerHTML = `
    <div class="panel-title">
      <div>
        <p class="eyebrow">Recommended actions</p>
        <h3>Human-owned recovery workflow</h3>
      </div>
      ${statusPill(userCan("approveRecommendation") ? "Can approve" : "Approval restricted", userCan("approveRecommendation") ? "teal" : "neutral")}
    </div>
    <div class="action-list">
      ${items.map((rec) => `
        <div class="action-item">
          ${statusPill(rec.status, rec.status === "Pending review" ? "amber" : rec.status === "Approved" ? "green" : "neutral")}
          <strong>${escapeHtml(rec.action)}</strong>
          <p>${escapeHtml(rec.reason)}</p>
          <p><strong>Owner:</strong> ${escapeHtml(rec.owner)} | <strong>Due:</strong> ${escapeHtml(rec.dueDate)}</p>
        </div>
      `).join("") || `<div class="action-item"><strong>No recommendation</strong><p>Continue monitoring the current signal set.</p></div>`}
    </div>
  `;
}

function renderCustomerDetail() {
  const customer = selectedCustomer();
  $("#selectedCustomerPill").textContent = `${customer.name} | ${customer.score}`;
  renderCustomerOverview(customer);
  renderScoreCard(customer);
  renderGoals(customer);
  renderRootCauses(customer);
  renderSignalTimeline(customer);
  renderDetailActions(customer);
}

function renderSignalSourceOptions() {
  const select = $("#signalSourceFilter");
  const current = select.value || state.signalSource;
  const sources = Array.from(new Set(signalsForVisibleCustomers().map((signal) => signal.source))).sort();
  select.innerHTML = `<option value="All">All sources</option>${sources.map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`).join("")}`;
  select.value = sources.includes(current) ? current : "All";
  state.signalSource = select.value;
}

function renderSignals() {
  renderSignalSourceOptions();
  const items = filteredSignals();
  $("#signalCount").textContent = `${items.length} signals`;
  $("#signalInbox").innerHTML = items.map((signal) => {
    const customer = customerById(signal.customerId);
    const evidence = canViewSensitiveSignal(signal)
      ? escapeHtml(signal.evidence)
      : `<span class="locked-evidence">${icon("lock")} Restricted evidence. Summary remains visible.</span>`;
    const canReview = userCan("reviewSignals");
    return `
      <article class="signal-card">
        <div class="signal-card-head">
          <div>
            <p class="eyebrow">${escapeHtml(signal.source)}</p>
            <h3>${escapeHtml(customer.name)}</h3>
          </div>
          ${statusPill(signal.severity, severityClass(signal.severity))}
        </div>
        <div class="signal-meta">
          ${statusPill(signal.type, "neutral")}
          ${statusPill(signal.sentiment, signal.sentiment === "Negative" ? "red" : signal.sentiment === "Positive" ? "green" : "neutral")}
          ${statusPill(`${signal.confidence}% confidence`, signal.confidence >= 90 ? "teal" : signal.confidence >= 75 ? "neutral" : "amber")}
          ${statusPill(signal.status, signal.status === "Needs review" ? "amber" : signal.status === "Ignored" ? "neutral" : "green")}
        </div>
        <p>${escapeHtml(signal.risk)}</p>
        <div class="evidence-box">${evidence}</div>
        <div class="signal-actions">
          <button class="button quiet" type="button" data-select-customer="${escapeHtml(signal.customerId)}">Open customer</button>
          <button class="button success" type="button" data-signal-review="${escapeHtml(signal.id)}" ${canReview ? "" : "disabled"}>Mark reviewed</button>
          <button class="button danger" type="button" data-signal-ignore="${escapeHtml(signal.id)}" ${canReview ? "" : "disabled"}>Ignore</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderRecommendations() {
  const visibleIds = new Set(visibleCustomers().map((customer) => customer.id));
  const items = recommendations.filter((rec) => visibleIds.has(rec.customerId));
  $("#recommendationBoard").innerHTML = items.map((rec) => {
    const customer = customerById(rec.customerId);
    const canApprove = userCan("approveRecommendation");
    const canAssign = userCan("assignOwner");
    return `
      <article class="recommendation-card">
        <div class="recommendation-head">
          <div>
            <p class="eyebrow">${escapeHtml(customer.name)}</p>
            <h3>${escapeHtml(rec.action)}</h3>
          </div>
          ${statusPill(rec.riskLevel, statusClass(rec.riskLevel))}
        </div>
        <p>${escapeHtml(rec.reason)}</p>
        <div class="recommendation-meta">
          <span><strong>Owner</strong>${escapeHtml(rec.owner)}</span>
          <span><strong>Due date</strong>${escapeHtml(rec.dueDate)}</span>
          <span><strong>Status</strong>${escapeHtml(rec.status)}</span>
          <span><strong>Approval</strong>${rec.approvalRequired ? "Required" : "Not required"}</span>
        </div>
        <div class="recommendation-actions">
          <button class="button success" type="button" data-rec-approve="${escapeHtml(rec.id)}" ${canApprove ? "" : "disabled"}>Approve</button>
          <button class="button danger" type="button" data-rec-reject="${escapeHtml(rec.id)}" ${canApprove ? "" : "disabled"}>Reject</button>
          <button class="button quiet" type="button" data-rec-assign="${escapeHtml(rec.id)}" ${canAssign ? "" : "disabled"}>Assign owner</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderScoring() {
  const canChange = userCan("changeScoring");
  $("#scoringAccessPill").textContent = canChange ? "Editable for this role" : "Read-only for this role";
  const total = Object.values(scoringWeights).reduce((sum, value) => sum + Number(value), 0);
  $("#weightTotal").textContent = `${total}%`;
  $("#weightTotal").className = `status-pill ${total === 100 ? "neutral" : "urgent"}`;
  $("#weightList").innerHTML = Object.entries(scoringWeights).map(([key, value]) => `
    <label class="weight-row">
      <strong>${escapeHtml(scoreLabels[key])}</strong>
      <input type="range" min="0" max="40" value="${value}" data-weight-key="${escapeHtml(key)}" ${canChange ? "" : "disabled"} />
      <span>${value}%</span>
    </label>
  `).join("");

  $("#thresholdGrid").innerHTML = [
    ["Green", "75-100", "Healthy"],
    ["Amber", "45-74", "Needs attention"],
    ["Red", "0-44", "High risk"]
  ].map(([label, range, meaning]) => `
    <div class="threshold-card">
      ${statusPill(label, statusClass(label))}
      <span><strong>${escapeHtml(range)}</strong>${escapeHtml(meaning)}</span>
    </div>
  `).join("");

  $("#confidenceTable").innerHTML = confidenceBands.map(([range, behavior]) => `
    <div class="confidence-row">
      <strong>${escapeHtml(range)}</strong>
      <span>${escapeHtml(behavior)}</span>
    </div>
  `).join("");

  $("#guardrailList").innerHTML = guardrails.map(([title, detail]) => `
    <div class="guardrail-item">
      ${icon("shield")}
      <span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></span>
    </div>
  `).join("");
}

function renderWorkflow() {
  $("#agentGrid").innerHTML = agents.map(([name, responsibility, stateLabel]) => `
    <article class="agent-card">
      <h3>${escapeHtml(name)}</h3>
      <p>${escapeHtml(responsibility)}</p>
      ${statusPill(stateLabel, stateLabel.includes("Rule") || stateLabel.includes("Mock") ? "neutral" : "teal")}
    </article>
  `).join("");

  $("#integrationGrid").innerHTML = integrations.map(([name, detail, phase]) => `
    <article class="integration-card">
      <h3>${escapeHtml(name)}</h3>
      <p>${escapeHtml(detail)}</p>
      ${statusPill(phase, "neutral")}
    </article>
  `).join("");

  $("#releaseList").innerHTML = releasePlan.map(([phase, detail]) => `
    <div class="release-item">
      <strong>${escapeHtml(phase)}</strong>
      <span>${escapeHtml(detail)}</span>
    </div>
  `).join("");
}

function renderAccess() {
  const role = state.currentUser.role;
  const config = roleConfig();
  $("#activeRolePill").textContent = role;
  $("#roleOverview").innerHTML = `
    <div class="role-summary">
      <p class="eyebrow">Active persona</p>
      <h3>${escapeHtml(role)}</h3>
      <p>${escapeHtml(config.scope)}</p>
      <div class="role-chip-list">
        ${config.nav.map((id) => statusPill(navItems.find((item) => item.id === id)?.label || id, "neutral")).join("")}
      </div>
      <div class="evidence-box"><strong>Restricted areas:</strong> ${escapeHtml(config.restricted)}</div>
    </div>
  `;

  const rows = [
    ["View sensitive evidence", "Email summaries, commercial notes, and escalation details", config.permissions.viewSensitive],
    ["Approve recommendation", "Approve or reject major recovery actions", config.permissions.approveRecommendation],
    ["Assign owner", "Assign accountable owner for recommended action", config.permissions.assignOwner],
    ["Change scoring rules", "Edit weights and RAG threshold model", config.permissions.changeScoring],
    ["Configure integrations", "Manage Jira, email, MOM, CSAT, and LLM source setup", config.permissions.configureIntegrations],
    ["Manage users and roles", "Change users, role mapping, and access scope", config.permissions.manageUsers]
  ];

  $("#permissionGrid").innerHTML = rows.map(([label, detail, allowed]) => {
    const text = allowed === true ? "Allowed" : allowed === false ? "Restricted" : String(allowed);
    const tone = allowed === true ? "green" : allowed === false ? "neutral" : "amber";
    return `
      <div class="permission-row">
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(detail)}</span>
        <span class="permission-state">${statusPill(text, tone)}</span>
      </div>
    `;
  }).join("");
}

function renderReports() {
  $("#successChecklist").innerHTML = successChecklist.map((item) => `
    <div class="check-item">
      <strong>${icon("check")} ${escapeHtml(item)}</strong>
      <span>Included in this professional MVP website flow.</span>
    </div>
  `).join("");

  $("#openQuestions").innerHTML = openQuestions.map((item) => `
    <div class="question-item">
      <strong>${escapeHtml(item)}</strong>
      <span>Decision required before pilot or production rollout.</span>
    </div>
  `).join("");
}

function fullDemoUser() {
  return demoUsers.find((user) => user.id === "admin") || demoUsers[0];
}

function visibleStepIndex(index) {
  const allowed = new Set(roleConfig().nav);
  const visibleSteps = demoSteps
    .map((step, stepIndex) => ({ ...step, stepIndex }))
    .filter((step) => allowed.has(step.section));
  if (!visibleSteps.length) return 0;
  const normalized = ((index % visibleSteps.length) + visibleSteps.length) % visibleSteps.length;
  return visibleSteps[normalized].stepIndex;
}

function currentDemoStep() {
  return demoSteps[state.demoStepIndex] || demoSteps[0];
}

function focusSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section || section.hidden) return false;
  $$("[data-demo-focus]").forEach((item) => item.removeAttribute("data-demo-focus"));
  section.setAttribute("data-demo-focus", "true");
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(updateActiveNav, 300);
  return true;
}

function renderDemoBar() {
  const bar = $("#demoBar");
  if (!bar || !state.currentUser) return;
  const allowed = new Set(roleConfig().nav);
  const availableCount = demoSteps.filter((step) => allowed.has(step.section)).length || demoSteps.length;
  const step = currentDemoStep();
  const visibleOrdinal = demoSteps.filter((item, index) => allowed.has(item.section) && index <= state.demoStepIndex).length || 1;
  bar.classList.toggle("is-active", state.demoMode);
  $("#demoStepCount").textContent = state.demoMode ? `${visibleOrdinal}/${availableCount}` : "Demo";
  $("#demoStepTitle").textContent = state.demoMode ? step.title : "Team walkthrough";
  $("#demoStepBody").textContent = state.demoMode
    ? step.body
    : "Use this rail during the meeting: it turns the site into a guided clickable prototype.";
  $("#demoStart").textContent = state.demoMode ? "Restart" : "Start walkthrough";
  $("#demoPrev").disabled = !state.demoMode;
  $("#demoNext").disabled = !state.demoMode;
  $("#demoExit").disabled = !state.demoMode;
}

function startDemo() {
  state.currentUser = fullDemoUser();
  localStorage.setItem(STORAGE_KEY, state.currentUser.id);
  $("#login").hidden = true;
  $("#appShell").hidden = false;
  document.body.classList.remove("auth-locked");
  document.body.classList.add("is-authenticated");
  state.demoMode = true;
  state.demoStepIndex = 0;
  state.selectedCustomerId = "cafe-zupas";
  state.search = "";
  state.statusFilter = "All";
  state.tierFilter = "All";
  renderAll();
  focusDemoStep();
}

function focusDemoStep() {
  const step = currentDemoStep();
  if (step.customerId) {
    state.selectedCustomerId = step.customerId;
    renderCustomerDetail();
    renderPortfolio();
  }
  if (!focusSection(step.section)) {
    state.demoStepIndex = visibleStepIndex(state.demoStepIndex + 1);
    focusSection(currentDemoStep().section);
  }
  renderDemoBar();
}

function moveDemoStep(direction) {
  if (!state.demoMode) return;
  const allowed = new Set(roleConfig().nav);
  let next = state.demoStepIndex;
  for (let attempts = 0; attempts < demoSteps.length; attempts += 1) {
    next = (next + direction + demoSteps.length) % demoSteps.length;
    if (allowed.has(demoSteps[next].section)) break;
  }
  state.demoStepIndex = next;
  focusDemoStep();
}

function stopDemo() {
  state.demoMode = false;
  $$("[data-demo-focus]").forEach((item) => item.removeAttribute("data-demo-focus"));
  renderDemoBar();
}

function applyMetricFilter(filter) {
  state.search = "";
  state.statusFilter = "All";
  state.tierFilter = "All";
  if (["Green", "Amber", "Red"].includes(filter)) {
    state.statusFilter = filter;
    const firstMatch = visibleCustomers().find((customer) => customer.healthStatus === filter);
    if (firstMatch) state.selectedCustomerId = firstMatch.id;
  } else if (filter === "tier1") {
    state.tierFilter = "Tier 1";
  }
  $("#globalSearch").value = "";
  $("#portfolioSearch").value = "";
  $("#statusFilter").value = state.statusFilter;
  $("#tierFilter").value = state.tierFilter;
  renderPortfolio();
  if (filter === "reviews") {
    $("#recommendations")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    $("#portfolio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderAll() {
  normalizeCustomers();
  renderSession();
  renderNav();
  renderDashboard();
  renderPortfolio();
  renderCustomerDetail();
  renderSignals();
  renderRecommendations();
  renderScoring();
  renderWorkflow();
  renderAccess();
  renderReports();
  renderDemoBar();
  updateActiveNav();
}

function updateActiveNav() {
  if (!state.currentUser) return;
  const visibleSections = navItems
    .map((item) => document.getElementById(item.id))
    .filter((section) => section && !section.hidden);
  let activeId = visibleSections[0]?.id || "dashboard";
  const headerBottom = $(".site-header")?.getBoundingClientRect().bottom || 0;
  visibleSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= headerBottom + 120) {
      activeId = section.id;
    }
  });
  $$("#topNav a").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  });
}

function importSampleSignal() {
  const customer = selectedCustomer();
  const newSignal = {
    id: `sig-${Date.now()}`,
    customerId: customer.id,
    source: "Manual Import",
    type: "Demo risk",
    severity: customer.healthStatus === "Green" ? "Medium" : "High",
    sentiment: customer.healthStatus === "Green" ? "Neutral" : "Negative",
    risk: `New manually imported sample signal for ${customer.name}.`,
    confidence: 73,
    status: "Needs review",
    date: "May 22, 2026",
    evidence: "Mock import created for hackathon demo signal review workflow.",
    sensitive: false,
    sensitiveType: "delivery"
  };
  signals.unshift(newSignal);
  renderDashboard();
  renderCustomerDetail();
  renderSignals();
  $("#signals")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateRecommendation(id, status) {
  const rec = recommendations.find((item) => item.id === id);
  if (!rec) return;
  rec.status = status;
  rec.reviewer = state.currentUser.name;
  renderRecommendations();
  renderCustomerDetail();
  renderExecutiveSummary();
}

function bindEvents() {
  $("#demoUserSelect").addEventListener("change", populateLoginFields);

  $("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = $("#loginEmail").value.trim().toLowerCase();
    const password = $("#loginPassword").value;
    const user = demoUsers.find((item) => item.email === email);
    if (!user || password !== DEMO_PASSWORD) {
      $("#loginStatus").textContent = "Invalid demo credentials. Use one of the listed tkxel demo roles.";
      return;
    }
    $("#loginStatus").textContent = "";
    signIn(user);
  });

  $("#logoutButton").addEventListener("click", logOut);

  $("#viewAsSelect").addEventListener("change", (event) => {
    const user = demoUsers.find((item) => item.id === event.target.value) || demoUsers[0];
    state.currentUser = user;
    localStorage.setItem(STORAGE_KEY, user.id);
    if (!visibleCustomers().some((customer) => customer.id === state.selectedCustomerId)) {
      state.selectedCustomerId = visibleCustomers()[0]?.id || customers[0].id;
    }
    renderAll();
  });

  $("#navToggle").addEventListener("click", () => {
    const nav = $("#topNav");
    const isOpen = nav.classList.toggle("is-open");
    $("#navToggle").setAttribute("aria-expanded", String(isOpen));
  });

  $("#globalSearch").addEventListener("input", (event) => {
    state.search = event.target.value;
    $("#portfolioSearch").value = event.target.value;
    renderPortfolio();
  });

  $("#portfolioSearch").addEventListener("input", (event) => {
    state.search = event.target.value;
    $("#globalSearch").value = event.target.value;
    renderPortfolio();
  });

  $("#statusFilter").addEventListener("change", (event) => {
    state.statusFilter = event.target.value;
    renderPortfolio();
  });

  $("#tierFilter").addEventListener("change", (event) => {
    state.tierFilter = event.target.value;
    renderPortfolio();
  });

  $("#resetFilters").addEventListener("click", () => {
    state.search = "";
    state.statusFilter = "All";
    state.tierFilter = "All";
    $("#globalSearch").value = "";
    $("#portfolioSearch").value = "";
    $("#statusFilter").value = "All";
    $("#tierFilter").value = "All";
    renderPortfolio();
  });

  $("#signalSourceFilter").addEventListener("change", (event) => {
    state.signalSource = event.target.value;
    renderSignals();
  });

  $("#signalReviewFilter").addEventListener("change", (event) => {
    state.signalReview = event.target.value;
    renderSignals();
  });

  $("#importSignalButton").addEventListener("click", importSampleSignal);

  $("#demoStart").addEventListener("click", startDemo);
  $("#demoPrev").addEventListener("click", () => moveDemoStep(-1));
  $("#demoNext").addEventListener("click", () => moveDemoStep(1));
  $("#demoExit").addEventListener("click", stopDemo);

  $("#exportReport").addEventListener("click", () => {
    $("#reportStatus").textContent = userCan("exportReports")
      ? `Executive brief prepared for ${state.currentUser.name}.`
      : "Report export is restricted for this role.";
    $("#reports")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#timeRangeControl").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-range]");
    if (!button) return;
    $$("#timeRangeControl button").forEach((item) => item.classList.toggle("is-active", item === button));
    state.trendRange = Number(button.dataset.range);
    renderTrendChart();
  });

  document.addEventListener("click", (event) => {
    const metricButton = event.target.closest("[data-metric-filter]");
    if (metricButton) {
      applyMetricFilter(metricButton.dataset.metricFilter);
      return;
    }

    const selectButton = event.target.closest("[data-select-customer]");
    if (selectButton) {
      setCustomer(selectButton.dataset.selectCustomer);
      return;
    }

    const row = event.target.closest("[data-row-customer]");
    if (row && !event.target.closest("button")) {
      setCustomer(row.dataset.rowCustomer);
      return;
    }

    const reviewButton = event.target.closest("[data-signal-review]");
    if (reviewButton) {
      const signal = signals.find((item) => item.id === reviewButton.dataset.signalReview);
      if (signal && userCan("reviewSignals")) {
        signal.status = "Reviewed";
        renderDashboard();
        renderCustomerDetail();
        renderSignals();
      }
      return;
    }

    const ignoreButton = event.target.closest("[data-signal-ignore]");
    if (ignoreButton) {
      const signal = signals.find((item) => item.id === ignoreButton.dataset.signalIgnore);
      if (signal && userCan("reviewSignals")) {
        signal.status = "Ignored";
        renderSignals();
      }
      return;
    }

    const approveButton = event.target.closest("[data-rec-approve]");
    if (approveButton) {
      updateRecommendation(approveButton.dataset.recApprove, "Approved");
      return;
    }

    const rejectButton = event.target.closest("[data-rec-reject]");
    if (rejectButton) {
      updateRecommendation(rejectButton.dataset.recReject, "Rejected");
      return;
    }

    const assignButton = event.target.closest("[data-rec-assign]");
    if (assignButton) {
      updateRecommendation(assignButton.dataset.recAssign, "Owner assigned");
    }
  });

  document.addEventListener("input", (event) => {
    const range = event.target.closest("[data-weight-key]");
    if (!range || !userCan("changeScoring")) return;
    scoringWeights[range.dataset.weightKey] = Number(range.value);
    renderDashboard();
    renderPortfolio();
    renderCustomerDetail();
    renderScoring();
  });

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  window.addEventListener("hashchange", updateActiveNav);
}

function init() {
  normalizeCustomers();
  renderLoginOptions();
  bindEvents();
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "1" || params.has("walkthrough")) {
    startDemo();
    return;
  }
  const demoAs = params.get("as") || params.get("demoRole");
  const demoUser = demoUsers.find((user) => {
    const requested = String(demoAs || "").toLowerCase();
    return user.id === requested || user.email.toLowerCase() === requested || user.role.toLowerCase() === requested;
  });
  if (demoUser) {
    signIn(demoUser);
    return;
  }
  const storedId = localStorage.getItem(STORAGE_KEY);
  const storedUser = demoUsers.find((user) => user.id === storedId);
  if (storedUser) {
    signIn(storedUser);
  }
}

init();
