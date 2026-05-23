import { Activity } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import { RagBadge, RiskBadge } from '@/components/shared/StatusBadges'
import { cn } from '@/lib/utils'
import type { HealthStatus, RiskLevel } from '@/types'

interface HealthScoreCardProps {
  title: string
  score: number
  status: HealthStatus
  riskLevel: RiskLevel
  subtitle: string
}

const ringClass: Record<HealthStatus, string> = {
  green: 'text-green-700 bg-green-50 border-green-200',
  amber: 'text-amber-700 bg-amber-50 border-amber-200',
  red: 'text-red-700 bg-red-50 border-red-200',
}

const HealthScoreCard = ({ title, score, status, riskLevel, subtitle }: HealthScoreCardProps): JSX.Element => (
  <Card>
    <CardContent>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </div>
        <Activity className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div className={cn('flex h-20 w-20 items-center justify-center rounded-full border text-2xl font-semibold', ringClass[status])}>
          {score}
        </div>
        <div className="flex flex-col items-end gap-2">
          <RagBadge status={status} />
          <RiskBadge level={riskLevel} />
        </div>
      </div>
    </CardContent>
  </Card>
)

export { HealthScoreCard }
