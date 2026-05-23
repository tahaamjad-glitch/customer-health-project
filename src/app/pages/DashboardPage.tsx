import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { CommandCenterAlertActions } from '@/components/shared/CommandCenterAlertActions'
import { CommandCenterFilters } from '@/components/shared/CommandCenterFilters'
import { CustomerHealthGraph } from '@/components/shared/CustomerHealthGraph'
import { DashboardExecutiveSummary } from '@/components/shared/DashboardExecutiveSummary'
import { DashboardMetricGrid } from '@/components/shared/DashboardMetricGrid'
import { DashboardPortfolioOverview } from '@/components/shared/DashboardPortfolioOverview'
import { EscalationTrendCard } from '@/components/shared/EscalationTrendCard'
import { RecommendationPanel } from '@/components/shared/RecommendationPanel'
import { RoleDashboardPanel } from '@/components/shared/RoleDashboardPanel'
import { ScoreBreakdownChart } from '@/components/shared/ScoreBreakdownChart'
import { ScoreTrendChart } from '@/components/shared/ScoreTrendChart'
import { EmptyState, ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { PageHeader } from '@/components/ui/PageHeader'
import { actionItemsApi } from '@/lib/api/actionItems.api'
import { alertsApi } from '@/lib/api/alerts.api'
import { clientsApi } from '@/lib/api/clients.api'
import { configApi } from '@/lib/api/config.api'
import { escalationsApi } from '@/lib/api/escalations.api'
import { projectsApi } from '@/lib/api/projects.api'
import { recommendationsApi } from '@/lib/api/recommendations.api'
import { signalsApi } from '@/lib/api/signals.api'
import { buildPortfolioTrend, getDashboardScope } from '@/lib/dashboardScope'
import { buildRoleDashboardContent } from '@/lib/roleDashboard'
import { useUiStore } from '@/store/uiStore'

const DashboardPage = (): JSX.Element => {
  const activeRole = useUiStore((state) => state.activeRole)
  const [customerFilter, setCustomerFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: clientsApi.getAll })
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: projectsApi.getAll })
  const alertsQuery = useQuery({ queryKey: ['alerts'], queryFn: alertsApi.getAll })
  const signalsQuery = useQuery({ queryKey: ['signals'], queryFn: signalsApi.getAll })
  const actionsQuery = useQuery({ queryKey: ['action-items'], queryFn: actionItemsApi.getAll })
  const escalationsQuery = useQuery({ queryKey: ['escalations'], queryFn: escalationsApi.getAll })
  const recommendationsQuery = useQuery({ queryKey: ['recommendations'], queryFn: recommendationsApi.getAll })
  const historyQuery = useQuery({ queryKey: ['health-history'], queryFn: configApi.getHealthHistory })
  const agentsQuery = useQuery({ queryKey: ['agent-modules'], queryFn: configApi.getAgentModules })
  const scoreRulesQuery = useQuery({ queryKey: ['score-rules'], queryFn: configApi.getScoreRules })
  const auditQuery = useQuery({ queryKey: ['audit-logs'], queryFn: configApi.getAuditLogs })

  const isLoading =
    clientsQuery.isLoading ||
    projectsQuery.isLoading ||
    alertsQuery.isLoading ||
    signalsQuery.isLoading ||
    actionsQuery.isLoading ||
    escalationsQuery.isLoading ||
    recommendationsQuery.isLoading ||
    historyQuery.isLoading ||
    agentsQuery.isLoading ||
    scoreRulesQuery.isLoading ||
    auditQuery.isLoading

  if (isLoading) return <div className="p-6"><SkeletonList /></div>
  if (
    clientsQuery.error ||
    projectsQuery.error ||
    alertsQuery.error ||
    signalsQuery.error ||
    actionsQuery.error ||
    escalationsQuery.error ||
    recommendationsQuery.error ||
    historyQuery.error ||
    agentsQuery.error ||
    scoreRulesQuery.error ||
    auditQuery.error
  ) {
    return <div className="p-6"><ErrorMessage message="Unable to load dashboard data." /></div>
  }

  const clients = clientsQuery.data ?? []
  const projects = projectsQuery.data ?? []
  const alerts = alertsQuery.data ?? []
  const signals = signalsQuery.data ?? []
  const actionItems = actionsQuery.data ?? []
  const escalations = escalationsQuery.data ?? []
  const recommendations = recommendationsQuery.data ?? []
  const history = historyQuery.data ?? []
  const agents = agentsQuery.data ?? []
  const scoreRules = scoreRulesQuery.data ?? []
  const auditLogs = auditQuery.data ?? []

  if (clients.length === 0) return <div className="p-6"><EmptyState title="No customers" message="Add customers to start scoring portfolio health." /></div>

  const scope = getDashboardScope({
    clients,
    projects,
    alerts,
    signals,
    actionItems,
    escalations,
    recommendations,
    history,
    customerId: customerFilter,
    projectId: projectFilter,
  })
  const greenCount = scope.clients.filter((client) => client.healthStatus === 'green').length
  const amberCount = scope.clients.filter((client) => client.healthStatus === 'amber').length
  const redCount = scope.clients.filter((client) => client.healthStatus === 'red').length
  const averageHealth = Math.round(scope.clients.reduce((sum, client) => sum + client.healthScore, 0) / Math.max(scope.clients.length, 1))
  const highRiskTierOne = scope.clients.filter((client) => client.tier === 'tier_1' && client.riskLevel === 'critical')
  const openEscalations = scope.escalations.filter((item) => item.status !== 'closed')
  const openAlerts = scope.alerts.filter((alert) => alert.status !== 'resolved' && !alert.isDismissed)
  const pmoJiraSignals = scope.signals.filter((signal) => signal.source === 'jira_pulse' || signal.source === 'jira')
  const projectNameById = Object.fromEntries(projects.map((project) => [project.id, project.name]))
  const roleDashboard = buildRoleDashboardContent({
    role: activeRole,
    clients: scope.clients,
    projects: scope.projects,
    alerts: scope.alerts,
    signals: scope.signals,
    actionItems: scope.actionItems,
    escalations: scope.escalations,
    recommendations: scope.recommendations,
    agents,
    scoreRules,
    auditLogs,
    averageHealth,
    greenCount,
    amberCount,
    redCount,
  })

  const portfolioTrend = buildPortfolioTrend(scope.history)

  const handleCustomerFilterChange = (clientId: string): void => {
    setCustomerFilter(clientId)
    setProjectFilter('all')
  }

  return (
    <>
      <PageHeader description={roleDashboard.description} title={roleDashboard.title} />
      <div className="space-y-6 p-6">
        <CommandCenterFilters
          clients={clients}
          customerId={customerFilter}
          onCustomerChange={handleCustomerFilterChange}
          onProjectChange={setProjectFilter}
          openAlertCount={openAlerts.length}
          pmoJiraSignalCount={pmoJiraSignals.length}
          projectId={projectFilter}
          projects={scope.availableProjects}
          visibleClientCount={scope.clients.length}
          visibleProjectCount={scope.projects.length}
        />
        <DashboardMetricGrid metrics={roleDashboard.metrics} />
        <DashboardPortfolioOverview alerts={scope.alerts} clients={scope.clients} projects={scope.projects} signals={scope.signals} />
        <RoleDashboardPanel role={activeRole} {...roleDashboard} />
        <CommandCenterAlertActions alerts={scope.alerts} projectNameById={projectNameById} />
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <ScoreTrendChart data={portfolioTrend} title="Portfolio Health History" />
          <DashboardExecutiveSummary averageHealth={averageHealth} highRiskTierOneClients={highRiskTierOne} />
        </div>
        <CustomerHealthGraph clients={scope.clients} />
        <div className="grid gap-6 xl:grid-cols-2">
          <ScoreBreakdownChart />
          <EscalationTrendCard escalations={openEscalations} />
        </div>
        <RecommendationPanel recommendations={recommendations.slice(0, 3)} />
      </div>
    </>
  )
}

export default DashboardPage
