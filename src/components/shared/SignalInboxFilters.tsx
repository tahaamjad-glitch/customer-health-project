import { Filter, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/FormControls'
import { DATA_SOURCE_LABELS, DATA_SOURCE_OPTIONS, SIGNAL_CONCERN_LABELS, SIGNAL_CONCERN_OPTIONS, SIGNAL_LIFECYCLE } from '@/constants'
import type {
  Client,
  DataSource,
  Project,
  SentimentLabel,
  SignalConcernType,
  SignalConfidenceFilter,
  SignalFilterState,
  SignalLifecycleStatus,
  SignalRiskFlagFilter,
} from '@/types'

interface SignalInboxFiltersProps {
  clients: Client[]
  projects: Project[]
  filters: SignalFilterState
  visibleCount: number
  lowConfidenceCount: number
  flaggedSignalCount: number
  reviewedSignalCount: number
  onChange: (filters: SignalFilterState) => void
  onReset: () => void
}

const SignalInboxFilters = ({
  clients,
  projects,
  filters,
  visibleCount,
  lowConfidenceCount,
  flaggedSignalCount,
  reviewedSignalCount,
  onChange,
  onReset,
}: SignalInboxFiltersProps): JSX.Element => {
  const handleChange = <Key extends keyof SignalFilterState>(key: Key, value: SignalFilterState[Key]): void => {
    onChange({ ...filters, [key]: value })
  }
  const visibleProjects = filters.clientId === 'all' ? projects : projects.filter((project) => project.clientId === filters.clientId)

  return (
    <Card>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm font-medium text-gray-700 md:col-span-2">
          Search
          <Input
            className="mt-2"
            onChange={(event) => handleChange('searchTerm', event.target.value)}
            placeholder="Customer, participant, summary, risk flag, or topic"
            value={filters.searchTerm}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Customer
          <Select className="mt-2" onChange={(event) => handleChange('clientId', event.target.value)} value={filters.clientId}>
            <option value="all">All customers</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Project
          <Select className="mt-2" onChange={(event) => handleChange('projectId', event.target.value)} value={filters.projectId}>
            <option value="all">All projects</option>
            {visibleProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Source
          <Select className="mt-2" onChange={(event) => handleChange('source', event.target.value as DataSource | 'all')} value={filters.source}>
            <option value="all">All sources</option>
            {DATA_SOURCE_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {DATA_SOURCE_LABELS[source]}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Concern Type
          <Select className="mt-2" onChange={(event) => handleChange('concernType', event.target.value as SignalConcernType | 'all')} value={filters.concernType}>
            <option value="all">All concerns</option>
            {SIGNAL_CONCERN_OPTIONS.map((concernType) => (
              <option key={concernType} value={concernType}>
                {SIGNAL_CONCERN_LABELS[concernType]}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Sentiment
          <Select className="mt-2" onChange={(event) => handleChange('sentiment', event.target.value as SentimentLabel | 'all')} value={filters.sentiment}>
            <option value="all">All sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="mixed">Mixed</option>
            <option value="negative">Negative</option>
          </Select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Lifecycle
          <Select className="mt-2" onChange={(event) => handleChange('lifecycleStatus', event.target.value as SignalLifecycleStatus | 'all')} value={filters.lifecycleStatus}>
            <option value="all">All lifecycle states</option>
            {SIGNAL_LIFECYCLE.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Confidence
          <Select className="mt-2" onChange={(event) => handleChange('confidence', event.target.value as SignalConfidenceFilter)} value={filters.confidence}>
            <option value="all">All confidence</option>
            <option value="low">Low below 65%</option>
            <option value="medium">Medium 65-84%</option>
            <option value="high">High 85%+</option>
          </Select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Risk Flags
          <Select className="mt-2" onChange={(event) => handleChange('riskFlags', event.target.value as SignalRiskFlagFilter)} value={filters.riskFlags}>
            <option value="all">All signals</option>
            <option value="has_flags">Has risk flags</option>
            <option value="no_flags">No risk flags</option>
          </Select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          From
          <Input className="mt-2" onChange={(event) => handleChange('dateFrom', event.target.value)} type="date" value={filters.dateFrom} />
        </label>
        <label className="text-sm font-medium text-gray-700">
          To
          <Input className="mt-2" onChange={(event) => handleChange('dateTo', event.target.value)} type="date" value={filters.dateTo} />
        </label>
        <div className="flex items-end">
          <Button className="w-full" onClick={onReset} variant="secondary">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset filters
          </Button>
        </div>
      </CardContent>
      <CardContent className="grid gap-4 border-t border-gray-100 md:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-xs uppercase tracking-wide text-blue-700">Visible signals</p>
          <p className="mt-2 text-2xl font-semibold text-blue-700">{visibleCount}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <p className="text-xs uppercase tracking-wide text-gray-500">Confidence threshold</p>
          </div>
          <p className="mt-2 text-sm text-gray-700">Signals below 65% require human review before scoring.</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-700">False-positive candidates</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">{lowConfidenceCount}</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-xs uppercase tracking-wide text-red-700">Flagged / reviewed</p>
          <p className="mt-2 text-2xl font-semibold text-red-700">{flaggedSignalCount} / {reviewedSignalCount}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export { SignalInboxFilters }
