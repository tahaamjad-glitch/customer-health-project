import { Gauge, ListChecks, ShieldAlert } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { CustomerHealthGraph } from '@/components/shared/CustomerHealthGraph'
import { ProjectTable } from '@/components/shared/ProjectTable'
import { MetricCard } from '@/components/ui/MetricCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { clientsApi } from '@/lib/api/clients.api'
import { projectsApi } from '@/lib/api/projects.api'

const ProjectsPage = (): JSX.Element => {
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: projectsApi.getAll })
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: clientsApi.getAll })

  if (projectsQuery.isLoading || clientsQuery.isLoading) return <div className="p-6"><SkeletonList /></div>
  if (projectsQuery.error || clientsQuery.error) return <div className="p-6"><ErrorMessage message="Unable to load projects." /></div>

  const projects = projectsQuery.data ?? []
  const clients = clientsQuery.data ?? []
  const averageProjectHealth = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + project.healthScore, 0) / projects.length)
    : 0
  const criticalProjects = projects.filter((project) => project.jiraRisk === 'critical').length
  const openActions = projects.reduce((sum, project) => sum + project.openActions, 0)

  return (
    <>
      <PageHeader
        description="Project-level health, delivery risk, Jira signals, milestone confidence, and roll-up inputs."
        title="Project Portfolio"
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard helper="Average across active projects" icon={<Gauge className="h-5 w-5" aria-hidden="true" />} label="Project Health" tone="green" value={String(averageProjectHealth)} />
          <MetricCard helper="Jira delivery risk is critical" icon={<ShieldAlert className="h-5 w-5" aria-hidden="true" />} label="Critical Projects" tone="red" value={String(criticalProjects)} />
          <MetricCard helper="Assigned recovery and delivery tasks" icon={<ListChecks className="h-5 w-5" aria-hidden="true" />} label="Open Actions" tone="amber" value={String(openActions)} />
        </div>
        <CustomerHealthGraph clients={clients} />
        {projects.length > 0 ? <ProjectTable projects={projects} /> : <EmptyState title="No projects" message="Create delivery projects to separate project health from account health." />}
      </div>
    </>
  )
}

export default ProjectsPage
