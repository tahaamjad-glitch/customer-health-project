import { ArrowUpRight, BellRing, CheckCircle2, Route } from 'lucide-react'
import { Link } from 'react-router-dom'

import { RiskBadge } from '@/components/shared/StatusBadges'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ALERT_ROUTING } from '@/constants'
import type { Alert } from '@/types'

interface CommandCenterAlertActionsProps {
  alerts: Alert[]
  projectNameById: Record<string, string>
}

const CommandCenterAlertActions = ({ alerts, projectNameById }: CommandCenterAlertActionsProps): JSX.Element => {
  const openAlerts = alerts
    .filter((alert) => alert.status !== 'resolved' && !alert.isDismissed)
    .slice(0, 4)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Alert Action Queue</CardTitle>
          <p className="mt-1 text-sm text-gray-500">Action items now live inside alerts with acknowledge, route, resolve, and feedback options.</p>
        </div>
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900" to="/alerts">
          Open alerts
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {openAlerts.map((alert) => (
          <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4" key={alert.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <BellRing className="h-4 w-4 text-red-700" aria-hidden="true" />
                  <p className="font-semibold text-gray-950">{alert.clientName}</p>
                  <RiskBadge level={alert.severity} />
                  <Badge tone="blue">{alert.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-gray-600">{alert.aiSummary}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {alert.projectId ? projectNameById[alert.projectId] : 'Customer-level alert'} · {ALERT_ROUTING[alert.severity]}
                </p>
              </div>
              <Badge tone={alert.routedToRole ? 'amber' : 'gray'}>
                <Route className="h-3 w-3" aria-hidden="true" />
                {alert.routedToRole ?? 'Unrouted'}
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              {alert.actionItems.length > 0 ? (
                alert.actionItems.map((item) => (
                  <div className="flex items-center justify-between rounded-md border border-white bg-white px-3 py-2 shadow-panel" key={item.id}>
                    <div>
                      <p className="text-sm font-medium text-gray-950">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.owner} · Due {item.dueDate}</p>
                    </div>
                    <Badge tone={item.status === 'done' ? 'green' : 'amber'}>{item.status.replace('_', ' ')}</Badge>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  No action item created yet
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { CommandCenterAlertActions }
