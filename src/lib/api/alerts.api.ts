import { MOCK_ALERT_CONNECTION_PEOPLE, MOCK_ALERTS } from '@/data/mock'
import type { Alert, AlertConnectionPerson } from '@/types'
import { delay } from '@/lib/api/delay'

let alerts = [...MOCK_ALERTS]

export const alertsApi = {
  getAll: async (): Promise<Alert[]> => {
    await delay()
    return alerts
  },

  getConnectionPeople: async (): Promise<AlertConnectionPerson[]> => {
    await delay()
    return MOCK_ALERT_CONNECTION_PEOPLE
  },

  getByClientId: async (clientId: string): Promise<Alert[]> => {
    await delay()
    return alerts.filter((alert) => alert.clientId === clientId)
  },

  create: async (data: Omit<Alert, 'id'>): Promise<Alert> => {
    await delay()
    const newAlert = { ...data, id: crypto.randomUUID() }
    alerts = [newAlert, ...alerts]
    return newAlert
  },

  update: async (id: string, data: Partial<Alert>): Promise<Alert> => {
    await delay()
    alerts = alerts.map((alert) => (alert.id === id ? { ...alert, ...data } : alert))
    const updatedAlert = alerts.find((alert) => alert.id === id)
    if (!updatedAlert) throw new Error('Alert not found')
    return updatedAlert
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    alerts = alerts.filter((alert) => alert.id !== id)
  },
}
