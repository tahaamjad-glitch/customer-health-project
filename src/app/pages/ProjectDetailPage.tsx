import { ArrowLeft, CalendarClock, GitBranch, ListTodo } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

import { HealthScoreCard } from '@/components/shared/HealthScoreCard'
import { RecommendationPanel } from '@/components/shared/RecommendationPanel'
import { RiskBadge } from '@/components/shared/StatusBadges'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { actionItemsApi } from '@/lib/api/actionItems.api'
import { clientsApi } from '@/lib/api/clients.api'
import { projectsApi } from '@/lib/api/projects.api'
import { recommendationsApi } from '@/lib/api/recommendations.api'
import { signalsApi } from '@/lib/api/signals.api'

const ProjectDetailPage = (): JSX.Element => {
  const { id = '' } = useParams()
  const projectQuery = useQuery({ queryKey: ['projects', id], queryFn: () => projectsApi.getById(id) })
  const clientId = projectQuery.data?.clientId ?? ''

  const clientQuery = useQuery({
    queryKey: ['clients', clientId],
    queryFn: () => clientsApi.getById(clientId),
    enabled: Boolean(clientId),
  })
  const signalsQuery = useQuery({
    queryKey: ['signals', 'client', clientId],
    queryFn: () => signalsApi.getByClientId(clientId),
    enabled: Boolean(clientId),
  })
  const recommendationsQuery = useQuery({
    queryKey: ['recommendations', 'client', clientId],
    queryFn: () => recommendationsApi.getByClientId(clientId),
    enabled: Boolean(clientId),
  })
  const actionsQuery = useQuery({
    queryKey: ['action-items', 'client', clientId],
    queryFn: () => actionItemsApi.getByClientId(clientId),
    enabled: Boolean(clientId),
  })

  if (projectQuery.isLoading || clientQuery.isLoading || signalsQuery.isLoading || recommendationsQuery.isLoading || actionsQuery.isLoading) {
    return <div className="p-6"><SkeletonList /></div>
  }
  if (projectQuery.error) return <div className="p-6"><ErrorMessage message="Project not found." /></div>

  const project = projectQuery.data
  const client = clientQuery.data
  const signals = signalsQuery.data ?? []
  const recommendations = (recommendationsQuery.data ?? []).filter((recommendation) => recommendation.projectId === id)
  const actions = (actionsQuery.data ?? []).filter((action) => action.projectId === id)
  const jiraSignals = signals.filter((signal) => signal.source === 'jira')

  if (!project) return <div className="p-6"><ErrorMessage message="Project not found." /></div>

  return (
    <>
      <PageHeader
        actions={
          <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 hover:bg-gray-50" to="/projects">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        }
        description={`${client?.company ?? 'Customer'} · ${project.stage.replace('_', ' ')} · Director ${project.director}`}
        title={project.name}
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 xl:grid-cols-4">
          <HealthScoreCard riskLevel={project.jiraRisk} score={project.healthScore} status={project.healthStatus} subtitle="Project-level health only, independent of account relationship score." title="Project Health" />
          <MetricCard helper="Probability delivery milestones land on plan" icon={<CalendarClock className="h-5 w-5" aria-hidden="true" />} label="Milestone Confidence" value={`${project.milestoneConfidence}%`} />
          <MetricCard helper="Calculated from Jira and delivery signals" icon={<GitBranch className="h-5 w-5" aria-hidden="true" />} label="Delivery Risk" value={`${project.deliveryRisk}%`} />
          <MetricCard helper="Open project recovery tasks" icon={<ListTodo className="h-5 w-5" aria-hidden="true" />} label="Open Actions" value={String(project.openActions)} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Jira Delivery Risks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {jiraSignals.length > 0 ? (
                jiraSignals.map((signal) => (
                  <div className="rounded-lg border border-gray-200 p-4" key={signal.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <RiskBadge level={project.jiraRisk} />
                      <Badge tone="blue">{signal.source}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{signal.summary}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                  No project Jira signals are above the scoring threshold.
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Delivery Risk Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Next milestone</p>
                <p className="mt-2 text-sm font-medium text-gray-950">{project.nextMilestone}</p>
                <p className="text-sm text-gray-500">{project.dueDate}</p>
              </div>
              {actions.map((action) => (
                <div className="rounded-lg border border-gray-200 p-3" key={action.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-950">{action.title}</p>
                    <RiskBadge level={action.severity} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{action.owner} · {action.status.replace('_', ' ')}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <RecommendationPanel recommendations={recommendations} />
      </div>
    </>
  )
}

export default ProjectDetailPage
