import { Plus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { CustomerCreateModal } from '@/components/shared/CustomerCreateModal'
import { CustomerFiltersPanel } from '@/components/shared/CustomerFiltersPanel'
import { CustomerHealthTrend } from '@/components/shared/CustomerHealthTrend'
import { CustomerTable } from '@/components/shared/CustomerTable'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { alertsApi } from '@/lib/api/alerts.api'
import { clientsApi } from '@/lib/api/clients.api'
import { configApi } from '@/lib/api/config.api'
import { escalationsApi } from '@/lib/api/escalations.api'
import { projectsApi } from '@/lib/api/projects.api'
import { signalsApi } from '@/lib/api/signals.api'
import { buildCustomerProjectSummaries, matchesProjectCoverage, matchesProjectHealth } from '@/lib/customerProjects'
import { useUiStore } from '@/store/uiStore'
import type { ClientTier, CustomerOnboardingPayload, HealthStatus, ProjectCoverageFilter } from '@/types'

const CustomersPage = (): JSX.Element => {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [projectCoverageFilter, setProjectCoverageFilter] = useState<ProjectCoverageFilter>('all')
  const [projectHealthFilter, setProjectHealthFilter] = useState<HealthStatus | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<ClientTier | 'all'>('all')
  const activeHealthFilter = useUiStore((state) => state.activeHealthFilter)
  const activeRiskFilter = useUiStore((state) => state.activeRiskFilter)
  const setActiveHealthFilter = useUiStore((state) => state.setActiveHealthFilter)
  const setActiveRiskFilter = useUiStore((state) => state.setActiveRiskFilter)

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsApi.getAll,
  })
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  })
  const connectorsQuery = useQuery({
    queryKey: ['source-connectors'],
    queryFn: configApi.getConnectors,
  })
  const historyQuery = useQuery({
    queryKey: ['health-history'],
    queryFn: configApi.getHealthHistory,
  })
  const alertsQuery = useQuery({ queryKey: ['alerts'], queryFn: alertsApi.getAll })
  const signalsQuery = useQuery({ queryKey: ['signals'], queryFn: signalsApi.getAll })
  const escalationsQuery = useQuery({ queryKey: ['escalations'], queryFn: escalationsApi.getAll })

  const createMutation = useMutation({
    mutationFn: async (data: CustomerOnboardingPayload) => {
      const client = await clientsApi.create(data.client)
      const project = await projectsApi.create({ ...data.project, clientId: client.id })
      const connectorProvisions = await configApi.provisionCustomerConnectors(client.id, data.connectorIds)
      return { client, project, connectorProvisions }
    },
    onSuccess: ({ connectorProvisions }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success(`Customer onboarded with ${connectorProvisions.length} connectors`)
      setIsCreateOpen(false)
    },
    onError: () => toast.error('Something went wrong'),
  })

  const projectSummaries = buildCustomerProjectSummaries(clients, projectsQuery.data ?? [])
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const multiProjectCustomers = clients.filter((client) => projectSummaries[client.id]?.projectCount > 1).length
  const alertCounts = (alertsQuery.data ?? []).reduce<Record<string, number>>((counts, alert) => ({
    ...counts,
    [alert.clientId]: (counts[alert.clientId] ?? 0) + 1,
  }), {})
  const signalCounts = (signalsQuery.data ?? []).reduce<Record<string, number>>((counts, signal) => ({
    ...counts,
    [signal.clientId]: (counts[signal.clientId] ?? 0) + 1,
  }), {})
  const escalationCounts = (escalationsQuery.data ?? []).reduce<Record<string, number>>((counts, escalation) => ({
    ...counts,
    [escalation.clientId]: (counts[escalation.clientId] ?? 0) + 1,
  }), {})
  const filteredClients = clients.filter((client) => {
    const summary = projectSummaries[client.id]
    const healthMatch = activeHealthFilter === 'all' || client.healthStatus === activeHealthFilter
    const riskMatch = activeRiskFilter === 'all' || client.riskLevel === activeRiskFilter
    const tierMatch = tierFilter === 'all' || client.tier === tierFilter
    const coverageMatch = summary ? matchesProjectCoverage(summary, projectCoverageFilter) : false
    const projectHealthMatch = summary ? matchesProjectHealth(summary, projectHealthFilter) : false
    const searchMatch =
      !normalizedSearchTerm ||
      client.company.toLowerCase().includes(normalizedSearchTerm) ||
      client.name.toLowerCase().includes(normalizedSearchTerm) ||
      client.email.toLowerCase().includes(normalizedSearchTerm) ||
      summary?.projectNames.some((projectName) => projectName.toLowerCase().includes(normalizedSearchTerm))

    return healthMatch && riskMatch && tierMatch && coverageMatch && projectHealthMatch && searchMatch
  })

  const handleCreateCustomer = (data: CustomerOnboardingPayload): void => {
    createMutation.mutate(data)
  }

  if (
    isLoading ||
    projectsQuery.isLoading ||
    connectorsQuery.isLoading ||
    historyQuery.isLoading ||
    alertsQuery.isLoading ||
    signalsQuery.isLoading ||
    escalationsQuery.isLoading
  ) return <div className="p-6"><SkeletonList /></div>
  if (
    error ||
    projectsQuery.error ||
    connectorsQuery.error ||
    historyQuery.error ||
    alertsQuery.error ||
    signalsQuery.error ||
    escalationsQuery.error
  ) return <div className="p-6"><ErrorMessage message="Unable to load customers." /></div>

  return (
    <>
      <PageHeader
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Onboard customer
          </Button>
        }
        description="Customer-level scores, multiple projects per account, account risk, renewal exposure, and portfolio filters."
        title="Customer Portfolio"
      />
      <div className="space-y-5 p-6">
        <CustomerFiltersPanel
          healthFilter={activeHealthFilter}
          multiProjectCustomerCount={multiProjectCustomers}
          onHealthFilterChange={setActiveHealthFilter}
          onProjectCoverageFilterChange={setProjectCoverageFilter}
          onProjectHealthFilterChange={setProjectHealthFilter}
          onRiskFilterChange={setActiveRiskFilter}
          onSearchTermChange={setSearchTerm}
          onTierFilterChange={setTierFilter}
          projectCoverageFilter={projectCoverageFilter}
          projectHealthFilter={projectHealthFilter}
          riskFilter={activeRiskFilter}
          searchTerm={searchTerm}
          tierFilter={tierFilter}
          totalProjectCount={projectsQuery.data?.length ?? 0}
          visibleCustomerCount={filteredClients.length}
        />
        {filteredClients.length > 0 ? (
          <>
            <CustomerHealthTrend clients={filteredClients} history={historyQuery.data ?? []} />
            <CustomerTable
              alertCounts={alertCounts}
              clients={filteredClients}
              escalationCounts={escalationCounts}
              projectSummaries={projectSummaries}
              signalCounts={signalCounts}
            />
          </>
        ) : (
          <EmptyState title="No matching customers" message="Adjust the customer, project, or risk filters to expand the portfolio view." />
        )}
      </div>
      <CustomerCreateModal
        connectors={connectorsQuery.data ?? []}
        isOpen={isCreateOpen}
        isSaving={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateCustomer}
      />
    </>
  )
}

export default CustomersPage
