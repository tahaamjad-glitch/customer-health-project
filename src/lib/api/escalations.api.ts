import { MOCK_ESCALATION_CASES } from '@/data/mock'
import type { EscalationCase } from '@/types'
import { delay } from '@/lib/api/delay'

let escalationCases = [...MOCK_ESCALATION_CASES]

export const escalationsApi = {
  getAll: async (): Promise<EscalationCase[]> => {
    await delay()
    return escalationCases
  },

  getByClientId: async (clientId: string): Promise<EscalationCase[]> => {
    await delay()
    return escalationCases.filter((item) => item.clientId === clientId)
  },

  create: async (data: Omit<EscalationCase, 'id'>): Promise<EscalationCase> => {
    await delay()
    const newCase = { ...data, id: crypto.randomUUID() }
    escalationCases = [newCase, ...escalationCases]
    return newCase
  },

  update: async (id: string, data: Partial<EscalationCase>): Promise<EscalationCase> => {
    await delay()
    escalationCases = escalationCases.map((item) => (item.id === id ? { ...item, ...data } : item))
    const updatedCase = escalationCases.find((item) => item.id === id)
    if (!updatedCase) throw new Error('Escalation case not found')
    return updatedCase
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    escalationCases = escalationCases.filter((item) => item.id !== id)
  },
}
