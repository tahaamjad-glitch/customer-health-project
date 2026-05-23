import { MOCK_PROJECTS } from '@/data/mock'
import type { Project } from '@/types'
import { delay } from '@/lib/api/delay'

let projects = [...MOCK_PROJECTS]

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    await delay()
    return projects
  },

  getById: async (id: string): Promise<Project> => {
    await delay()
    const project = projects.find((item) => item.id === id)
    if (!project) throw new Error('Project not found')
    return project
  },

  getByClientId: async (clientId: string): Promise<Project[]> => {
    await delay()
    return projects.filter((project) => project.clientId === clientId)
  },

  create: async (data: Omit<Project, 'id'>): Promise<Project> => {
    await delay()
    const newProject = { ...data, id: crypto.randomUUID() }
    projects = [...projects, newProject]
    return newProject
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    await delay()
    projects = projects.map((project) => (project.id === id ? { ...project, ...data } : project))
    const updatedProject = projects.find((project) => project.id === id)
    if (!updatedProject) throw new Error('Project not found')
    return updatedProject
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    projects = projects.filter((project) => project.id !== id)
  },
}
