import { FileCheck2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/FormControls'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorMessage, SkeletonList } from '@/components/ui/StateViews'
import { escalationsApi } from '@/lib/api/escalations.api'

const EscalationsPage = (): JSX.Element => {
  const queryClient = useQueryClient()
  const [closingId, setClosingId] = useState<string>()
  const [closureNotes, setClosureNotes] = useState('')
  const { data: escalationCases = [], isLoading, error } = useQuery({
    queryKey: ['escalations'],
    queryFn: escalationsApi.getAll,
  })

  const closeMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      escalationsApi.update(id, { status: 'closed', closureNotes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] })
      toast.success('Escalation closed')
      setClosingId(undefined)
      setClosureNotes('')
    },
    onError: () => toast.error('Unable to close escalation'),
  })

  if (isLoading) return <div className="p-6"><SkeletonList /></div>
  if (error) return <div className="p-6"><ErrorMessage message="Unable to load escalations." /></div>

  const activeCases = escalationCases.filter((item) => item.status !== 'closed')
  const selectedCase = escalationCases.find((item) => item.id === closingId)

  const handleCloseCase = (): void => {
    if (!closingId) return
    closeMutation.mutate({ id: closingId, notes: closureNotes })
  }

  return (
    <>
      <PageHeader
        description="Escalation ownership, recovery plans, due dates, and closure governance."
        title="Escalation Cases"
      />
      <div className="grid gap-6 p-6 xl:grid-cols-[1fr_0.45fr]">
        <div className="space-y-4">
          {activeCases.length > 0 ? (
            activeCases.map((item) => (
              <Card key={item.id}>
                <CardContent className="space-y-4">
                  <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                    <div>
                      <p className="text-sm font-semibold capitalize text-gray-950">{item.status.replace('_', ' ')}</p>
                      <p className="mt-2 text-sm text-gray-600">{item.triggerCondition}</p>
                    </div>
                    <Button onClick={() => setClosingId(item.id)} variant="secondary">
                      <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                      Close case
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Owner</p>
                      <p className="mt-1 text-sm text-gray-950">{item.owner}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Due date</p>
                      <p className="mt-1 text-sm text-gray-950">{item.dueDate}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Project</p>
                      <p className="mt-1 text-sm text-gray-950">{item.projectId ?? 'Account level'}</p>
                    </div>
                  </div>
                  <p className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">{item.recoveryPlan}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState title="No open escalations" message="High-severity alerts can open escalation cases when recovery governance is required." />
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>1. Trigger condition crosses severity threshold.</p>
            <p>2. Escalation owner accepts recovery accountability.</p>
            <p>3. Recovery plan and due dates are published.</p>
            <p>4. Closure notes capture outcome and scoring feedback.</p>
          </CardContent>
        </Card>
      </div>
      <Modal
        footer={
          <>
            <Button onClick={() => setClosingId(undefined)} variant="secondary">
              Cancel
            </Button>
            <Button disabled={closeMutation.isPending} onClick={handleCloseCase}>
              {closeMutation.isPending ? 'Closing...' : 'Close escalation'}
            </Button>
          </>
        }
        isOpen={Boolean(selectedCase)}
        onClose={() => setClosingId(undefined)}
        title="Close Escalation"
      >
        <label className="block text-sm font-medium text-gray-700">
          Closure notes
          <Textarea className="mt-2" onChange={(event) => setClosureNotes(event.target.value)} value={closureNotes} />
        </label>
      </Modal>
    </>
  )
}

export default EscalationsPage
