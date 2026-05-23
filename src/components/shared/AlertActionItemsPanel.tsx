import { CheckCircle2, ListPlus } from 'lucide-react'

import { AlertSeverityChip, RiskBadge } from '@/components/shared/StatusBadges'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ALERT_ROUTING } from '@/constants'
import type { ActionItem, Alert } from '@/types'

interface AlertActionItemsPanelProps {
  alert: Alert
  actionItems: ActionItem[]
  isSaving: boolean
  onCreateAction: (alert: Alert) => void
  onMarkActionDone: (id: string) => void
  onMarkAlertRead: (id: string) => void
  onDismissAlert: (id: string) => void
}

const AlertActionItemsPanel = ({
  alert,
  actionItems,
  isSaving,
  onCreateAction,
  onMarkActionDone,
  onMarkAlertRead,
  onDismissAlert,
}: AlertActionItemsPanelProps): JSX.Element => {
  const openActions = actionItems.filter((item) => item.status !== 'done')

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <AlertSeverityChip level={alert.severity} />
              <span className="text-xs text-gray-500">{alert.type.replace('_', ' ')}</span>
              <span className="text-xs text-gray-500">{openActions.length} open actions</span>
            </div>
            <p className="mt-3 text-sm font-medium text-gray-950">{alert.clientName}</p>
            <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
            <p className="mt-2 text-xs text-gray-500">Routing: {ALERT_ROUTING[alert.severity]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={isSaving} onClick={() => onCreateAction(alert)} variant="primary">
              <ListPlus className="h-4 w-4" aria-hidden="true" />
              Create action
            </Button>
            <Button disabled={isSaving} onClick={() => onMarkAlertRead(alert.id)} variant="secondary">
              Mark read
            </Button>
            <Button disabled={isSaving} onClick={() => onDismissAlert(alert.id)} variant="ghost">
              Dismiss
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-950">Merged Action Items</p>
            <span className="text-xs text-gray-500">Customer-linked follow-up</span>
          </div>
          <div className="mt-3 space-y-2">
            {openActions.length > 0 ? (
              openActions.map((item) => (
                <div className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 md:flex-row md:items-center" key={item.id}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <RiskBadge level={item.severity} />
                      <span className="text-xs capitalize text-gray-500">{item.status.replace('_', ' ')}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-950">{item.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.owner} · {item.ownerRole} · Due {item.dueDate}
                    </p>
                  </div>
                  <Button disabled={isSaving} onClick={() => onMarkActionDone(item.id)} size="sm" variant="secondary">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Done
                  </Button>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                No open action items are linked to this customer yet.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { AlertActionItemsPanel }
