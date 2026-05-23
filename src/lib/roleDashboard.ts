import type {
  AgentModule,
  Alert,
  Client,
  DashboardMetric,
  Project,
  Recommendation,
  RoleDashboardContent,
  RoleDashboardInput,
  RoleQueueItem,
} from '@/types'

const toClientQueueItem = (client: Client): RoleQueueItem => ({
  id: client.id,
  title: client.company,
  description: `${client.healthScore} health score with ${client.churnRisk}% churn risk.`,
  meta: `${client.csm} · Renewal ${client.renewalDate}`,
  severity: client.riskLevel,
})

const toProjectQueueItem = (project: Project): RoleQueueItem => ({
  id: project.id,
  title: project.name,
  description: `${project.healthScore} project score, ${project.deliveryRisk}% delivery risk.`,
  meta: `${project.projectManager} · ${project.nextMilestone} · Due ${project.dueDate}`,
  severity: project.jiraRisk,
})

const toAlertQueueItem = (alert: Alert): RoleQueueItem => ({
  id: alert.id,
  title: alert.clientName,
  description: alert.message,
  meta: `Triggered ${new Date(alert.triggeredAt).toLocaleDateString()}`,
  severity: alert.severity,
})

const toRecommendationQueueItem = (recommendation: Recommendation): RoleQueueItem => ({
  id: recommendation.id,
  title: recommendation.title,
  description: recommendation.suggestedAction,
  meta: `${recommendation.ownerRole} owner · ${recommendation.confidence}% confidence`,
  severity: recommendation.impact,
})

const toAgentQueueItem = (agent: AgentModule): RoleQueueItem => ({
  id: agent.id,
  title: agent.name,
  description: `${agent.processedSignals} processed signals in the latest run.`,
  meta: `${agent.status} · ${agent.lastRun}`,
  severity: agent.status === 'online' ? 'low' : 'medium',
})

const top = <Item>(items: Item[], count = 4): Item[] => items.slice(0, count)

