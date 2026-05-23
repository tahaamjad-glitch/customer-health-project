import { useState, type FormEvent } from 'react'

import {
  CLIENT_TIER_LABELS,
  CLIENT_TIER_OPTIONS,
  HEALTH_LABELS,
  HEALTH_STATUS_OPTIONS,
  PROJECT_STAGE_LABELS,
  PROJECT_STAGE_OPTIONS,
  RISK_LABELS,
  RISK_LEVEL_OPTIONS,
  SENTIMENT_OPTIONS,
} from '@/constants'
import { ConnectorChecklist } from '@/components/shared/ConnectorChecklist'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/FormControls'
import { Modal } from '@/components/ui/Modal'
import { DEFAULT_CLIENT_DRAFT, DEFAULT_PROJECT_DRAFT } from '@/lib/onboardingDefaults'
import { getHealthStatus } from '@/lib/utils'
import type { ClientTier, CustomerOnboardingPayload, HealthStatus, ProjectStage, RiskLevel, SentimentLabel, SourceConnector } from '@/types'

interface CustomerCreateModalProps {
  isOpen: boolean
  isSaving: boolean
  connectors: SourceConnector[]
  onClose: () => void
  onSubmit: (data: CustomerOnboardingPayload) => void
}

type ClientDraft = CustomerOnboardingPayload['client']
type ProjectDraft = CustomerOnboardingPayload['project']
type ClientTextField = 'name' | 'company' | 'email' | 'industry' | 'renewalDate' | 'csm' | 'lastActivity'
type ClientNumberField = 'contractValue' | 'healthScore' | 'churnRisk' | 'engagementScore'
type ProjectTextField = 'name' | 'projectManager' | 'director' | 'nextMilestone' | 'dueDate'
type ProjectNumberField = 'healthScore' | 'deliveryRisk' | 'milestoneConfidence' | 'activeSignals' | 'openActions'

