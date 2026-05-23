import { GitPullRequest, Mail, MessageSquare, MonitorUp, PlugZap, ReceiptText, Video } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DATA_SOURCE_LABELS } from '@/constants'
import type { SourceConnector } from '@/types'

interface ConnectorManagementPanelProps {
  connectors: SourceConnector[]
  isSaving: boolean
  onToggleStatus: (connector: SourceConnector) => void
}

const sourceIcon = {
  email: Mail,
  slack: MessageSquare,
  zoom: Video,
  google_meet: Video,
  teams: Video,
  jira: MonitorUp,
  jira_pulse: MonitorUp,
  bitbucket: GitPullRequest,
  invoice: ReceiptText,
  manual: MessageSquare,
}

const statusTone: Record<SourceConnector['status'], 'green' | 'amber' | 'gray'> = {
  connected: 'green',
  needs_auth: 'amber',
  paused: 'gray',
}

const ConnectorManagementPanel = ({ connectors, isSaving, onToggleStatus }: ConnectorManagementPanelProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>Source Connectors</CardTitle>
    </CardHeader>
    <CardContent className="grid gap-4 xl:grid-cols-2">
      {connectors.map((connector) => {
        const Icon = sourceIcon[connector.source]
        const actionLabel = connector.status === 'connected' ? 'Pause' : 'Connect'

        return (
          <div className="rounded-lg border border-gray-200 p-4" key={connector.id}>
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-950">{connector.name}</p>
                    <Badge tone={statusTone[connector.status]}>{connector.status.replace('_', ' ')}</Badge>
                    <Badge tone={connector.scope === 'company_wide' ? 'blue' : 'amber'}>
                      {connector.scope === 'company_wide' ? 'Company-wide' : 'Client-specific'}
                    </Badge>
                    <Badge tone={connector.phase === 'phase_1' ? 'green' : 'gray'}>
                      {connector.phase === 'phase_1' ? 'Phase 1' : 'Phase 2'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {DATA_SOURCE_LABELS[connector.source]} · Owner {connector.ownerRole} · {connector.syncCadence}
                  </p>
                </div>
              </div>
              <Button disabled={isSaving} onClick={() => onToggleStatus(connector)} size="sm" variant="secondary">
                <PlugZap className="h-4 w-4" aria-hidden="true" />
                {actionLabel}
              </Button>
            </div>
            <p className="mt-3 text-sm text-gray-600">{connector.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {connector.signalTypes.map((signalType) => (
                <Badge key={signalType} tone="blue">
                  {signalType}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Last sync {new Date(connector.lastSync).toLocaleString()} · Scopes: {connector.requiredScopes.join(', ')}
            </p>
          </div>
        )
      })}
    </CardContent>
  </Card>
)

export { ConnectorManagementPanel }
