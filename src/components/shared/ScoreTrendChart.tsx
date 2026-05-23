import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { HealthHistoryPoint } from '@/types'

interface ScoreTrendChartProps {
  title: string
  data: HealthHistoryPoint[]
}

const ScoreTrendChart = ({ title, data }: ScoreTrendChartProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="h-72">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={data}>
          <CartesianGrid stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(value: string) => value.slice(5)} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area dataKey="customerScore" name="Customer score" stroke="#111827" fill="#e5e7eb" strokeWidth={2} />
          <Area dataKey="deliveryScore" name="Delivery score" stroke="#b45309" fill="#fef3c7" strokeWidth={2} />
          <Area dataKey="relationshipScore" name="Relationship score" stroke="#15803d" fill="#dcfce7" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

export { ScoreTrendChart }
