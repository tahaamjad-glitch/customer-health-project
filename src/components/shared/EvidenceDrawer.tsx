import { Lock, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { CommunicationSignal, UserRole } from '@/types'

interface EvidenceDrawerProps {
  isOpen: boolean
  role: UserRole
  signal?: CommunicationSignal
  onClose: () => void
}

const rawEvidenceRoles: UserRole[] = ['PM', 'Delivery Lead', 'POD Head', 'Project Director', 'PMO', 'Admin']
const commercialRoles: UserRole[] = ['AE', 'PMO', 'Leadership', 'Admin']

const EvidenceDrawer = ({ isOpen, role, signal, onClose }: EvidenceDrawerProps): JSX.Element | null => {
  if (!signal) return null

  const canViewRaw = rawEvidenceRoles.includes(role)
  const canViewCommercial = commercialRoles.includes(role)

  return (
    <Modal
      footer={
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      }
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Evidence Access"
    >
      <div className="space-y-4">
        <section className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-700" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-gray-950">Broad Summary</h3>
            <Badge tone="green">Visible</Badge>
          </div>
          <p className="mt-2 text-sm text-gray-600">{signal.summary}</p>
        </section>
        <section className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-gray-950">Raw Communication</h3>
            <Badge tone={canViewRaw ? 'green' : 'gray'}>{canViewRaw ? 'Allowed' : 'Restricted'}</Badge>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {canViewRaw
              ? `Source transcript excerpt from ${signal.participant}: score ${signal.score}, topics ${signal.topics.join(', ')}.`
              : 'Restricted to delivery leadership, PMO, and administrators.'}
          </p>
        </section>
        <section className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-gray-950">Commercial Notes</h3>
            <Badge tone={canViewCommercial ? 'green' : 'gray'}>{canViewCommercial ? 'Allowed' : 'Hidden'}</Badge>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {canViewCommercial
              ? 'Commercial context is visible for AE, PMO, Leadership, and Admin roles.'
              : 'Sensitive commercial notes are hidden from delivery roles.'}
          </p>
        </section>
      </div>
    </Modal>
  )
}

export { EvidenceDrawer }
