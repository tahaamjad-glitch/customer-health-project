import { AlertTriangle, ClipboardCheck, Gauge, ListTodo, Settings, ShieldAlert, TrendingDown, Users } from 'lucide-react'

import { MetricCard } from '@/components/ui/MetricCard'
import type { DashboardMetric, DashboardMetricIcon } from '@/types'

interface DashboardMetricGridProps {
  metrics: DashboardMetric[]
}

const metricIconMap: Record<DashboardMetricIcon, JSX.Element> = {
  users: <Users className="h-5 w-5" aria-hidden="true" />,
  gauge: <Gauge className="h-5 w-5" aria-hidden="true" />,
  trend: <TrendingDown className="h-5 w-5" aria-hidden="true" />,
  alert: <AlertTriangle className="h-5 w-5" aria-hidden="true" />,
  actions: <ListTodo className="h-5 w-5" aria-hidden="true" />,
  shield: <ShieldAlert className="h-5 w-5" aria-hidden="true" />,
  recommendations: <ClipboardCheck className="h-5 w-5" aria-hidden="true" />,
  settings: <Settings className="h-5 w-5" aria-hidden="true" />,
}

const metricToneMap: Record<DashboardMetricIcon, 'gray' | 'green' | 'amber' | 'red' | 'blue' | 'slate'> = {
  users: 'blue',
  gauge: 'green',
  trend: 'amber',
  alert: 'red',
  actions: 'amber',
  shield: 'red',
  recommendations: 'blue',
  settings: 'slate',
}

const DashboardMetricGrid = ({ metrics }: DashboardMetricGridProps): JSX.Element => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {metrics.map((metric) => (
      <MetricCard
        helper={metric.helper}
        icon={metricIconMap[metric.icon]}
        key={metric.id}
        label={metric.label}
        tone={metricToneMap[metric.icon]}
        value={metric.value}
      />
    ))}
  </div>
)

export { DashboardMetricGrid }
