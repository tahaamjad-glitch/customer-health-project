import { CheckCircle2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { EscalationCase } from '@/types'

interface EscalationTrendCardProps {
  escalations: EscalationCase[]
}

const EscalationTrendCard = ({ escalations }: EscalationTrendCardProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>Escalation Trend</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {escalations.map((item) => (
        <div className="rounded-lg border border-gray-200 p-4" key={item.id}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <p className="text-sm font-semibold capitalize text-gray-950">{item.status.replace('_', ' ')}</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">{item.triggerCondition}</p>
        </div>
      ))}
    </CardContent>
  </Card>
)

export { EscalationTrendCard }
