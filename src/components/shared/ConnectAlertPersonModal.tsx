import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/FormControls'
import { Modal } from '@/components/ui/Modal'
import type { Alert, AlertConnectionPerson } from '@/types'

interface ConnectAlertPersonModalProps {
  alert?: Alert
  people: AlertConnectionPerson[]
  isOpen: boolean
  isSaving: boolean
  onClose: () => void
  onConnect: (personId: string) => void
}

const ConnectAlertPersonModal = ({
  alert,
  people,
  isOpen,
  isSaving,
  onClose,
  onConnect,
}: ConnectAlertPersonModalProps): JSX.Element | null => {
  const [selectedPersonId, setSelectedPersonId] = useState(alert?.connectedPersonId ?? people[0]?.id ?? '')

  if (!alert) return null

  const handleConnect = (): void => {
    if (!selectedPersonId) return
    onConnect(selectedPersonId)
  }

  return (
    <Modal
      footer={
        <>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSaving || !selectedPersonId} onClick={handleConnect}>
            {isSaving ? 'Connecting...' : 'Connect person'}
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Relevant Person"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-semibold text-gray-950">{alert.clientName}</p>
          <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Relevant person
          <Select className="mt-2" onChange={(event) => setSelectedPersonId(event.target.value)} value={selectedPersonId}>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} · {person.role} · {person.team}
              </option>
            ))}
          </Select>
        </label>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
          This connects the selected person to the alert for follow-up ownership and routing visibility.
        </div>
      </div>
    </Modal>
  )
}

export { ConnectAlertPersonModal }
