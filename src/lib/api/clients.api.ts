import { MOCK_CLIENTS } from '@/data/mock'
import type { Client } from '@/types'
import { delay } from '@/lib/api/delay'

let clients = [...MOCK_CLIENTS]

export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    await delay()
    return clients
  },

  getById: async (id: string): Promise<Client> => {
    await delay()
    const client = clients.find((item) => item.id === id)
    if (!client) throw new Error('Client not found')
    return client
  },

  create: async (data: Omit<Client, 'id'>): Promise<Client> => {
    await delay()
    const newClient = { ...data, id: crypto.randomUUID() }
    clients = [...clients, newClient]
    return newClient
  },

  update: async (id: string, data: Partial<Client>): Promise<Client> => {
    await delay()
    clients = clients.map((client) => (client.id === id ? { ...client, ...data } : client))
    const updatedClient = clients.find((client) => client.id === id)
    if (!updatedClient) throw new Error('Client not found')
    return updatedClient
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    clients = clients.filter((client) => client.id !== id)
  },
}
