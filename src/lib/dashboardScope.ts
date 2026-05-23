import type {
  ActionItem,
  Alert,
  Client,
  CommunicationSignal,
  EscalationCase,
  HealthHistoryPoint,
  Project,
  Recommendation,
} from '@/types'

interface DashboardScopeInput {
  clients: Client[]
  projects: Project[]
  alerts: Alert[]
  signals: CommunicationSignal[]
  actionItems: ActionItem[]
  escalations: EscalationCase[]
  recommendations: Recommendation[]
  history: HealthHistoryPoint[]
  customerId: string
  projectId: string
}

interface DashboardScopeResult {
  clients: Client[]
  projects: Project[]
  alerts: Alert[]
  signals: CommunicationSignal[]
  actionItems: ActionItem[]
  escalations: EscalationCase[]
  recommendations: Recommendation[]
  history: HealthHistoryPoint[]
  availableProjects: Project[]
}

const isAll = (value: string): boolean => value === 'all'

export const getDashboardScope = ({
  clients,
  projects,
  alerts,
  signals,
  actionItems,
  escalations,
  recommendations,
  history,
  customerId,
  projectId,
}: DashboardScopeInput): DashboardScopeResult => {
  const availableProjects = isAll(customerId)
    ? projects
    : projects.filter((project) => project.clientId === customerId)
  const selectedProject = isAll(projectId)
    ? undefined
    : projects.find((project) => project.id === projectId)
  const scopedClientIds = new Set<string>()

  if (selectedProject) {
    scopedClientIds.add(selectedProject.clientId)
  } else if (!isAll(customerId)) {
    scopedClientIds.add(customerId)
  } else {
    clients.forEach((client) => scopedClientIds.add(client.id))
  }

  const scopedProjectIds = new Set(
    selectedProject ? [selectedProject.id] : availableProjects.map((project) => project.id),
  )
  const scopedClients = clients.filter((client) => scopedClientIds.has(client.id))
  const scopedProjects = selectedProject ? [selectedProject] : availableProjects
  const matchesClient = (clientId: string): boolean => scopedClientIds.has(clientId)
  const matchesProject = (itemProjectId?: string): boolean => isAll(projectId) || itemProjectId === projectId

  return {
    clients: scopedClients,
    projects: scopedProjects,
    alerts: alerts.filter((alert) => matchesClient(alert.clientId) && matchesProject(alert.projectId)),
    signals: signals.filter((signal) => matchesClient(signal.clientId) && matchesProject(signal.projectId)),
    actionItems: actionItems.filter((item) => matchesClient(item.clientId) && matchesProject(item.projectId)),
    escalations: escalations.filter((item) => matchesClient(item.clientId) && matchesProject(item.projectId)),
    recommendations: recommendations.filter((item) => matchesClient(item.clientId) && matchesProject(item.projectId)),
    history: history.filter((point) => scopedClientIds.has(point.clientId)),
    availableProjects: Array.from(scopedProjectIds).length ? availableProjects : [],
  }
}

export const buildPortfolioTrend = (history: HealthHistoryPoint[]): HealthHistoryPoint[] =>
  Array.from(new Set(history.map((point) => point.week))).map((week) => {
    const points = history.filter((point) => point.week === week)
    const divisor = Math.max(points.length, 1)

    return {
      clientId: 'portfolio',
      week,
      customerScore: Math.round(points.reduce((sum, point) => sum + point.customerScore, 0) / divisor),
      deliveryScore: Math.round(points.reduce((sum, point) => sum + point.deliveryScore, 0) / divisor),
      relationshipScore: Math.round(points.reduce((sum, point) => sum + point.relationshipScore, 0) / divisor),
    }
  })
