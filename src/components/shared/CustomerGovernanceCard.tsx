import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface CustomerGovernanceCardProps {
  inputSignalCount: number
  alertActionCount: number
  escalationCount: number
}

const CustomerGovernanceCard = ({
  inputSignalCount,
  alertActionCount,
  escalationCount,
}: CustomerGovernanceCardProps): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>Goals & Governance</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">Customer goals</p>
        <p className="mt-2 text-sm text-gray-700">
          Protect renewal path, stabilize delivery confidence, and create an executive-visible recovery cadence.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs text-blue-700">Input signals</p>
          <p className="text-xl font-semibold text-blue-900">{inputSignalCount}</p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
          <p className="text-xs text-amber-700">Alert action items</p>
          <p className="text-xl font-semibold text-amber-900">{alertActionCount}</p>
        </div>
        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-xs text-red-700">Escalations</p>
          <p className="text-xl font-semibold text-red-900">{escalationCount}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

export { CustomerGovernanceCard }
