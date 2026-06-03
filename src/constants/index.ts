import type {
  ActionStatus,
  ClientTier,
  DataSource,
  HealthStatus,
  NotificationDigestFrequency,
  ProjectStage,
  RiskLevel,
  SentimentLabel,
  SignalConcernType,
  SignalLifecycleStatus,
  UserRole,
} from '@/types'

export const APP_NAME = 'Customer Health Projection Agent'
export const APP_POSITIONING = 'Customer Trust Early Warning System'

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  green: 'Green',
  amber: 'Amber',
  red: 'Red',
}

export const CLIENT_TIER_LABELS: Record<ClientTier, string> = {
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
}

export const CLIENT_TIER_OPTIONS: ClientTier[] = ['tier_1', 'tier_2', 'tier_3']

export const RISK_LABELS: Record<RiskLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const RISK_LEVEL_OPTIONS: RiskLevel[] = ['critical', 'high', 'medium', 'low']

export const HEALTH_STATUS_OPTIONS: HealthStatus[] = ['green', 'amber', 'red']

export const SENTIMENT_OPTIONS: SentimentLabel[] = ['positive', 'neutral', 'mixed', 'negative']

export const PROJECT_STAGE_OPTIONS: ProjectStage[] = ['discovery', 'delivery', 'hypercare', 'managed_service']

export const PROJECT_STAGE_LABELS: Record<ProjectStage, string> = {
  discovery: 'Discovery',
  delivery: 'Delivery',
  hypercare: 'Hypercare',
  managed_service: 'Managed service',
}

export const ACTION_STATUS_OPTIONS: ActionStatus[] = ['open', 'in_progress', 'blocked', 'done']

export const SIGNAL_LIFECYCLE: SignalLifecycleStatus[] = [
  'new',
  'classified',
  'scored',
  'reviewed',
  'action_created',
  'resolved',
  'dismissed',
]

export const SIGNAL_CONCERN_LABELS: Record<SignalConcernType, string> = {
  billing: 'Billing',
  blocker: 'Blocker',
  delivery: 'Delivery',
  commercial: 'Commercial',
  relationship: 'Relationship',
  scope: 'Scope',
  support: 'Support',
  security: 'Security',
  adoption: 'Adoption',
}

export const SIGNAL_CONCERN_OPTIONS: SignalConcernType[] = [
  'billing',
  'blocker',
  'delivery',
  'commercial',
  'relationship',
  'scope',
  'support',
  'security',
  'adoption',
]

export const ALERT_ROUTING: Record<RiskLevel, string> = {
  low: 'PM only',
  medium: 'PM + Project Director / POD Head',
  high: 'PM + AE + PMO + Leadership',
  critical: 'PM + AE + PMO + Leadership',
}

export const ROLE_OPTIONS: UserRole[] = ['PM', 'Delivery Lead', 'POD Head', 'Project Director', 'AE', 'PMO', 'Leadership', 'Admin']

export const ROLE_PROFILES: Record<UserRole, { description: string; scope: string }> = {
  PM: {
    description: 'Own project signals, reviews, and delivery actions.',
    scope: 'Project execution',
  },
  'Delivery Lead': {
    description: 'Own delivery blockers, technical recovery tasks, and Jira follow-through.',
    scope: 'Delivery execution',
  },
  'POD Head': {
    description: 'Review portfolio risk and assign recovery owners.',
    scope: 'POD portfolio',
  },
  'Project Director': {
    description: 'Coordinate cross-project delivery risk and escalations.',
    scope: 'Delivery governance',
  },
  AE: {
    description: 'Monitor relationship health, renewal risk, and recovery plans.',
    scope: 'Account relationship',
  },
  PMO: {
    description: 'Govern thresholds, escalations, and recovery operating rhythm.',
    scope: 'Risk governance',
  },
  Leadership: {
    description: 'Track executive risk posture and tier-one recovery movement.',
    scope: 'Executive oversight',
  },
  Admin: {
    description: 'Manage users, permissions, connectors, and scoring rules.',
    scope: 'System control',
  },
}

export const DATA_SOURCE_OPTIONS: DataSource[] = [
  'jira_pulse',
  'jira',
  'bitbucket',
  'invoice',
  'email',
  'slack',
  'teams',
  'zoom',
  'google_meet',
  'manual',
]

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  email: 'Email',
  slack: 'Slack',
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  teams: 'Microsoft Teams',
  jira: 'Jira',
  jira_pulse: 'Jira Pulse',
  bitbucket: 'Bitbucket PRs',
  invoice: 'Workspace Invoices',
  manual: 'Manual Entry',
}

export const NOTIFICATION_FREQUENCY_LABELS: Record<NotificationDigestFrequency, string> = {
  in_app_only: 'In-app only',
  daily: 'Daily email',
  twice_daily: 'Twice daily email',
}

export const NOTIFICATION_FREQUENCY_OPTIONS: NotificationDigestFrequency[] = ['in_app_only', 'daily', 'twice_daily']

export const SOURCE_WEIGHT_SUMMARY = [
  { source: 'Communication', weight: 28 },
  { source: 'Jira delivery risk', weight: 24 },
  { source: 'Meeting sentiment', weight: 18 },
  { source: 'CSAT', weight: 12 },
  { source: 'Human overrides', weight: 10 },
  { source: 'Cadence gaps', weight: 8 },
]

export const DASHBOARD_NAV = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Customers', path: '/customers' },
  { label: 'Projects', path: '/projects' },
  { label: 'Signals', path: '/signals' },
  { label: 'Alerts', path: '/alerts' },
  { label: 'Recommendations', path: '/recommendations' },
  { label: 'Escalations', path: '/escalations' },
  { label: 'Reports', path: '/reports' },
  { label: 'Settings', path: '/settings' },
]
