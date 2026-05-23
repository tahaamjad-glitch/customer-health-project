import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  ClipboardCheck,
  Gauge,
  LayoutDashboard,
  ListTodo,
  Menu,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { NavLink, Outlet } from 'react-router-dom'

import { RoleSwitcher } from '@/components/shared/RoleSwitcher'
import { IconButton } from '@/components/ui/IconButton'
import { APP_NAME, APP_POSITIONING, DASHBOARD_NAV } from '@/constants'
import { alertsApi } from '@/lib/api/alerts.api'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'

const iconMap = {
  Dashboard: LayoutDashboard,
  Customers: Users,
  Projects: Gauge,
  Signals: Sparkles,
  Alerts: Bell,
  Recommendations: ClipboardCheck,
  'Action Items': ListTodo,
  Escalations: ShieldAlert,
  Reports: BarChart3,
  Settings: Settings,
}

const AppLayout = (): JSX.Element => {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const activeRole = useUiStore((state) => state.activeRole)
  const setActiveRole = useUiStore((state) => state.setActiveRole)

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertsApi.getAll,
  })

  const unreadAlerts = alerts.filter((alert) => !alert.isRead && !alert.isDismissed).length

  return (
    <div className="app-canvas min-h-screen text-gray-950">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[17.5rem] flex-col border-r border-blue-950 bg-gray-950 text-white shadow-elevated transition-transform',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-panel ring-1 ring-blue-300/30">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-5 text-white">{APP_NAME}</p>
              <p className="mt-1 text-xs leading-5 text-gray-400">{APP_POSITIONING}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-blue-300/20 bg-blue-500/10 p-3">
              <p className="text-xs text-blue-200">Role</p>
              <p className="mt-1 truncate text-sm font-semibold text-white">{activeRole}</p>
            </div>
            <div className="rounded-lg border border-amber-300/20 bg-amber-500/10 p-3">
              <p className="text-xs text-amber-100">Unread alerts</p>
              <p className="mt-1 text-sm font-semibold text-white">{unreadAlerts}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {DASHBOARD_NAV.map((item) => {
            const Icon = iconMap[item.label as keyof typeof iconMap]

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-blue-500 text-white shadow-elevated'
                      : 'text-gray-300 hover:bg-emerald-400/10 hover:text-white',
                  )
                }
                end={item.path === '/'}
                key={item.path}
                to={item.path}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
      <div className={cn('min-h-screen transition-[padding]', sidebarOpen ? 'pl-[17.5rem]' : 'pl-0')}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/70 bg-white/80 px-6 shadow-panel backdrop-blur">
          <div className="flex items-center gap-3">
            <IconButton ariaLabel="Toggle sidebar" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" aria-hidden="true" />
            </IconButton>
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-700" aria-hidden="true" />
                <p className="text-sm font-semibold text-gray-950">Trust command center</p>
              </div>
              <p className="text-xs text-gray-500">Account and project health separated with governed rollups.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RoleSwitcher activeRole={activeRole} onChange={setActiveRole} />
            <div
              className={cn(
                'hidden items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium md:flex',
                unreadAlerts > 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700',
              )}
            >
              {unreadAlerts > 0 ? (
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Bell className="h-4 w-4" aria-hidden="true" />
              )}
              {unreadAlerts} unread alerts
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export { AppLayout }
