import {
  Activity,
  AlertTriangle,
  Bell,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Gauge,
  GitPullRequest,
  Inbox,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  Moon,
  MoreHorizontal,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  TableProperties,
  UserCircle,
  UserPlus,
  Users,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'
import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { cn } from '@/lib/utils'

type HealthBand = 'green' | 'amber' | 'red'
type AlertSeverity = 'High' | 'Medium' | 'Low'
type AlertStatus = 'New' | 'Acknowledged' | 'Forwarded' | 'In progress' | 'Resolved'
type SignalStatus = 'Linked' | 'Unreviewed' | 'Valid' | 'Dismissed'
type SignalSentiment = 'negative' | 'neutral' | 'positive'
type SourceId = 'email' | 'jira' | 'pmo-jira' | 'bitbucket' | 'invoice' | 'meeting'

interface Customer {
  id: string
  name: string
  tier: 'Strategic' | 'Enterprise' | 'Growth' | 'Standard'
  aggregateHealth: number
  aeOwner: string
  renewalDays: number
  trend: 'up' | 'flat' | 'down'
  industry: string
}

interface Project {
  id: string
  customerId: string
  name: string
  stage: string
  health: number
  trend: 'up' | 'flat' | 'down'
  lastActivity: string
  openAlerts: number
  pd: string
  pm: string
  status: 'Open' | 'Blocked' | 'Watching' | 'Recovering'
  lastActivityAt: string
  sourceCoverage: SourceId[]
  contributors: string[]
}

interface AlertItem {
  id: string
  projectId: string
  customerId: string
  title: string
  summary: string
  severity: AlertSeverity
  concern: string
  source: SourceId
  age: string
  status: AlertStatus
  sender: string
  playbook: string
  playbookSummary: string
  routedTo: string
}

interface SignalItem {
  id: string
  projectId: string
  customerId: string
  timestamp: string
  source: SourceId
  sender: string
  summary: string
  sentiment: SignalSentiment
  concern: string
  status: SignalStatus
}

interface ActionItem {
  id: string
  projectId: string
  alertId?: string
  title: string
  owner: string
  dueDate: string
  status: 'Open' | 'In progress' | 'Blocked' | 'Done'
  priority: AlertSeverity
}

interface PmoCase {
  id: string
  title: string
  status: 'Open' | 'Watching' | 'Closed'
  summary: string
  projectId: string
  owner: string
  openedAt: string
}

interface NotificationPreference {
  enabled: boolean
  cadence: 'off' | 'daily digest' | 'immediate'
}

type PreferenceMatrix = Record<string, Record<string, Record<AlertSeverity, NotificationPreference>>>

interface AuthUser {
  email: string
  full_name?: string
  id: string
  is_active: boolean
  name: string
  role: string
}

interface AuthResponse {
  token: string
  user: AuthUser
}

interface RegisterPayload {
  confirm_password: string
  email: string
  full_name: string
  password: string
}

interface ForgotPasswordResponse {
  message: string
  reset_token?: string
  reset_url?: string
}

type ProjectImportFormat = 'csv' | 'json'

interface BackendProject {
  active_signals: number
  customer_id: string
  customer_name?: string
  delivery_risk: number
  director: string
  due_date: string
  external_ref?: string | null
  health_score: number
  health_status: HealthBand
  id: string
  jira_risk: 'critical' | 'high' | 'medium' | 'low'
  milestone_confidence: number
  name: string
  next_milestone: string
  open_actions: number
  project_manager: string
  stage: 'discovery' | 'delivery' | 'hypercare' | 'managed_service'
}

interface ProjectImportRowResult {
  errors?: string[]
  project?: BackendProject
  row: number
  status: 'created' | 'updated' | 'failed'
}

interface ProjectImportResult {
  created: number
  errors: Array<{ message: string; row: number }>
  failed: number
  rows: ProjectImportRowResult[]
  updated: number
}

interface ProjectImportPreviewRow {
  errors: string[]
  rowNumber: number
  values: Record<string, string>
}

interface AppState {
  authChecking: boolean
  authToken: string | null
  authUser: AuthUser | null
  alerts: AlertItem[]
  actionItems: ActionItem[]
  signalStatuses: Record<string, SignalStatus>
  selectedSignals: string[]
  preferenceMatrix: PreferenceMatrix
  auditEvents: string[]
  updateAlertStatus: (alertId: string, status: AlertStatus) => void
  updateActionItem: (id: string, patch: Partial<ActionItem>) => void
  updateSignalStatus: (signalId: string, status: SignalStatus) => void
  toggleSignalSelection: (signalId: string) => void
  clearSignalSelection: () => void
  updatePreference: (channel: string, source: string, severity: AlertSeverity, patch: Partial<NotificationPreference>) => void
  resetPreferences: () => void
  addAudit: (event: string) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  registerUser: (payload: RegisterPayload) => Promise<void>
  requestPasswordReset: (email: string) => Promise<ForgotPasswordResponse>
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<string>
}

const sourceCatalog: Array<{ id: SourceId; label: string; icon: LucideIcon }> = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'jira', label: 'Jira', icon: ClipboardCheck },
  { id: 'pmo-jira', label: 'PMO Jira', icon: TableProperties },
  { id: 'bitbucket', label: 'Bitbucket PR', icon: GitPullRequest },
  { id: 'invoice', label: 'Invoice', icon: Receipt },
  { id: 'meeting', label: 'Meeting', icon: Video },
]

const customers: Customer[] = [
  { id: 'northstar-retail', name: 'Northstar Retail', tier: 'Strategic', aggregateHealth: 49, aeOwner: 'Ayesha Malik', renewalDays: 87, trend: 'down', industry: 'Retail' },
  { id: 'vertex-health-systems', name: 'Vertex Health Systems', tier: 'Enterprise', aggregateHealth: 56, aeOwner: 'Daniyal Ahmed', renewalDays: 220, trend: 'flat', industry: 'Healthcare' },
  { id: 'brightline-logistics', name: 'Brightline Logistics', tier: 'Growth', aggregateHealth: 63, aeOwner: 'Ayesha Malik', renewalDays: 45, trend: 'up', industry: 'Logistics' },
  { id: 'kestrel-financial', name: 'Kestrel Financial', tier: 'Strategic', aggregateHealth: 41, aeOwner: 'Hira Siddiqui', renewalDays: 12, trend: 'down', industry: 'Financial services' },
  { id: 'meridian-education', name: 'Meridian Education', tier: 'Standard', aggregateHealth: 88, aeOwner: 'Daniyal Ahmed', renewalDays: 180, trend: 'up', industry: 'Education' },
]

const projects: Project[] = [
  {
    id: 'kestrel-compliance',
    customerId: 'kestrel-financial',
    name: 'Kestrel Financial - Compliance Portal',
    stage: 'delivery',
    health: 28,
    trend: 'down',
    lastActivity: '2h ago',
    openAlerts: 5,
    pd: 'Fatima Raza',
    pm: 'Hassan Ali',
    status: 'Blocked',
    lastActivityAt: 'May 22, 05:05 AM',
    sourceCoverage: ['email', 'jira', 'pmo-jira', 'bitbucket', 'invoice', 'meeting'],
    contributors: [
      "Client lead repeated month-end escalation language in yesterday's steering call.",
      'PR review comments show quality concerns on the auth module.',
      'The renewal date is 12 days away, amplifying relationship and missed-commitment signals.',
    ],
  },
  {
    id: 'northstar-mobile',
    customerId: 'northstar-retail',
    name: 'Northstar Retail - Mobile App Revamp',
    stage: 'delivery',
    health: 34,
    trend: 'down',
    lastActivity: '3h ago',
    openAlerts: 4,
    pd: 'Omar Farooq',
    pm: 'Sarah Khan',
    status: 'Recovering',
    lastActivityAt: 'May 22, 04:30 AM',
    sourceCoverage: ['email', 'jira', 'pmo-jira', 'meeting'],
    contributors: [
      'Contract milestone thread now includes partnership risk language.',
      'Checkout analytics scope changed after sprint commitment.',
      'Mobile release confidence fell after two unresolved acceptance criteria changes.',
    ],
  },
  {
    id: 'brightline-dispatch',
    customerId: 'brightline-logistics',
    name: 'Brightline - Dispatch Backend',
    stage: 'delivery',
    health: 41,
    trend: 'down',
    lastActivity: '4h ago',
    openAlerts: 2,
    pd: 'Omar Farooq',
    pm: 'Amin Khan',
    status: 'Watching',
    lastActivityAt: 'May 22, 03:45 AM',
    sourceCoverage: ['jira', 'invoice', 'meeting'],
    contributors: [
      'Invoice aging overlaps with dispatch API concerns.',
      'Two route-optimization defects are blocking staging sign-off.',
      'Commercial owner has not joined the last two recovery syncs.',
    ],
  },
  {
    id: 'vertex-ehr',
    customerId: 'vertex-health-systems',
    name: 'Vertex Health - EHR Integration',
    stage: 'delivery',
    health: 56,
    trend: 'flat',
    lastActivity: '5h ago',
    openAlerts: 2,
    pd: 'Fatima Raza',
    pm: 'Amanda Lee',
    status: 'Watching',
    lastActivityAt: 'May 21, 06:40 PM',
    sourceCoverage: ['jira', 'pmo-jira', 'meeting'],
    contributors: [
      'Three EHR blockers have aged past seven days.',
      'Client is positive on the prototype but uncertain about UAT staffing.',
      'Interface mapping owners are not visible in client notes.',
    ],
  },
  {
    id: 'kestrel-trading',
    customerId: 'kestrel-financial',
    name: 'Kestrel Financial - Trading Analytics',
    stage: 'discovery',
    health: 71,
    trend: 'flat',
    lastActivity: '44h ago',
    openAlerts: 1,
    pd: 'Fatima Raza',
    pm: 'Bilal Hussain',
    status: 'Open',
    lastActivityAt: 'May 20, 11:00 AM',
    sourceCoverage: ['email', 'jira', 'meeting'],
    contributors: [
      'Discovery path is stable, but dependency risk remains with compliance stakeholders.',
      'One unresolved requirements note needs AE context.',
      'Executive sponsor has not reviewed the next-phase effort estimate.',
    ],
  },
  {
    id: 'northstar-loyalty',
    customerId: 'northstar-retail',
    name: 'Northstar Retail - Loyalty Platform',
    stage: 'hypercare',
    health: 78,
    trend: 'up',
    lastActivity: '19h ago',
    openAlerts: 0,
    pd: 'Omar Farooq',
    pm: 'Sarah Khan',
    status: 'Open',
    lastActivityAt: 'May 21, 05:20 PM',
    sourceCoverage: ['email', 'jira', 'meeting'],
    contributors: [
      'Sponsor thanked the team for clean UAT support.',
      'Hypercare defects are below threshold.',
      'Adoption signals remain positive across store pilot teams.',
    ],
  },
  {
    id: 'brightline-driver',
    customerId: 'brightline-logistics',
    name: 'Brightline - Driver App v2',
    stage: 'delivery',
    health: 82,
    trend: 'up',
    lastActivity: '22h ago',
    openAlerts: 0,
    pd: 'Omar Farooq',
    pm: 'Amin Khan',
    status: 'Open',
    lastActivityAt: 'May 21, 02:18 PM',
    sourceCoverage: ['jira', 'meeting'],
    contributors: [
      'Driver app sprint closed with no client-visible critical defects.',
      'Team velocity recovered after backlog grooming.',
      'Next milestone has a named client approver.',
    ],
  },
  {
    id: 'meridian-student',
    customerId: 'meridian-education',
    name: 'Meridian - Student Portal',
    stage: 'managed service',
    health: 88,
    trend: 'up',
    lastActivity: '26h ago',
    openAlerts: 0,
    pd: 'Fatima Raza',
    pm: 'Usman Raza',
    status: 'Open',
    lastActivityAt: 'May 21, 10:20 AM',
    sourceCoverage: ['email', 'jira', 'meeting'],
    contributors: [
      'Managed-service checks are consistently green.',
      'Renewal path is clean with no commercial flags.',
      'Support backlog remains under target.',
    ],
  },
]

const seedAlerts: AlertItem[] = [
  {
    id: 'alert-kc-missed',
    projectId: 'kestrel-compliance',
    customerId: 'kestrel-financial',
    title: 'Month-end escalation language repeated',
    summary: "Client lead stated in yesterday's call: 'we need this by month-end or we'll have to escalate' - second similar mention in 14 days.",
    severity: 'High',
    concern: 'Missed commitment',
    source: 'meeting',
    age: '2h ago',
    status: 'Forwarded',
    sender: 'Transcript bot - Kestrel weekly steering',
    playbook: 'Commitment reset and PMO pre-brief',
    playbookSummary: 'PD validates the delivery path, PMO receives a concise risk brief, and the client gets a written commitment reset within one business day.',
    routedTo: 'PM, PD, AE, PMO',
  },
  {
    id: 'alert-kc-quality',
    projectId: 'kestrel-compliance',
    customerId: 'kestrel-financial',
    title: 'Repeated auth module style inconsistencies',
    summary: 'Client reviewer flagged repeated style inconsistencies on auth module PR #847.',
    severity: 'Low',
    concern: 'Quality',
    source: 'bitbucket',
    age: '18h ago',
    status: 'Acknowledged',
    sender: 'Evan Brooks',
    playbook: 'Quality closure note',
    playbookSummary: 'PM confirms coding-standard owner, closes review comments, and sends client-visible quality note.',
    routedTo: 'PM',
  },
  {
    id: 'alert-ns-relationship',
    projectId: 'northstar-mobile',
    customerId: 'northstar-retail',
    title: 'Partnership risk language in contract milestone thread',
    summary: "Client VP raised 'reconsidering our partnership' language 11 days before contract milestone review.",
    severity: 'High',
    concern: 'Relationship risk',
    source: 'email',
    age: '3h ago',
    status: 'New',
    sender: 'Maya Thompson',
    playbook: 'Executive recovery call',
    playbookSummary: 'AE joins PM and PD to reset milestone expectations before the contract milestone review.',
    routedTo: 'PM, PD, AE',
  },
  {
    id: 'alert-ns-scope',
    projectId: 'northstar-mobile',
    customerId: 'northstar-retail',
    title: 'Checkout analytics scope drift',
    summary: 'Scope acceptance comments on checkout analytics changed twice after sprint commitment.',
    severity: 'Medium',
    concern: 'Scope',
    source: 'jira',
    age: '22h ago',
    status: 'In progress',
    sender: 'Jira acceptance sync',
    playbook: 'Scope memo and sprint re-baseline',
    playbookSummary: 'PM publishes the committed scope and re-baselines analytics acceptance criteria with PD visibility.',
    routedTo: 'PM, PD',
  },
  {
    id: 'alert-br-invoice',
    projectId: 'brightline-dispatch',
    customerId: 'brightline-logistics',
    title: 'Invoice delay overlaps dispatch API concerns',
    summary: 'Invoice INV-2310 is nine days overdue while dispatch API sign-off is still blocked.',
    severity: 'Medium',
    concern: 'Billing',
    source: 'invoice',
    age: '4h ago',
    status: 'New',
    sender: 'Finance workspace sync',
    playbook: 'Commercial context check',
    playbookSummary: 'AE confirms whether the invoice delay is operational or a commercial reaction to delivery concerns.',
    routedTo: 'AE, PM',
  },
  {
    id: 'alert-vertex-blockers',
    projectId: 'vertex-ehr',
    customerId: 'vertex-health-systems',
    title: 'Aged EHR interface blockers',
    summary: 'Three EHR blockers have aged past seven days and need named owners before UAT.',
    severity: 'Medium',
    concern: 'Delivery',
    source: 'jira',
    age: '5h ago',
    status: 'In progress',
    sender: 'Amanda Lee',
    playbook: 'Named owner recovery',
    playbookSummary: 'Assign owners for each interface blocker and publish client-visible recovery dates.',
    routedTo: 'PM, PMO',
  },
]

