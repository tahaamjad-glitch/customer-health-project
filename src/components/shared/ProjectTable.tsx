import { Link } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/Card'
import { RagBadge, RiskBadge } from '@/components/shared/StatusBadges'
import type { Project } from '@/types'

const ProjectTable = ({ projects }: { projects: Project[] }): JSX.Element => (
  <Card>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">Project</th>
              <th className="px-5 py-3">Project Health</th>
              <th className="px-5 py-3">Jira Risk</th>
              <th className="px-5 py-3">PM</th>
              <th className="px-5 py-3">Milestone</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {projects.map((project) => (
              <tr className="hover:bg-gray-50" key={project.id}>
                <td className="px-5 py-4">
                  <Link className="font-medium text-gray-950 hover:text-blue-700" to={`/projects/${project.id}`}>
                    {project.name}
                  </Link>
                  <p className="text-xs capitalize text-gray-500">{project.stage.replace('_', ' ')}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-950">{project.healthScore}</span>
                    <RagBadge status={project.healthStatus} />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <RiskBadge level={project.jiraRisk} />
                </td>
                <td className="px-5 py-4 text-gray-600">{project.projectManager}</td>
                <td className="px-5 py-4 text-gray-600">
                  {project.nextMilestone}
                  <p className="text-xs text-gray-400">{project.dueDate}</p>
                </td>
                <td className="px-5 py-4 text-gray-600">{project.openActions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
)

export { ProjectTable }
