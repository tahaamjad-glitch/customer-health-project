import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type BadgeTone = 'gray' | 'green' | 'amber' | 'red' | 'blue'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  tone?: BadgeTone
}

const toneClasses: Record<BadgeTone, string> = {
  gray: 'bg-gray-100 text-gray-700 ring-gray-200',
  green: 'bg-green-50 text-green-700 ring-green-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
}

const Badge = ({ children, className, tone = 'gray', ...props }: BadgeProps): JSX.Element => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
      toneClasses[tone],
      className,
    )}
    {...props}
  >
    {children}
  </span>
)

export { Badge }
