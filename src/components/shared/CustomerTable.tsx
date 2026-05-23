import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { RagBadge, RiskBadge } from '@/components/shared/StatusBadges'
import { CLIENT_TIER_LABELS } from '@/constants'
import { formatCurrency } from '@/lib/utils'
import type { Client, CustomerProjectSummary } from '@/types'

interface CustomerTableProps {
  clients: Client[]
  projectSummaries: Record<string, CustomerProjectSummary>
  alertCounts: Record<string, number>
  signalCounts: Record<string, number>
  escalationCounts: Record<string, number>
}

const CustomerTable = ({ clients, projectSummaries, alertCounts, signalCounts, escalationCounts }: CustomerTableProps): JSX.Element => (
  <Card className="overflow-hidden border-blue-100 bg-blue-50/35">
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-blue-100/80 text-sm">
          <thead className="bg-blue-950 text-left text-xs font-semibold uppercase tracking-wide text-blue-100">
            <tr>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3">Health</th>
              <th className="px-5 py-3">Risk</th>
              <th className="px-5 py-3">Inputs</th>
              <th className="px-5 py-3">Alerts</th>
              <th className="px-5 py-3">Escalations</th>
              <th className="px-5 py-3">Projects</th>
              <th className="px-5 py-3">CSM</th>
              <th className="px-5 py-3">Renewal</th>
              <th className="px-5 py-3">Contract</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/70 bg-white/75">
            {clients.map((client) => {
              const summary = projectSummaries[client.id]
              const projectCount = summary?.projectCount ?? 0

              return (
                <tr className="transition hover:bg-blue-50/80" key={client.id}>
                  <td className="px-5 py-4">
                    <Link className="font-medium text-gray-950 hover:text-blue-700" to={`/customers/${client.id}`}>
                      {client.company}
                    </Link>
                    <p className="text-xs text-gray-500">{client.name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={client.tier === 'tier_1' ? 'red' : client.tier === 'tier_2' ? 'blue' : 'gray'}>
                      {CLIENT_TIER_LABELS[client.tier]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-950">{client.healthScore}</span>
                      <RagBadge status={client.healthStatus} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <RiskBadge level={client.riskLevel} />
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone="blue">{signalCounts[client.id] ?? 0}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={(alertCounts[client.id] ?? 0) > 0 ? 'red' : 'gray'}>{alertCounts[client.id] ?? 0}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={(escalationCounts[client.id] ?? 0) > 0 ? 'amber' : 'gray'}>{escalationCounts[client.id] ?? 0}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-950">{projectCount}</span>
                        <Badge tone={projectCount > 1 ? 'blue' : 'gray'}>{projectCount === 1 ? 'project' : 'projects'}</Badge>
                      </div>
                      {summary?.projectHealthStatus ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Avg {summary.averageProjectHealth}</span>
                          <RagBadge status={summary.projectHealthStatus} />
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No active projects</p>
                      )}
                      {summary?.projects.length ? (
                        <div className="mt-1 flex flex-col gap-1">
                          {summary.projects.map((project) => (
                            <Link
                              className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
                              key={project.id}
                              to={`/projects/${project.id}`}
                            >
                              <span className="block truncate">Show Projects: {project.name}</span>
                              <span className="block truncate font-normal text-blue-600">Owner: {project.owner}</span>
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{client.csm}</td>
                  <td className="px-5 py-4 text-gray-600">{client.renewalDate}</td>
                  <td className="px-5 py-4 text-gray-600">{formatCurrency(client.contractValue)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
)

export { CustomerTable }
