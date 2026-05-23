import { create } from 'zustand'

import type { HealthStatus, RiskLevel } from '@/types'
import type { UserRole } from '@/types'

interface UiStore {
  sidebarOpen: boolean
  activeRole: UserRole
  activeHealthFilter: HealthStatus | 'all'
  activeRiskFilter: RiskLevel | 'all'
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveRole: (role: UserRole) => void
  setActiveHealthFilter: (filter: HealthStatus | 'all') => void
  setActiveRiskFilter: (filter: RiskLevel | 'all') => void
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarOpen: true,
  activeRole: 'PM',
  activeHealthFilter: 'all',
  activeRiskFilter: 'all',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveRole: (role) => set({ activeRole: role }),
  setActiveHealthFilter: (filter) => set({ activeHealthFilter: filter }),
  setActiveRiskFilter: (filter) => set({ activeRiskFilter: filter }),
}))
