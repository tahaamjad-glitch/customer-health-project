import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { Client, HealthStatus } from '@/types'

interface CustomerHealthGraphProps {
  clients: Client[]
}

interface CustomerHealthDatum {
  id: string
  company: string
  score: number
  status: HealthStatus
  churnRisk: number
}

const statusFill: Record<HealthStatus, string> = {
  green: '#15803d',
  amber: '#b45309',
  red: '#b91c1c',
}

const statusTone: Record<HealthStatus, 'green' | 'amber' | 'red'> = {
  green: 'green',
  amber: 'amber',
  red: 'red',
}

const CustomerHealthGraph = ({ clients }: CustomerHealthGraphProps): JSX.Element => {
  const data: CustomerHealthDatum[] = clients
    .map((client) => ({
      id: client.id,
      company: client.company,
      score: client.healthScore,
      status: client.healthStatus,
      churnRisk: client.churnRisk,
    }))
    .sort((first, second) => first.score - second.score)

  const averageScore = data.length ? Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length) : 0
  const highestChurnRisk = data.length ? Math.max(...data.map((item) => item.churnRisk)) : 0

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Customer Health Graph</CardTitle>
          <p className="mt-1 text-sm text-gray-500">Lowest health scores first, separated from project-level delivery health.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="green">Green 70+</Badge>
          <Badge tone="amber">Amber 50-69</Badge>
          <Badge tone="red">Red &lt;50</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Average customer score</p>
            <p className="mt-1 text-xl font-semibold text-gray-950">{averageScore}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Red customers</p>
            <p className="mt-1 text-xl font-semibold text-gray-950">{data.filter((item) => item.status === 'red').length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Highest churn risk</p>
            <p className="mt-1 text-xl font-semibold text-gray-950">{highestChurnRisk}%</p>
          </div>
        </div>
        <div className="h-[28rem]">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 42, right: 20 }}>
              <CartesianGrid horizontal={false} stroke="#eef2f7" />
              <XAxis dataKey="score" domain={[0, 100]} tick={{ fontSize: 11 }} type="number" />
              <YAxis dataKey="company" tick={{ fontSize: 11 }} type="category" width={150} />
              <Tooltip />
              <ReferenceLine stroke="#b45309" strokeDasharray="4 4" x={50} />
              <ReferenceLine stroke="#15803d" strokeDasharray="4 4" x={70} />
              <Bar dataKey="score" name="Health score" radius={[0, 4, 4, 0]}>
                {data.map((item) => (
                  <Cell fill={statusFill[item.status]} key={item.id} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {data.slice(0, 3).map((item) => (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3" key={item.id}>
              <div>
                <p className="text-sm font-medium text-gray-950">{item.company}</p>
                <p className="text-xs text-gray-500">Churn risk {item.churnRisk}%</p>
              </div>
              <Badge tone={statusTone[item.status]}>{item.score}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { CustomerHealthGraph }
