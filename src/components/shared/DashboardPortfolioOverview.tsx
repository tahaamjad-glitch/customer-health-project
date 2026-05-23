import { AlertTriangle, ArrowUpRight, Gauge, RadioTower } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { RiskBadge } from '@/components/shared/StatusBadges'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { HEALTH_LABELS } from '@/constants'
import { cn, formatPercent } from '@/lib/utils'
import type { Alert, Client, CommunicationSignal, HealthStatus, Project, RiskLevel } from '@/types'

interface DashboardPortfolioOverviewProps {
  clients: Client[]
  projects: Project[]
  alerts: Alert[]
  signals: CommunicationSignal[]
}

const healthColors: Record<HealthStatus, string> = {
  green: '#15803d',
  amber: '#b45309',
  red: '#b91c1c',
}

const healthTone: Record<HealthStatus, 'green' | 'amber' | 'red'> = {
  green: 'green',
  amber: 'amber',
  red: 'red',
}

const healthDotClasses: Record<HealthStatus, string> = {
  green: 'bg-green-700',
  amber: 'bg-amber-700',
  red: 'bg-red-700',
}

const riskRank: Record<RiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const DashboardPortfolioOverview = ({ clients, projects, alerts, signals }: DashboardPortfolioOverviewProps): JSX.Element => {
  const averageHealth = clients.length
    ? Math.round(clients.reduce((sum, client) => sum + client.healthScore, 0) / clients.length)
    : 0
  const healthSegments = (['green', 'amber', 'red'] as HealthStatus[]).map((status) => ({
    status,
    name: HEALTH_LABELS[status],
    value: clients.filter((client) => client.healthStatus === status).length,
  }))
  const highRiskAccounts = [...clients]
    .filter((client) => client.riskLevel === 'critical' || client.riskLevel === 'high')
    .sort((first, second) => riskRank[second.riskLevel] - riskRank[first.riskLevel] || second.churnRisk - first.churnRisk)
    .slice(0, 3)
  const blockedProjects = projects.filter((project) => project.deliveryRisk >= 50 || project.jiraRisk === 'high' || project.jiraRisk === 'critical')
  const openAlerts = alerts.filter((alert) => !alert.isDismissed)
  const pmoJiraInputs = signals.filter((signal) => signal.source === 'jira_pulse' || signal.source === 'jira')

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-950 text-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-white">Portfolio Health Mix</CardTitle>
              <p className="mt-1 text-sm text-gray-300">Current customer distribution across green, amber, and red states.</p>
            </div>
            <Badge className="bg-white text-gray-950 ring-white">{formatPercent(averageHealth)} average</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
          <div className="h-64">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Tooltip />
                <Pie data={healthSegments} dataKey="value" innerRadius={56} nameKey="name" outerRadius={92} paddingAngle={3}>
                  {healthSegments.map((segment) => (
                    <Cell fill={healthColors[segment.status]} key={segment.status} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid content-center gap-3">
            {healthSegments.map((segment) => (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3" key={segment.status}>
                <div className="flex items-center gap-3">
                  <span className={cn('h-3 w-3 rounded-full', healthDotClasses[segment.status])} aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-gray-950">{segment.name} customers</p>
                    <p className="text-xs text-gray-500">{clients.length ? Math.round((segment.value / clients.length) * 100) : 0}% of portfolio</p>
                  </div>
                </div>
                <Badge tone={healthTone[segment.status]}>{segment.value}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Executive Risk Snapshot</CardTitle>
              <p className="mt-1 text-sm text-gray-500">Live risk posture across signals, projects, and alerts.</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-blue-700" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-red-50 p-3">
              <AlertTriangle className="h-4 w-4 text-red-700" aria-hidden="true" />
              <p className="mt-2 text-xl font-semibold text-red-700">{openAlerts.length}</p>
              <p className="text-xs text-red-700">open alerts</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <Gauge className="h-4 w-4 text-amber-700" aria-hidden="true" />
              <p className="mt-2 text-xl font-semibold text-amber-700">{blockedProjects.length}</p>
              <p className="text-xs text-amber-700">delivery risks</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <RadioTower className="h-4 w-4 text-blue-700" aria-hidden="true" />
              <p className="mt-2 text-xl font-semibold text-blue-700">{pmoJiraInputs.length}</p>
              <p className="text-xs text-blue-700">PMO Jira inputs</p>
            </div>
          </div>
          <div className="space-y-3">
            {highRiskAccounts.map((client) => (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3" key={client.id}>
                <div>
                  <p className="text-sm font-semibold text-gray-950">{client.company}</p>
                  <p className="text-xs text-gray-500">Churn risk {client.churnRisk}% · Renewal {client.renewalDate}</p>
                </div>
                <RiskBadge level={client.riskLevel} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { DashboardPortfolioOverview }
