import { MailPlus, ShieldCheck, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/FormControls'
import { ROLE_OPTIONS } from '@/constants'
import type { UserInvite, UserRole } from '@/types'

interface InviteUsersPanelProps {
  invites: UserInvite[]
  isSaving: boolean
  onInvite: (invite: Omit<UserInvite, 'id' | 'status'>) => void
}

const statusTone: Record<UserInvite['status'], 'green' | 'amber'> = {
  accepted: 'green',
  pending: 'amber',
}

const InviteUsersPanel = ({ invites, isSaving, onInvite }: InviteUsersPanelProps): JSX.Element => {
  const inviterOptions = Array.from(new Set([...invites.map((invite) => invite.invitedBy), ...invites.map((invite) => invite.name)]))
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Project Director' as UserRole,
    invitedBy: inviterOptions[0] ?? 'PMO Directory Super Admin',
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onInvite(form)
    setForm((current) => ({ ...current, name: '', email: '' }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Invite Users</CardTitle>
            <p className="mt-1 text-sm text-gray-500">PMO super admins add Project Directors; Project Directors add PMs and Delivery Leads.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <form className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-gray-700">
            Name
            <Input
              className="mt-2"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Full name"
              required
              value={form.name}
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Email
            <Input
              className="mt-2"
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="name@company.com"
              required
              type="email"
              value={form.email}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Role
              <Select className="mt-2" onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))} value={form.role}>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Invited by
              <Select className="mt-2" onChange={(event) => setForm((current) => ({ ...current, invitedBy: event.target.value }))} value={form.invitedBy}>
                {inviterOptions.map((inviter) => (
                  <option key={inviter} value={inviter}>{inviter}</option>
                ))}
              </Select>
            </label>
          </div>
          <Button disabled={isSaving} type="submit">
            <MailPlus className="h-4 w-4" aria-hidden="true" />
            {isSaving ? 'Sending...' : 'Send invite'}
          </Button>
        </form>
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-700" aria-hidden="true" />
              <p className="text-sm font-semibold text-blue-900">Directory delegation</p>
            </div>
            <p className="mt-2 text-sm text-blue-800">
              Super admin controls Project Director creation. Project Directors can add PMs and Delivery Leads under their portfolio.
            </p>
          </div>
          {invites.map((invite) => (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3" key={invite.id}>
              <div>
                <p className="text-sm font-semibold text-gray-950">{invite.name}</p>
                <p className="text-xs text-gray-500">{invite.email} · invited by {invite.invitedBy}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Badge tone="blue">{invite.role}</Badge>
                <Badge tone={statusTone[invite.status]}>{invite.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { InviteUsersPanel }
