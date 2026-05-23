import { Badge } from '@/components/ui/Badge'
import { HEALTH_LABELS, RISK_LABELS } from '@/constants'
import type { HealthStatus, RiskLevel } from '@/types'

const healthTone: Record<HealthStatus, 'green' | 'amber' | 'red'> = {
  green: 'green',
  amber: 'amber',
  red: 'red',
}

const riskTone: Record<RiskLevel, 'green' | 'amber' | 'red'> = {
  low: 'green',
  medium: 'amber',
  high: 'red',
  critical: 'red',
}

const RagBadge = ({ status }: { status: HealthStatus }): JSX.Element => (
  <Badge tone={healthTone[status]}>{HEALTH_LABELS[status]}</Badge>
)

const RiskBadge = ({ level }: { level: RiskLevel }): JSX.Element => (
  <Badge tone={riskTone[level]}>{RISK_LABELS[level]}</Badge>
)

const AlertSeverityChip = ({ level }: { level: RiskLevel }): JSX.Element => (
  <Badge className="uppercase" tone={riskTone[level]}>
    {RISK_LABELS[level]}
  </Badge>
)

export { AlertSeverityChip, RagBadge, RiskBadge }
