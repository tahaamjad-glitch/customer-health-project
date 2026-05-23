import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { SOURCE_WEIGHT_SUMMARY } from '@/constants'

const ScoreBreakdownChart = (): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>Source Weight Breakdown</CardTitle>
    </CardHeader>
    <CardContent className="h-72">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={SOURCE_WEIGHT_SUMMARY} layout="vertical" margin={{ left: 18 }}>
          <CartesianGrid stroke="#eef2f7" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="source" type="category" width={120} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="weight" name="Weight" fill="#374151" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

export { ScoreBreakdownChart }
