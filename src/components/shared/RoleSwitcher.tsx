import { BriefcaseBusiness, CheckCircle2, ChevronDown, Crown, FolderKanban, Handshake, ShieldCheck, UserRound, Users } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'

import { Badge } from '@/components/ui/Badge'
import { ROLE_OPTIONS, ROLE_PROFILES } from '@/constants'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface RoleSwitcherProps {
  activeRole: UserRole
  onChange: (role: UserRole) => void
}

const roleIconMap: Record<UserRole, JSX.Element> = {
  PM: <FolderKanban className="h-4 w-4" aria-hidden="true" />,
  'Delivery Lead': <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />,
  'POD Head': <Users className="h-4 w-4" aria-hidden="true" />,
  'Project Director': <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />,
  AE: <Handshake className="h-4 w-4" aria-hidden="true" />,
  PMO: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
  Leadership: <Crown className="h-4 w-4" aria-hidden="true" />,
  Admin: <UserRound className="h-4 w-4" aria-hidden="true" />,
}

const roleToneMap: Record<UserRole, 'gray' | 'green' | 'amber' | 'red' | 'blue'> = {
  PM: 'blue',
  'Delivery Lead': 'blue',
  'POD Head': 'amber',
  'Project Director': 'amber',
  AE: 'green',
  PMO: 'red',
  Leadership: 'red',
  Admin: 'gray',
}

const roleSurfaceMap: Record<UserRole, string> = {
  PM: 'bg-blue-50 text-blue-700 ring-blue-100',
  'Delivery Lead': 'bg-blue-50 text-blue-700 ring-blue-100',
  'POD Head': 'bg-amber-50 text-amber-700 ring-amber-100',
  'Project Director': 'bg-amber-50 text-amber-700 ring-amber-100',
  AE: 'bg-green-50 text-green-700 ring-green-100',
  PMO: 'bg-red-50 text-red-700 ring-red-100',
  Leadership: 'bg-red-50 text-red-700 ring-red-100',
  Admin: 'bg-gray-100 text-gray-700 ring-gray-200',
}

const RoleSwitcher = ({ activeRole, onChange }: RoleSwitcherProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const activeProfile = ROLE_PROFILES[activeRole]

  const handleSelectRole = (role: UserRole): void => {
    onChange(role)
    setIsOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') setIsOpen(false)
  }

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="relative z-50 flex h-11 w-56 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 text-left shadow-card transition hover:border-blue-200 hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-100 md:w-72"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1 ring-inset', roleSurfaceMap[activeRole])}>
          {roleIconMap[activeRole]}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">Viewing as</span>
          <span className="block truncate text-sm font-semibold text-gray-950">{activeRole}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 text-gray-500 transition', isOpen && 'rotate-180')} aria-hidden="true" />
      </button>
      {isOpen ? (
        <>
          <button aria-label="Close role menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} type="button" />
          <div
            className="absolute right-0 top-full z-50 mt-2 w-[24rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-elevated"
            role="menu"
          >
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-950">Role dashboard</p>
              <p className="mt-1 text-xs text-gray-500">{activeProfile.description}</p>
            </div>
            <div className="max-h-[26rem] overflow-y-auto p-2">
              {ROLE_OPTIONS.map((role) => {
                const profile = ROLE_PROFILES[role]
                const isActive = role === activeRole

                return (
                  <button
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition',
                      isActive ? 'bg-blue-50' : 'hover:bg-gray-50',
                    )}
                    key={role}
                    onClick={() => handleSelectRole(role)}
                    role="menuitem"
                    type="button"
                  >
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1 ring-inset', roleSurfaceMap[role])}>
                      {roleIconMap[role]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-950">{role}</span>
                        <Badge tone={roleToneMap[role]}>{profile.scope}</Badge>
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-gray-500">{profile.description}</span>
                    </span>
                    {isActive ? <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export { RoleSwitcher }
