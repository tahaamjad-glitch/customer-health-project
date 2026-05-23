import { CheckCircle2, Circle, PlugZap } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { DATA_SOURCE_LABELS } from '@/constants'
import { cn } from '@/lib/utils'
import type { SourceConnector } from '@/types'

interface ConnectorChecklistProps {
  connectors: SourceConnector[]
  selectedConnectorIds: string[]
  onToggle: (connectorId: string) => void
}

const statusTone: Record<SourceConnector['status'], 'green' | 'amber' | 'gray'> = {
  connected: 'green',
  needs_auth: 'amber',
  paused: 'gray',
}

const ConnectorChecklist = ({ connectors, selectedConnectorIds, onToggle }: ConnectorChecklistProps): JSX.Element => (
  <div className="grid gap-3 md:grid-cols-2">
    {connectors.map((connector) => {
      const isSelected = selectedConnectorIds.includes(connector.id)
      const Icon = isSelected ? CheckCircle2 : Circle

      return (
        <label
          className={cn(
            'flex cursor-pointer gap-3 rounded-lg border p-3 text-sm transition',
            isSelected ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50',
          )}
          key={connector.id}
        >
          <input
            checked={isSelected}
            className="sr-only"
            onChange={() => onToggle(connector.id)}
            type="checkbox"
          />
          <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', isSelected ? 'text-blue-700' : 'text-gray-400')} aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-950">{connector.name}</span>
              <Badge tone={statusTone[connector.status]}>{connector.status.replace('_', ' ')}</Badge>
              <Badge tone={connector.scope === 'company_wide' ? 'blue' : 'amber'}>
                {connector.scope === 'company_wide' ? 'Company-wide' : 'Client-specific'}
              </Badge>
              <Badge tone={connector.phase === 'phase_1' ? 'green' : 'gray'}>
                {connector.phase === 'phase_1' ? 'Phase 1' : 'Phase 2'}
              </Badge>
            </span>
            <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
              {DATA_SOURCE_LABELS[connector.source]} · {connector.syncCadence}
            </span>
            <span className="mt-2 block text-xs text-gray-600">{connector.description}</span>
          </span>
        </label>
      )
    })}
  </div>
)

export { ConnectorChecklist }
