import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { EvidenceDrawer } from '@/components/shared/EvidenceDrawer'
import { SignalInboxFilters } from '@/components/shared/SignalInboxFilters'
import { ReviewDecisionModal } from '@/components/shared/ReviewDecisionModal'
import { SignalCard } from '@/components/shared/SignalCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { clientsApi } from '@/lib/api/clients.api'
import { projectsApi } from '@/lib/api/projects.api'
import { signalsApi } from '@/lib/api/signals.api'
import { useUiStore } from '@/store/uiStore'
import type {
  CommunicationSignal,
  SignalConfidenceFilter,
  SignalFilterState,
  SignalLifecycleStatus,
} from '@/types'

const getConfidenceBand = (confidence: number): SignalConfidenceFilter => {
  if (confidence < 65) return 'low'
  if (confidence < 85) return 'medium'
  return 'high'
}

const SignalsPage = (): JSX.Element => {
  const queryClient = useQueryClient()
  const activeRole = useUiStore((state) => state.activeRole)
  const [filters, setFilters] = useState<SignalFilterState>({
    searchTerm: '',
    clientId: 'all',
    projectId: 'all',
    source: 'all',
    sentiment: 'all',
    concernType: 'all',
    lifecycleStatus: 'all',
    confidence: 'all',
    riskFlags: 'all',
    dateFrom: '',
    dateTo: '',
  })
  const [evidenceSignal, setEvidenceSignal] = useState<CommunicationSignal>()
  const [reviewSignal, setReviewSignal] = useState<CommunicationSignal>()

  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: clientsApi.getAll })
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: projectsApi.getAll })
  const signalsQuery = useQuery({ queryKey: ['signals'], queryFn: signalsApi.getAll })
  const reviewsQuery = useQuery({ queryKey: ['signal-reviews'], queryFn: signalsApi.getReviews })

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

  if (clientsQuery.isLoading || projectsQuery.isLoading || signalsQuery.isLoading || reviewsQuery.isLoading) return <div className="p-6"><SkeletonList /></div>
  if (clientsQuery.error || projectsQuery.error || signalsQuery.error || reviewsQuery.error) return <div className="p-6"><ErrorMessage message="Unable to load signals." /></div>

  const clients = clientsQuery.data ?? []
  const projects = projectsQuery.data ?? []
  const signals = signalsQuery.data ?? []
  const reviews = reviewsQuery.data ?? []
  const clientNameById = Object.fromEntries(clients.map((client) => [client.id, client.company]))
  const projectNameById = Object.fromEntries(projects.map((project) => [project.id, project.name]))
  const normalizedSearchTerm = filters.searchTerm.trim().toLowerCase()
  const filteredSignals = signals.filter((signal) => {
    const review = reviews.find((item) => item.signalId === signal.id)
    const lifecycleStatus = review?.lifecycleStatus ?? 'new'
    const confidence = review?.confidence ?? 70
    const clientName = clientNameById[signal.clientId] ?? ''
    const projectName = signal.projectId ? projectNameById[signal.projectId] ?? '' : ''
    const signalDate = signal.timestamp.slice(0, 10)
    const searchableText = [
      clientName,
      projectName,
      signal.participant,
      signal.summary,
      signal.source,
      signal.sentiment,
      signal.concernType,
      ...signal.riskFlags,
      ...signal.topics,
    ].join(' ').toLowerCase()

    const searchMatch = !normalizedSearchTerm || searchableText.includes(normalizedSearchTerm)
    const clientMatch = filters.clientId === 'all' || signal.clientId === filters.clientId
    const projectMatch = filters.projectId === 'all' || signal.projectId === filters.projectId
    const sourceMatch = filters.source === 'all' || signal.source === filters.source
    const sentimentMatch = filters.sentiment === 'all' || signal.sentiment === filters.sentiment
    const concernMatch = filters.concernType === 'all' || signal.concernType === filters.concernType
    const lifecycleMatch = filters.lifecycleStatus === 'all' || lifecycleStatus === filters.lifecycleStatus
    const confidenceMatch = filters.confidence === 'all' || getConfidenceBand(confidence) === filters.confidence
    const dateFromMatch = !filters.dateFrom || signalDate >= filters.dateFrom
    const dateToMatch = !filters.dateTo || signalDate <= filters.dateTo
    const riskFlagMatch =
      filters.riskFlags === 'all' ||
      (filters.riskFlags === 'has_flags' && signal.riskFlags.length > 0) ||
      (filters.riskFlags === 'no_flags' && signal.riskFlags.length === 0)

    return searchMatch && clientMatch && projectMatch && sourceMatch && sentimentMatch && concernMatch && lifecycleMatch && confidenceMatch && riskFlagMatch && dateFromMatch && dateToMatch
  })
  const lowConfidenceCount = reviews.filter((review) => review.confidence < 65).length
  const flaggedSignalCount = signals.filter((signal) => signal.riskFlags.length > 0).length
  const reviewedSignalCount = reviews.filter((review) => review.lifecycleStatus === 'reviewed' || review.lifecycleStatus === 'action_created').length

  const handleResetFilters = (): void => {
    setFilters({
      searchTerm: '',
      clientId: 'all',
      projectId: 'all',
      source: 'all',
      sentiment: 'all',
      concernType: 'all',
      lifecycleStatus: 'all',
      confidence: 'all',
      riskFlags: 'all',
      dateFrom: '',
      dateTo: '',
    })
  }

  const handleReviewSubmit = (status: SignalLifecycleStatus, dismissalReason?: string): void => {
    if (!reviewSignal) return
    reviewMutation.mutate({ signalId: reviewSignal.id, status, dismissalReason })
  }

  return (
    <>
      <PageHeader
        description="Signal lifecycle from new to resolved, with false-positive feedback and evidence controls."
        title="Signal Inbox"
      />
      <div className="space-y-5 p-6">
        <SignalInboxFilters
          clients={clients}
          projects={projects}
          filters={filters}
          flaggedSignalCount={flaggedSignalCount}
          lowConfidenceCount={lowConfidenceCount}
          onChange={setFilters}
          onReset={handleResetFilters}
          reviewedSignalCount={reviewedSignalCount}
          visibleCount={filteredSignals.length}
        />
        <div className="space-y-4">
          {filteredSignals.length > 0 ? (
            filteredSignals.map((signal) => (
              <SignalCard
                key={signal.id}
                clientName={clientNameById[signal.clientId]}
                projectName={signal.projectId ? projectNameById[signal.projectId] : undefined}
                onOpenEvidence={setEvidenceSignal}
                onReview={setReviewSignal}
                review={reviews.find((review) => review.signalId === signal.id)}
                signal={signal}
              />
            ))
          ) : (
            <EmptyState title="No matching signals" message="Adjust the customer, source, lifecycle, confidence, risk flag, or search filters." />
          )}
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

export default SignalsPage