const seedSignals: SignalItem[] = [
  { id: 'sig-kc-meeting', projectId: 'kestrel-compliance', customerId: 'kestrel-financial', timestamp: 'May 22, 10:05 AM', source: 'meeting', sender: 'Transcript bot - Kestrel weekly steering', summary: 'Client repeated month-end escalation language for the second time in 14 days.', sentiment: 'negative', concern: 'Missed commitment', status: 'Linked' },
  { id: 'sig-ns-email', projectId: 'northstar-mobile', customerId: 'northstar-retail', timestamp: 'May 22, 09:15 AM', source: 'email', sender: 'Maya Thompson', summary: 'Client VP questioned partnership viability ahead of milestone review.', sentiment: 'negative', concern: 'Relationship risk', status: 'Linked' },
  { id: 'sig-br-invoice', projectId: 'brightline-dispatch', customerId: 'brightline-logistics', timestamp: 'May 22, 08:31 AM', source: 'invoice', sender: 'Finance workspace sync', summary: 'Invoice INV-2310 is nine days overdue.', sentiment: 'neutral', concern: 'Billing', status: 'Unreviewed' },
  { id: 'sig-vh-jira', projectId: 'vertex-ehr', customerId: 'vertex-health-systems', timestamp: 'May 22, 07:42 AM', source: 'jira', sender: 'Amanda Lee', summary: 'Three EHR blockers have aged past seven days.', sentiment: 'negative', concern: 'Delivery', status: 'Valid' },
  { id: 'sig-kc-pr', projectId: 'kestrel-compliance', customerId: 'kestrel-financial', timestamp: 'May 21, 06:04 PM', source: 'bitbucket', sender: 'Evan Brooks', summary: 'Client reviewer flagged repeated style inconsistencies on auth module PR #847.', sentiment: 'negative', concern: 'Quality', status: 'Valid' },
  { id: 'sig-ns-positive', projectId: 'northstar-loyalty', customerId: 'northstar-retail', timestamp: 'May 21, 05:20 PM', source: 'email', sender: 'Priya Raman', summary: 'Client sponsor thanked the team for clean UAT support.', sentiment: 'positive', concern: 'Communication gap', status: 'Valid' },
  { id: 'sig-br-meeting', projectId: 'brightline-driver', customerId: 'brightline-logistics', timestamp: 'May 21, 02:18 PM', source: 'meeting', sender: 'Transcript bot - Driver standup', summary: 'Driver app sprint closed with no client-visible critical defects.', sentiment: 'positive', concern: 'Delivery', status: 'Valid' },
  { id: 'sig-kc-pmo', projectId: 'kestrel-compliance', customerId: 'kestrel-financial', timestamp: 'May 21, 11:30 AM', source: 'pmo-jira', sender: 'PMO-1842', summary: 'PD forwarded high-severity missed commitment alert for PMO visibility.', sentiment: 'negative', concern: 'Escalation', status: 'Linked' },
]

const seedActionItems: ActionItem[] = [
  { id: 'act-kc-brief', projectId: 'kestrel-compliance', alertId: 'alert-kc-missed', title: 'Create PMO escalation brief', owner: 'Fatima Raza', dueDate: '2026-05-22', status: 'In progress', priority: 'High' },
  { id: 'act-kc-reset', projectId: 'kestrel-compliance', alertId: 'alert-kc-missed', title: 'Re-baseline month-end delivery scope', owner: 'Hassan Ali', dueDate: '2026-05-23', status: 'Open', priority: 'High' },
  { id: 'act-ns-call', projectId: 'northstar-mobile', alertId: 'alert-ns-relationship', title: 'Call Northstar VP with recovery owner', owner: 'Sarah Khan', dueDate: '2026-05-22', status: 'Open', priority: 'High' },
  { id: 'act-ns-scope', projectId: 'northstar-mobile', alertId: 'alert-ns-scope', title: 'Publish checkout analytics scope memo', owner: 'Sarah Khan', dueDate: '2026-05-23', status: 'In progress', priority: 'Medium' },
  { id: 'act-br-invoice', projectId: 'brightline-dispatch', alertId: 'alert-br-invoice', title: 'Check Brightline invoice context', owner: 'Ayesha Malik', dueDate: '2026-05-22', status: 'Open', priority: 'Medium' },
]

const pmoCases: PmoCase[] = [
  { id: 'PMO-1842', title: 'Month-end compliance milestone risk', status: 'Open', summary: 'PD forwarded high-severity missed commitment alert for PMO visibility before formal client escalation.', projectId: 'kestrel-compliance', owner: 'Kestrel Financial / Fatima Raza', openedAt: 'May 22, 05:20 AM' },
  { id: 'PMO-1838', title: 'Contract milestone relationship recovery', status: 'Watching', summary: 'Client VP requested a recovery plan ahead of milestone review; AE is joining executive call.', projectId: 'northstar-mobile', owner: 'Northstar Retail / Omar Farooq', openedAt: 'May 21, 10:10 AM' },
  { id: 'PMO-1829', title: 'Aged interface mapping blockers', status: 'Watching', summary: 'Three blocked EHR tickets require named owners and client-visible updates.', projectId: 'vertex-ehr', owner: 'Vertex Health Systems / Fatima Raza', openedAt: 'May 18, 06:30 AM' },
  { id: 'PMO-1840', title: 'Dispatch backend payment anomaly', status: 'Open', summary: 'Invoice delay may be an early commercial signal tied to dispatch API concerns.', projectId: 'brightline-dispatch', owner: 'Brightline Logistics / Omar Farooq', openedAt: 'May 22, 04:00 AM' },
]

const severityOptions: AlertSeverity[] = ['Low', 'Medium', 'High']
const channelOptions = ['Slack', 'Email digest']
const cadenceOptions: NotificationPreference['cadence'][] = ['off', 'daily digest', 'immediate']

const buildDefaultPreferences = (): PreferenceMatrix => {
  const matrix: PreferenceMatrix = {}
  channelOptions.forEach((channel) => {
    matrix[channel] = {}
    sourceCatalog.forEach((source) => {
      matrix[channel][source.id] = {
        Low: { enabled: false, cadence: 'off' },
        Medium: { enabled: true, cadence: 'daily digest' },
        High: { enabled: true, cadence: 'immediate' },
      }
    })
  })
  return matrix
}

const storageKeys = {
  actionItems: 'tkxel-health-action-items',
  alerts: 'tkxel-health-alerts',
  authToken: 'tkxel-health-auth-token',
  authUser: 'tkxel-health-auth-user',
  auditEvents: 'tkxel-health-audit-events',
  preferences: 'tkxel-health-preferences',
  signalStatuses: 'tkxel-health-signal-statuses',
}

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const writeStorage = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

const removeStorage = (key: string): void => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key)
}

const apiBaseUrl = (): string => {
  const runtimeBase =
    typeof window !== 'undefined'
      ? ((window as Window & typeof globalThis & { PROJECT_HEALTH_API_BASE?: string }).PROJECT_HEALTH_API_BASE ?? import.meta.env.VITE_CUSTOMER_HEALTH_API_BASE)
      : import.meta.env.VITE_CUSTOMER_HEALTH_API_BASE
  return (runtimeBase || 'http://127.0.0.1:8181').replace(/\/+$/, '')
}

const apiRequest = async <T,>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> => {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, { ...options, headers })
  } catch (error) {
    throw new Error(`Unable to reach the authentication API at ${apiBaseUrl()}.`)
  }

  const text = await response.text()
  const payload = text ? JSON.parse(text) : {}
  if (!response.ok) {
    const message = typeof payload.error === 'string' ? payload.error : typeof payload.message === 'string' ? payload.message : `Request failed with status ${response.status}`
    throw new Error(message)
  }
  return payload as T
}

const messageFromError = (error: unknown): string => (error instanceof Error ? error.message : 'Something went wrong. Please try again.')

const sanitizeNextPath = (path: string | null): string => {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return '/dashboard'
  if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password') || path.startsWith('/reset-password')) return '/dashboard'
  return path
}

const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CH'

const titleCase = (value: string): string =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')

const passwordRuleState = (password: string): Array<{ label: string; met: boolean }> => [
  { label: '8+ characters', met: password.length >= 8 },
  { label: 'Uppercase and lowercase', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
  { label: 'Number', met: /\d/.test(password) },
  { label: 'Symbol', met: /[^A-Za-z0-9]/.test(password) },
]

const projectImportColumns = [
  'external_ref',
  'customer_id',
  'name',
  'stage',
  'project_manager',
  'director',
  'health_score',
  'jira_risk',
  'delivery_risk',
  'milestone_confidence',
  'active_signals',
  'open_actions',
  'next_milestone',
  'due_date',
]

const projectImportRequired = [
  'name',
  'stage',
  'project_manager',
  'director',
  'health_score',
  'jira_risk',
  'delivery_risk',
  'milestone_confidence',
  'active_signals',
  'open_actions',
  'next_milestone',
  'due_date',
]

const projectImportAliases: Record<string, string[]> = {
  active_signals: ['activesignals', 'signals'],
  customer_external_ref: ['customerexternalref', 'clientexternalref', 'accountref'],
  customer_id: ['customerid', 'clientid', 'accountid'],
  customer_name: ['customername', 'clientname', 'company', 'accountname'],
  delivery_risk: ['deliveryrisk', 'deliveryriskscore'],
  director: ['director', 'projectdirector', 'pd'],
  due_date: ['duedate', 'milestoneduedate', 'date'],
  external_ref: ['externalref', 'externalid', 'projectref', 'projectcode', 'jiraid', 'jirakey'],
  health_score: ['healthscore', 'projecthealthscore', 'score'],
  health_status: ['healthstatus', 'projecthealth', 'status'],
  id: ['id', 'projectid'],
  jira_risk: ['jirarisk', 'risk', 'risklevel', 'deliveryrisklevel'],
  milestone_confidence: ['milestoneconfidence', 'confidence'],
  name: ['name', 'projectname'],
  next_milestone: ['nextmilestone', 'milestone'],
  open_actions: ['openactions', 'actions'],
  project_manager: ['projectmanager', 'pm', 'owner', 'projectowner'],
  stage: ['stage', 'projectstage'],
}

const projectStageOptions = ['discovery', 'delivery', 'hypercare', 'managed_service']
const projectRiskOptions = ['critical', 'high', 'medium', 'low']

const projectImportSample = {
  active_signals: 3,
  customer_id: 'cust_northstar',
  delivery_risk: 35,
  director: 'Omar Farooq',
  due_date: '2026-07-15',
  external_ref: 'JIRA-NS-001',
  health_score: 72,
  jira_risk: 'medium',
  milestone_confidence: 78,
  name: 'Mobile App Revamp',
  next_milestone: 'UAT sign-off',
  open_actions: 2,
  project_manager: 'Sarah Khan',
  stage: 'delivery',
}

const parseProjectImportPreview = (content: string, format: ProjectImportFormat): { error?: string; rows: ProjectImportPreviewRow[] } => {
  try {
    const rawRows =
      format === 'json'
        ? parseProjectImportJson(content)
        : parseProjectImportCsv(content)
    return {
      rows: rawRows.slice(0, 25).map((row, index) => {
        const values = canonicalizeProjectImportRow(row)
        return {
          errors: validateProjectImportPreviewRow(values),
          rowNumber: format === 'csv' ? index + 2 : index + 1,
          values,
        }
      }),
    }
  } catch (error) {
    return { error: messageFromError(error), rows: [] }
  }
}

const parseProjectImportJson = (content: string): Array<Record<string, string | number>> => {
  const payload = JSON.parse(content) as unknown
  const rows = typeof payload === 'object' && payload !== null && 'projects' in payload ? (payload as { projects: unknown }).projects : payload
  if (!Array.isArray(rows)) throw new Error('JSON must be an array or an object with a projects array.')
  return rows.map((row) => {
    if (typeof row !== 'object' || row === null || Array.isArray(row)) throw new Error('Each JSON row must be an object.')
    return row as Record<string, string | number>
  })
}

const parseProjectImportCsv = (content: string): Array<Record<string, string>> => {
  const rows = parseCsvCells(content)
  if (rows.length === 0) throw new Error('CSV file is empty.')
  const headers = rows[0].map((header) => header.trim())
  if (headers.every((header) => !header)) throw new Error('CSV requires a header row.')
  return rows
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])))
}

const parseCsvCells = (content: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    const next = content[index + 1]
    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

const canonicalizeProjectImportRow = (row: Record<string, string | number>): Record<string, string> => {
  const tokenized = Object.fromEntries(Object.entries(row).map(([key, value]) => [fieldToken(key), String(value ?? '').trim()]))
  return Object.fromEntries(
    Object.entries(projectImportAliases).flatMap(([field, aliases]) => {
      const match = [...aliases, fieldToken(field)].find((alias) => alias in tokenized)
      return match ? [[field, tokenized[match]]] : []
    }),
  )
}

const validateProjectImportPreviewRow = (values: Record<string, string>): string[] => {
  const errors: string[] = []
  if (!values.customer_id && !values.customer_external_ref && !values.customer_name) errors.push('customer_id is required')
  projectImportRequired.forEach((field) => {
    if (!values[field]) errors.push(`${field} is required`)
  })
  if (values.stage && !projectStageOptions.includes(values.stage.replace(/[-\s]/g, '_').toLowerCase())) errors.push('stage is invalid')
  if (values.jira_risk && !projectRiskOptions.includes(values.jira_risk.toLowerCase())) errors.push('jira_risk is invalid')
  ;['health_score', 'delivery_risk', 'milestone_confidence'].forEach((field) => validatePercentField(values, field, errors))
  ;['active_signals', 'open_actions'].forEach((field) => validateIntegerField(values, field, errors))
  if (values.due_date && Number.isNaN(Date.parse(`${values.due_date}T00:00:00Z`))) errors.push('due_date must be YYYY-MM-DD')
  return errors
}

const validatePercentField = (values: Record<string, string>, field: string, errors: string[]): void => {
  if (!values[field]) return
  const value = Number(values[field])
  if (!Number.isInteger(value) || value < 0 || value > 100) errors.push(`${field} must be 0-100`)
}

const validateIntegerField = (values: Record<string, string>, field: string, errors: string[]): void => {
  if (!values[field]) return
  const value = Number(values[field])
  if (!Number.isInteger(value) || value < 0) errors.push(`${field} must be 0 or greater`)
}

const fieldToken = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '')

