import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Select, Textarea } from '@/components/ui/FormControls'
import { Modal } from '@/components/ui/Modal'
import { SIGNAL_LIFECYCLE } from '@/constants'
import type { CommunicationSignal, SignalLifecycleStatus } from '@/types'

interface ReviewDecisionModalProps {
  isOpen: boolean
  signal?: CommunicationSignal
  isSaving: boolean
  onClose: () => void
  onSubmit: (status: SignalLifecycleStatus, dismissalReason?: string) => void
}

const ReviewDecisionModal = ({ isOpen, signal, isSaving, onClose, onSubmit }: ReviewDecisionModalProps): JSX.Element | null => {
  const [status, setStatus] = useState<SignalLifecycleStatus>('reviewed')
  const [dismissalReason, setDismissalReason] = useState('')

  if (!signal) return null

  const handleSubmit = (): void => {
    onSubmit(status, dismissalReason || undefined)
  }

  return (
    <Modal
      footer={
        <>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSaving} onClick={handleSubmit}>
            {isSaving ? 'Saving...' : 'Save review'}
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      title="Review Signal"
    >
      <div className="space-y-4">
        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{signal.summary}</p>
        <label className="block text-sm font-medium text-gray-700">
          Lifecycle status
          <Select className="mt-2" onChange={(event) => setStatus(event.target.value as SignalLifecycleStatus)} value={status}>
            {SIGNAL_LIFECYCLE.map((item) => (
              <option key={item} value={item}>
                {item.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Dismissal reason or override note
          <Textarea
            className="mt-2"
            onChange={(event) => setDismissalReason(event.target.value)}
            placeholder="Required for false positives or human overrides"
            value={dismissalReason}
          />
        </label>
      </div>
    </Modal>
  )
}

export { ReviewDecisionModal }
