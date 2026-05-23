import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { RiskLevel, RoleDashboardContent, UserRole } from '@/types'

type RoleDashboardPanelProps = RoleDashboardContent & {
  role: UserRole
}

const severityTone: Record<RiskLevel, 'green' | 'amber' | 'red'> = {
  low: 'green',
  medium: 'amber',
  high: 'red',
  critical: 'red',
}

const severitySurface: Record<RiskLevel, string> = {
  low: 'border-l-green-500 bg-green-50/30',
  medium: 'border-l-amber-500 bg-amber-50/40',
  high: 'border-l-red-500 bg-red-50/30',
  critical: 'border-l-red-700 bg-red-50/60',
}

const roleSurface: Record<UserRole, string> = {
  PM: 'border-t-blue-500',
  'Delivery Lead': 'border-t-blue-500',
  'POD Head': 'border-t-amber-500',
  'Project Director': 'border-t-amber-500',
  AE: 'border-t-green-500',
  PMO: 'border-t-red-500',
  Leadership: 'border-t-red-700',
  Admin: 'border-t-gray-700',
}

const RoleDashboardPanel = ({
  role,
  title,
  summary,
  primaryQueueTitle,
  primaryQueue,
  nextMoves,
  capabilities,
  primaryActionLabel,
  primaryActionPath,
}: RoleDashboardPanelProps): JSX.Element => (
  <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
    <Card className={cn('border-t-4', roleSurface[role])}>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-2 text-sm text-gray-600">{summary}</p>
        </div>
        <Badge tone="blue">{role}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          {capabilities.map((capability) => (
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3" key={capability.label}>
              <p className="text-xs uppercase tracking-wide text-gray-500">{capability.label}</p>
              <p className="mt-1 text-sm font-medium text-gray-950">{capability.value}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-950">{primaryQueueTitle}</h3>
            <Link className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-950" to={primaryActionPath}>
              {primaryActionLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-3 space-y-3">
            {primaryQueue.map((item) => (
              <article
                className={cn('rounded-lg border border-l-4 border-gray-200 p-4', item.severity && severitySurface[item.severity])}
                key={item.id}
              >
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-950">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                    <p className="mt-2 text-xs text-gray-500">{item.meta}</p>
                  </div>
                  {item.severity ? (
                    <Badge className={cn(item.severity === 'critical' && 'font-semibold')} tone={severityTone[item.severity]}>
                      {item.severity}
                    </Badge>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className={cn('border-t-4', roleSurface[role])}>
      <CardHeader>
        <CardTitle>Role Next Moves</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nextMoves.map((move) => (
          <div className="flex gap-3 rounded-lg border border-green-100 bg-green-50/40 p-3" key={move}>
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
            <p className="text-sm text-gray-700">{move}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
)

export { RoleDashboardPanel }
