import { BellOff, CheckCheck, GitBranch, MessageSquareText, ShieldAlert, ThumbsDown, ThumbsUp, UserPlus } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AlertSeverityChip } from '@/components/shared/StatusBadges'
import { ALERT_ROUTING } from '@/constants'
import type { Alert, AlertConnectionPerson, UserRole } from '@/types'

interface AlertWorkflowCardProps {
  alert: Alert
  connectedPerson?: AlertConnectionPerson
  isSaving: boolean
  onConnect: (alert: Alert) => void
  onUpdate: (id: string, data: Partial<Alert>) => void
}

const statusTone: Record<Alert['status'], 'gray' | 'green' | 'amber' | 'red' | 'blue'> = {
  open: 'red',
  acknowledged: 'amber',
  routed: 'blue',
  escalated: 'red',
  resolved: 'green',
}

const AlertWorkflowCard = ({ alert, connectedPerson, isSaving, onConnect, onUpdate }: AlertWorkflowCardProps): JSX.Element => {
  const handleRoute = (role: UserRole): void => {
    onUpdate(alert.id, { status: 'routed', routedToRole: role, isRead: true })
  }

  return (
    <Card className="overflow-hidden border-red-100 bg-red-50/25" key={alert.id}>
      <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600" />
      <CardContent className="space-y-4">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <AlertSeverityChip level={alert.severity} />
              <Badge tone={statusTone[alert.status]}>{alert.status}</Badge>
              <Badge tone="gray">{alert.type.replace('_', ' ')}</Badge>
              {connectedPerson ? <Badge tone="blue">Connected: {connectedPerson.name}</Badge> : <Badge tone="gray">No person connected</Badge>}
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-950">{alert.clientName}</p>
            <p className="mt-1 text-sm text-gray-700">{alert.message}</p>
            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-blue-700" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">AI summary</p>
              </div>
              <p className="mt-2 text-sm text-blue-900">{alert.aiSummary}</p>
            </div>
            <p className="mt-3 text-xs text-gray-500">Routing rule: {ALERT_ROUTING[alert.severity]}</p>
            {alert.routedToRole ? <p className="mt-1 text-xs text-gray-500">Current route: {alert.routedToRole}</p> : null}
            {connectedPerson ? <p className="mt-1 text-xs text-gray-500">Relevant person: {connectedPerson.role} · {connectedPerson.email}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2 xl:max-w-sm xl:justify-end">
            <Button disabled={isSaving} onClick={() => onConnect(alert)} variant="primary">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Connect
            </Button>
            <Button disabled={isSaving} onClick={() => onUpdate(alert.id, { status: 'acknowledged', isRead: true })} variant="secondary">
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Acknowledge
            </Button>
            <Button disabled={isSaving} onClick={() => handleRoute('PMO')} variant="secondary">
              <GitBranch className="h-4 w-4" aria-hidden="true" />
              Route PMO
            </Button>
            <Button disabled={isSaving} onClick={() => handleRoute('Project Director')} variant="secondary">
              <GitBranch className="h-4 w-4" aria-hidden="true" />
              Route PD
            </Button>
            <Button disabled={isSaving} onClick={() => onUpdate(alert.id, { status: 'escalated', routedToRole: 'Leadership', isRead: true })} variant="secondary">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              Escalate
            </Button>
            <Button
              disabled={isSaving}
              onClick={() => onUpdate(alert.id, {
                status: 'resolved',
                isDismissed: true,
                isRead: true,
                resolutionImpact: 'Resolved alerts leave the active queue. Client health improves only after the underlying source signals recover or feedback marks the alert as a false positive.',
              })}
              variant="secondary"
            >
              <BellOff className="h-4 w-4" aria-hidden="true" />
              Resolve
            </Button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Action items inside alert</p>
            <div className="mt-2 space-y-2">
              {alert.actionItems.length > 0 ? (
                alert.actionItems.map((item) => (
                  <div className="rounded-md bg-white/75 p-2 text-sm" key={item.id}>
                    <p className="font-medium text-gray-950">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.ownerRole} · {item.owner} · Due {item.dueDate} · {item.status}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-amber-800">No action item needed for this low-severity alert.</p>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Alert feedback and score impact</p>
            <p className="mt-2 text-sm text-emerald-900">{alert.resolutionImpact}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button disabled={isSaving} onClick={() => onUpdate(alert.id, { feedback: 'useful' })} size="sm" variant="secondary">
                <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                Useful
              </Button>
              <Button
                disabled={isSaving}
                onClick={() => onUpdate(alert.id, {
                  feedback: 'false_positive',
                  status: 'resolved',
                  isDismissed: true,
                  isRead: true,
                  resolutionImpact: 'False-positive feedback is captured for scoring calibration and can reduce the future weight of similar signals.',
                })}
                size="sm"
                variant="secondary"
              >
                <ThumbsDown className="h-4 w-4" aria-hidden="true" />
                False positive
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { AlertWorkflowCard }