const CustomerCreateModal = ({ isOpen, isSaving, connectors, onClose, onSubmit }: CustomerCreateModalProps): JSX.Element => {
  const defaultConnectorIds = connectors.filter((connector) => connector.status === 'connected').map((connector) => connector.id)
  const [clientData, setClientData] = useState<ClientDraft>(DEFAULT_CLIENT_DRAFT)
  const [projectData, setProjectData] = useState<ProjectDraft>(DEFAULT_PROJECT_DRAFT)
  const [selectedConnectorIds, setSelectedConnectorIds] = useState<string[]>(defaultConnectorIds)

  const handleReset = (): void => {
    setClientData(DEFAULT_CLIENT_DRAFT)
    setProjectData(DEFAULT_PROJECT_DRAFT)
    setSelectedConnectorIds(defaultConnectorIds)
  }

  const handleClose = (): void => {
    handleReset()
    onClose()
  }

  const handleClientTextChange = (field: ClientTextField, value: string): void => {
    setClientData((current) => ({ ...current, [field]: value }))
  }

  const handleClientNumberChange = (field: ClientNumberField, value: string): void => {
    const numericValue = Number(value)
    setClientData((current) => ({
      ...current,
      [field]: numericValue,
      ...(field === 'healthScore' ? { healthStatus: getHealthStatus(numericValue) } : {}),
    }))
  }

  const handleProjectTextChange = (field: ProjectTextField, value: string): void => {
    setProjectData((current) => ({ ...current, [field]: value }))
  }

  const handleProjectNumberChange = (field: ProjectNumberField, value: string): void => {
    const numericValue = Number(value)
    setProjectData((current) => ({
      ...current,
      [field]: numericValue,
      ...(field === 'healthScore' ? { healthStatus: getHealthStatus(numericValue) } : {}),
    }))
  }

  const handleTagsChange = (value: string): void => {
    setClientData((current) => ({ ...current, tags: value.split(',').map((tag) => tag.trim()).filter(Boolean) }))
  }

  const handleToggleConnector = (connectorId: string): void => {
    setSelectedConnectorIds((current) =>
      current.includes(connectorId) ? current.filter((id) => id !== connectorId) : [...current, connectorId],
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onSubmit({ client: clientData, project: projectData, connectorIds: selectedConnectorIds })
    handleReset()
  }

  return (
    <Modal
      footer={
        <>
          <Button onClick={handleClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSaving} form="customer-onboarding-form" type="submit">
            {isSaving ? 'Onboarding...' : 'Onboard customer'}
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title="Onboard New Customer"
    >
      <form className="space-y-6" id="customer-onboarding-form" onSubmit={handleSubmit}>
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-950">Customer profile</h3>
            <p className="text-xs text-gray-500">Account-level fields used for portfolio health and renewal risk.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">Contact name<Input required className="mt-2" onChange={(event) => handleClientTextChange('name', event.target.value)} value={clientData.name} /></label>
            <label className="text-sm font-medium text-gray-700">Company<Input required className="mt-2" onChange={(event) => handleClientTextChange('company', event.target.value)} value={clientData.company} /></label>
            <label className="text-sm font-medium text-gray-700">Email<Input required className="mt-2" onChange={(event) => handleClientTextChange('email', event.target.value)} type="email" value={clientData.email} /></label>
            <label className="text-sm font-medium text-gray-700">Industry<Input required className="mt-2" onChange={(event) => handleClientTextChange('industry', event.target.value)} value={clientData.industry} /></label>
            <label className="text-sm font-medium text-gray-700">Contract value<Input required className="mt-2" min={0} onChange={(event) => handleClientNumberChange('contractValue', event.target.value)} type="number" value={clientData.contractValue} /></label>
            <label className="text-sm font-medium text-gray-700">Renewal date<Input required className="mt-2" onChange={(event) => handleClientTextChange('renewalDate', event.target.value)} type="date" value={clientData.renewalDate} /></label>
            <label className="text-sm font-medium text-gray-700">Tier<Select className="mt-2" onChange={(event) => setClientData((current) => ({ ...current, tier: event.target.value as ClientTier }))} value={clientData.tier}>{CLIENT_TIER_OPTIONS.map((tier) => <option key={tier} value={tier}>{CLIENT_TIER_LABELS[tier]}</option>)}</Select></label>
            <label className="text-sm font-medium text-gray-700">Customer health score<Input required className="mt-2" max={100} min={0} onChange={(event) => handleClientNumberChange('healthScore', event.target.value)} type="number" value={clientData.healthScore} /></label>
            <label className="text-sm font-medium text-gray-700">Customer health<Select className="mt-2" onChange={(event) => setClientData((current) => ({ ...current, healthStatus: event.target.value as HealthStatus }))} value={clientData.healthStatus}>{HEALTH_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{HEALTH_LABELS[status]}</option>)}</Select></label>
            <label className="text-sm font-medium text-gray-700">Churn risk<Input required className="mt-2" max={100} min={0} onChange={(event) => handleClientNumberChange('churnRisk', event.target.value)} type="number" value={clientData.churnRisk} /></label>
            <label className="text-sm font-medium text-gray-700">Risk level<Select className="mt-2" onChange={(event) => setClientData((current) => ({ ...current, riskLevel: event.target.value as RiskLevel }))} value={clientData.riskLevel}>{RISK_LEVEL_OPTIONS.map((level) => <option key={level} value={level}>{RISK_LABELS[level]}</option>)}</Select></label>
            <label className="text-sm font-medium text-gray-700">CSM<Input required className="mt-2" onChange={(event) => handleClientTextChange('csm', event.target.value)} value={clientData.csm} /></label>
            <label className="text-sm font-medium text-gray-700">Last activity<Input required className="mt-2" onChange={(event) => handleClientTextChange('lastActivity', event.target.value)} type="date" value={clientData.lastActivity} /></label>
            <label className="text-sm font-medium text-gray-700">Engagement score<Input required className="mt-2" max={100} min={0} onChange={(event) => handleClientNumberChange('engagementScore', event.target.value)} type="number" value={clientData.engagementScore} /></label>
            <label className="text-sm font-medium text-gray-700">Sentiment trend<Select className="mt-2" onChange={(event) => setClientData((current) => ({ ...current, sentimentTrend: event.target.value as SentimentLabel }))} value={clientData.sentimentTrend}>{SENTIMENT_OPTIONS.map((sentiment) => <option key={sentiment} value={sentiment}>{sentiment}</option>)}</Select></label>
            <label className="text-sm font-medium text-gray-700 md:col-span-2">Tags<Input className="mt-2" onChange={(event) => handleTagsChange(event.target.value)} placeholder="New, Enterprise, Tier 1" value={clientData.tags.join(', ')} /></label>
          </div>
        </section>
        <section className="space-y-3 border-t border-gray-100 pt-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-950">Initial project setup</h3>
            <p className="text-xs text-gray-500">Required project fields are captured during onboarding.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700 md:col-span-2">Project name<Input required className="mt-2" onChange={(event) => handleProjectTextChange('name', event.target.value)} value={projectData.name} /></label>
            <label className="text-sm font-medium text-gray-700">Project stage<Select className="mt-2" onChange={(event) => setProjectData((current) => ({ ...current, stage: event.target.value as ProjectStage }))} value={projectData.stage}>{PROJECT_STAGE_OPTIONS.map((stage) => <option key={stage} value={stage}>{PROJECT_STAGE_LABELS[stage]}</option>)}</Select></label>
            <label className="text-sm font-medium text-gray-700">Project owner / PM<Input required className="mt-2" onChange={(event) => handleProjectTextChange('projectManager', event.target.value)} value={projectData.projectManager} /></label>
            <label className="text-sm font-medium text-gray-700">Project director<Input required className="mt-2" onChange={(event) => handleProjectTextChange('director', event.target.value)} value={projectData.director} /></label>
            <label className="text-sm font-medium text-gray-700">Jira risk<Select className="mt-2" onChange={(event) => setProjectData((current) => ({ ...current, jiraRisk: event.target.value as RiskLevel }))} value={projectData.jiraRisk}>{RISK_LEVEL_OPTIONS.map((level) => <option key={level} value={level}>{RISK_LABELS[level]}</option>)}</Select></label>
            <label className="text-sm font-medium text-gray-700">Project health score<Input required className="mt-2" max={100} min={0} onChange={(event) => handleProjectNumberChange('healthScore', event.target.value)} type="number" value={projectData.healthScore} /></label>
            <label className="text-sm font-medium text-gray-700">Project health<Select className="mt-2" onChange={(event) => setProjectData((current) => ({ ...current, healthStatus: event.target.value as HealthStatus }))} value={projectData.healthStatus}>{HEALTH_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{HEALTH_LABELS[status]}</option>)}</Select></label>
            <label className="text-sm font-medium text-gray-700">Delivery risk<Input required className="mt-2" max={100} min={0} onChange={(event) => handleProjectNumberChange('deliveryRisk', event.target.value)} type="number" value={projectData.deliveryRisk} /></label>
            <label className="text-sm font-medium text-gray-700">Milestone confidence<Input required className="mt-2" max={100} min={0} onChange={(event) => handleProjectNumberChange('milestoneConfidence', event.target.value)} type="number" value={projectData.milestoneConfidence} /></label>
            <label className="text-sm font-medium text-gray-700">Active signals<Input required className="mt-2" min={0} onChange={(event) => handleProjectNumberChange('activeSignals', event.target.value)} type="number" value={projectData.activeSignals} /></label>
            <label className="text-sm font-medium text-gray-700">Open actions<Input required className="mt-2" min={0} onChange={(event) => handleProjectNumberChange('openActions', event.target.value)} type="number" value={projectData.openActions} /></label>
            <label className="text-sm font-medium text-gray-700">Next milestone<Input required className="mt-2" onChange={(event) => handleProjectTextChange('nextMilestone', event.target.value)} value={projectData.nextMilestone} /></label>
            <label className="text-sm font-medium text-gray-700">Due date<Input required className="mt-2" onChange={(event) => handleProjectTextChange('dueDate', event.target.value)} type="date" value={projectData.dueDate} /></label>
          </div>
        </section>
        <section className="space-y-3 border-t border-gray-100 pt-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-950">Connectors</h3>
            <p className="text-xs text-gray-500">Select source systems to provision for the new customer.</p>
          </div>
          <ConnectorChecklist connectors={connectors} onToggle={handleToggleConnector} selectedConnectorIds={selectedConnectorIds} />
        </section>
      </form>
    </Modal>
  )
}

export { CustomerCreateModal }
