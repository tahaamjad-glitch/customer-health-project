import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { RecommendationPanel } from '@/components/shared/RecommendationPanel'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { recommendationsApi } from '@/lib/api/recommendations.api'

const RecommendationsPage = (): JSX.Element => {
  const queryClient = useQueryClient()
  const { data: recommendations = [], isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: recommendationsApi.getAll,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approved' | 'rejected' }) =>
      recommendationsApi.update(id, { decision }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      toast.success('Recommendation decision saved')
    },
    onError: () => toast.error('Unable to save recommendation decision'),
  })

  if (isLoading) return <div className="p-6"><SkeletonList /></div>
  if (error) return <div className="p-6"><ErrorMessage message="Unable to load recommendations." /></div>

  return (
    <>
      <PageHeader
        description="Root cause explanations, confidence, approval gates, and recommended recovery actions."
        title="Recommendations"
      />
      <div className="p-6">
        {recommendations.length > 0 ? (
          <RecommendationPanel
            isSaving={updateMutation.isPending}
            onDecision={(id, decision) => updateMutation.mutate({ id, decision })}
            recommendations={recommendations}
          />
        ) : (
          <EmptyState title="No recommendations" message="The recommendation agent will populate this queue after scored signals are reviewed." />
        )}
      </div>
    </>
  )
}

export default RecommendationsPage
