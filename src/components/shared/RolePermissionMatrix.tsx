import { Check, Minus } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { RolePermission } from '@/types'

const PermissionIcon = ({ isAllowed }: { isAllowed: boolean }): JSX.Element =>
  isAllowed ? (
    <Check className="h-4 w-4 text-green-700" aria-hidden="true" />
  ) : (
    <Minus className="h-4 w-4 text-gray-400" aria-hidden="true" />
  )

const RolePermissionMatrix = ({ permissions }: { permissions: RolePermission[] }): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>Role & Permission Matrix</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Summary</th>
              <th className="px-5 py-3">Raw Evidence</th>
              <th className="px-5 py-3">Commercial Notes</th>
              <th className="px-5 py-3">Override</th>
              <th className="px-5 py-3">Escalation Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {permissions.map((permission) => (
              <tr key={permission.role}>
                <td className="px-5 py-4 font-medium text-gray-950">{permission.role}</td>
                <td className="px-5 py-4">
                  <PermissionIcon isAllowed={permission.canViewSummary} />
                </td>
                <td className="px-5 py-4">
                  <PermissionIcon isAllowed={permission.canViewRawEvidence} />
                </td>
                <td className="px-5 py-4">
                  <PermissionIcon isAllowed={permission.canViewCommercialNotes} />
                </td>
                <td className="px-5 py-4">
                  <PermissionIcon isAllowed={permission.canOverrideSignals} />
                </td>
                <td className="px-5 py-4 text-gray-600">{permission.escalationScope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
)

export { RolePermissionMatrix }
