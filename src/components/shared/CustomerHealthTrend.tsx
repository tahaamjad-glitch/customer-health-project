import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { RagBadge } from '@/components/shared/StatusBadges'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/FormControls'
import { getHealthStatus } from '@/lib/utils'
import type { Client, HealthHistoryPoint } from '@/types'

interface CustomerHealthTrendProps {
  clients: Client[]
  history: HealthHistoryPoint[]
}

interface TrendDatum {
  clientId: string
  week: string
  customerScore: number
  deliveryScore: number
  relationshipScore: number
}

const averagePointsByWeek = (history: HealthHistoryPoint[], clientIds: string[]): TrendDatum[] =>
  Array.from(new Set(history.map((point) => point.week))).map((week) => {
    const points = history.filter((point) => point.week === week && clientIds.includes(point.clientId))
    const divisor = Math.max(points.length, 1)

    return {
      clientId: 'portfolio',
      week,
      customerScore: Math.round(points.reduce((sum, point) => sum + point.customerScore, 0) / divisor),
      deliveryScore: Math.round(points.reduce((sum, point) => sum + point.deliveryScore, 0) / divisor),
      relationshipScore: Math.round(points.reduce((sum, point) => sum + point.relationshipScore, 0) / divisor),
    }
  })

const CustomerHealthTrend = ({ clients, history }: CustomerHealthTrendProps): JSX.Element => {
  const [selectedClientId, setSelectedClientId] = useState('portfolio')
  const visibleClientIds = clients.map((client) => client.id)
  const selectedClient = clients.find((client) => client.id === selectedClientId)
  const trend =
    selectedClientId === 'portfolio'
      ? averagePointsByWeek(history, visibleClientIds)
      : history.filter((point) => point.clientId === selectedClientId)
  const firstPoint = trend[0]
  const latestPoint = trend[trend.length - 1]
  const healthDelta = firstPoint && latestPoint ? latestPoint.customerScore - firstPoint.customerScore : 0
  const latestStatus = latestPoint ? getHealthStatus(latestPoint.customerScore) : undefined

  return (
    <Card className="overflow-hidden border-emerald-100 bg-emerald-50/45">
      <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-emerald-50 via-blue-50 to-amber-50 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Customer Health Trend</CardTitle>
          <p className="mt-1 text-sm text-gray-500">Weekly customer, delivery, and relationship health movement.</p>
        </div>
        <label className="text-sm font-medium text-gray-700">
          Customer
          <Select className="mt-2 min-w-56" onChange={(event) => setSelectedClientId(event.target.value)} value={selectedClientId}>
            <option value="portfolio">Visible customer portfolio</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company}
              </option>
            ))}
          </Select>
        </label>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Current health</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xl font-semibold text-emerald-800">{latestPoint?.customerScore ?? 0}</p>
              {latestStatus ? <RagBadge status={latestStatus} /> : null}
            </div>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs uppercase tracking-wide text-blue-700">12-week movement</p>
            <p className="mt-1 text-xl font-semibold text-blue-700">{healthDelta > 0 ? `+${healthDelta}` : healthDelta}</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
            <p className="text-xs uppercase tracking-wide text-amber-700">Trend scope</p>
            <p className="mt-1 text-sm font-semibold text-amber-900">{selectedClient?.company ?? `${clients.length} visible customers`}</p>
          </div>
        </div>
        <div className="h-80 rounded-lg border border-white/80 bg-white/70 p-3">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={trend}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(value: string) => value.slice(5)} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area dataKey="customerScore" fill="#dbeafe" name="Customer health" stroke="#2563eb" strokeWidth={2} />
              <Area dataKey="deliveryScore" fill="#fef3c7" name="Project delivery" stroke="#b45309" strokeWidth={2} />
              <Area dataKey="relationshipScore" fill="#dcfce7" name="Relationship" stroke="#15803d" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="blue">Customer health</Badge>
          <Badge tone="amber">Project delivery</Badge>
          <Badge tone="green">Relationship</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export { CustomerHealthTrend }
