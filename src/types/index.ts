export type HealthStatus = 'green' | 'amber' | 'red'
export type SentimentLabel = 'positive' | 'neutral' | 'negative' | 'mixed'
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'
export type SequenceStatus = 'active' | 'paused' | 'draft' | 'completed'
export type DataSource =
  | 'email'
  | 'slack'
  | 'zoom'
  | 'google_meet'
  | 'jira'
  | 'jira_pulse'
  | 'teams'
  | 'bitbucket'
  | 'invoice'
  | 'manual'
export type ClientTier = 'tier_1' | 'tier_2' | 'tier_3'
export type SignalConcernType =
  | 'billing'
  | 'blocker'
  | 'delivery'
  | 'commercial'
  | 'relationship'
  | 'scope'
  | 'support'
  | 'security'
  | 'adoption'
export type SignalConfidenceFilter = 'all' | 'low' | 'medium' | 'high'
export type SignalRiskFlagFilter = 'all' | 'has_flags' | 'no_flags'
export type ConnectorStatus = 'connected' | 'needs_auth' | 'paused'
export type ConnectorCategory = 'delivery' | 'communication' | 'meeting' | 'finance' | 'survey' | 'manual'
export type ConnectorScope = 'company_wide' | 'client_specific'
export type ConnectorPhase = 'phase_1' | 'phase_2'
export type CustomerConnectorStatus = 'queued' | 'connected' | 'needs_auth'
export type AlertStatus = 'open' | 'acknowledged' | 'routed' | 'escalated' | 'resolved'
export type AlertFeedback = 'useful' | 'false_positive'
export type NotificationDigestFrequency = 'in_app_only' | 'daily' | 'twice_daily'
export interface SignalFilterState {
  searchTerm: string
  clientId: string
  projectId: string
  source: DataSource | 'all'
  sentiment: SentimentLabel | 'all'
  concernType: SignalConcernType | 'all'
  lifecycleStatus: SignalLifecycleStatus | 'all'
  confidence: SignalConfidenceFilter
  riskFlags: SignalRiskFlagFilter
  dateFrom: string
  dateTo: string
}

export interface Client {
  id: string
  name: string
  company: string
  email: string
  industry: string
  contractValue: number
  renewalDate: string
  healthScore: number
  healthStatus: HealthStatus
  churnRisk: number
  riskLevel: RiskLevel
  csm: string
  lastActivity: string
  engagementScore: number
  sentimentTrend: SentimentLabel
  tags: string[]
  tier: ClientTier
}

export interface CommunicationSignal {
  id: string
  clientId: string
  projectId?: string
  source: DataSource
  sentiment: SentimentLabel
  concernType: SignalConcernType
  score: number
  summary: string
  riskFlags: string[]
  topics: string[]
  timestamp: string
  participant: string
}

export interface Meeting {
  id: string
  clientId: string
  title: string
  source: 'zoom' | 'google_meet' | 'teams'
  duration: number
  attendees: string[]
  summary: string
  actionItems: string[]
  sentiment: SentimentLabel
  sentimentScore: number
  riskFlags: string[]
  date: string
}

export interface Sequence {
  id: string
  name: string
  clientId: string
  clientName: string
  status: SequenceStatus
  steps: number
  completedSteps: number
  lastActivity: string
  nextAction: string
  createdAt: string
}

export interface Alert {
  id: string
  clientId: string
  clientName: string
  projectId?: string
  type: 'churn_risk' | 'sentiment_drop' | 'no_meeting' | 'health_drop' | 'escalation'
  severity: RiskLevel
  message: string
  aiSummary: string
  triggeredAt: string
  isRead: boolean
  isDismissed: boolean
  status: AlertStatus
  routedToRole?: UserRole
  feedback?: AlertFeedback
  resolutionImpact?: string
  actionItems: ActionItem[]
  connectedPersonId?: string
}

export interface AlertConnectionPerson {
  id: string
  name: string
  role: UserRole
  email: string
  team: string
}

export interface SourceConnector {
  id: string
  name: string
  source: DataSource
  category: ConnectorCategory
  scope: ConnectorScope
  phase: ConnectorPhase
  status: ConnectorStatus
  description: string
  ownerRole: UserRole
  syncCadence: string
  lastSync: string
  signalTypes: string[]
  requiredScopes: string[]
}

export interface CustomerConnectorProvision {
  id: string
  clientId: string
  connectorId: string
  status: CustomerConnectorStatus
  requestedAt: string
}

export type ProjectStage = 'discovery' | 'delivery' | 'hypercare' | 'managed_service'
export type SignalLifecycleStatus =
  | 'new'
  | 'classified'
  | 'scored'
  | 'reviewed'
  | 'action_created'
  | 'resolved'
  | 'dismissed'
