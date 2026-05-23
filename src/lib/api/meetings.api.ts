import { MOCK_MEETINGS } from '@/data/mock'
import type { Meeting } from '@/types'
import { delay } from '@/lib/api/delay'

let meetings = [...MOCK_MEETINGS]

export const meetingsApi = {
  getAll: async (): Promise<Meeting[]> => {
    await delay()
    return meetings
  },

  getByClientId: async (clientId: string): Promise<Meeting[]> => {
    await delay()
    return meetings.filter((meeting) => meeting.clientId === clientId)
  },

  create: async (data: Omit<Meeting, 'id'>): Promise<Meeting> => {
    await delay()
    const newMeeting = { ...data, id: crypto.randomUUID() }
    meetings = [newMeeting, ...meetings]
    return newMeeting
  },

  update: async (id: string, data: Partial<Meeting>): Promise<Meeting> => {
    await delay()
    meetings = meetings.map((meeting) => (meeting.id === id ? { ...meeting, ...data } : meeting))
    const updatedMeeting = meetings.find((meeting) => meeting.id === id)
    if (!updatedMeeting) throw new Error('Meeting not found')
    return updatedMeeting
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    meetings = meetings.filter((meeting) => meeting.id !== id)
  },
}
