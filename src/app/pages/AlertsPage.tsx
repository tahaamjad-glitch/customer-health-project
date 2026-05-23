import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { AlertWorkflowCard } from '@/components/shared/AlertWorkflowCard'
import { ConnectAlertPersonModal } from '@/components/shared/ConnectAlertPersonModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { ALERT_ROUTING } from '@/constants'
import { alertsApi } from '@/lib/api/alerts.api'
import type { Alert } from '@/types'

const AlertsPage = (): JSX.Element => {
  const queryClient = useQueryClient()
  const [connectingAlert, setConnectingAlert] = useState<Alert>()
  const alertsQuery = useQuery({ queryKey: ['alerts'], queryFn: alertsApi.getAll })
  const peopleQuery = useQuery({ queryKey: ['alert-connection-people'], queryFn: alertsApi.getConnectionPeople })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Alert> }) => alertsApi.update(id, data),
    onSuccess: (alert) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      setConnectingAlert(undefined)
      toast.success(alert.status === 'resolved' ? 'Alert resolved; health score updates after next recalculation' : 'Alert updated')
    },
    onError: () => toast.error('Unable to update alert'),
  })

  if (alertsQuery.isLoading || peopleQuery.isLoading) return <div className="p-6"><SkeletonList /></div>
  if (alertsQuery.error || peopleQuery.error) return <div className="p-6"><ErrorMessage message="Unable to load alerts." /></div>

  const alerts = alertsQuery.data ?? []
  const people = peopleQuery.data ?? []
  const activeAlerts = alerts.filter((alert) => !alert.isDismissed)
  const resolvedAlerts = alerts.filter((alert) => alert.status === 'resolved' || alert.isDismissed).length
  const personById = Object.fromEntries(people.map((person) => [person.id, person]))

  const handleUpdateAlert = (id: string, data: Partial<Alert>): void => {
    updateMutation.mutate({ id, data })
  }

  return (
    <>
      <PageHeader
        description="Acknowledge, route, escalate, resolve, and feed back alerts with action items embedded in each alert."
        title="Alerts"
      />
      <div className="grid gap-6 p-6 xl:grid-cols-[1fr_0.42fr]">
        <div className="space-y-4">
          {activeAlerts.length > 0 ? (
            activeAlerts.map((alert) => (
              <AlertWorkflowCard
                alert={alert}
                connectedPerson={alert.connectedPersonId ? personById[alert.connectedPersonId] : undefined}
                isSaving={updateMutation.isPending}
                key={alert.id}
                onConnect={setConnectingAlert}
                onUpdate={handleUpdateAlert}
              />
            ))
          ) : (
            <EmptyState title="No active alerts" message="Resolved alerts remain in audit history and score feedback." />
          )}
        </div>
        <div className="space-y-6">
          <Card className="border-blue-100 bg-blue-50/50">
            <CardHeader>
              <CardTitle>Alert Operations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                <p className="text-xs uppercase tracking-wide text-red-700">Active alerts</p>
                <p className="mt-1 text-2xl font-semibold text-red-700">{activeAlerts.length}</p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Resolved / dismissed</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-700">{resolvedAlerts}</p>
              </div>
              <p className="text-sm text-gray-600">
                Resolving an alert closes the workflow. Client health does not jump immediately; it improves after the next score recalculation confirms recovery evidence, positive signals, or reduced Jira risk.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Severity Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(ALERT_ROUTING).map(([severity, routing]) => (
                <div className="rounded-lg border border-gray-200 p-3" key={severity}>
                  <p className="text-sm font-medium capitalize text-gray-950">{severity}</p>
                  <p className="mt-1 text-sm text-gray-600">{routing}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <ConnectAlertPersonModal
        alert={connectingAlert}
        isOpen={Boolean(connectingAlert)}
        isSaving={updateMutation.isPending}
        key={connectingAlert?.id ?? 'no-alert'}
        onClose={() => setConnectingAlert(undefined)}
        onConnect={(connectedPersonId) => {
          if (!connectingAlert) return
          handleUpdateAlert(connectingAlert.id, { connectedPersonId })
        }}
        people={people}
      />
    </>
  )
}

export default AlertsPage
