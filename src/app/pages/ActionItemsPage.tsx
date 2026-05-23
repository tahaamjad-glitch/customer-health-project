import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { ActionItemOptionsPanel } from '@/components/shared/ActionItemOptionsPanel'
import { AlertActionItemsPanel } from '@/components/shared/AlertActionItemsPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { actionItemsApi } from '@/lib/api/actionItems.api'
import { alertsApi } from '@/lib/api/alerts.api'
import { createActionFromAlert } from '@/lib/actionItems'
import { useUiStore } from '@/store/uiStore'
import type { Alert } from '@/types'

const ActionItemsPage = (): JSX.Element => {
  const queryClient = useQueryClient()
  const activeRole = useUiStore((state) => state.activeRole)
  const alertsQuery = useQuery({ queryKey: ['alerts'], queryFn: alertsApi.getAll })
  const actionItemsQuery = useQuery({ queryKey: ['action-items'], queryFn: actionItemsApi.getAll })

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, isRead, isDismissed }: { id: string; isRead?: boolean; isDismissed?: boolean }) =>
      alertsApi.update(id, { isRead, isDismissed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert updated')
    },
    onError: () => toast.error('Unable to update alert'),
  })

  const createActionMutation = useMutation({
    mutationFn: actionItemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-items'] })
      toast.success('Action item created from alert')
    },
    onError: () => toast.error('Unable to create action item'),
  })

  const updateActionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'done' }) => actionItemsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-items'] })
      toast.success('Action item completed')
    },
    onError: () => toast.error('Unable to update action item'),
  })

  if (alertsQuery.isLoading || actionItemsQuery.isLoading) return <div className="p-6"><SkeletonList /></div>
  if (alertsQuery.error || actionItemsQuery.error) return <div className="p-6"><ErrorMessage message="Unable to load action items." /></div>

  const alerts = alertsQuery.data ?? []
  const actionItems = actionItemsQuery.data ?? []
  const activeAlerts = alerts.filter((alert) => !alert.isDismissed)
  const openActionItems = actionItems.filter((item) => item.status !== 'done')
  const mergedActionCount = activeAlerts.reduce(
    (count, alert) => count + openActionItems.filter((item) => item.clientId === alert.clientId).length,
    0,
  )
  const isSaving = updateAlertMutation.isPending || createActionMutation.isPending || updateActionMutation.isPending

  const handleCreateAction = (alert: Alert): void => {
    createActionMutation.mutate(createActionFromAlert(alert, activeRole))
  }

  return (
    <>
      <PageHeader
        description="Action items are merged inside their related alerts, with all available action item options listed."
        title="Alert Action Items"
      />
      <div className="grid gap-6 p-6 xl:grid-cols-[1fr_0.45fr]">
        <div className="space-y-4">
          {activeAlerts.length > 0 ? (
            activeAlerts.map((alert) => (
              <AlertActionItemsPanel
                actionItems={openActionItems.filter((item) => item.clientId === alert.clientId)}
                alert={alert}
                isSaving={isSaving}
                key={alert.id}
                onCreateAction={handleCreateAction}
                onDismissAlert={(id) => updateAlertMutation.mutate({ id, isDismissed: true })}
                onMarkActionDone={(id) => updateActionMutation.mutate({ id, status: 'done' })}
                onMarkAlertRead={(id) => updateAlertMutation.mutate({ id, isRead: true })}
              />
            ))
          ) : (
            <EmptyState title="No active alerts" message="Action items are displayed inside active alert cards when alerts exist." />
          )}
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Merged Action Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs uppercase tracking-wide text-red-700">Active alerts</p>
                <p className="mt-1 text-xl font-semibold text-red-700">{activeAlerts.length}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-xs uppercase tracking-wide text-amber-700">Open action items</p>
                <p className="mt-1 text-xl font-semibold text-amber-700">{openActionItems.length}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs uppercase tracking-wide text-blue-700">Merged into alerts</p>
                <p className="mt-1 text-xl font-semibold text-blue-700">{mergedActionCount}</p>
              </div>
            </CardContent>
          </Card>
          <ActionItemOptionsPanel />
        </div>
      </div>
    </>
  )
}

export default ActionItemsPage
