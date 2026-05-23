import { Layers3 } from 'lucide-react'

import { AlertSeverityChip } from '@/components/shared/StatusBadges'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { Alert, Meeting } from '@/types'

interface CustomerAlertsMeetingsCardProps {
  alerts: Alert[]
  meetings: Meeting[]
}

const CustomerAlertsMeetingsCard = ({ alerts, meetings }: CustomerAlertsMeetingsCardProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>Alerts & Meetings</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {alerts.map((alert) => (
        <div className="rounded-lg border border-gray-200 p-3" key={alert.id}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-gray-950">{alert.message}</p>
              <p className="mt-1 text-xs text-gray-500">{alert.aiSummary}</p>
            </div>
            <AlertSeverityChip level={alert.severity} />
          </div>
        </div>
      ))}
      {meetings.map((meeting) => (
        <div className="rounded-lg bg-gray-50 p-3" key={meeting.id}>
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-950">{meeting.title}</p>
          </div>
          <p className="mt-1 text-sm text-gray-600">{meeting.summary}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {meeting.riskFlags.map((flag) => <Badge key={flag} tone="amber">{flag}</Badge>)}
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)

export { CustomerAlertsMeetingsCard }
