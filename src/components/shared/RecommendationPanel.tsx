import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { RiskBadge } from '@/components/shared/StatusBadges'
import type { Recommendation } from '@/types'

interface RecommendationPanelProps {
  recommendations: Recommendation[]
  isSaving?: boolean
  onDecision?: (id: string, decision: 'approved' | 'rejected') => void
}

const RecommendationPanel = ({ recommendations, isSaving = false, onDecision }: RecommendationPanelProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>AI Recommendations</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {recommendations.map((recommendation) => (
        <article className="rounded-lg border border-gray-200 p-4" key={recommendation.id}>
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-950">{recommendation.title}</h3>
                <RiskBadge level={recommendation.impact} />
                <span className="text-xs text-gray-500">{recommendation.confidence}% confidence</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{recommendation.rootCause}</p>
              <p className="mt-2 text-sm text-gray-800">{recommendation.suggestedAction}</p>
              <p className="mt-2 text-xs text-gray-500">Owner role: {recommendation.ownerRole}</p>
            </div>
            {onDecision ? (
              <div className="flex shrink-0 gap-2">
                <Button
                  disabled={isSaving || recommendation.decision !== 'pending'}
                  onClick={() => onDecision(recommendation.id, 'approved')}
                  size="sm"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Approve
                </Button>
                <Button
                  disabled={isSaving || recommendation.decision !== 'pending'}
                  onClick={() => onDecision(recommendation.id, 'rejected')}
                  size="sm"
                  variant="secondary"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Reject
                </Button>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </CardContent>
  </Card>
)

export { RecommendationPanel }