const buildRoleDashboardContent = ({
  role,
  clients,
  projects,
  alerts,
  signals,
  actionItems,
  escalations,
  recommendations,
  agents,
  scoreRules,
  auditLogs,
  averageHealth,
  greenCount,
  amberCount,
  redCount,
}: RoleDashboardInput): RoleDashboardContent => {
  const openAlerts = alerts.filter((alert) => !alert.isDismissed)
  const unreadAlerts = openAlerts.filter((alert) => !alert.isRead)
  const highRiskClients = clients.filter((client) => client.healthStatus === 'red' || client.riskLevel === 'critical')
  const amberRedProjects = projects.filter((project) => project.healthStatus !== 'green')
  const pmoJiraSignals = signals.filter((signal) => signal.source === 'jira_pulse' || signal.source === 'jira')
  const overdueActions = actionItems.filter((item) => item.status !== 'done' && new Date(item.dueDate) < new Date('2026-05-22'))
  const openEscalations = escalations.filter((item) => item.status !== 'closed')
  const pendingRecommendations = recommendations.filter((recommendation) => recommendation.decision === 'pending')

  const portfolioMetrics: DashboardMetric[] = [
    { id: 'customers', label: 'Total Customers', value: String(clients.length), helper: `${greenCount} green, ${amberCount} amber, ${redCount} red`, icon: 'users' },
    { id: 'projects', label: 'Total Projects', value: String(projects.length), helper: 'Project-level health rolled into customer score', icon: 'gauge' },
    { id: 'health', label: 'Average Health Score', value: String(averageHealth), helper: 'Weighted across customer and project signals', icon: 'gauge' },
    { id: 'alerts', label: 'Open Alerts', value: String(openAlerts.length), helper: `${overdueActions.length} overdue actions`, icon: 'alert' },
  ]

  if (role === 'PM') {
    const pmActions = actionItems.filter((item) => item.ownerRole === 'PM' && item.status !== 'done')
    const pmAlerts = openAlerts.filter((alert) => alert.severity === 'low' || alert.severity === 'medium')

    return {
      title: 'PM Dashboard',
      description: 'Project delivery queue, alert actions, root causes, and assigned recovery ownership.',
      summary: 'Focus the day on amber/red projects, alert actions, and recovery work that can move project health before escalation.',
      metrics: [
        { id: 'projects', label: 'Active Projects', value: String(projects.length), helper: 'Delivery work in portfolio', icon: 'gauge' },
        { id: 'pm-actions', label: 'PM Action Items', value: String(pmActions.length), helper: `${overdueActions.length} overdue across all owners`, icon: 'actions' },
        { id: 'project-risk', label: 'Amber / Red Projects', value: String(amberRedProjects.length), helper: 'Need delivery attention', icon: 'alert' },
        { id: 'alert-actions', label: 'Alert Actions', value: String(pmAlerts.length), helper: 'Acknowledge, route, resolve, or mark feedback', icon: 'actions' },
      ],
      primaryQueueTitle: 'Project Delivery Queue',
      primaryQueue: top(amberRedProjects.map(toProjectQueueItem)),
      nextMoves: [
        'Acknowledge new alerts before creating project recovery actions.',
        'Attach root cause notes before marking a recommendation as accepted.',
        'Escalate only when recovery owner, due date, and closure criteria are clear.',
      ],
      capabilities: [
        { label: 'Alert routing', value: 'Low: PM only' },
        { label: 'Evidence', value: 'Summary + raw delivery evidence' },
        { label: 'Commercial notes', value: 'Hidden' },
      ],
      primaryActionLabel: 'Open alerts',
      primaryActionPath: '/alerts',
    }
  }

  if (role === 'POD Head' || role === 'Project Director') {
    const directorRecommendations = pendingRecommendations.filter(
      (recommendation) => recommendation.ownerRole === 'POD Head' || recommendation.ownerRole === 'Project Director',
    )

    return {
      title: `${role} Dashboard`,
      description: 'Portfolio delivery risk, medium-severity routing, recommendation approval, and owner assignment.',
      summary: 'Prioritize accounts where delivery risk is creating customer-level impact and recommendations need approval or rejection.',
      metrics: [
        { id: 'amber-red-projects', label: 'Amber / Red Projects', value: String(amberRedProjects.length), helper: 'Projects above POD watch threshold', icon: 'gauge' },
        { id: 'medium-alerts', label: 'Medium+ Alerts', value: String(openAlerts.filter((alert) => alert.severity !== 'low').length), helper: 'Requires leadership routing', icon: 'alert' },
        { id: 'approvals', label: 'Pending Approvals', value: String(directorRecommendations.length), helper: 'Recommendations awaiting decision', icon: 'recommendations' },
        { id: 'escalations', label: 'Open Escalations', value: String(openEscalations.length), helper: 'Recovery governance cases', icon: 'shield' },
      ],
      primaryQueueTitle: 'Portfolio Risk Queue',
      primaryQueue: top([...amberRedProjects.map(toProjectQueueItem), ...directorRecommendations.map(toRecommendationQueueItem)]),
      nextMoves: [
        'Approve or reject recommendations with clear ownership.',
        'Move medium alerts into recovery actions before they become leadership escalations.',
        'Use project health as a separate lens before changing the customer-level score.',
      ],
      capabilities: [
        { label: 'Alert routing', value: 'Medium: PM + Director / POD' },
        { label: 'Evidence', value: 'Summary + raw delivery evidence' },
        { label: 'Escalation scope', value: 'Portfolio' },
      ],
      primaryActionLabel: 'Review recommendations',
      primaryActionPath: '/recommendations',
    }
  }

  if (role === 'AE') {
    const aeRecommendations = recommendations.filter((recommendation) => recommendation.ownerRole === 'AE')
    const renewalRisk = clients.filter((client) => client.churnRisk >= 50 || client.healthStatus === 'red')

    return {
      title: 'AE Dashboard',
      description: 'Relationship signals, renewal risk, commercial sensitivity, and recovery plan creation.',
      summary: 'Concentrate on red accounts, renewal blockers, and commercial context while delivery evidence remains appropriately restricted.',
      metrics: [
        { id: 'red-accounts', label: 'Red Accounts', value: String(highRiskClients.length), helper: 'Relationship and churn risk', icon: 'users' },
        { id: 'renewal-risk', label: 'Renewal Risk', value: String(renewalRisk.length), helper: 'Churn risk above 50% or red health', icon: 'trend' },
        { id: 'ae-recs', label: 'AE Recommendations', value: String(aeRecommendations.length), helper: 'Commercial or recovery plan actions', icon: 'recommendations' },
        { id: 'high-alerts', label: 'High Alerts', value: String(openAlerts.filter((alert) => alert.severity === 'high' || alert.severity === 'critical').length), helper: 'AE + PMO + Leadership routing', icon: 'alert' },
      ],
      primaryQueueTitle: 'Relationship Risk Queue',
      primaryQueue: top([...renewalRisk.map(toClientQueueItem), ...aeRecommendations.map(toRecommendationQueueItem)]),
      nextMoves: [
        'Open a recovery plan for red accounts with renewal blockers.',
        'Review commercial notes before joining delivery recovery calls.',
        'Keep sensitive commercial context out of delivery-facing summaries.',
      ],
      capabilities: [
        { label: 'Evidence', value: 'Summary + commercial notes' },
        { label: 'Raw evidence', value: 'Restricted' },
        { label: 'Primary workflow', value: 'Recovery plan' },
      ],
      primaryActionLabel: 'Open customers',
      primaryActionPath: '/customers',
    }
  }

  if (role === 'Admin') {
    return {
      title: 'Admin Dashboard',
      description: 'Scoring rules, integrations, role permissions, audit logs, and agent module health.',
      summary: 'Watch scoring configuration, integration health, and audit activity without mixing system governance with account delivery work.',
      metrics: [
        { id: 'rules', label: 'Scoring Rules', value: String(scoreRules.length), helper: `${scoreRules.filter((rule) => rule.isEnabled).length} enabled`, icon: 'settings' },
        { id: 'agents', label: 'AI Modules', value: String(agents.length), helper: `${agents.filter((agent) => agent.status !== 'online').length} need attention`, icon: 'shield' },
        { id: 'audit', label: 'Audit Events', value: String(auditLogs.length), helper: 'Recent governance changes', icon: 'actions' },
        { id: 'alerts', label: 'Open Alerts', value: String(openAlerts.length), helper: 'System-wide alert queue', icon: 'alert' },
      ],
      primaryQueueTitle: 'Integration & Agent Health',
      primaryQueue: top(agents.map(toAgentQueueItem)),
      nextMoves: [
        'Tune score weights only through configuration so audit logs capture the change.',
        'Verify role permissions before exposing raw communication or commercial notes.',
        'Check degraded integrations before trusting source-weighted health movements.',
      ],
      capabilities: [
        { label: 'Permissions', value: 'Full access' },
        { label: 'Configuration', value: 'Scoring + integrations' },
        { label: 'Audit scope', value: 'Global' },
      ],
      primaryActionLabel: 'Open settings',
      primaryActionPath: '/settings',
    }
  }

  return {
    title: `${role} Dashboard`,
    description: 'Executive risk view across customer health, alerts, escalations, and recovery governance.',
      summary: 'Watch Tier 1 pressure, escalation trend, and high-confidence negative signals that require cross-functional recovery.',
      metrics: portfolioMetrics,
      primaryQueueTitle: 'Executive Risk Queue',
      primaryQueue: top([...highRiskClients.map(toClientQueueItem), ...openAlerts.map(toAlertQueueItem)]),
      nextMoves: [
        'Confirm every high-severity alert has an accountable owner and due date.',
        'Use the escalation trend to separate active recovery from unresolved risk.',
        `Use the PMO Jira board as one governed escalation input (${pmoJiraSignals.length} items in scope).`,
      ],
    capabilities: [
      { label: 'Alert routing', value: 'High: PM + AE + PMO + Leadership' },
      { label: 'Evidence', value: 'Summary + commercial notes' },
      { label: 'Escalation scope', value: 'Global' },
    ],
    primaryActionLabel: 'Open escalations',
    primaryActionPath: '/escalations',
  }
}

export { buildRoleDashboardContent }
