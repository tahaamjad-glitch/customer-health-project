import { getHealthStatus } from '@/lib/utils'
import type { Client, CustomerProjectSummary, HealthStatus, Project, ProjectCoverageFilter } from '@/types'

const buildCustomerProjectSummaries = (
  clients: Client[],
  projects: Project[],
): Record<string, CustomerProjectSummary> =>
  clients.reduce<Record<string, CustomerProjectSummary>>((summaries, client) => {
    const clientProjects = projects.filter((project) => project.clientId === client.id)
    const averageProjectHealth = clientProjects.length
      ? Math.round(clientProjects.reduce((sum, project) => sum + project.healthScore, 0) / clientProjects.length)
      : 0

    summaries[client.id] = {
      clientId: client.id,
      projectCount: clientProjects.length,
      averageProjectHealth,
      projectHealthStatus: clientProjects.length ? getHealthStatus(averageProjectHealth) : undefined,
      projectHealthStatuses: clientProjects.map((project) => project.healthStatus),
      projectNames: clientProjects.map((project) => project.name),
      projects: clientProjects.map((project) => ({
        id: project.id,
        name: project.name,
        owner: project.projectManager,
        healthScore: project.healthScore,
        healthStatus: project.healthStatus,
      })),
    }

    return summaries
  }, {})

const matchesProjectCoverage = (summary: CustomerProjectSummary, filter: ProjectCoverageFilter): boolean => {
  if (filter === 'all') return true
  if (filter === 'no_projects') return summary.projectCount === 0
  if (filter === 'single_project') return summary.projectCount === 1
  return summary.projectCount > 1
}

const matchesProjectHealth = (summary: CustomerProjectSummary, filter: HealthStatus | 'all'): boolean =>
  filter === 'all' || summary.projectHealthStatuses.includes(filter)

export { buildCustomerProjectSummaries, matchesProjectCoverage, matchesProjectHealth }
