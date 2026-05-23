import { ListChecks } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ACTION_STATUS_OPTIONS, RISK_LEVEL_OPTIONS, ROLE_OPTIONS } from '@/constants'

const ActionItemOptionsPanel = (): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>Available Action Item Options</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Workflow actions</p>
        <div className="mt-2 space-y-2 text-sm text-gray-700">
          <p>Create action from alert</p>
          <p>Mark action item done</p>
          <p>Keep action customer-linked inside alert card</p>
          <p>Mark alert read or dismiss after follow-up</p>
        </div>
      </section>
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status options</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACTION_STATUS_OPTIONS.map((status) => (
            <Badge key={status} tone="blue">
              {status.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </section>
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Owner role options</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ROLE_OPTIONS.map((role) => (
            <Badge key={role} tone="gray">
              {role}
            </Badge>
          ))}
        </div>
      </section>
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Severity options</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {RISK_LEVEL_OPTIONS.map((risk) => (
            <Badge key={risk} tone={risk === 'low' ? 'green' : risk === 'medium' ? 'amber' : 'red'}>
              {risk}
            </Badge>
          ))}
        </div>
      </section>
      <section className="rounded-lg bg-gray-50 p-3">
        <div className="flex gap-2">
          <ListChecks className="mt-0.5 h-4 w-4 text-gray-500" aria-hidden="true" />
          <p className="text-sm text-gray-700">
            Action items can be account-level or linked to a project, with owner, owner role, due date, status, and severity.
          </p>
        </div>
      </section>
    </CardContent>
  </Card>
)

export { ActionItemOptionsPanel }
