import { ArrowLeft } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'

import { CustomerAlertsMeetingsCard } from '@/components/shared/CustomerAlertsMeetingsCard'
import { CustomerGovernanceCard } from '@/components/shared/CustomerGovernanceCard'
import { EvidenceDrawer } from '@/components/shared/EvidenceDrawer'
import { HealthScoreCard } from '@/components/shared/HealthScoreCard'
import { ProjectTable } from '@/components/shared/ProjectTable'
import { RecommendationPanel } from '@/components/shared/RecommendationPanel'
import { ReviewDecisionModal } from '@/components/shared/ReviewDecisionModal'
import { ScoreTrendChart } from '@/components/shared/ScoreTrendChart'
import { SignalCard } from '@/components/shared/SignalCard'
import { EmptyState, ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { PageHeader } from '@/components/ui/PageHeader'
import { actionItemsApi } from '@/lib/api/actionItems.api'
import { alertsApi } from '@/lib/api/alerts.api'
import { clientsApi } from '@/lib/api/clients.api'
import { configApi } from '@/lib/api/config.api'
import { escalationsApi } from '@/lib/api/escalations.api'
import { meetingsApi } from '@/lib/api/meetings.api'
import { projectsApi } from '@/lib/api/projects.api'
import { recommendationsApi } from '@/lib/api/recommendations.api'
import { signalsApi } from '@/lib/api/signals.api'
import { formatCurrency, getHealthStatus } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'
import type { CommunicationSignal, SignalLifecycleStatus } from '@/types'

const CustomerDetailPage = (): JSX.Element => {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const activeRole = useUiStore((state) => state.activeRole)
  const [evidenceSignal, setEvidenceSignal] = useState<CommunicationSignal>()
  const [reviewSignal, setReviewSignal] = useState<CommunicationSignal>()

  const clientQuery = useQuery({ queryKey: ['clients', id], queryFn: () => clientsApi.getById(id) })
  const projectsQuery = useQuery({ queryKey: ['projects', 'client', id], queryFn: () => projectsApi.getByClientId(id) })
  const signalsQuery = useQuery({ queryKey: ['signals', 'client', id], queryFn: () => signalsApi.getByClientId(id) })
  const reviewsQuery = useQuery({ queryKey: ['signal-reviews'], queryFn: signalsApi.getReviews })
  const meetingsQuery = useQuery({ queryKey: ['meetings', 'client', id], queryFn: () => meetingsApi.getByClientId(id) })
  const recommendationsQuery = useQuery({ queryKey: ['recommendations', 'client', id], queryFn: () => recommendationsApi.getByClientId(id) })
  const actionsQuery = useQuery({ queryKey: ['action-items', 'client', id], queryFn: () => actionItemsApi.getByClientId(id) })
  const alertsQuery = useQuery({ queryKey: ['alerts', 'client', id], queryFn: () => alertsApi.getByClientId(id) })
  const escalationsQuery = useQuery({ queryKey: ['escalations', 'client', id], queryFn: () => escalationsApi.getByClientId(id) })
  const historyQuery = useQuery({ queryKey: ['health-history'], queryFn: configApi.getHealthHistory })

  const reviewMutation = useMutation({
    mutationFn: ({ signalId, status, dismissalReason }: { signalId: string; status: SignalLifecycleStatus; dismissalReason?: string }) =>
      signalsApi.updateReview(signalId, {
        lifecycleStatus: status,
        dismissalReason,
        reviewer: activeRole,
        humanOverride: Boolean(dismissalReason),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signal-reviews'] })
      toast.success('Signal review saved')
      setReviewSignal(undefined)
    },
    onError: () => toast.error('Unable to save signal review'),
  })

  const isLoading =
    clientQuery.isLoading ||
    projectsQuery.isLoading ||
    signalsQuery.isLoading ||
    reviewsQuery.isLoading ||
    meetingsQuery.isLoading ||
    recommendationsQuery.isLoading ||
    actionsQuery.isLoading ||
    alertsQuery.isLoading ||
    escalationsQuery.isLoading ||
    historyQuery.isLoading

  if (isLoading) return <div className="p-6"><SkeletonList /></div>
  if (clientQuery.error) return <div className="p-6"><ErrorMessage message="Customer not found." /></div>

  const client = clientQuery.data
  const projects = projectsQuery.data ?? []
  const signals = signalsQuery.data ?? []
  const reviews = reviewsQuery.data ?? []
  const meetings = meetingsQuery.data ?? []
  const recommendations = recommendationsQuery.data ?? []
  const actions = actionsQuery.data ?? []
  const alerts = alertsQuery.data ?? []
  const escalations = escalationsQuery.data ?? []
  const history = (historyQuery.data ?? []).filter((point) => point.clientId === id)

  if (!client) return <div className="p-6"><ErrorMessage message="Customer not found." /></div>

  const projectAverage = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + project.healthScore, 0) / projects.length)
    : client.healthScore
  const rollupScore = Math.round(client.healthScore * 0.6 + projectAverage * 0.4)
  const rollupStatus = getHealthStatus(rollupScore)

  const handleReviewSubmit = (status: SignalLifecycleStatus, dismissalReason?: string): void => {
    if (!reviewSignal) return
    reviewMutation.mutate({ signalId: reviewSignal.id, status, dismissalReason })
  }

  return (
    <>
      <PageHeader
        actions={
          <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 hover:bg-gray-50" to="/customers">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        }
        description={`${client.industry} · ${formatCurrency(client.contractValue)} · Renewal ${client.renewalDate}`}
        title={client.company}
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 xl:grid-cols-3">
          <HealthScoreCard riskLevel={client.riskLevel} score={client.healthScore} status={client.healthStatus} subtitle="Customer-level relationship, commercial, and engagement score." title="Customer Health" />
          <HealthScoreCard riskLevel={projects[0]?.jiraRisk ?? client.riskLevel} score={projectAverage} status={getHealthStatus(projectAverage)} subtitle="Average project score across active delivery work." title="Project Health" />
          <HealthScoreCard riskLevel={client.riskLevel} score={rollupScore} status={rollupStatus} subtitle="Roll-up: 60% customer health + 40% project average." title="Account Roll-up" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <ScoreTrendChart data={history} title="Customer Health History" />
          <CustomerGovernanceCard alertActionCount={actions.length} escalationCount={escalations.length} inputSignalCount={signals.length} />
        </div>
        {projects.length > 0 ? <ProjectTable projects={projects} /> : <EmptyState title="No projects" message="This customer does not have active delivery projects." />}
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {signals.map((signal) => (
              <SignalCard
                key={signal.id}
                onOpenEvidence={setEvidenceSignal}
                onReview={setReviewSignal}
                review={reviews.find((review) => review.signalId === signal.id)}
                signal={signal}
              />
            ))}
          </div>
          <div className="space-y-6">
            <RecommendationPanel recommendations={recommendations} />
            <CustomerAlertsMeetingsCard alerts={alerts} meetings={meetings} />
          </div>
        </div>
      </div>
      <EvidenceDrawer isOpen={Boolean(evidenceSignal)} onClose={() => setEvidenceSignal(undefined)} role={activeRole} signal={evidenceSignal} />
      <ReviewDecisionModal
        isOpen={Boolean(reviewSignal)}
        isSaving={reviewMutation.isPending}
        onClose={() => setReviewSignal(undefined)}
        onSubmit={handleReviewSubmit}
        signal={reviewSignal}
      />
    </>
  )
}

export default CustomerDetailPage
