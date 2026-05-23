import { MOCK_SEQUENCES } from '@/data/mock'
import type { Sequence } from '@/types'
import { delay } from '@/lib/api/delay'

let sequences = [...MOCK_SEQUENCES]

export const sequencesApi = {
  getAll: async (): Promise<Sequence[]> => {
    await delay()
    return sequences
  },

  getByClientId: async (clientId: string): Promise<Sequence[]> => {
    await delay()
    return sequences.filter((sequence) => sequence.clientId === clientId)
  },

  create: async (data: Omit<Sequence, 'id'>): Promise<Sequence> => {
    await delay()
    const newSequence = { ...data, id: crypto.randomUUID() }
    sequences = [newSequence, ...sequences]
    return newSequence
  },

  update: async (id: string, data: Partial<Sequence>): Promise<Sequence> => {
    await delay()
    sequences = sequences.map((sequence) => (sequence.id === id ? { ...sequence, ...data } : sequence))
    const updatedSequence = sequences.find((sequence) => sequence.id === id)
    if (!updatedSequence) throw new Error('Sequence not found')
    return updatedSequence
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    sequences = sequences.filter((sequence) => sequence.id !== id)
  },
}
