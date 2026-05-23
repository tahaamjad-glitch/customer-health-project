import { AlertTriangle, BriefcaseBusiness, Building2, GitBranch, RadioTower } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Select } from '@/components/ui/FormControls'
import type { Client, Project } from '@/types'

interface CommandCenterFiltersProps {
  clients: Client[]
  projects: Project[]
  customerId: string
  projectId: string
  visibleClientCount: number
  visibleProjectCount: number
  openAlertCount: number
  pmoJiraSignalCount: number
  onCustomerChange: (clientId: string) => void
  onProjectChange: (projectId: string) => void
}

const CommandCenterFilters = ({
  clients,
  projects,
  customerId,
  projectId,
  visibleClientCount,
  visibleProjectCount,
  openAlertCount,
  pmoJiraSignalCount,
  onCustomerChange,
  onProjectChange,
}: CommandCenterFiltersProps): JSX.Element => {
  const selectedCustomerProjectCount = customerId === 'all'
    ? projects.length
    : projects.filter((project) => project.clientId === customerId).length

  return (
    <Card className="overflow-hidden border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="h-1 bg-gradient-to-r from-blue-700 via-amber-500 to-emerald-600" />
      <CardContent className="grid gap-4 lg:grid-cols-[1.2fr_1fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Customer
            <Select className="mt-2" onChange={(event) => onCustomerChange(event.target.value)} value={customerId}>
              <option value="all">All customers</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-sm font-medium text-gray-700">
            Project
            <Select className="mt-2" onChange={(event) => onProjectChange(event.target.value)} value={projectId}>
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} · {project.projectManager}
                </option>
              ))}
            </Select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-blue-100 bg-white/80 p-3 shadow-panel">
            <Building2 className="h-4 w-4 text-blue-700" aria-hidden="true" />
            <p className="mt-2 text-xl font-semibold text-gray-950">{visibleClientCount}</p>
            <p className="text-xs text-gray-500">clients in view</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-white/80 p-3 shadow-panel">
            <BriefcaseBusiness className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <p className="mt-2 text-xl font-semibold text-gray-950">{visibleProjectCount}</p>
            <p className="text-xs text-gray-500">projects in view</p>
          </div>
          <div className="rounded-lg border border-red-100 bg-white/80 p-3 shadow-panel">
            <AlertTriangle className="h-4 w-4 text-red-700" aria-hidden="true" />
            <p className="mt-2 text-xl font-semibold text-gray-950">{openAlertCount}</p>
            <p className="text-xs text-gray-500">alert actions</p>
          </div>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50/80 p-4">
          <div className="flex items-center gap-2">
            <RadioTower className="h-4 w-4 text-amber-700" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-950">PMO Jira board</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Company escalation board is treated as an input signal for health risk.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="amber">{pmoJiraSignalCount} Jira inputs</Badge>
            <Badge tone="blue">
              <GitBranch className="h-3 w-3" aria-hidden="true" />
              {selectedCustomerProjectCount} related projects
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { CommandCenterFilters }
