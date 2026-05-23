import { Card, CardContent } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/FormControls'
import { CLIENT_TIER_LABELS, CLIENT_TIER_OPTIONS } from '@/constants'
import type { ClientTier, HealthStatus, ProjectCoverageFilter, RiskLevel } from '@/types'

interface CustomerFiltersPanelProps {
  searchTerm: string
  healthFilter: HealthStatus | 'all'
  riskFilter: RiskLevel | 'all'
  tierFilter: ClientTier | 'all'
  projectCoverageFilter: ProjectCoverageFilter
  projectHealthFilter: HealthStatus | 'all'
  visibleCustomerCount: number
  multiProjectCustomerCount: number
  totalProjectCount: number
  onSearchTermChange: (value: string) => void
  onHealthFilterChange: (value: HealthStatus | 'all') => void
  onRiskFilterChange: (value: RiskLevel | 'all') => void
  onTierFilterChange: (value: ClientTier | 'all') => void
  onProjectCoverageFilterChange: (value: ProjectCoverageFilter) => void
  onProjectHealthFilterChange: (value: HealthStatus | 'all') => void
}

const CustomerFiltersPanel = ({
  searchTerm,
  healthFilter,
  riskFilter,
  tierFilter,
  projectCoverageFilter,
  projectHealthFilter,
  visibleCustomerCount,
  multiProjectCustomerCount,
  totalProjectCount,
  onSearchTermChange,
  onHealthFilterChange,
  onRiskFilterChange,
  onTierFilterChange,
  onProjectCoverageFilterChange,
  onProjectHealthFilterChange,
}: CustomerFiltersPanelProps): JSX.Element => (
  <Card className="overflow-hidden border-blue-100 bg-blue-50/60">
    <div className="h-1 bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-600" />
    <CardContent className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
      <label className="text-sm font-medium text-gray-700 md:col-span-2 xl:col-span-2">
        Search
        <Input
          className="mt-2"
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Customer, contact, email, or project"
          value={searchTerm}
        />
      </label>
      <label className="text-sm font-medium text-gray-700">
        Customer Health
        <Select className="mt-2" onChange={(event) => onHealthFilterChange(event.target.value as HealthStatus | 'all')} value={healthFilter}>
          <option value="all">All health states</option>
          <option value="green">Green</option>
          <option value="amber">Amber</option>
          <option value="red">Red</option>
        </Select>
      </label>
      <label className="text-sm font-medium text-gray-700">
        Risk
        <Select className="mt-2" onChange={(event) => onRiskFilterChange(event.target.value as RiskLevel | 'all')} value={riskFilter}>
          <option value="all">All risk levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </label>
      <label className="text-sm font-medium text-gray-700">
        Tier
        <Select className="mt-2" onChange={(event) => onTierFilterChange(event.target.value as ClientTier | 'all')} value={tierFilter}>
          <option value="all">All tiers</option>
          {CLIENT_TIER_OPTIONS.map((tier) => (
            <option key={tier} value={tier}>
              {CLIENT_TIER_LABELS[tier]}
            </option>
          ))}
        </Select>
      </label>
      <label className="text-sm font-medium text-gray-700">
        Project Coverage
        <Select className="mt-2" onChange={(event) => onProjectCoverageFilterChange(event.target.value as ProjectCoverageFilter)} value={projectCoverageFilter}>
          <option value="all">All coverage</option>
          <option value="multiple_projects">Multiple projects</option>
          <option value="single_project">Single project</option>
          <option value="no_projects">No projects</option>
        </Select>
      </label>
      <label className="text-sm font-medium text-gray-700">
        Project Health
        <Select className="mt-2" onChange={(event) => onProjectHealthFilterChange(event.target.value as HealthStatus | 'all')} value={projectHealthFilter}>
          <option value="all">All project health</option>
          <option value="green">Green project</option>
          <option value="amber">Amber project</option>
          <option value="red">Red project</option>
        </Select>
      </label>
    </CardContent>
    <CardContent className="grid gap-4 border-t border-blue-100/80 md:grid-cols-3">
      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-xs uppercase tracking-wide text-emerald-700">Visible customers</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-800">{visibleCustomerCount}</p>
      </div>
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs uppercase tracking-wide text-blue-700">Customers with multiple projects</p>
        <p className="mt-2 text-2xl font-semibold text-blue-700">{multiProjectCustomerCount}</p>
      </div>
      <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
        <p className="text-xs uppercase tracking-wide text-amber-700">Total active projects</p>
        <p className="mt-2 text-2xl font-semibold text-amber-800">{totalProjectCount}</p>
      </div>
    </CardContent>
  </Card>
)

export { CustomerFiltersPanel }
