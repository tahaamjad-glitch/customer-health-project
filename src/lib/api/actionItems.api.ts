import { MOCK_ACTION_ITEMS } from '@/data/mock'
import type { ActionItem } from '@/types'
import { delay } from '@/lib/api/delay'

let actionItems = [...MOCK_ACTION_ITEMS]

export const actionItemsApi = {
  getAll: async (): Promise<ActionItem[]> => {
    await delay()
    return actionItems
  },

  getByClientId: async (clientId: string): Promise<ActionItem[]> => {
    await delay()
    return actionItems.filter((item) => item.clientId === clientId)
  },

  create: async (data: Omit<ActionItem, 'id'>): Promise<ActionItem> => {
    await delay()
    const newActionItem = { ...data, id: crypto.randomUUID() }
    actionItems = [newActionItem, ...actionItems]
    return newActionItem
  },

  update: async (id: string, data: Partial<ActionItem>): Promise<ActionItem> => {
    await delay()
    actionItems = actionItems.map((item) => (item.id === id ? { ...item, ...data } : item))
    const updatedActionItem = actionItems.find((item) => item.id === id)
    if (!updatedActionItem) throw new Error('Action item not found')
    return updatedActionItem
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    actionItems = actionItems.filter((item) => item.id !== id)
  },
}
