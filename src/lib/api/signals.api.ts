import { MOCK_SIGNAL_REVIEWS, MOCK_SIGNALS } from '@/data/mock'
import type { CommunicationSignal, SignalReview } from '@/types'
import { delay } from '@/lib/api/delay'

let signals = [...MOCK_SIGNALS]
let reviews = [...MOCK_SIGNAL_REVIEWS]

export const signalsApi = {
  getAll: async (): Promise<CommunicationSignal[]> => {
    await delay()
    return signals
  },

  getByClientId: async (clientId: string): Promise<CommunicationSignal[]> => {
    await delay()
    return signals.filter((signal) => signal.clientId === clientId)
  },

  getReviews: async (): Promise<SignalReview[]> => {
    await delay()
    return reviews
  },

  updateReview: async (signalId: string, data: Partial<SignalReview>): Promise<SignalReview> => {
    await delay()
    const current = reviews.find((review) => review.signalId === signalId)
    const updated: SignalReview = {
      signalId,
      lifecycleStatus: data.lifecycleStatus ?? current?.lifecycleStatus ?? 'reviewed',
      confidence: data.confidence ?? current?.confidence ?? 75,
      reviewer: data.reviewer ?? current?.reviewer ?? 'Current user',
      reviewedAt: data.reviewedAt ?? new Date().toISOString(),
      dismissalReason: data.dismissalReason ?? current?.dismissalReason,
      humanOverride: data.humanOverride ?? current?.humanOverride,
    }

    reviews = current
      ? reviews.map((review) => (review.signalId === signalId ? updated : review))
      : [...reviews, updated]

    return updated
  },

  create: async (data: Omit<CommunicationSignal, 'id'>): Promise<CommunicationSignal> => {
    await delay()
    const newSignal = { ...data, id: crypto.randomUUID() }
    signals = [newSignal, ...signals]
    return newSignal
  },
}
