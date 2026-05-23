import { MOCK_RECOMMENDATIONS } from '@/data/mock'
import type { Recommendation } from '@/types'
import { delay } from '@/lib/api/delay'

let recommendations = [...MOCK_RECOMMENDATIONS]

export const recommendationsApi = {
  getAll: async (): Promise<Recommendation[]> => {
    await delay()
    return recommendations
  },

  getByClientId: async (clientId: string): Promise<Recommendation[]> => {
    await delay()
    return recommendations.filter((recommendation) => recommendation.clientId === clientId)
  },

  create: async (data: Omit<Recommendation, 'id'>): Promise<Recommendation> => {
    await delay()
    const newRecommendation = { ...data, id: crypto.randomUUID() }
    recommendations = [newRecommendation, ...recommendations]
    return newRecommendation
  },

  update: async (id: string, data: Partial<Recommendation>): Promise<Recommendation> => {
    await delay()
    recommendations = recommendations.map((recommendation) =>
      recommendation.id === id ? { ...recommendation, ...data } : recommendation,
    )
    const updatedRecommendation = recommendations.find((recommendation) => recommendation.id === id)
    if (!updatedRecommendation) throw new Error('Recommendation not found')
    return updatedRecommendation
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    recommendations = recommendations.filter((recommendation) => recommendation.id !== id)
  },
}
