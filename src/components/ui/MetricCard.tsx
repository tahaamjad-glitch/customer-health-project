import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string
  helper: string
  icon: ReactNode
  tone?: 'gray' | 'green' | 'amber' | 'red' | 'blue' | 'slate'
}

const toneClasses: Record<NonNullable<MetricCardProps['tone']>, { accent: string; icon: string; value: string; surface: string }> = {
  gray: { accent: 'bg-gray-300', icon: 'bg-gray-100 text-gray-700', value: 'text-gray-950', surface: 'hover:border-gray-300' },
  green: { accent: 'bg-green-500', icon: 'bg-green-50 text-green-700', value: 'text-green-700', surface: 'hover:border-green-200' },
  amber: { accent: 'bg-amber-500', icon: 'bg-amber-50 text-amber-700', value: 'text-amber-700', surface: 'hover:border-amber-200' },
  red: { accent: 'bg-red-500', icon: 'bg-red-50 text-red-700', value: 'text-red-700', surface: 'hover:border-red-200' },
  blue: { accent: 'bg-blue-500', icon: 'bg-blue-50 text-blue-700', value: 'text-blue-700', surface: 'hover:border-blue-200' },
  slate: { accent: 'bg-gray-700', icon: 'bg-gray-900 text-white', value: 'text-gray-950', surface: 'hover:border-gray-300' },
}

const MetricCard = ({ label, value, helper, icon, tone = 'gray' }: MetricCardProps): JSX.Element => (
  <Card className={cn('overflow-hidden transition hover:-translate-y-0.5 hover:shadow-elevated', toneClasses[tone].surface)}>
    <div className={cn('h-1', toneClasses[tone].accent)} />
    <CardContent className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className={cn('mt-2 text-3xl font-semibold tracking-tight', toneClasses[tone].value)}>{value}</p>
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      </div>
      <div className={cn('rounded-lg p-2.5 shadow-panel ring-1 ring-inset ring-black/5', toneClasses[tone].icon)}>{icon}</div>
    </CardContent>
  </Card>
)

export { MetricCard }
