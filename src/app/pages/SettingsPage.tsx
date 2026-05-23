import { PlugZap, ShieldCheck } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { ConnectorManagementPanel } from '@/components/shared/ConnectorManagementPanel'
import { InviteUsersPanel } from '@/components/shared/InviteUsersPanel'
import { NotificationPreferencesPanel } from '@/components/shared/NotificationPreferencesPanel'
import { RolePermissionMatrix } from '@/components/shared/RolePermissionMatrix'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { DATA_SOURCE_LABELS } from '@/constants'
import { configApi } from '@/lib/api/config.api'
import type { NotificationPreference, SourceConnector, UserInvite } from '@/types'

const SettingsPage = (): JSX.Element => {
  const queryClient = useQueryClient()
  const rulesQuery = useQuery({ queryKey: ['score-rules'], queryFn: configApi.getScoreRules })
  const permissionsQuery = useQuery({ queryKey: ['role-permissions'], queryFn: configApi.getRolePermissions })
  const auditQuery = useQuery({ queryKey: ['audit-logs'], queryFn: configApi.getAuditLogs })
  const agentsQuery = useQuery({ queryKey: ['agent-modules'], queryFn: configApi.getAgentModules })
  const connectorsQuery = useQuery({ queryKey: ['source-connectors'], queryFn: configApi.getConnectors })
  const invitesQuery = useQuery({ queryKey: ['user-invites'], queryFn: configApi.getUserInvites })
  const notificationsQuery = useQuery({ queryKey: ['notification-preferences'], queryFn: configApi.getNotificationPreferences })

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) => configApi.updateScoreRule(id, { isEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['score-rules'] })
      toast.success('Scoring rule updated')
    },
    onError: () => toast.error('Unable to update scoring rule'),
  })

  const updateConnectorMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SourceConnector['status'] }) => {
      const data = status === 'connected' ? { status, lastSync: new Date().toISOString() } : { status }
      return configApi.updateConnector(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['source-connectors'] })
      toast.success('Connector updated')
    },
    onError: () => toast.error('Unable to update connector'),
  })

  const createInviteMutation = useMutation({
    mutationFn: (data: Omit<UserInvite, 'id' | 'status'>) => configApi.createUserInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invites'] })
      toast.success('Invite sent')
    },
    onError: () => toast.error('Unable to send invite'),
  })

  const updateNotificationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NotificationPreference> }) =>
      configApi.updateNotificationPreference(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('Notification preference updated')
    },
    onError: () => toast.error('Unable to update notification preference'),
  })

  if (
    rulesQuery.isLoading ||
    permissionsQuery.isLoading ||
    auditQuery.isLoading ||
    agentsQuery.isLoading ||
    connectorsQuery.isLoading ||
    invitesQuery.isLoading ||
    notificationsQuery.isLoading
  ) {
    return <div className="p-6"><SkeletonList /></div>
  }
  if (
    rulesQuery.error ||
    permissionsQuery.error ||
    auditQuery.error ||
    agentsQuery.error ||
    connectorsQuery.error ||
    invitesQuery.error ||
    notificationsQuery.error
  ) {
    return <div className="p-6"><ErrorMessage message="Unable to load settings." /></div>
  }

  const rules = rulesQuery.data ?? []
  const permissions = permissionsQuery.data ?? []
  const auditLogs = auditQuery.data ?? []
  const agents = agentsQuery.data ?? []
  const connectors = connectorsQuery.data ?? []
  const invites = invitesQuery.data ?? []
  const notificationPreferences = notificationsQuery.data ?? []

  const handleToggleConnector = (connector: SourceConnector): void => {
    updateConnectorMutation.mutate({
      id: connector.id,
      status: connector.status === 'connected' ? 'paused' : 'connected',
    })
  }

  return (
    <>
      <PageHeader
        description="Scoring thresholds, source weights, integrations, user invitations, notification preferences, permissions, and audit history."
        title="Settings"
      />
      <div className="space-y-6 p-6">
        <ConnectorManagementPanel
          connectors={connectors}
          isSaving={updateConnectorMutation.isPending}
          onToggleStatus={handleToggleConnector}
        />
        <InviteUsersPanel
          invites={invites}
          isSaving={createInviteMutation.isPending}
          onInvite={(invite) => createInviteMutation.mutate(invite)}
        />
        <NotificationPreferencesPanel
          isSaving={updateNotificationMutation.isPending}
          onUpdate={(id, data) => updateNotificationMutation.mutate({ id, data })}
          preferences={notificationPreferences}
        />
        <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
          <Card>
            <CardHeader>
              <CardTitle>Health Score Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rules.map((rule) => (
                <div className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-4 lg:flex-row lg:items-center" key={rule.id}>
                  <div>
                    <p className="text-sm font-semibold text-gray-950">{rule.name}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Source {DATA_SOURCE_LABELS[rule.source]} · Weight {rule.weight}% · Threshold {rule.threshold}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      checked={rule.isEnabled}
                      className="h-4 w-4 rounded border-gray-300 text-gray-950 focus:ring-gray-500"
                      disabled={updateRuleMutation.isPending}
                      onChange={(event) => updateRuleMutation.mutate({ id: rule.id, isEnabled: event.target.checked })}
                      type="checkbox"
                    />
                    Enabled
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI Modules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agents.map((agent) => (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3" key={agent.id}>
                  <div className="flex items-center gap-3">
                    <PlugZap className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-gray-950">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.processedSignals} signals</p>
                    </div>
                  </div>
                  <Badge tone={agent.status === 'online' ? 'green' : 'amber'}>{agent.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <RolePermissionMatrix permissions={permissions} />
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditLogs.map((log) => (
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3" key={log.id}>
                <ShieldCheck className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-gray-950">{log.actor} · {log.action}</p>
                  <p className="text-xs text-gray-500">{log.target} · {log.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default SettingsPage
