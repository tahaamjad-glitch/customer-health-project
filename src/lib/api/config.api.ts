import {
  MOCK_AGENT_MODULES,
  MOCK_AUDIT_LOGS,
  MOCK_CUSTOMER_CONNECTOR_PROVISIONS,
  MOCK_HEALTH_HISTORY,
  MOCK_NOTIFICATION_PREFERENCES,
  MOCK_ROLE_PERMISSIONS,
  MOCK_SCORE_RULES,
  MOCK_SOURCE_CONNECTORS,
  MOCK_USER_INVITES,
} from '@/data/mock'
import type {
  AgentModule,
  AuditLogEntry,
  CustomerConnectorProvision,
  HealthHistoryPoint,
  NotificationPreference,
  RolePermission,
  ScoreRule,
  SourceConnector,
  UserInvite,
} from '@/types'
import { delay } from '@/lib/api/delay'

let scoreRules = [...MOCK_SCORE_RULES]
let sourceConnectors = [...MOCK_SOURCE_CONNECTORS]
let customerConnectorProvisions = [...MOCK_CUSTOMER_CONNECTOR_PROVISIONS]
let userInvites = [...MOCK_USER_INVITES]
let notificationPreferences = [...MOCK_NOTIFICATION_PREFERENCES]

export const configApi = {
  getHealthHistory: async (): Promise<HealthHistoryPoint[]> => {
    await delay()
    return MOCK_HEALTH_HISTORY
  },

  getScoreRules: async (): Promise<ScoreRule[]> => {
    await delay()
    return scoreRules
  },

  updateScoreRule: async (id: string, data: Partial<ScoreRule>): Promise<ScoreRule> => {
    await delay()
    scoreRules = scoreRules.map((rule) => (rule.id === id ? { ...rule, ...data } : rule))
    const updatedRule = scoreRules.find((rule) => rule.id === id)
    if (!updatedRule) throw new Error('Score rule not found')
    return updatedRule
  },

  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    await delay()
    return MOCK_AUDIT_LOGS
  },

  getConnectors: async (): Promise<SourceConnector[]> => {
    await delay()
    return sourceConnectors
  },

  updateConnector: async (id: string, data: Partial<SourceConnector>): Promise<SourceConnector> => {
    await delay()
    sourceConnectors = sourceConnectors.map((connector) => (connector.id === id ? { ...connector, ...data } : connector))
    const updatedConnector = sourceConnectors.find((connector) => connector.id === id)
    if (!updatedConnector) throw new Error('Connector not found')
    return updatedConnector
  },

  provisionCustomerConnectors: async (clientId: string, connectorIds: string[]): Promise<CustomerConnectorProvision[]> => {
    await delay()
    const requestedAt = new Date().toISOString()
    const provisions = connectorIds.map((connectorId) => {
      const connector = sourceConnectors.find((item) => item.id === connectorId)
      return {
        id: crypto.randomUUID(),
        clientId,
        connectorId,
        status: connector?.status === 'connected' ? 'connected' : 'needs_auth',
        requestedAt,
      } satisfies CustomerConnectorProvision
    })

    customerConnectorProvisions = [
      ...customerConnectorProvisions.filter((provision) => provision.clientId !== clientId),
      ...provisions,
    ]

    return provisions
  },

  getAgentModules: async (): Promise<AgentModule[]> => {
    await delay()
    return MOCK_AGENT_MODULES
  },

  getRolePermissions: async (): Promise<RolePermission[]> => {
    await delay()
    return MOCK_ROLE_PERMISSIONS
  },

  getUserInvites: async (): Promise<UserInvite[]> => {
    await delay()
    return userInvites
  },

  createUserInvite: async (data: Omit<UserInvite, 'id' | 'status'>): Promise<UserInvite> => {
    await delay()
    const invite = { ...data, id: crypto.randomUUID(), status: 'pending' as const }
    userInvites = [invite, ...userInvites]
    return invite
  },

  getNotificationPreferences: async (): Promise<NotificationPreference[]> => {
    await delay()
    return notificationPreferences
  },

  updateNotificationPreference: async (
    id: string,
    data: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> => {
    await delay()
    notificationPreferences = notificationPreferences.map((preference) =>
      preference.id === id ? { ...preference, ...data } : preference,
    )
    const updatedPreference = notificationPreferences.find((preference) => preference.id === id)
    if (!updatedPreference) throw new Error('Notification preference not found')
    return updatedPreference
  },
}