const downloadCsv = (fileName: string, rows: Array<Record<string, string | number>>): void => {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escapeCell = (value: string | number): string => `"${String(value).replace(/"/g, '""')}"`
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

const AppContext = createContext<AppState | undefined>(undefined)

const useAppState = (): AppState => {
  const context = useContext(AppContext)
  if (!context) throw new Error('Customer health context is missing')
  return context
}

const getCustomer = (customerId: string): Customer => customers.find((customer) => customer.id === customerId) ?? customers[0]
const getProject = (projectId: string): Project => projects.find((project) => project.id === projectId) ?? projects[0]
const sourceMeta = (sourceId: SourceId) => sourceCatalog.find((source) => source.id === sourceId) ?? sourceCatalog[0]

const healthBand = (score: number): HealthBand => {
  if (score < 40) return 'red'
  if (score < 70) return 'amber'
  return 'green'
}

const scoreClasses = (score: number): string => {
  const band = healthBand(score)
  if (band === 'red') return 'border-rose-500/35 bg-rose-500/14 text-rose-100'
  if (band === 'amber') return 'border-amber-500/35 bg-amber-500/14 text-amber-100'
  return 'border-emerald-500/35 bg-emerald-500/14 text-emerald-100'
}

const severityClasses = (severity: AlertSeverity): string => {
  if (severity === 'High') return 'border-rose-500/40 bg-rose-500/20 text-rose-100'
  if (severity === 'Medium') return 'border-amber-500/40 bg-amber-500/18 text-amber-100'
  return 'border-zinc-500/45 bg-zinc-500/20 text-zinc-200'
}

const trendSymbol = (trend: Project['trend'] | Customer['trend']): string => {
  if (trend === 'up') return 'up'
  if (trend === 'down') return 'down'
  return 'flat'
}

const Sparkline = ({ score, trend }: { score: number; trend: 'up' | 'flat' | 'down' }): JSX.Element => {
  const start = trend === 'up' ? score - 12 : trend === 'down' ? score + 12 : score - 2
  const points = [start, start + 4, score + (trend === 'down' ? 4 : -2), score].map((value, index) => `${index * 30},${54 - Math.max(12, Math.min(88, value)) / 2}`)

  return (
    <svg aria-hidden="true" className="h-16 w-full" viewBox="0 0 90 56">
      <polyline fill="none" points={points.join(' ')} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  )
}

const Pill = ({ children, className }: { children: ReactNode; className?: string }): JSX.Element => (
  <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold', className)}>
    {children}
  </span>
)

const IconShell = ({ icon: Icon, className }: { icon: LucideIcon; className?: string }): JSX.Element => (
  <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]', className)}>
    <Icon className="h-4 w-4" aria-hidden="true" />
  </span>
)

const Panel = ({ children, className }: { children: ReactNode; className?: string }): JSX.Element => (
  <section className={cn('rounded-lg border border-white/10 bg-zinc-950/86 shadow-[0_22px_70px_rgba(0,0,0,0.28)]', className)}>{children}</section>
)

