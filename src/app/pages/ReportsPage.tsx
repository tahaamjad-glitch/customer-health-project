import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useQuery } from '@tanstack/react-query'

import { ScoreBreakdownChart } from '@/components/shared/ScoreBreakdownChart'
import { AlertSeverityChip, RagBadge, RiskBadge } from '@/components/shared/StatusBadges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { alertsApi } from '@/lib/api/alerts.api'
import { clientsApi } from '@/lib/api/clients.api'
import { configApi } from '@/lib/api/config.api'
import { recommendationsApi } from '@/lib/api/recommendations.api'
import { cn } from '@/lib/utils'
import type { HealthStatus } from '@/types'

const reportColorByHealth: Record<HealthStatus, string> = {
  green: '#15803d',
  amber: '#b45309',
  red: '#b91c1c',
}

const reportSurfaceByHealth: Record<HealthStatus, string> = {
  green: 'bg-green-50 text-green-700 border-green-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
}

const ReportsPage = (): JSX.Element => {
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: clientsApi.getAll })
  const alertsQuery = useQuery({ queryKey: ['alerts'], queryFn: alertsApi.getAll })
  const recommendationsQuery = useQuery({ queryKey: ['recommendations'], queryFn: recommendationsApi.getAll })
  const agentsQuery = useQuery({ queryKey: ['agent-modules'], queryFn: configApi.getAgentModules })

  if (clientsQuery.isLoading || alertsQuery.isLoading || recommendationsQuery.isLoading || agentsQuery.isLoading) {
    return <div className="p-6"><SkeletonList /></div>
  }
  if (clientsQuery.error || alertsQuery.error || recommendationsQuery.error || agentsQuery.error) {
    return <div className="p-6"><ErrorMessage message="Unable to load reports." /></div>
  }

  const clients = clientsQuery.data ?? []
  const alerts = alertsQuery.data ?? []
  const recommendations = recommendationsQuery.data ?? []
  const agents = agentsQuery.data ?? []
  const healthDistribution = [
    { label: 'Green', count: clients.filter((client) => client.healthStatus === 'green').length, status: 'green' as const },
    { label: 'Amber', count: clients.filter((client) => client.healthStatus === 'amber').length, status: 'amber' as const },
    { label: 'Red', count: clients.filter((client) => client.healthStatus === 'red').length, status: 'red' as const },
  ]
  const openAlerts = alerts.filter((alert) => !alert.isDismissed)

  return (
    <>
      <PageHeader
        description="Portfolio reporting for health distribution, root causes, alerts, and agent throughput."
        title="Reports"
      />
      <div className="grid gap-6 p-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Health Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {healthDistribution.map((item) => (
                <div className={cn('rounded-lg border p-3', reportSurfaceByHealth[item.status])} key={item.status}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide">{item.label}</p>
                    <RagBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{item.count}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 h-72">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={healthDistribution}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {healthDistribution.map((entry) => (
                      <Cell fill={reportColorByHealth[entry.status]} key={entry.status} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <ScoreBreakdownChart />
        <Card>
          <CardHeader>
            <CardTitle>Top Root Causes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((recommendation) => (
              <div className="rounded-lg border border-l-4 border-gray-200 border-l-red-500 p-3" key={recommendation.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-gray-950">{recommendation.title}</p>
                  <RiskBadge level={recommendation.impact} />
                </div>
                <p className="mt-1 text-sm text-gray-600">{recommendation.rootCause}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Agent Throughput</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agents.map((agent) => (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3" key={agent.id}>
                <div>
                  <p className="text-sm font-medium text-gray-950">{agent.name}</p>
                  <p className="text-xs text-gray-500">{agent.status} · {agent.lastRun}</p>
                </div>
                <span className="text-sm font-semibold text-gray-950">{agent.processedSignals}</span>
              </div>
            ))}
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-700">Open alerts: {openAlerts.length}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {openAlerts.slice(0, 4).map((alert) => (
                  <AlertSeverityChip key={alert.id} level={alert.severity} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default ReportsPage