export type EscalationStatus = 'open' | 'in_review' | 'recovering' | 'closed'
export type ActionStatus = 'open' | 'in_progress' | 'blocked' | 'done'
export type RecommendationDecision = 'pending' | 'approved' | 'rejected'
export type UserRole = 'PM' | 'Delivery Lead' | 'POD Head' | 'Project Director' | 'AE' | 'PMO' | 'Leadership' | 'Admin'

export interface HealthHistoryPoint {
  clientId: string
  week: string
  customerScore: number
  deliveryScore: number
  relationshipScore: number
}

export interface Project {
  id: string
  clientId: string
  name: string
  stage: ProjectStage
  projectManager: string
  director: string
  healthScore: number
  healthStatus: HealthStatus
  jiraRisk: RiskLevel
  deliveryRisk: number
  milestoneConfidence: number
  activeSignals: number
  openActions: number
  nextMilestone: string
  dueDate: string
}

export interface CustomerOnboardingPayload {
  client: Omit<Client, 'id'>
  project: Omit<Project, 'id' | 'clientId'>
  connectorIds: string[]
}

export interface SignalReview {
  signalId: string
  lifecycleStatus: SignalLifecycleStatus
  confidence: number
  reviewer: string
  reviewedAt?: string
  dismissalReason?: string
  humanOverride?: boolean
}

export interface Recommendation {
  id: string
  clientId: string
  projectId?: string
  title: string
  rootCause: string
  suggestedAction: string
  impact: RiskLevel
  ownerRole: UserRole
  confidence: number
  decision: RecommendationDecision
}

export interface ActionItem {
  id: string
  clientId: string
  projectId?: string
  title: string
  owner: string
  ownerRole: UserRole
  dueDate: string
  status: ActionStatus
  severity: RiskLevel
}

export interface EscalationCase {
  id: string
  clientId: string
  projectId?: string
  triggerCondition: string
  owner: string
  recoveryPlan: string
  dueDate: string
  status: EscalationStatus
  closureNotes?: string
}

export interface ScoreRule {
  id: string
  name: string
  source: DataSource
  weight: number
  threshold: number
  isEnabled: boolean
}

export interface AuditLogEntry {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
}

export interface AgentModule {
  id: string
  name: string
  status: 'online' | 'degraded' | 'offline'
  lastRun: string
  processedSignals: number
}

export interface RolePermission {
  role: UserRole
  canViewSummary: boolean
  canViewRawEvidence: boolean
  canViewCommercialNotes: boolean
  canOverrideSignals: boolean
  escalationScope: string
}

export interface UserInvite {
  id: string
  name: string
  email: string
  role: UserRole
  invitedBy: string
  status: 'pending' | 'accepted'
}

export interface NotificationPreference {
  id: string
  role: UserRole
  lowSeverity: NotificationDigestFrequency
  mediumSeverity: NotificationDigestFrequency
  highSeverity: NotificationDigestFrequency
  emailEnabled: boolean
  inAppEnabled: boolean
}

export type ProjectCoverageFilter = 'all' | 'no_projects' | 'single_project' | 'multiple_projects'

export interface CustomerProjectSummaryItem {
  id: string
  name: string
  owner: string
  healthScore: number
  healthStatus: HealthStatus
}

export interface CustomerProjectSummary {
  clientId: string
  projectCount: number
  averageProjectHealth: number
  projectHealthStatus?: HealthStatus
  projectHealthStatuses: HealthStatus[]
  projectNames: string[]
  projects: CustomerProjectSummaryItem[]
}

export type DashboardMetricIcon =
  | 'users'
  | 'gauge'
  | 'trend'
  | 'alert'
  | 'actions'
  | 'shield'
  | 'recommendations'
  | 'settings'

export interface DashboardMetric {
  id: string
  label: string
  value: string
  helper: string
  icon: DashboardMetricIcon
}

export interface RoleQueueItem {
  id: string
  title: string
  description: string
  meta: string
  severity?: RiskLevel
}

export interface RoleCapability {
  label: string
  value: string
}

export interface RoleDashboardContent {
  title: string
  description: string
  summary: string
  metrics: DashboardMetric[]
  primaryQueueTitle: string
  primaryQueue: RoleQueueItem[]
  nextMoves: string[]
  capabilities: RoleCapability[]
  primaryActionLabel: string
  primaryActionPath: string
}

export interface RoleDashboardInput {
  role: UserRole
  clients: Client[]
  projects: Project[]
  alerts: Alert[]
  signals: CommunicationSignal[]
  actionItems: ActionItem[]
  escalations: EscalationCase[]
  recommendations: Recommendation[]
  agents: AgentModule[]
  scoreRules: ScoreRule[]
  auditLogs: AuditLogEntry[]
  averageHealth: number
  greenCount: number
  amberCount: number
  redCount: number
}