const SectionHeader = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }): JSX.Element => (
  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 p-4">
    <div>
      <h2 className="text-base font-semibold text-zinc-50">{title}</h2>
      {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
    </div>
    {action}
  </div>
)

const EmptyState = ({ title, message }: { title: string; message: string }): JSX.Element => (
  <div className="rounded-lg border border-dashed border-white/15 p-8 text-center">
    <p className="text-sm font-semibold text-zinc-100">{title}</p>
    <p className="mt-1 text-sm text-zinc-500">{message}</p>
  </div>
)

const CustomerHealthApp = (): JSX.Element => {
  const location = useLocation()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [searchOpen, setSearchOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(() => readStorage<string | null>(storageKeys.authToken, null))
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => readStorage<AuthUser | null>(storageKeys.authUser, null))
  const [authChecking, setAuthChecking] = useState(() => Boolean(readStorage<string | null>(storageKeys.authToken, null)))
  const [alerts, setAlerts] = useState<AlertItem[]>(() => readStorage(storageKeys.alerts, seedAlerts))
  const [actionItems, setActionItems] = useState<ActionItem[]>(() => readStorage(storageKeys.actionItems, seedActionItems))
  const [signalStatuses, setSignalStatuses] = useState<Record<string, SignalStatus>>(() =>
    readStorage(storageKeys.signalStatuses, Object.fromEntries(seedSignals.map((signal) => [signal.id, signal.status]))),
  )
  const [selectedSignals, setSelectedSignals] = useState<string[]>([])
  const [preferenceMatrix, setPreferenceMatrix] = useState<PreferenceMatrix>(() => readStorage(storageKeys.preferences, buildDefaultPreferences()))
  const [auditEvents, setAuditEvents] = useState<string[]>(() => readStorage(storageKeys.auditEvents, [
    'Omar Farooq opened Command Center',
    'PMO-1842 created from Kestrel missed commitment alert',
    'Sarah Khan acknowledged Northstar relationship watch',
  ]))

  const addAudit = (event: string): void => setAuditEvents((events) => [`${new Date().toLocaleTimeString()} - ${event}`, ...events].slice(0, 20))

  const rememberAuth = (token: string, user: AuthUser): void => {
    setAuthToken(token)
    setAuthUser(user)
    writeStorage(storageKeys.authToken, token)
    writeStorage(storageKeys.authUser, user)
  }

  const clearAuth = (): void => {
    setAuthToken(null)
    setAuthUser(null)
    removeStorage(storageKeys.authToken)
    removeStorage(storageKeys.authUser)
  }

  const login = async (email: string, password: string): Promise<void> => {
    const payload = await apiRequest<AuthResponse>('/api/auth/login', {
      body: JSON.stringify({ email, password }),
      method: 'POST',
    })
    rememberAuth(payload.token, payload.user)
    addAudit(`${payload.user.name} signed in`)
    toast.success('Signed in')
  }

  const registerUser = async (payload: RegisterPayload): Promise<void> => {
    const response = await apiRequest<AuthResponse>('/api/auth/register', {
      body: JSON.stringify(payload),
      method: 'POST',
    })
    rememberAuth(response.token, response.user)
    addAudit(`${response.user.name} registered`)
    toast.success('Account created')
  }

  const requestPasswordReset = async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiRequest<ForgotPasswordResponse>('/api/auth/forgot-password', {
      body: JSON.stringify({ email }),
      method: 'POST',
    })
    toast.success('Password reset requested')
    return response
  }

  const resetPassword = async (token: string, password: string, confirmPassword: string): Promise<string> => {
    const response = await apiRequest<{ message: string }>('/api/auth/reset-password', {
      body: JSON.stringify({ confirm_password: confirmPassword, password, token }),
      method: 'POST',
    })
    toast.success('Password reset')
    return response.message
  }

  const logout = async (): Promise<void> => {
    const token = authToken
    clearAuth()
    addAudit('Signed out')
    if (token) {
      try {
        await apiRequest<{ data: { logged_out: boolean } }>('/api/auth/logout', { method: 'POST' }, token)
      } catch {
        // Local session is cleared even if the backend is temporarily unavailable.
      }
    }
    toast.success('Signed out')
  }

  const updateAlertStatus = (alertId: string, status: AlertStatus): void => {
    const previousAlert = alerts.find((item) => item.id === alertId)
    const previousStatus = previousAlert?.status
    setAlerts((items) => items.map((alert) => (alert.id === alertId ? { ...alert, status } : alert)))
    addAudit(`${previousAlert?.title ?? 'Alert'} marked ${status}`)
    toast.custom(
      (toastItem) => (
        <div className="flex max-w-md items-center gap-3 rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 shadow-2xl shadow-black/40">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
          <span className="min-w-0 flex-1">Alert marked {status.toLowerCase()}.</span>
          {previousStatus ? (
            <button
              className="rounded-md border border-white/10 px-2 py-1 text-xs font-semibold text-zinc-200 hover:bg-white/8"
              onClick={() => {
                setAlerts((items) => items.map((alert) => (alert.id === alertId ? { ...alert, status: previousStatus } : alert)))
                addAudit(`${previousAlert?.title ?? 'Alert'} restored to ${previousStatus}`)
                toast.dismiss(toastItem.id)
              }}
              type="button"
            >
              Undo
            </button>
          ) : null}
        </div>
      ),
      { duration: 5000 },
    )
  }

  const updateActionItem = (id: string, patch: Partial<ActionItem>): void => {
    setActionItems((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    addAudit('Action item updated')
  }

  const updateSignalStatus = (signalId: string, status: SignalStatus): void => {
    setSignalStatuses((statuses) => ({ ...statuses, [signalId]: status }))
    addAudit(`Signal ${signalId} marked ${status}`)
    toast.success(`Signal marked ${status.toLowerCase()}`)
  }

  const toggleSignalSelection = (signalId: string): void => {
    setSelectedSignals((ids) => (ids.includes(signalId) ? ids.filter((id) => id !== signalId) : [...ids, signalId]))
  }

  const clearSignalSelection = (): void => setSelectedSignals([])

  const updatePreference = (channel: string, source: string, severity: AlertSeverity, patch: Partial<NotificationPreference>): void => {
    setPreferenceMatrix((matrix) => ({
      ...matrix,
      [channel]: {
        ...matrix[channel],
        [source]: {
          ...matrix[channel][source],
          [severity]: { ...matrix[channel][source][severity], ...patch },
        },
      },
    }))
  }

  const resetPreferences = (): void => {
    setPreferenceMatrix(buildDefaultPreferences())
    addAudit('Notification preferences reset to role defaults')
    toast.success('Notification preferences reset')
  }

  useEffect(() => {
    let mounted = true

    if (!authToken) {
      setAuthChecking(false)
      return () => {
        mounted = false
      }
    }

    setAuthChecking(true)
    apiRequest<{ user: AuthUser }>('/api/auth/me', { method: 'GET' }, authToken)
      .then((payload) => {
        if (!mounted) return
        setAuthUser(payload.user)
        writeStorage(storageKeys.authUser, payload.user)
      })
      .catch(() => {
        if (!mounted) return
        clearAuth()
      })
      .finally(() => {
        if (mounted) setAuthChecking(false)
      })

    return () => {
      mounted = false
    }
  }, [authToken])

  useEffect(() => writeStorage(storageKeys.alerts, alerts), [alerts])
  useEffect(() => writeStorage(storageKeys.actionItems, actionItems), [actionItems])
  useEffect(() => writeStorage(storageKeys.signalStatuses, signalStatuses), [signalStatuses])
  useEffect(() => writeStorage(storageKeys.preferences, preferenceMatrix), [preferenceMatrix])
  useEffect(() => writeStorage(storageKeys.auditEvents, auditEvents), [auditEvents])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setMoreOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const state = useMemo<AppState>(
    () => ({
      authChecking,
      authToken,
      authUser,
      alerts,
      actionItems,
      signalStatuses,
      selectedSignals,
      preferenceMatrix,
      auditEvents,
      updateAlertStatus,
      updateActionItem,
      updateSignalStatus,
      toggleSignalSelection,
      clearSignalSelection,
      updatePreference,
      resetPreferences,
      addAudit,
      login,
      logout,
      registerUser,
      requestPasswordReset,
      resetPassword,
    }),
    [actionItems, alerts, auditEvents, authChecking, authToken, authUser, preferenceMatrix, selectedSignals, signalStatuses],
  )

  const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].some((path) => location.pathname.startsWith(path))

  return (
    <AppContext.Provider value={state}>
      <div className={cn('min-h-screen overflow-x-hidden bg-[#050506] text-zinc-100', theme === 'light' && 'bg-[#f5f5f4] text-zinc-950')}>
        {!isAuthRoute && authUser ? (
          <TopNavigation
            moreOpen={moreOpen}
            onMoreChange={setMoreOpen}
            onSearchOpen={() => setSearchOpen(true)}
            onThemeToggle={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
            theme={theme}
          />
        ) : null}
        <Outlet />
        {!isAuthRoute && authUser && searchOpen ? <CommandPalette onClose={() => setSearchOpen(false)} /> : null}
      </div>
    </AppContext.Provider>
  )
}

const navItems: Array<{ label: string; to: string; icon: LucideIcon }> = [
  { label: 'Command Center', to: '/dashboard', icon: Activity },
  { label: 'Alerts', to: '/alerts', icon: Bell },
  { label: 'Signals', to: '/signals', icon: Inbox },
  { label: 'Customers', to: '/customers', icon: Building2 },
  { label: 'Projects', to: '/projects', icon: BriefcaseBusiness },
  { label: 'PMO', to: '/pmo', icon: ClipboardCheck },
  { label: 'Settings', to: '/settings', icon: Settings },
]

const TopNavigation = ({
  moreOpen,
  onMoreChange,
  onSearchOpen,
  onThemeToggle,
  theme,
}: {
  moreOpen: boolean
  onMoreChange: (open: boolean) => void
  onSearchOpen: () => void
  onThemeToggle: () => void
  theme: 'dark' | 'light'
}): JSX.Element => {
  const navigate = useNavigate()
  const { authUser, logout } = useAppState()
  const displayName = authUser?.name ?? 'Customer Health User'
  const email = authUser?.email ?? ''

  const handleLogout = async (): Promise<void> => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 flex min-h-12 max-w-full items-center gap-2 overflow-visible border-b border-white/10 bg-[#09090a]/96 px-2 backdrop-blur sm:px-3">
      <Link className="flex min-w-fit items-center gap-2 pr-2 text-sm font-bold text-white" to="/dashboard">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-100 text-xs font-black text-zinc-950">Tk</span>
        <span className="hidden leading-tight sm:block">
          Tkxel
          <br />
          Health
        </span>
      </Link>
      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => (
          <NavLink
            aria-label={item.label}
            className={({ isActive }) =>
              cn(
                'flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm text-zinc-400 transition hover:bg-white/8 hover:text-zinc-100',
                isActive && 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]',
              )
            }
            key={item.to}
            to={item.to}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{item.label}</span>
          </NavLink>
        ))}
        <div className="relative">
          <button
            aria-label="More navigation"
            aria-expanded={moreOpen}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm text-zinc-400 transition hover:bg-white/8 hover:text-white"
            onClick={() => onMoreChange(!moreOpen)}
            type="button"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">More</span>
          </button>
          {moreOpen ? (
            <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-white/12 bg-zinc-950 p-1 shadow-2xl shadow-black/40">
              {[
                { label: 'AE Account View', to: '/account', icon: BriefcaseBusiness },
                { label: 'Project Onboarding', to: '/onboarding', icon: Sparkles },
                { label: 'Audit Log', to: '/audit', icon: FileText },
              ].map((item) => (
                <Link
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/8 hover:text-white"
                  key={item.to}
                  onClick={() => onMoreChange(false)}
                  to={item.to}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </nav>
      <button
        aria-label="Open command palette"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 text-zinc-400 transition hover:bg-white/8 hover:text-white lg:hidden"
        onClick={onSearchOpen}
        type="button"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        className="hidden h-9 w-[17rem] shrink-0 items-center justify-between gap-2 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-zinc-400 transition hover:border-white/20 hover:text-zinc-200 lg:flex"
        onClick={onSearchOpen}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate whitespace-nowrap">Search projects, customers, alerts</span>
        </span>
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-zinc-300">⌘K</span>
      </button>
      <button className="grid h-9 w-9 place-items-center rounded-md text-zinc-400 hover:bg-white/8 hover:text-white" onClick={onThemeToggle} type="button" aria-label="Toggle theme">
        {theme === 'dark' ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
      </button>
      <div className="hidden min-w-0 items-center gap-2 border-l border-white/10 pl-2 md:flex">
        <div className="min-w-0 text-right">
          <p className="truncate text-xs font-semibold text-white">{displayName}</p>
          <p className="max-w-44 truncate text-xs text-zinc-500">{email}</p>
        </div>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-800 text-xs text-zinc-300">{getInitials(displayName)}</span>
      </div>
      <button className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-zinc-400 hover:bg-white/8 hover:text-white" onClick={() => void handleLogout()} type="button" aria-label="Log out">
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    </header>
  )
}

const authInputClass =
  'mt-1 h-11 w-full rounded-md border border-white/10 bg-black/35 px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10'

const AuthShell = ({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode
  description: string
  icon: LucideIcon
  title: string
}): JSX.Element => (
  <main className="grid min-h-screen max-w-full overflow-x-hidden bg-[#050506] px-4 py-6 text-zinc-100 lg:grid-cols-[minmax(0,1fr)_25rem] lg:px-8">
    <section className="mx-auto flex w-full max-w-xl flex-col justify-center py-8">
      <Link className="mb-8 flex w-fit items-center gap-2 text-sm font-bold text-white" to="/login">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-zinc-100 text-xs font-black text-zinc-950">Tk</span>
        Tkxel Customer Health
      </Link>
      <Panel className="overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <IconShell icon={Icon} className="text-emerald-200" />
          <h1 className="mt-4 text-2xl font-semibold text-white">{title}</h1>
          <p className="mt-2 text-sm text-zinc-500">{description}</p>
        </div>
        <div className="p-5">{children}</div>
      </Panel>
    </section>
    <aside className="hidden min-h-full items-center border-l border-white/10 pl-8 lg:flex">
      <div className="space-y-4">
        <Pill className="border-emerald-500/30 bg-emerald-500/12 text-emerald-100">Secure workspace</Pill>
        <h2 className="max-w-sm text-3xl font-semibold leading-tight text-white">Customer risk signals stay behind authenticated access.</h2>
        <div className="grid max-w-sm gap-3">
          {[
            ['Session protected', 'Bearer sessions expire automatically and can be revoked on logout.'],
            ['Password hardened', 'Passwords are stored as salted hashes in the backend.'],
            ['Role aware', 'Admin user controls are available only to admin accounts.'],
          ].map(([heading, copy]) => (
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={heading}>
              <p className="text-sm font-semibold text-zinc-100">{heading}</p>
              <p className="mt-1 text-sm text-zinc-500">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  </main>
)

const AuthNotice = ({ message, tone = 'error' }: { message: string; tone?: 'error' | 'success' }): JSX.Element => (
  <div
    aria-live="polite"
    className={cn(
      'rounded-md border px-3 py-2 text-sm',
      tone === 'error' ? 'border-rose-500/30 bg-rose-500/12 text-rose-100' : 'border-emerald-500/30 bg-emerald-500/12 text-emerald-100',
    )}
  >
    {message}
  </div>
)

const LoadingButtonContent = ({ icon: Icon, loading, text }: { icon: LucideIcon; loading: boolean; text: string }): JSX.Element => (
  <>
    {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
    {text}
  </>
)

const PasswordStrength = ({ password }: { password: string }): JSX.Element => (
  <div className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-3 sm:grid-cols-2">
    {passwordRuleState(password).map((rule) => (
      <span className={cn('flex items-center gap-2 text-xs', rule.met ? 'text-emerald-200' : 'text-zinc-500')} key={rule.label}>
        {rule.met ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Circle className="h-3.5 w-3.5" aria-hidden="true" />}
        {rule.label}
      </span>
    ))}
  </div>
)

const RequireAuth = ({ children }: { children: ReactNode }): JSX.Element => {
  const { authChecking, authUser } = useAppState()
  const location = useLocation()
  if (authChecking) return <AuthLoadingScreen />
  if (!authUser) return <Navigate replace to={`/login?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`} />
  return <>{children}</>
}

const AuthLoadingScreen = (): JSX.Element => (
  <main className="grid min-h-screen place-items-center bg-[#050506] px-4 text-zinc-100">
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-950/86 px-4 py-3 text-sm text-zinc-300">
      <Loader2 className="h-4 w-4 animate-spin text-emerald-200" aria-hidden="true" />
      Checking session
    </div>
  </main>
)

const LoginPage = (): JSX.Element => {
  const { authUser, login } = useAppState()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nextPath = sanitizeNextPath(searchParams.get('next'))

  if (authUser) return <Navigate replace to={nextPath} />

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate(nextPath, { replace: true })
    } catch (err) {
      setError(messageFromError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell description="Sign in to view health scores, customer risks, alerts, and recommendations." icon={LogIn} title="Sign in">
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        {error ? <AuthNotice message={error} /> : null}
        <label className="block text-sm font-medium text-zinc-400">
          Email
          <input autoComplete="email" className={authInputClass} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} placeholder="admin@customerhealth.test" type="email" value={form.email} />
        </label>
        <label className="block text-sm font-medium text-zinc-400">
          Password
          <input autoComplete="current-password" className={authInputClass} onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))} type="password" value={form.password} />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm font-semibold text-zinc-300 hover:text-white" to="/forgot-password">Forgot password?</Link>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
            <LoadingButtonContent icon={LogIn} loading={loading} text="Login" />
          </button>
        </div>
        <p className="border-t border-white/10 pt-4 text-sm text-zinc-500">
          Need access? <Link className="font-semibold text-zinc-200 hover:text-white" to="/register">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  )
}

const RegisterPage = (): JSX.Element => {
  const { authUser, registerUser } = useAppState()
  const navigate = useNavigate()
  const [form, setForm] = useState({ confirm_password: '', email: '', full_name: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (authUser) return <Navigate replace to="/dashboard" />

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError('')
    if (!form.full_name.trim() || !form.email.trim() || !form.password || !form.confirm_password) {
      setError('All fields are required.')
      return
    }
    if (passwordRuleState(form.password).some((rule) => !rule.met)) {
      setError('Password does not meet the strength requirements.')
      return
    }
    if (form.password !== form.confirm_password) {
      setError('Password confirmation does not match.')
      return
    }
    setLoading(true)
    try {
      await registerUser({ ...form, email: form.email.trim(), full_name: form.full_name.trim() })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(messageFromError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell description="Create a viewer account for the Customer Health workspace." icon={UserPlus} title="Create account">
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        {error ? <AuthNotice message={error} /> : null}
        <label className="block text-sm font-medium text-zinc-400">
          Full name
          <input autoComplete="name" className={authInputClass} onChange={(event) => setForm((value) => ({ ...value, full_name: event.target.value }))} value={form.full_name} />
        </label>
        <label className="block text-sm font-medium text-zinc-400">
          Email
          <input autoComplete="email" className={authInputClass} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} type="email" value={form.email} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-400">
            Password
            <input autoComplete="new-password" className={authInputClass} onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))} type="password" value={form.password} />
          </label>
          <label className="block text-sm font-medium text-zinc-400">
            Confirm password
            <input autoComplete="new-password" className={authInputClass} onChange={(event) => setForm((value) => ({ ...value, confirm_password: event.target.value }))} type="password" value={form.confirm_password} />
          </label>
        </div>
        <PasswordStrength password={form.password} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm font-semibold text-zinc-300 hover:text-white" to="/login">Back to login</Link>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
            <LoadingButtonContent icon={UserPlus} loading={loading} text="Register" />
          </button>
        </div>
      </form>
    </AuthShell>
  )
}

const ForgotPasswordPage = (): JSX.Element => {
  const { requestPasswordReset } = useAppState()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ForgotPasswordResponse | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError('')
    setResult(null)
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    setLoading(true)
    try {
      setResult(await requestPasswordReset(email.trim()))
    } catch (err) {
      setError(messageFromError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell description="Request a password reset link for your Customer Health account." icon={Mail} title="Forgot password">
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        {error ? <AuthNotice message={error} /> : null}
        {result ? (
          <div className="space-y-3">
            <AuthNotice message={result.message} tone="success" />
            {result.reset_url ? (
              <a className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" href={result.reset_url}>
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                Open local reset link
              </a>
            ) : null}
          </div>
        ) : null}
        <label className="block text-sm font-medium text-zinc-400">
          Email
          <input autoComplete="email" className={authInputClass} onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm font-semibold text-zinc-300 hover:text-white" to="/login">Back to login</Link>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
            <LoadingButtonContent icon={Mail} loading={loading} text="Send reset link" />
          </button>
        </div>
      </form>
    </AuthShell>
  )
}

const ResetPasswordPage = (): JSX.Element => {
  const { resetPassword } = useAppState()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ confirmPassword: '', password: '', token: searchParams.get('token') ?? '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!form.token.trim() || !form.password || !form.confirmPassword) {
      setError('Reset token and new password are required.')
      return
    }
    if (passwordRuleState(form.password).some((rule) => !rule.met)) {
      setError('Password does not meet the strength requirements.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Password confirmation does not match.')
      return
    }
    setLoading(true)
    try {
      setMessage(await resetPassword(form.token.trim(), form.password, form.confirmPassword))
    } catch (err) {
      setError(messageFromError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell description="Set a new password with your reset token." icon={KeyRound} title="Reset password">
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        {error ? <AuthNotice message={error} /> : null}
        {message ? <AuthNotice message={message} tone="success" /> : null}
        <label className="block text-sm font-medium text-zinc-400">
          Reset token
          <input className={authInputClass} onChange={(event) => setForm((value) => ({ ...value, token: event.target.value }))} value={form.token} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-400">
            New password
            <input autoComplete="new-password" className={authInputClass} onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))} type="password" value={form.password} />
          </label>
          <label className="block text-sm font-medium text-zinc-400">
            Confirm password
            <input autoComplete="new-password" className={authInputClass} onChange={(event) => setForm((value) => ({ ...value, confirmPassword: event.target.value }))} type="password" value={form.confirmPassword} />
          </label>
        </div>
        <PasswordStrength password={form.password} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm font-semibold text-zinc-300 hover:text-white" to="/login">Back to login</Link>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
            <LoadingButtonContent icon={KeyRound} loading={loading} text="Reset password" />
          </button>
        </div>
      </form>
    </AuthShell>
  )
}

const CommandPalette = ({ onClose }: { onClose: () => void }): JSX.Element => {
  const navigate = useNavigate()
  const { alerts } = useAppState()
  const [query, setQuery] = useState('')

  const groups = useMemo(
    () => [
      {
        label: 'Projects',
        items: projects.map((project) => ({
          id: project.id,
          title: project.name,
          meta: String(project.health),
          icon: Gauge,
          to: `/dashboard?project=${project.id}`,
        })),
      },
      {
        label: 'Customers',
        items: customers.map((customer) => ({
          id: customer.id,
          title: customer.name,
          meta: customer.tier,
          icon: Building2,
          to: `/customers/${customer.id}`,
        })),
      },
      {
        label: 'Alerts',
        items: alerts.map((alert) => ({
          id: alert.id,
          title: alert.title,
          meta: alert.severity,
          icon: AlertTriangle,
          to: `/alerts/${alert.id}`,
        })),
      },
      {
        label: 'Views',
        items: navItems.map((item) => ({
          id: item.to,
          title: item.label,
          meta: 'View',
          icon: item.icon,
          to: item.to,
        })),
      },
    ],
    [alerts],
  )

  const normalized = query.trim().toLowerCase()
  const tokens = normalized.split(/\s+/).filter(Boolean)
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => tokens.length === 0 || tokens.every((token) => `${item.title} ${item.meta}`.toLowerCase().includes(token))),
    }))
    .filter((group) => group.items.length > 0)
  const firstResult = filteredGroups[0]?.items[0]

  const goTo = (to: string): void => {
    onClose()
    navigate(to)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-3 py-[18vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-white/15 bg-[#0b0b0d] shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 border-b border-white/10 px-3">
          <Search className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          <input
            aria-label="Search projects, customers, alerts, and views"
            autoFocus
            className="h-12 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && firstResult) goTo(firstResult.to)
              if (event.key === 'Escape') onClose()
            }}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to a project, customer, or alert..."
            value={query}
          />
          <button aria-label="Close search" className="grid h-8 w-8 place-items-center rounded-md text-zinc-500 hover:bg-white/8 hover:text-white" onClick={onClose} type="button">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[24rem] overflow-y-auto p-2">
          {filteredGroups.length === 0 ? <EmptyState title="No matches" message="Try a project, customer, alert, or view name." /> : null}
          {filteredGroups.map((group) => (
            <div className="mb-2" key={group.label}>
              <p className="px-2 py-1 text-xs font-semibold text-zinc-500">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm text-zinc-300 hover:bg-white/8 hover:text-white"
                    key={item.id}
                    onClick={() => goTo(item.to)}
                    type="button"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <item.icon className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
                      <span className="truncate">{item.title}</span>
                    </span>
                    <span className="shrink-0 rounded border border-white/10 px-2 py-0.5 text-xs text-zinc-400">{item.meta}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const DashboardPage = (): JSX.Element => {
  const { alerts, actionItems, updateAlertStatus } = useAppState()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<'risk' | 'recent' | 'customer'>('risk')
  const [filterOpen, setFilterOpen] = useState(false)
  const [stageFilter, setStageFilter] = useState('all')
  const [explanationOpen, setExplanationOpen] = useState(false)

  const selectedProjectId = projects.some((project) => project.id === searchParams.get('project')) ? searchParams.get('project')! : 'kestrel-compliance'
  const selectedProject = getProject(selectedProjectId)
  const selectedCustomer = getCustomer(selectedProject.customerId)
  const projectAlerts = alerts.filter((alert) => alert.projectId === selectedProject.id && alert.status !== 'Resolved')
  const projectActions = actionItems.filter((item) => item.projectId === selectedProject.id && item.status !== 'Done')

  const visibleProjects = projects
    .filter((project) => `${project.name} ${getCustomer(project.customerId).name}`.toLowerCase().includes(query.toLowerCase()))
    .filter((project) => stageFilter === 'all' || project.stage === stageFilter)
    .sort((a, b) => {
      if (sortMode === 'recent') return a.lastActivity.localeCompare(b.lastActivity)
      if (sortMode === 'customer') return getCustomer(a.customerId).name.localeCompare(getCustomer(b.customerId).name)
      return a.health - b.health
    })

  const counts = {
    amber: projects.filter((project) => healthBand(project.health) === 'amber').length,
    red: projects.filter((project) => healthBand(project.health) === 'red').length,
    green: projects.filter((project) => healthBand(project.health) === 'green').length,
  }

  const selectProject = (projectId: string): void => setSearchParams({ project: projectId })

  return (
    <main className="grid min-h-[calc(100vh-3rem)] max-w-full overflow-x-hidden lg:grid-cols-[22.5rem_1fr]">
      <aside className="flex max-w-full flex-col border-b border-white/10 bg-[#080809] lg:min-h-[calc(100vh-3rem)] lg:border-b-0 lg:border-r">
        <div className="border-b border-white/10 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Command Center</h2>
              <p className="text-sm text-zinc-500">Risk-ranked PD portfolio</p>
            </div>
            <button aria-label="Open filters" className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-zinc-400 hover:bg-white/8 hover:text-white" onClick={() => setFilterOpen((open) => !open)} type="button">
              <Filter className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <label className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
              <Search className="h-4 w-4" aria-hidden="true" />
              <input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-zinc-500" onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" value={query} />
            </label>
            <select className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-zinc-200 outline-none" onChange={(event) => setSortMode(event.target.value as typeof sortMode)} value={sortMode}>
              <option value="risk">Risk</option>
              <option value="recent">Recent</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          {filterOpen ? (
            <div className="mt-3 rounded-lg border border-white/10 bg-zinc-950 p-3">
              <p className="text-xs font-semibold text-zinc-400">Stage</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {['all', 'delivery', 'discovery', 'hypercare', 'managed service'].map((stage) => (
                  <button
                    className={cn('rounded-md border px-2 py-1.5 text-xs capitalize', stageFilter === stage ? 'border-emerald-400/40 bg-emerald-400/12 text-emerald-100' : 'border-white/10 text-zinc-400 hover:bg-white/8')}
                    key={stage}
                    onClick={() => setStageFilter(stage)}
                    type="button"
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {visibleProjects.map((project) => (
            <button
              className={cn('flex w-full items-start justify-between gap-3 border-b border-white/10 px-3 py-3 text-left transition hover:bg-white/[0.04]', project.id === selectedProject.id && 'bg-white/[0.08]')}
              key={project.id}
              onClick={() => selectProject(project.id)}
              type="button"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-zinc-100">{project.name}</span>
                <span className="mt-1 block truncate text-xs text-zinc-500">{getCustomer(project.customerId).name}</span>
                <span className={cn('mt-1 flex items-center gap-2 text-xs', project.trend === 'up' ? 'text-emerald-300' : project.trend === 'down' ? 'text-rose-300' : 'text-zinc-400')}>
                  {trendSymbol(project.trend)}
                  <span className="text-zinc-500">{project.lastActivity}</span>
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-2">
                <Pill className={scoreClasses(project.health)}>{project.health}</Pill>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Bell className="h-3 w-3" aria-hidden="true" />
                  {project.openAlerts}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-white/10 p-3">
          {[
            ['Amber', counts.amber, 'text-amber-200'],
            ['Red', counts.red, 'text-rose-200'],
            ['Green', counts.green, 'text-emerald-200'],
          ].map(([label, count, color]) => (
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={label}>
              <p className={cn('text-lg font-semibold', color as string)}>{count}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </aside>
      <section className="min-w-0 overflow-hidden p-4 lg:p-6">
        <div className="grid gap-5 xl:grid-cols-[1fr_19rem]">
              <div className="min-w-0 space-y-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_19rem]">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  <span>{selectedProject.stage}</span>
                  <span>/</span>
                  <Link className="text-zinc-300 hover:text-white" to={`/customers/${selectedCustomer.id}`}>
                    {selectedCustomer.name}
                  </Link>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <h1 className="mt-2 text-2xl font-semibold text-white">{selectedProject.name}</h1>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-400">
                  <Pill className="border-white/10 bg-white/[0.035] text-zinc-300">PD: {selectedProject.pd}</Pill>
                  <Pill className="border-white/10 bg-white/[0.035] text-zinc-300">PM: {selectedProject.pm}</Pill>
                  <Pill className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100">{selectedProject.sourceCoverage.length} of 6 sources active</Pill>
                </div>
              </div>
              <Panel className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-zinc-400">Health</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-4xl font-semibold text-white">{selectedProject.health}</span>
                      <Pill className={scoreClasses(selectedProject.health)}>{selectedProject.health}</Pill>
                    </div>
                  </div>
                  <div className="w-36 text-rose-300">
                    <Sparkline score={selectedProject.health} trend={selectedProject.trend} />
                  </div>
                </div>
              </Panel>
            </div>
            <Panel>
              <SectionHeader
                action={
                  <button className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/8" onClick={() => setExplanationOpen(true)} type="button">
                    Explain score
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                }
                description="Plain-language drivers behind the current score."
                title="Top contributors"
              />
              <ul className="divide-y divide-white/10">
                {selectedProject.contributors.map((contributor) => (
                  <li className="px-4 py-4 text-sm leading-6 text-zinc-300" key={contributor}>{contributor}</li>
                ))}
              </ul>
            </Panel>
            <Panel>
              <SectionHeader
                action={
                  <Link className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/8" to={`/signals?project=${selectedProject.id}`}>
                    See all signals
                  </Link>
                }
                description="Most recent first, scoped to this project."
                title="Recent alerts"
              />
              <div className="space-y-3 p-3">
                {projectAlerts.length === 0 ? <EmptyState title="No open alerts" message="This project has no unresolved alerts." /> : null}
                {projectAlerts.map((alert) => (
                  <AlertCard alert={alert} compact key={alert.id} onPrimary={() => updateAlertStatus(alert.id, 'Resolved')} primaryLabel="Resolve" />
                ))}
              </div>
            </Panel>
            <Panel>
              <SectionHeader title="Open action items" />
              <div className="divide-y divide-white/10">
                {projectActions.map((item) => (
                  <div className="grid gap-3 px-4 py-4 sm:grid-cols-[auto_1fr_auto_auto]" key={item.id}>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs text-zinc-300">{item.owner.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                      <p className="text-sm text-zinc-500">{item.owner}</p>
                    </div>
                    <p className="text-sm text-zinc-400">{item.dueDate.replace('2026-', '').replace('-', '/')}</p>
                    <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{item.status}</Pill>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
          <aside className="space-y-5">
            <Panel className="p-4">
              <p className="text-sm font-semibold text-zinc-100">{selectedProject.sourceCoverage.length} of 6 sources active</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {sourceCatalog.map((source) => {
                  const active = selectedProject.sourceCoverage.includes(source.id)
                  return (
                    <Pill className={active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100' : 'border-white/10 bg-white/[0.035] text-zinc-500'} key={source.id}>
                      <source.icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {source.label}
                    </Pill>
                  )
                })}
              </div>
            </Panel>
            <Panel className="p-4">
              <h2 className="text-base font-semibold text-white">Customer aggregate</h2>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-4xl font-semibold text-white">{selectedCustomer.aggregateHealth}</p>
                  <p className="mt-1 text-sm text-zinc-500">{selectedCustomer.tier} account</p>
                </div>
                <Pill className={scoreClasses(selectedCustomer.aggregateHealth)}>{selectedCustomer.aggregateHealth}</Pill>
              </div>
              <p className="mt-5 text-sm text-zinc-400">
                Renews in <span className="font-semibold text-zinc-100">{selectedCustomer.renewalDays} days</span> with {selectedCustomer.aeOwner}.
              </p>
            </Panel>
          </aside>
        </div>
      </section>
      {explanationOpen ? <ScoreExplanationModal alerts={projectAlerts} customer={selectedCustomer} onClose={() => setExplanationOpen(false)} project={selectedProject} /> : null}
    </main>
  )
}

const ScoreExplanationModal = ({
  alerts,
  customer,
  onClose,
  project,
}: {
  alerts: AlertItem[]
  customer: Customer
  onClose: () => void
  project: Project
}): JSX.Element => {
  const componentScores = [
    { label: 'Delivery confidence', score: project.health, weight: 35, detail: `${project.status} project with ${project.openAlerts} tracked alert(s).` },
    { label: 'Relationship sentiment', score: project.trend === 'down' ? 38 : project.trend === 'up' ? 82 : 62, weight: 25, detail: `${alerts.filter((alert) => alert.concern.toLowerCase().includes('relationship')).length} relationship signal(s) in the active set.` },
    { label: 'Source coverage', score: Math.round((project.sourceCoverage.length / sourceCatalog.length) * 100), weight: 20, detail: `${project.sourceCoverage.length} of ${sourceCatalog.length} configured sources are active.` },
    { label: 'Commercial timing', score: customer.renewalDays <= 30 ? 34 : customer.renewalDays <= 90 ? 62 : 82, weight: 20, detail: `${customer.renewalDays} day(s) until renewal with ${customer.aeOwner}.` },
  ]
  const nextAction =
    project.health < 40
      ? 'Open a PMO recovery brief, confirm owner/date for each action, and send a client-visible commitment reset.'
      : project.health < 70
        ? 'Keep the project on watch, validate open action owners, and confirm the next stakeholder checkpoint.'
        : 'Maintain monitoring cadence and keep source coverage active.'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-3 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="score-explanation-title">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-white/15 bg-[#0b0b0d] shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
          <div>
            <p className="text-sm font-semibold text-emerald-200">Score explanation</p>
            <h2 className="mt-1 text-xl font-semibold text-white" id="score-explanation-title">{project.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">Transparent score inputs, weights, and recommended response.</p>
          </div>
          <button aria-label="Close score explanation" className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-zinc-500 hover:bg-white/8 hover:text-white" onClick={onClose} type="button">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-[16rem_1fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <p className="text-sm text-zinc-500">Current health</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-5xl font-semibold text-white">{project.health}</span>
              <Pill className={scoreClasses(project.health)}>{healthBand(project.health)}</Pill>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              The score is anchored by active alert pressure, source coverage, delivery status, and renewal timing.
            </p>
          </div>
          <div className="space-y-3">
            {componentScores.map((component) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={component.label}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{component.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">Weight {component.weight}%</p>
                  </div>
                  <Pill className={scoreClasses(component.score)}>{component.score}</Pill>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-300" style={{ width: `${component.score}%` }} />
                </div>
                <p className="mt-2 text-sm text-zinc-400">{component.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 p-4">
          <p className="text-sm font-semibold text-white">Top evidence</p>
          <ul className="mt-3 space-y-2">
            {project.contributors.map((contributor) => (
              <li className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm leading-6 text-zinc-300" key={contributor}>{contributor}</li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm font-semibold text-emerald-100">Recommended next action</p>
            <p className="mt-2 text-sm leading-6 text-emerald-50/85">{nextAction}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const AlertCard = ({
  alert,
  compact,
  onPrimary,
  primaryLabel,
}: {
  alert: AlertItem
  compact?: boolean
  onPrimary?: () => void
  primaryLabel?: string
}): JSX.Element => {
  const source = sourceMeta(alert.source)
  const SourceIcon = source.icon

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.035] p-3 transition hover:border-white/20">
      <div className="flex flex-wrap items-center gap-2">
        <Pill className={severityClasses(alert.severity)}>{alert.severity}</Pill>
        <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{alert.concern}</Pill>
        <Pill className="border-white/10 bg-white/[0.04] text-zinc-400">
          <SourceIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {source.label}
        </Pill>
        <span className="text-xs text-zinc-500">{alert.age}</span>
        <Pill className="border-white/10 bg-white/[0.04] text-zinc-400">{alert.status}</Pill>
      </div>
      <div className={cn('mt-3 grid gap-3', compact ? 'sm:grid-cols-[1fr_auto_auto]' : 'sm:grid-cols-[1fr_auto]')}>
        <Link className="min-w-0 hover:text-white" to={`/alerts/${alert.id}`}>
          <h3 className="font-semibold text-zinc-100">{alert.title}</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-400">{alert.summary}</p>
        </Link>
        {onPrimary ? (
          <button className="self-start rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={onPrimary} type="button">
            {primaryLabel}
          </button>
        ) : null}
        <Link aria-label="Open alert detail" className="grid h-10 w-10 place-items-center rounded-md text-zinc-400 hover:bg-white/8 hover:text-white" to={`/alerts/${alert.id}`}>
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

const AlertsPage = (): JSX.Element => {
  const { alerts, updateAlertStatus } = useAppState()
  const [tab, setTab] = useState<'Open' | 'Resolved'>('Open')
  const [projectFilter, setProjectFilter] = useState('all')
  const [filtersVisible, setFiltersVisible] = useState(false)

  const projectButtons = ['all', 'northstar-mobile', 'brightline-driver']
  const filteredAlerts = alerts
    .filter((alert) => (tab === 'Resolved' ? alert.status === 'Resolved' : alert.status !== 'Resolved'))
    .filter((alert) => projectFilter === 'all' || alert.projectId === projectFilter)

  return (
    <main className="grid max-w-full gap-5 overflow-x-hidden p-4 lg:grid-cols-[1fr_19rem] lg:p-6">
      <section className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">PM Alert Feed</h1>
            <p className="mt-1 text-sm text-zinc-500">Daily-driver view for Sarah Khan, scoped to active projects.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={() => setFiltersVisible((visible) => !visible)} type="button">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
          </button>
        </div>
        {filtersVisible ? (
          <Panel className="p-3">
            <div className="flex flex-wrap gap-2">
              {projectButtons.map((projectId) => (
                <button
                  className={cn('rounded-md border px-3 py-2 text-sm', projectFilter === projectId ? 'border-emerald-400/40 bg-emerald-400/12 text-emerald-100' : 'border-white/10 text-zinc-400 hover:bg-white/8')}
                  key={projectId}
                  onClick={() => setProjectFilter(projectId)}
                  type="button"
                >
                  {projectId === 'all' ? 'All projects' : getProject(projectId).name}
                </button>
              ))}
            </div>
          </Panel>
        ) : null}
        <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-1">
          {(['Open', 'Resolved'] as const).map((value) => (
            <button className={cn('rounded-md px-4 py-2 text-sm font-semibold', tab === value ? 'bg-white/12 text-white' : 'text-zinc-500 hover:text-zinc-200')} key={value} onClick={() => setTab(value)} type="button">
              {value}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? <EmptyState title="No alerts in this view" message="Change filters or tab to see other alerts." /> : null}
          {filteredAlerts.map((alert) => (
            <AlertCard
              alert={alert}
              key={alert.id}
              onPrimary={() => updateAlertStatus(alert.id, alert.status === 'New' ? 'Acknowledged' : 'Resolved')}
              primaryLabel={alert.status === 'New' ? 'Acknowledge' : 'Resolve'}
            />
          ))}
        </div>
      </section>
      <aside className="space-y-5">
        <Panel className="p-4">
          <h2 className="text-base font-semibold text-white">Today</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <p className="text-2xl font-semibold text-white">{alerts.filter((alert) => alert.status !== 'Resolved').length}</p>
              <p className="text-sm text-zinc-500">Open alerts</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <p className="text-2xl font-semibold text-white">{new Set(alerts.map((alert) => alert.projectId)).size}</p>
              <p className="text-sm text-zinc-500">Projects</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-semibold text-zinc-100">Next best actions</p>
          <div className="mt-3 space-y-2">
            {['Call Northstar VP', 'Check Brightline invoice context', 'Publish scope memo'].map((action) => (
              <div className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-300" key={action}>{action}</div>
            ))}
          </div>
        </Panel>
      </aside>
    </main>
  )
}

const SignalsPage = (): JSX.Element => {
  const { selectedSignals, signalStatuses, toggleSignalSelection, clearSignalSelection, updateSignalStatus } = useAppState()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<SourceId | 'all'>('all')
  const [sentimentFilter, setSentimentFilter] = useState<SignalSentiment | 'all'>('all')
  const projectParam = searchParams.get('project')

  const visibleSignals = seedSignals
    .map((signal) => ({ ...signal, status: signalStatuses[signal.id] ?? signal.status }))
    .filter((signal) => !projectParam || signal.projectId === projectParam)
    .filter((signal) => sourceFilter === 'all' || signal.source === sourceFilter)
    .filter((signal) => sentimentFilter === 'all' || signal.sentiment === sentimentFilter)
    .filter((signal) => `${signal.summary} ${signal.sender} ${getCustomer(signal.customerId).name} ${getProject(signal.projectId).name}`.toLowerCase().includes(query.toLowerCase()))

  const linkSelected = (): void => {
    selectedSignals.forEach((signalId) => updateSignalStatus(signalId, 'Linked'))
    clearSignalSelection()
  }

  return (
    <main className="max-w-full space-y-5 overflow-x-hidden p-4 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Signal Inbox</h1>
          <p className="mt-1 text-sm text-zinc-500">PMO triage surface for raw signals before or after they become alerts.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-45" disabled={selectedSignals.length === 0} onClick={linkSelected} type="button">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Link selected to alert
        </button>
      </div>
      <Panel className="p-3">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto]">
          <label className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
            <Search className="h-4 w-4" aria-hidden="true" />
            <input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-zinc-500" onChange={(event) => setQuery(event.target.value)} placeholder="Search signals" value={query} />
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterButton active={sourceFilter === 'all'} label="All" onClick={() => setSourceFilter('all')} />
            {sourceCatalog.map((source) => (
              <FilterButton active={sourceFilter === source.id} key={source.id} label={source.label} onClick={() => setSourceFilter(source.id)} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'negative', 'neutral', 'positive'] as const).map((sentiment) => (
              <FilterButton active={sentimentFilter === sentiment} key={sentiment} label={sentiment === 'all' ? 'All' : sentiment[0].toUpperCase() + sentiment.slice(1)} onClick={() => setSentimentFilter(sentiment)} />
            ))}
          </div>
        </div>
      </Panel>
      <Panel className="overflow-hidden">
        <div className="space-y-3 p-3 md:hidden">
          {visibleSignals.map((signal) => {
            const source = sourceMeta(signal.source)
            const selected = selectedSignals.includes(signal.id)
            return (
              <article className={cn('rounded-lg border border-white/10 bg-white/[0.035] p-3', selected && 'border-emerald-400/30 bg-emerald-400/8')} key={signal.id}>
                <div className="flex items-start gap-3">
                  <input checked={selected} className="mt-1 h-4 w-4 shrink-0 accent-emerald-400" onChange={() => toggleSignalSelection(signal.id)} type="checkbox" aria-label={`Select signal from ${getCustomer(signal.customerId).name}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">
                        <source.icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {source.label}
                      </Pill>
                      <Pill className={signal.sentiment === 'negative' ? 'border-rose-500/35 bg-rose-500/12 text-rose-100' : signal.sentiment === 'positive' ? 'border-emerald-500/35 bg-emerald-500/12 text-emerald-100' : 'border-zinc-500/35 bg-zinc-500/12 text-zinc-200'}>
                        {signal.sentiment}
                      </Pill>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-zinc-100">{getCustomer(signal.customerId).name}</p>
                    <p className="mt-1 truncate text-xs text-zinc-500">{getProject(signal.projectId).name}</p>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">{signal.summary}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span>{signal.timestamp}</span>
                      <span>{signal.concern}</span>
                      <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{signal.status}</Pill>
                    </div>
                    <div className="mt-3 flex gap-1">
                      <IconAction label="Mark valid" icon={Check} onClick={() => updateSignalStatus(signal.id, 'Valid')} />
                      <IconAction label="Link" icon={ExternalLink} onClick={() => updateSignalStatus(signal.id, 'Linked')} />
                      <IconAction label="Dismiss" icon={X} onClick={() => updateSignalStatus(signal.id, 'Dismissed')} />
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[72rem] w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs text-zinc-500">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Customer / project</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">AI summary</th>
                <th className="px-4 py-3">Sentiment</th>
                <th className="px-4 py-3">Concern</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {visibleSignals.map((signal) => {
                const source = sourceMeta(signal.source)
                const selected = selectedSignals.includes(signal.id)
                return (
                  <tr className={cn('align-top hover:bg-white/[0.035]', selected && 'bg-emerald-400/8')} key={signal.id}>
                    <td className="px-4 py-4 text-zinc-400">
                      <label className="flex items-center gap-2">
                        <input checked={selected} className="h-4 w-4 accent-emerald-400" onChange={() => toggleSignalSelection(signal.id)} type="checkbox" />
                        {signal.timestamp}
                      </label>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-zinc-100">{getCustomer(signal.customerId).name}</p>
                      <p className="text-zinc-500">{getProject(signal.projectId).name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">
                        <source.icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {source.label}
                      </Pill>
                    </td>
                    <td className="px-4 py-4 text-zinc-400">{signal.sender}</td>
                    <td className="max-w-md px-4 py-4 text-zinc-300">{signal.summary}</td>
                    <td className="px-4 py-4">
                      <Pill className={signal.sentiment === 'negative' ? 'border-rose-500/35 bg-rose-500/12 text-rose-100' : signal.sentiment === 'positive' ? 'border-emerald-500/35 bg-emerald-500/12 text-emerald-100' : 'border-zinc-500/35 bg-zinc-500/12 text-zinc-200'}>
                        {signal.sentiment}
                      </Pill>
                    </td>
                    <td className="px-4 py-4 text-zinc-300">{signal.concern}</td>
                    <td className="px-4 py-4">
                      <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{signal.status}</Pill>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <IconAction label="Mark valid" icon={Check} onClick={() => updateSignalStatus(signal.id, 'Valid')} />
                        <IconAction label="Link" icon={ExternalLink} onClick={() => updateSignalStatus(signal.id, 'Linked')} />
                        <IconAction label="Dismiss" icon={X} onClick={() => updateSignalStatus(signal.id, 'Dismissed')} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </main>
  )
}

const FilterButton = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }): JSX.Element => (
  <button className={cn('h-10 rounded-md border px-3 text-sm', active ? 'border-emerald-400/40 bg-emerald-400/12 text-emerald-100' : 'border-white/10 text-zinc-400 hover:bg-white/8')} onClick={onClick} type="button">
    {label}
  </button>
)

const IconAction = ({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }): JSX.Element => (
  <button aria-label={label} className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-zinc-400 hover:bg-white/8 hover:text-white" onClick={onClick} title={label} type="button">
    <Icon className="h-4 w-4" aria-hidden="true" />
  </button>
)

const CustomersPage = (): JSX.Element => {
  const { alerts } = useAppState()
  const [query, setQuery] = useState('')
  const rows = customers.filter((customer) => `${customer.name} ${customer.aeOwner} ${customer.tier}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <main className="max-w-full space-y-5 overflow-x-hidden p-4 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Customers</h1>
          <p className="mt-1 text-sm text-zinc-500">Account-level health with project-level truth underneath.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8"
          onClick={() =>
            downloadCsv(
              'customer-health-portfolio.csv',
              rows.map((customer) => ({
                customer: customer.name,
                tier: customer.tier,
                health: customer.aggregateHealth,
                trend: customer.trend,
                aeOwner: customer.aeOwner,
                renewalDays: customer.renewalDays,
                openAlerts: alerts.filter((alert) => alert.customerId === customer.id && alert.status !== 'Resolved').length,
              })),
            )
          }
          type="button"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </button>
      </div>
      <label className="flex h-10 max-w-md items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
        <Search className="h-4 w-4" aria-hidden="true" />
        <input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-zinc-500" onChange={(event) => setQuery(event.target.value)} placeholder="Search customers" value={query} />
      </label>
      <Panel className="overflow-hidden">
        <div className="space-y-3 p-3 md:hidden">
          {rows.map((customer) => {
            const customerProjects = projects.filter((project) => project.customerId === customer.id)
            const openAlerts = alerts.filter((alert) => alert.customerId === customer.id && alert.status !== 'Resolved').length
            return (
              <article className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={customer.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link className="font-semibold text-zinc-100 hover:text-white" to={`/customers/${customer.id}`}>{customer.name}</Link>
                    <p className="mt-1 text-sm text-zinc-500">{customer.industry} / {customer.aeOwner}</p>
                  </div>
                  <Pill className={scoreClasses(customer.aggregateHealth)}>{customer.aggregateHealth}</Pill>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Metric label="Renewal" value={`${customer.renewalDays}d`} />
                  <Metric label="Projects" value={customerProjects.length} />
                  <Metric label="Alerts" value={openAlerts} />
                </div>
                <Link className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white" to={`/customers/${customer.id}`}>
                  Open account <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            )
          })}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[64rem] w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs text-zinc-500">
              <tr>
                {['Customer', 'Tier', 'Aggregate health', 'Trend', 'AE owner', 'Renewal', 'Projects', 'Open alerts', 'Open'].map((heading) => (
                  <th className="px-4 py-3" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((customer) => {
                const customerProjects = projects.filter((project) => project.customerId === customer.id)
                const openAlerts = alerts.filter((alert) => alert.customerId === customer.id && alert.status !== 'Resolved').length
                return (
                  <tr className="hover:bg-white/[0.035]" key={customer.id}>
                    <td className="px-4 py-4">
                      <Link className="font-semibold text-zinc-100 hover:text-white" to={`/customers/${customer.id}`}>{customer.name}</Link>
                    </td>
                    <td className="px-4 py-4"><Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{customer.tier}</Pill></td>
                    <td className="px-4 py-4"><Pill className={scoreClasses(customer.aggregateHealth)}>{customer.aggregateHealth}</Pill></td>
                    <td className="px-4 py-4 text-zinc-400"><Sparkline score={customer.aggregateHealth} trend={customer.trend} /></td>
                    <td className="px-4 py-4 text-zinc-300">{customer.aeOwner}</td>
                    <td className="px-4 py-4 text-zinc-300">{customer.renewalDays} days</td>
                    <td className="px-4 py-4 text-zinc-300">{customerProjects.length}</td>
                    <td className="px-4 py-4 text-zinc-300">{openAlerts}</td>
                    <td className="px-4 py-4">
                      <Link className="inline-flex items-center gap-2 text-zinc-300 hover:text-white" to={`/customers/${customer.id}`}>
                        Open <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </main>
  )
}

const CustomerDetailPage = (): JSX.Element => {
  const { customerId } = useParams()
  const { alerts } = useAppState()
  const customer = customers.find((item) => item.id === customerId) ?? customers[0]
  const [tab, setTab] = useState('Overview')
  const customerProjects = projects.filter((project) => project.customerId === customer.id)
  const customerAlerts = alerts.filter((alert) => alert.customerId === customer.id)
  const customerSignals = seedSignals.filter((signal) => signal.customerId === customer.id)
  const customerCases = pmoCases.filter((item) => customerProjects.some((project) => project.id === item.projectId))

  return (
    <main className="max-w-full space-y-5 overflow-x-hidden p-4 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{customer.tier}</Pill>
            <span className="text-sm text-zinc-500">{customer.tier} account</span>
            <span className="text-sm text-zinc-500">renews in {customer.renewalDays} days</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-white">{customer.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">AE owner: {customer.aeOwner}</p>
        </div>
        <Link className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" to="/account">
          Open AE view
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-black/30 p-1">
        {['Overview', 'Projects', 'Signals', 'Alerts', 'Escalations', 'Notes'].map((item) => (
          <button className={cn('rounded-md px-3 py-2 text-sm font-semibold', tab === item ? 'bg-white/12 text-white' : 'text-zinc-500 hover:text-zinc-200')} key={item} onClick={() => setTab(item)} type="button">
            {item}
          </button>
        ))}
      </div>
      {tab === 'Overview' ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Panel className="p-4">
            <h2 className="text-base font-semibold text-white">Customer health score</h2>
            <p className="mt-1 text-sm text-zinc-500">Aggregate of project health with source coverage weighting.</p>
            <div className="mt-5 flex items-center justify-between gap-5">
              <p className="text-5xl font-semibold text-white">{customer.aggregateHealth}</p>
              <div className="w-48 text-rose-300"><Sparkline score={customer.aggregateHealth} trend={customer.trend} /></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sourceCatalog.map((source) => (
                <Pill className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100" key={source.id}>
                  <source.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {source.label}
                </Pill>
              ))}
            </div>
          </Panel>
          <Panel className="p-4">
            <h2 className="text-base font-semibold text-white">Attention summary</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="Projects" value={customerProjects.length} />
              <Metric label="Alerts" value={customerAlerts.filter((alert) => alert.status !== 'Resolved').length} />
              <Metric label="Cases" value={customerCases.length} />
            </div>
          </Panel>
        </div>
      ) : null}
      {tab === 'Overview' || tab === 'Projects' ? <CustomerProjectsTable projectsForCustomer={customerProjects} /> : null}
      {tab === 'Signals' ? <CustomerSignalList signals={customerSignals} /> : null}
      {tab === 'Alerts' ? <div className="space-y-3">{customerAlerts.map((alert) => <AlertCard alert={alert} key={alert.id} />)}</div> : null}
      {tab === 'Escalations' ? <PmoCaseList cases={customerCases} /> : null}
      {tab === 'Notes' ? <CustomerNotes customer={customer} /> : null}
    </main>
  )
}

const Metric = ({ label, value }: { label: string; value: number | string }): JSX.Element => (
  <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
    <p className="text-2xl font-semibold text-white">{value}</p>
    <p className="mt-1 text-sm text-zinc-500">{label}</p>
  </div>
)

const CustomerProjectsTable = ({ projectsForCustomer }: { projectsForCustomer: Project[] }): JSX.Element => (
  <Panel className="overflow-hidden">
    <SectionHeader title="Projects under customer" />
    <div className="space-y-3 p-3 md:hidden">
      {projectsForCustomer.map((project) => (
        <article className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={project.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link className="font-semibold text-zinc-100 hover:text-white" to={`/dashboard?project=${project.id}`}>{project.name}</Link>
              <p className="mt-1 text-sm text-zinc-500">{project.pd} / {project.pm}</p>
            </div>
            <Pill className={scoreClasses(project.health)}>{project.health}</Pill>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{project.status}</Pill>
            <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{project.openAlerts} alert(s)</Pill>
            <span className="text-xs text-zinc-500">{project.lastActivityAt}</span>
          </div>
        </article>
      ))}
    </div>
    <div className="hidden overflow-x-auto md:block">
      <table className="min-w-[54rem] w-full text-left text-sm">
        <thead className="border-b border-white/10 text-xs text-zinc-500">
          <tr>
            {['Project', 'Health', 'Owners', 'Open alerts', 'Status', 'Last activity'].map((heading) => <th className="px-4 py-3" key={heading}>{heading}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {projectsForCustomer.map((project) => (
            <tr className="hover:bg-white/[0.035]" key={project.id}>
              <td className="px-4 py-4"><Link className="font-semibold text-zinc-100 hover:text-white" to={`/dashboard?project=${project.id}`}>{project.name}</Link></td>
              <td className="px-4 py-4"><Pill className={scoreClasses(project.health)}>{project.health}</Pill></td>
              <td className="px-4 py-4 text-zinc-300">{project.pd} / {project.pm}</td>
              <td className="px-4 py-4 text-zinc-300">{project.openAlerts}</td>
              <td className="px-4 py-4"><Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{project.status}</Pill></td>
              <td className="px-4 py-4 text-zinc-400">{project.lastActivityAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Panel>
)

const CustomerSignalList = ({ signals }: { signals: SignalItem[] }): JSX.Element => (
  <Panel className="p-3">
    <div className="space-y-2">
      {signals.map((signal) => (
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={signal.id}>
          <div className="flex flex-wrap items-center gap-2">
            <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{sourceMeta(signal.source).label}</Pill>
            <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{signal.sentiment}</Pill>
            <span className="text-xs text-zinc-500">{signal.timestamp}</span>
          </div>
          <p className="mt-2 text-sm text-zinc-300">{signal.summary}</p>
        </div>
      ))}
    </div>
  </Panel>
)

const PmoCaseList = ({ cases }: { cases: PmoCase[] }): JSX.Element => (
  <div className="space-y-3">
    {cases.length === 0 ? <EmptyState title="No PMO cases" message="No escalation cases are linked to this customer." /> : null}
    {cases.map((item) => (
      <Panel className="p-4" key={item.id}>
        <div className="flex flex-wrap items-center gap-2">
          <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{item.id}</Pill>
          <Pill className="border-amber-500/30 bg-amber-500/10 text-amber-100">{item.status}</Pill>
        </div>
        <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{item.summary}</p>
        <p className="mt-3 text-sm text-zinc-500">{item.owner}</p>
      </Panel>
    ))}
  </div>
)

const CustomerNotes = ({ customer }: { customer: Customer }): JSX.Element => {
  const [note, setNote] = useState(`Renewal attention remains tied to ${customer.aeOwner}'s executive path.`)
  return (
    <Panel className="p-4">
      <h2 className="text-base font-semibold text-white">Notes</h2>
      <textarea className="mt-3 min-h-36 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-zinc-200 outline-none focus:border-emerald-400/50" onChange={(event) => setNote(event.target.value)} value={note} />
      <button className="mt-3 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={() => toast.success('Customer note saved')} type="button">
        Save note
      </button>
    </Panel>
  )
}

const AlertDetailPage = (): JSX.Element => {
  const { alertId } = useParams()
  const { alerts, actionItems, updateActionItem, updateAlertStatus, addAudit } = useAppState()
  const alert = alerts.find((item) => item.id === alertId) ?? alerts[0]
  const project = getProject(alert.projectId)
  const customer = getCustomer(alert.customerId)
  const linkedActions = actionItems.filter((item) => item.alertId === alert.id)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [feedback, setFeedback] = useState('Useful')
  const [reason, setReason] = useState('')
  const [playbookDone, setPlaybookDone] = useState(false)

  return (
    <main className="grid max-w-full gap-5 overflow-x-hidden p-4 lg:grid-cols-[1fr_20rem] lg:p-6">
      <section className="space-y-5">
        <Link className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white" to="/dashboard">
          <ChevronRight className="h-4 w-4 rotate-180" aria-hidden="true" />
          Back to Command Center
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill className={severityClasses(alert.severity)}>{alert.severity}</Pill>
            <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{alert.concern}</Pill>
            <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{sourceMeta(alert.source).label}</Pill>
            <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{alert.status}</Pill>
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white">{alert.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <Link className="text-zinc-300 hover:text-white" to={`/customers/${customer.id}`}>{customer.name}</Link>
            <span>/</span>
            <span>{project.name}</span>
            <span>/</span>
            <span>{alert.age}</span>
          </div>
          <p className="mt-4 text-sm text-zinc-500">Signal sender</p>
          <p className="text-sm text-zinc-300">{alert.sender}</p>
        </div>
        <Panel className="p-4">
          <h2 className="text-base font-semibold text-white">AI summary</h2>
          <p className="mt-3 leading-7 text-zinc-300">{alert.summary}</p>
        </Panel>
        <button className="w-full rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left hover:bg-white/[0.055]" onClick={() => setEvidenceOpen((open) => !open)} type="button">
          <h2 className="text-base font-semibold text-white">Source evidence</h2>
          <p className="mt-1 text-sm text-zinc-500">Original signal excerpt, collapsed by default.</p>
          {evidenceOpen ? <p className="mt-4 rounded-md border border-white/10 bg-black/30 p-3 text-sm leading-6 text-zinc-300">{alert.summary}</p> : null}
        </button>
        <Panel>
          <SectionHeader description="Inline editable for demo purposes." title="Linked action items" />
          <div className="divide-y divide-white/10">
            {linkedActions.map((item) => (
              <div className="grid gap-3 p-4 lg:grid-cols-[1fr_10rem_10rem_9rem]" key={item.id}>
                <div>
                  <p className="mb-2 text-sm font-semibold text-zinc-100">{item.title}</p>
                  <label className="text-xs text-zinc-500">
                    Owner
                    <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-200 outline-none" onChange={(event) => updateActionItem(item.id, { owner: event.target.value })} value={item.owner} />
                  </label>
                </div>
                <label className="text-xs text-zinc-500">
                  Due date
                  <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-200 outline-none" onChange={(event) => updateActionItem(item.id, { dueDate: event.target.value })} type="date" value={item.dueDate} />
                </label>
                <label className="text-xs text-zinc-500">
                  Status
                  <select className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-zinc-200 outline-none" onChange={(event) => updateActionItem(item.id, { status: event.target.value as ActionItem['status'] })} value={item.status}>
                    {['Open', 'In progress', 'Blocked', 'Done'].map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
                <label className="text-xs text-zinc-500">
                  Priority
                  <select className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-zinc-200 outline-none" onChange={(event) => updateActionItem(item.id, { priority: event.target.value as AlertSeverity })} value={item.priority}>
                    {severityOptions.map((severity) => <option key={severity}>{severity}</option>)}
                  </select>
                </label>
              </div>
            ))}
          </div>
        </Panel>
      </section>
      <aside className="space-y-5">
        <Panel className="p-4">
          <h2 className="text-base font-semibold text-white">Suggested playbook</h2>
          <p className="mt-2 text-sm font-semibold text-zinc-100">{alert.playbook}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{alert.playbookSummary}</p>
          <button className={cn('mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold', playbookDone ? 'border-emerald-400/40 bg-emerald-400/12 text-emerald-100' : 'border-white/10 text-zinc-100 hover:bg-white/8')} onClick={() => setPlaybookDone(true)} type="button">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {playbookDone ? 'Done' : 'Mark as done'}
          </button>
        </Panel>
        <Panel className="p-4">
          <h2 className="text-base font-semibold text-white">Feedback</h2>
          <select className="mt-3 h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-zinc-200 outline-none" onChange={(event) => setFeedback(event.target.value)} value={feedback}>
            {['Useful', 'False positive', 'Needs more evidence'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input className="mt-3 h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-200 outline-none" onChange={(event) => setReason(event.target.value)} placeholder="Optional reason" value={reason} />
          <button className="mt-3 w-full rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={() => { addAudit(`Feedback saved on ${alert.title}: ${feedback}`); toast.success('Feedback saved') }} type="button">
            Save feedback
          </button>
        </Panel>
        <Panel className="p-4">
          <h2 className="text-base font-semibold text-white">Routing context</h2>
          <div className="mt-3 space-y-2 text-sm text-zinc-300">
            <p>PM: {project.pm}</p>
            <p>PD: {project.pd}</p>
            <p>AE: {customer.aeOwner}</p>
            <p>Customer tier: {customer.tier}</p>
          </div>
          <select className="mt-3 h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-zinc-200 outline-none">
            {['Sarah Khan', 'Fatima Raza', 'Adnan Sheikh', 'Hira Siddiqui'].map((person) => <option key={person}>{person}</option>)}
          </select>
          <p className="mt-3 text-sm leading-6 text-zinc-500">High severity routes to PM, PD, and AE; PMO auto-escalates if unacknowledged.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              ['Acknowledge', 'Acknowledged'],
              ['Route to...', 'Forwarded'],
              ['Escalate', 'Forwarded'],
              ['Resolve', 'Resolved'],
            ].map(([label, status]) => (
              <button className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" key={label} onClick={() => updateAlertStatus(alert.id, status as AlertStatus)} type="button">
                {label}
              </button>
            ))}
            <button className="col-span-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={() => toast.success('Note added to alert timeline')} type="button">
              Add note
            </button>
          </div>
        </Panel>
      </aside>
    </main>
  )
}

const ProjectsImportPage = (): JSX.Element => {
  const { addAudit, authToken } = useAppState()
  const [format, setFormat] = useState<ProjectImportFormat>('csv')
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [previewRows, setPreviewRows] = useState<ProjectImportPreviewRow[]>([])
  const [previewError, setPreviewError] = useState('')
  const [result, setResult] = useState<ProjectImportResult | null>(null)
  const [projects, setProjects] = useState<BackendProject[]>([])
  const [projectsError, setProjectsError] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [importing, setImporting] = useState(false)

  const loadProjects = async (): Promise<void> => {
    if (!authToken) return
    setLoadingProjects(true)
    setProjectsError('')
    try {
      const response = await apiRequest<{ data: BackendProject[] }>('/api/projects', { method: 'GET' }, authToken)
      setProjects(response.data)
    } catch (error) {
      setProjectsError(messageFromError(error))
    } finally {
      setLoadingProjects(false)
    }
  }

  useEffect(() => {
    void loadProjects()
  }, [authToken])

  const applyPreview = (content: string, nextFormat: ProjectImportFormat): void => {
    const parsed = parseProjectImportPreview(content, nextFormat)
    setPreviewRows(parsed.rows)
    setPreviewError(parsed.error ?? '')
  }

  const handleFileChange = async (file: File | undefined): Promise<void> => {
    setResult(null)
    setPreviewRows([])
    setPreviewError('')
    setFileContent('')
    setFileName('')
    if (!file) return
    const nextFormat: ProjectImportFormat = file.name.toLowerCase().endsWith('.json') || file.type.includes('json') ? 'json' : 'csv'
    const content = await file.text()
    setFormat(nextFormat)
    setFileName(file.name)
    setFileContent(content)
    applyPreview(content, nextFormat)
  }

  const handleFormatChange = (nextFormat: ProjectImportFormat): void => {
    setFormat(nextFormat)
    if (fileContent) applyPreview(fileContent, nextFormat)
  }

  const handleImport = async (): Promise<void> => {
    if (!authToken || !fileContent) return
    setImporting(true)
    setResult(null)
    try {
      const response = await apiRequest<ProjectImportResult>(
        `/api/projects/import?format=${format}`,
        {
          body: fileContent,
          headers: { 'Content-Type': format === 'csv' ? 'text/csv' : 'application/json' },
          method: 'POST',
        },
        authToken,
      )
      setResult(response)
      addAudit(`Project import finished: ${response.created} created, ${response.updated} updated, ${response.failed} failed`)
      toast.success('Project import finished')
      await loadProjects()
    } catch (error) {
      toast.error(messageFromError(error))
      setResult({
        created: 0,
        errors: [{ message: messageFromError(error), row: 0 }],
        failed: 1,
        rows: [],
        updated: 0,
      })
    } finally {
      setImporting(false)
    }
  }

  const previewIssueCount = previewRows.reduce((count, row) => count + row.errors.length, 0)

  return (
    <main className="max-w-full space-y-5 overflow-x-hidden p-4 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Project Imports</h1>
          <p className="mt-1 text-sm text-zinc-500">Upload delivery projects from CSV or JSON and sync them into the backend project model.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8"
          onClick={() => downloadCsv('project-import-sample.csv', [projectImportSample])}
          type="button"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Sample CSV
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[24rem_1fr]">
        <section className="space-y-5">
          <Panel className="p-4">
            <h2 className="text-base font-semibold text-white">Import Projects</h2>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/30 p-1">
                {(['csv', 'json'] as ProjectImportFormat[]).map((item) => (
                  <button
                    className={cn('rounded-md px-3 py-2 text-sm font-semibold uppercase', format === item ? 'bg-white/12 text-white' : 'text-zinc-500 hover:text-zinc-200')}
                    key={item}
                    onClick={() => handleFormatChange(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <label className="block rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-4 text-sm text-zinc-400">
                <span className="flex items-center gap-2 font-semibold text-zinc-100">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  {fileName || 'Choose CSV or JSON file'}
                </span>
                <input
                  accept=".csv,.json,application/json,text/csv"
                  className="mt-3 block w-full text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-950"
                  onChange={(event) => void handleFileChange(event.target.files?.[0])}
                  type="file"
                />
              </label>
              {previewError ? <AuthNotice message={previewError} /> : null}
              <button
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!fileContent || importing}
                onClick={() => void handleImport()}
                type="button"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                {importing ? 'Importing' : 'Submit import'}
              </button>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <SectionHeader description="CSV headers can use snake_case or camelCase field names." title="Format" />
            <div className="space-y-3 p-4 text-sm text-zinc-400">
              <div>
                <p className="font-semibold text-zinc-100">Required</p>
                <p className="mt-1 leading-6">{['customer_id', ...projectImportRequired].join(', ')}</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-100">Optional</p>
                <p className="mt-1 leading-6">id, external_ref, health_status, customer_external_ref, customer_name</p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/30 p-3 font-mono text-xs text-zinc-300">
                {projectImportColumns.join(', ')}
              </div>
            </div>
          </Panel>
        </section>

        <section className="space-y-5">
          {result ? (
            <Panel className="p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Created" value={result.created} />
                <Metric label="Updated" value={result.updated} />
                <Metric label="Failed" value={result.failed} />
              </div>
              {result.errors.length ? (
                <div className="mt-4 space-y-2">
                  {result.errors.slice(0, 8).map((error, index) => (
                    <div className="rounded-md border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-100" key={`${error.row}-${index}`}>
                      Row {error.row}: {error.message}
                    </div>
                  ))}
                </div>
              ) : null}
            </Panel>
          ) : null}

          <Panel className="overflow-hidden">
            <SectionHeader
              action={<Pill className={previewIssueCount ? 'border-amber-500/35 bg-amber-500/14 text-amber-100' : 'border-white/10 bg-white/[0.04] text-zinc-300'}>{previewRows.length} rows</Pill>}
              description="First 25 rows are shown before submit."
              title="Preview"
            />
            {previewRows.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No file selected" message="Select a CSV or JSON file to preview project rows." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[64rem] w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-xs text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Row</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Stage</th>
                      <th className="px-4 py-3">Health</th>
                      <th className="px-4 py-3">Risk</th>
                      <th className="px-4 py-3">Due</th>
                      <th className="px-4 py-3">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {previewRows.map((row) => (
                      <tr key={row.rowNumber}>
                        <td className="px-4 py-3 text-zinc-500">{row.rowNumber}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.values.customer_id || row.values.customer_name || row.values.customer_external_ref}</td>
                        <td className="px-4 py-3 text-zinc-100">{row.values.name}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.values.stage}</td>
                        <td className="px-4 py-3"><Pill className={scoreClasses(Number(row.values.health_score || 0))}>{row.values.health_score}</Pill></td>
                        <td className="px-4 py-3 text-zinc-300">{row.values.jira_risk}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.values.due_date}</td>
                        <td className="px-4 py-3">
                          {row.errors.length ? (
                            <span className="text-xs text-amber-200">{row.errors.join('; ')}</span>
                          ) : (
                            <Pill className="border-emerald-500/30 bg-emerald-500/12 text-emerald-100">Ready</Pill>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel className="overflow-hidden">
            <SectionHeader
              action={
                <button className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={() => void loadProjects()} type="button">
                  {loadingProjects ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
                  Refresh
                </button>
              }
              description="Projects persisted through the backend API."
              title="Imported Projects"
            />
            <div className="p-4">
              {projectsError ? <AuthNotice message={projectsError} /> : null}
              {!projectsError && projects.length === 0 ? <EmptyState title="No imported projects" message="Imported project records will appear here." /> : null}
              {projects.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {projects.map((project) => (
                    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4" key={project.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-zinc-100">{project.name}</p>
                          <p className="mt-1 truncate text-sm text-zinc-500">{project.customer_name ?? project.customer_id} / {project.project_manager}</p>
                        </div>
                        <Pill className={scoreClasses(project.health_score)}>{project.health_score}</Pill>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{project.stage.replace('_', ' ')}</Pill>
                        <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{project.jira_risk}</Pill>
                        <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{project.due_date}</Pill>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  )
}

const PmoPage = (): JSX.Element => {
  const { alerts, updateAlertStatus } = useAppState()
  const forwarded = alerts.filter((alert) => alert.status === 'Forwarded')
  const autoEscalated = alerts.filter((alert) => alert.severity === 'High' && alert.status === 'New')
  const redCustomers = customers.filter((customer) => healthBand(customer.aggregateHealth) === 'red').length
  const amberCustomers = customers.filter((customer) => healthBand(customer.aggregateHealth) === 'amber').length
  const greenCustomers = customers.filter((customer) => healthBand(customer.aggregateHealth) === 'green').length

  return (
    <main className="grid max-w-full gap-5 overflow-x-hidden p-4 xl:grid-cols-[1fr_22rem] lg:p-6">
      <section className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">PMO Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">Cross-portfolio attention view for Adnan Sheikh.</p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8"
            onClick={() =>
              downloadCsv(
                'pmo-portfolio-health.csv',
                projects.map((project) => ({
                  project: project.name,
                  customer: getCustomer(project.customerId).name,
                  health: project.health,
                  status: project.status,
                  pd: project.pd,
                  pm: project.pm,
                  openAlerts: alerts.filter((alert) => alert.projectId === project.id && alert.status !== 'Resolved').length,
                })),
              )
            }
            type="button"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export PMO CSV
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total clients" value={customers.length} />
          <Metric label="R/A/G distribution" value={`${redCustomers}/${amberCustomers}/${greenCustomers}`} />
          <Metric label="Active escalations" value={pmoCases.filter((item) => item.status !== 'Closed').length} />
          <Metric label="Awaiting PMO review" value={autoEscalated.length + forwarded.length} />
        </div>
        <Panel>
          <SectionHeader description="Received from PDs for PMO visibility or action." title="Forwarded alerts" action={<Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{forwarded.length}</Pill>} />
          <div className="space-y-3 p-3">
            {forwarded.map((alert) => <AlertCard alert={alert} key={alert.id} onPrimary={() => updateAlertStatus(alert.id, 'Resolved')} primaryLabel="Resolve" />)}
          </div>
        </Panel>
        <Panel>
          <SectionHeader description="High severity alerts still unacknowledged inside the escalation window." title="Auto-escalated High alerts" action={<Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{autoEscalated.length}</Pill>} />
          <div className="space-y-3 p-3">
            {autoEscalated.map((alert) => <AlertCard alert={alert} key={alert.id} onPrimary={() => updateAlertStatus(alert.id, 'Acknowledged')} primaryLabel="Acknowledge" />)}
          </div>
        </Panel>
      </section>
      <aside className="space-y-5">
        <Panel>
          <SectionHeader title="PMO Jira-linked cases" />
          <div className="space-y-3 p-3">
            {pmoCases.map((item) => (
              <article className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={item.id}>
                <div className="flex flex-wrap gap-2">
                  <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{item.id}</Pill>
                  <Pill className="border-amber-500/30 bg-amber-500/10 text-amber-100">{item.status}</Pill>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.summary}</p>
                <p className="mt-2 text-xs text-zinc-500">{item.owner}</p>
                <p className="text-xs text-zinc-500">{item.openedAt}</p>
              </article>
            ))}
          </div>
        </Panel>
        <Panel className="overflow-hidden">
          <SectionHeader title="Portfolio health" />
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs text-zinc-500">
              <tr><th className="px-4 py-3">Project</th><th className="px-4 py-3">Health</th><th className="px-4 py-3">Open</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {projects.slice(0, 5).map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-3 text-zinc-300">{project.name}</td>
                  <td className="px-4 py-3"><Pill className={scoreClasses(project.health)}>{project.health}</Pill></td>
                  <td className="px-4 py-3"><Link className="text-zinc-400 hover:text-white" to={`/dashboard?project=${project.id}`}><ExternalLink className="h-4 w-4" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </aside>
    </main>
  )
}

const SettingsPage = (): JSX.Element => {
  const { authUser, preferenceMatrix, updatePreference, resetPreferences, addAudit } = useAppState()
  const [tab, setTab] = useState('Notifications')
  const settingsTabs = ['Notifications', 'Source coverage', 'Profile', 'Escalation', ...(authUser?.role === 'admin' ? ['Admin'] : [])]
  const [profile, setProfile] = useState({ name: authUser?.name ?? 'Customer Health User', role: titleCase(authUser?.role ?? 'viewer'), timezone: 'Asia/Karachi' })
  const [windowHours, setWindowHours] = useState(4)
  const [connectors, setConnectors] = useState<Record<SourceId, string>>({
    email: 'Connected',
    jira: 'Connected',
    'pmo-jira': 'Connected',
    bitbucket: 'Connected',
    invoice: 'Needs auth',
    meeting: 'Connected',
  })

  return (
    <main className="max-w-full space-y-5 overflow-x-hidden p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Notification routing, source coverage, profile defaults, and escalation windows.</p>
      </div>
      <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-black/30 p-1">
        {settingsTabs.map((item) => (
          <button className={cn('rounded-md px-3 py-2 text-sm font-semibold', tab === item ? 'bg-white/12 text-white' : 'text-zinc-500 hover:text-zinc-200')} key={item} onClick={() => setTab(item)} type="button">
            {item}
          </button>
        ))}
      </div>
      {tab === 'Notifications' ? (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <button className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={() => toast.success('Low severity muted for 7 days')} type="button">Mute all Low for 7 days</button>
            <button className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={() => toast.success('Vacation mode enabled')} type="button">Vacation mode</button>
            <button className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={resetPreferences} type="button">Reset to role defaults</button>
          </div>
          {channelOptions.map((channel) => (
            <PreferenceTable channel={channel} key={channel} matrix={preferenceMatrix} updatePreference={updatePreference} />
          ))}
        </div>
      ) : null}
      {tab === 'Source coverage' ? (
        <Panel className="p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sourceCatalog.map((source) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4" key={source.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <IconShell icon={source.icon} />
                    <div>
                      <p className="font-semibold text-white">{source.label}</p>
                      <p className="text-sm text-zinc-500">{connectors[source.id]}</p>
                    </div>
                  </div>
                  <button className="rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/8" onClick={() => setConnectors((items) => ({ ...items, [source.id]: items[source.id] === 'Connected' ? 'Paused' : 'Connected' }))} type="button">
                    {connectors[source.id] === 'Connected' ? 'Pause' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
      {tab === 'Profile' ? (
        <Panel className="max-w-2xl p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Name', 'name'],
              ['Role', 'role'],
              ['Timezone', 'timezone'],
            ].map(([label, key]) => (
              <label className="text-sm text-zinc-500" key={key}>
                {label}
                <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-200 outline-none" onChange={(event) => setProfile((value) => ({ ...value, [key]: event.target.value }))} value={profile[key as keyof typeof profile]} />
              </label>
            ))}
          </div>
          <button className="mt-4 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={() => { addAudit('Profile defaults saved'); toast.success('Profile saved') }} type="button">Save profile</button>
        </Panel>
      ) : null}
      {tab === 'Escalation' ? (
        <Panel className="max-w-2xl p-4">
          <label className="text-sm text-zinc-500">
            High severity auto-escalation window
            <div className="mt-2 flex items-center gap-3">
              <input className="w-full accent-emerald-400" max={24} min={1} onChange={(event) => setWindowHours(Number(event.target.value))} type="range" value={windowHours} />
              <span className="w-20 text-sm font-semibold text-zinc-100">{windowHours} hours</span>
            </div>
          </label>
          <label className="mt-4 block text-sm text-zinc-500">
            Default PMO owner
            <select className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-zinc-200 outline-none">
              {['Adnan Sheikh', 'Fatima Raza', 'Omar Farooq'].map((owner) => <option key={owner}>{owner}</option>)}
            </select>
          </label>
          <button className="mt-4 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={() => { addAudit(`Escalation window set to ${windowHours} hours`); toast.success('Escalation policy saved') }} type="button">Save escalation policy</button>
        </Panel>
      ) : null}
      {tab === 'Admin' ? <AdminUserPanel /> : null}
    </main>
  )
}

const AdminUserPanel = (): JSX.Element => {
  const { authToken, authUser } = useAppState()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(false)
  const [busyUserId, setBusyUserId] = useState('')
  const [error, setError] = useState('')

  const loadUsers = async (): Promise<void> => {
    if (!authToken || authUser?.role !== 'admin') return
    setLoading(true)
    setError('')
    try {
      const response = await apiRequest<{ data: AuthUser[] }>('/api/users', { method: 'GET' }, authToken)
      setUsers(response.data)
    } catch (err) {
      setError(messageFromError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [authToken, authUser?.role])

  const toggleUser = async (user: AuthUser): Promise<void> => {
    if (!authToken || user.id === authUser?.id) return
    setBusyUserId(user.id)
    setError('')
    try {
      const response = await apiRequest<{ data: AuthUser }>(
        `/api/users/${user.id}`,
        {
          body: JSON.stringify({ is_active: !user.is_active }),
          method: 'PATCH',
        },
        authToken,
      )
      setUsers((items) => items.map((item) => (item.id === user.id ? response.data : item)))
      toast.success(`${response.data.name} ${response.data.is_active ? 'enabled' : 'disabled'}`)
    } catch (err) {
      setError(messageFromError(err))
    } finally {
      setBusyUserId('')
    }
  }

  if (authUser?.role !== 'admin') {
    return (
      <Panel className="p-4">
        <EmptyState title="Admin access required" message="User management is available to admin accounts." />
      </Panel>
    )
  }

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        action={
          <button className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8 disabled:opacity-60" disabled={loading} onClick={() => void loadUsers()} type="button">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Users className="h-4 w-4" aria-hidden="true" />}
            Refresh
          </button>
        }
        description="Enable or disable Customer Health user access."
        title="User management"
      />
      <div className="space-y-3 p-4">
        {error ? <AuthNotice message={error} /> : null}
        {loading && users.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading users
          </div>
        ) : null}
        {users.map((user) => (
          <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 sm:grid-cols-[1fr_auto_auto]" key={user.id}>
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-100">{user.name}</p>
              <p className="truncate text-sm text-zinc-500">{user.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{titleCase(user.role)}</Pill>
              <Pill className={user.is_active ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-100' : 'border-rose-500/30 bg-rose-500/12 text-rose-100'}>
                {user.is_active ? 'Active' : 'Disabled'}
              </Pill>
            </div>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-zinc-100 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busyUserId === user.id || user.id === authUser.id}
              onClick={() => void toggleUser(user)}
              type="button"
            >
              {busyUserId === user.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
              {user.is_active ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </Panel>
  )
}

const PreferenceTable = ({
  channel,
  matrix,
  updatePreference,
}: {
  channel: string
  matrix: PreferenceMatrix
  updatePreference: AppState['updatePreference']
}): JSX.Element => (
  <Panel className="overflow-hidden">
    <SectionHeader description="Role x severity x source delivery preferences." title={channel} />
    <div className="space-y-3 p-3 md:hidden">
      {sourceCatalog.map((source) => (
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={source.id}>
          <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <source.icon className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            {source.label}
          </p>
          <div className="mt-3 space-y-2">
            {severityOptions.map((severity) => {
              const pref = matrix[channel][source.id][severity]
              return (
                <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/20 px-3 py-2" key={severity}>
                  <span className="text-sm text-zinc-300">{severity}</span>
                  <select className="h-9 rounded-md border border-white/10 bg-black px-2 text-sm text-zinc-200 outline-none" onChange={(event) => updatePreference(channel, source.id, severity, { cadence: event.target.value as NotificationPreference['cadence'], enabled: event.target.value !== 'off' })} value={pref.cadence}>
                    {cadenceOptions.map((cadence) => <option key={cadence}>{cadence}</option>)}
                  </select>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
    <div className="hidden overflow-x-auto md:block">
      <table className="min-w-[44rem] w-full text-left text-sm">
        <thead className="border-b border-white/10 text-xs text-zinc-500">
          <tr>
            <th className="px-4 py-3">Source</th>
            {severityOptions.map((severity) => <th className="px-4 py-3 lowercase" key={severity}>{severity}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {sourceCatalog.map((source) => (
            <tr key={source.id}>
              <td className="px-4 py-4">
                <span className="flex items-center gap-2 text-zinc-200">
                  <source.icon className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  {source.label}
                </span>
              </td>
              {severityOptions.map((severity) => {
                const pref = matrix[channel][source.id][severity]
                return (
                  <td className="px-4 py-4" key={severity}>
                    <div className="flex items-center gap-2">
                      <button
                        aria-checked={pref.enabled}
                        className={cn('relative h-6 w-11 rounded-full border transition', pref.enabled ? 'border-emerald-400/50 bg-emerald-400/30' : 'border-white/10 bg-white/8')}
                        onClick={() => updatePreference(channel, source.id, severity, { enabled: !pref.enabled, cadence: !pref.enabled ? 'daily digest' : 'off' })}
                        role="switch"
                        type="button"
                      >
                        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition', pref.enabled ? 'left-5' : 'left-0.5')} />
                      </button>
                      <select className="h-9 rounded-md border border-white/10 bg-black px-2 text-sm text-zinc-200 outline-none" onChange={(event) => updatePreference(channel, source.id, severity, { cadence: event.target.value as NotificationPreference['cadence'], enabled: event.target.value !== 'off' })} value={pref.cadence}>
                        {cadenceOptions.map((cadence) => <option key={cadence}>{cadence}</option>)}
                      </select>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Panel>
)

const AccountPage = (): JSX.Element => {
  const { authUser } = useAppState()
  const displayName = authUser?.name ?? 'Customer Health User'

  return (
    <main className="max-w-full space-y-5 overflow-x-hidden p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">AE Account View</h1>
        <p className="mt-1 text-sm text-zinc-500">Commercial and renewal context for strategic accounts.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <Panel className="overflow-hidden">
          <SectionHeader title="Renewal watch" />
          <div className="divide-y divide-white/10">
            {customers.filter((customer) => customer.tier === 'Strategic' || customer.renewalDays < 60).map((customer) => (
              <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]" key={customer.id}>
                <div>
                  <Link className="font-semibold text-zinc-100 hover:text-white" to={`/customers/${customer.id}`}>{customer.name}</Link>
                  <p className="mt-1 text-sm text-zinc-500">{customer.industry} / {customer.aeOwner}</p>
                </div>
                <Pill className={scoreClasses(customer.aggregateHealth)}>{customer.aggregateHealth}</Pill>
                <Pill className="border-white/10 bg-white/[0.04] text-zinc-300">{customer.renewalDays} days</Pill>
              </div>
            ))}
          </div>
        </Panel>
        <div className="space-y-5">
          <Panel className="p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-200">{getInitials(displayName)}</span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-white">User profile</h2>
                <p className="truncate text-sm text-zinc-500">{authUser?.email ?? 'No email available'}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
                <span className="text-zinc-500">Name</span>
                <span className="min-w-0 truncate font-semibold text-zinc-100">{displayName}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
                <span className="text-zinc-500">Role</span>
                <span className="font-semibold text-zinc-100">{titleCase(authUser?.role ?? 'viewer')}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
                <span className="text-zinc-500">Status</span>
                <Pill className="border-emerald-500/30 bg-emerald-500/12 text-emerald-100">Active</Pill>
              </div>
            </div>
          </Panel>
          <Panel className="p-4">
            <h2 className="text-base font-semibold text-white">Commercial notes</h2>
            <div className="mt-3 space-y-2 text-sm text-zinc-400">
              <p>Kestrel renewal is within two weeks and currently attached to the compliance milestone risk.</p>
              <p>Brightline invoice delay needs AE confirmation before being treated as commercial pressure.</p>
              <p>Northstar relationship risk needs an executive recovery call before milestone review.</p>
            </div>
          </Panel>
        </div>
      </div>
    </main>
  )
}

const OnboardingPage = (): JSX.Element => {
  const [form, setForm] = useState({ customer: '', project: '', owner: '' })
  return (
    <main className="max-w-full space-y-5 overflow-x-hidden p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Project Onboarding</h1>
        <p className="mt-1 text-sm text-zinc-500">Create a demo project record and source checklist.</p>
      </div>
      <Panel className="max-w-2xl p-4">
        <div className="grid gap-4">
          {[
            ['Customer', 'customer'],
            ['Project', 'project'],
            ['Owner', 'owner'],
          ].map(([label, key]) => (
            <label className="text-sm text-zinc-500" key={key}>
              {label}
              <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-200 outline-none" onChange={(event) => setForm((value) => ({ ...value, [key]: event.target.value }))} value={form[key as keyof typeof form]} />
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {sourceCatalog.map((source) => (
            <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-300" key={source.id}>
              <input className="accent-emerald-400" defaultChecked type="checkbox" />
              {source.label}
            </label>
          ))}
        </div>
        <button className="mt-4 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" onClick={() => toast.success('Project onboarding draft created')} type="button">
          Create draft
        </button>
      </Panel>
    </main>
  )
}

const AuditPage = (): JSX.Element => {
  const { auditEvents } = useAppState()
  return (
    <main className="max-w-full space-y-5 overflow-x-hidden p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Audit Log</h1>
        <p className="mt-1 text-sm text-zinc-500">Recent prototype actions and governance events.</p>
      </div>
      <Panel className="p-4">
        <div className="space-y-2">
          {auditEvents.map((event) => (
            <div className="flex items-start gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-zinc-300" key={event}>
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
              {event}
            </div>
          ))}
        </div>
      </Panel>
    </main>
  )
}

const NotFoundPage = (): JSX.Element => (
  <main className="p-6">
    <Panel className="mx-auto max-w-lg p-6 text-center">
      <Circle className="mx-auto h-8 w-8 text-zinc-500" aria-hidden="true" />
      <h1 className="mt-4 text-xl font-semibold text-white">View not found</h1>
      <p className="mt-2 text-sm text-zinc-500">The requested route is not part of the prototype.</p>
      <Link className="mt-4 inline-flex rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/8" to="/dashboard">Back to Command Center</Link>
    </Panel>
  </main>
)

const RedirectToDashboard = (): JSX.Element => {
  const location = useLocation()
  return <Navigate replace to={`/dashboard${location.search}`} />
}

export {
  AccountPage,
  AlertDetailPage,
  AlertsPage,
  AuditPage,
  CustomerDetailPage,
  CustomerHealthApp,
  CustomersPage,
  DashboardPage,
  ForgotPasswordPage,
  LoginPage,
  NotFoundPage,
  OnboardingPage,
  PmoPage,
  ProjectsImportPage,
  RedirectToDashboard,
  RegisterPage,
  RequireAuth,
  ResetPasswordPage,
  SettingsPage,
  SignalsPage,
}
