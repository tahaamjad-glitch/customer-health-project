import type { CustomerOnboardingPayload } from '@/types'

export const DEFAULT_CLIENT_DRAFT: CustomerOnboardingPayload['client'] = {
  name: '',
  company: '',
  email: '',
  industry: '',
  contractValue: 250000,
  renewalDate: '2026-12-31',
  healthScore: 72,
  healthStatus: 'green',
  churnRisk: 20,
  riskLevel: 'low',
  csm: '',
  lastActivity: '2026-05-22',
  engagementScore: 70,
  sentimentTrend: 'neutral',
  tags: ['New'],
  tier: 'tier_2',
}

export const DEFAULT_PROJECT_DRAFT: CustomerOnboardingPayload['project'] = {
  name: '',
  stage: 'discovery',
  projectManager: '',
  director: '',
  healthScore: 72,
  healthStatus: 'green',
  jiraRisk: 'low',
  deliveryRisk: 20,
  milestoneConfidence: 75,
  activeSignals: 0,
  openActions: 0,
  nextMilestone: '',
  dueDate: '2026-06-30',
}
