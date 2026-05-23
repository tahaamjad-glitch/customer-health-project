import { addDays, format } from 'date-fns'

import type { ActionItem, Alert, UserRole } from '@/types'

const createActionFromAlert = (alert: Alert, ownerRole: UserRole): Omit<ActionItem, 'id'> => ({
  clientId: alert.clientId,
  title: `Resolve alert: ${alert.type.replace('_', ' ')}`,
  owner: ownerRole,
  ownerRole,
  dueDate: format(addDays(new Date('2026-05-22'), 3), 'yyyy-MM-dd'),
  status: 'open',
  severity: alert.severity,
})

export { createActionFromAlert }
