import { RiskBadge } from '@/components/shared/StatusBadges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatPercent } from '@/lib/utils'
import type { Client } from '@/types'

interface DashboardExecutiveSummaryProps {
  averageHealth: number
  highRiskTierOneClients: Client[]
}

const DashboardExecutiveSummary = ({
  averageHealth,
  highRiskTierOneClients,
}: DashboardExecutiveSummaryProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>AI Executive Summary</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-gray-700">
        Portfolio health is {formatPercent(averageHealth)} with critical pressure concentrated in {highRiskTierOneClients.length} Tier 1 accounts.
        The strongest early warnings are PMO Jira escalations, negative sponsor sentiment, and overdue recovery ownership.
      </p>
      <div className="space-y-3">
        {highRiskTierOneClients.map((client) => (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3" key={client.id}>
            <div>
              <p className="text-sm font-medium text-gray-950">{client.company}</p>
              <p className="text-xs text-gray-500">Churn risk {client.churnRisk}%</p>
            </div>
            <RiskBadge level={client.riskLevel} />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export { DashboardExecutiveSummary }
