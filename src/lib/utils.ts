import { clsx, type ClassValue } from 'clsx'
import { format, parseISO } from 'date-fns'
import { twMerge } from 'tailwind-merge'

import type { HealthStatus, RiskLevel } from '@/types'

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export const formatPercent = (value: number): string => `${Math.round(value)}%`

export const formatDate = (value: string): string => format(parseISO(value), 'MMM d, yyyy')

export const getHealthStatus = (score: number): HealthStatus => {
  if (score >= 70) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}

export const getHealthColorClass = (status: HealthStatus): string => {
  const classes: Record<HealthStatus, string> = {
    green: 'bg-green-50 text-green-700 ring-green-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
  }

  return classes[status]
}

export const getRiskColorClass = (level: RiskLevel): string => {
  const classes: Record<RiskLevel, string> = {
    critical: 'bg-red-100 text-red-800 ring-red-300',
    high: 'bg-orange-50 text-orange-700 ring-orange-200',
    medium: 'bg-amber-50 text-amber-700 ring-amber-200',
    low: 'bg-green-50 text-green-700 ring-green-200',
  }

  return classes[level]
}
