import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/app/layouts/AppLayout'
import ActionItemsPage from '@/app/pages/ActionItemsPage'
import AlertsPage from '@/app/pages/AlertsPage'
import CustomerDetailPage from '@/app/pages/CustomerDetailPage'
import CustomersPage from '@/app/pages/CustomersPage'
import DashboardPage from '@/app/pages/DashboardPage'
import EscalationsPage from '@/app/pages/EscalationsPage'
import ForgotPasswordPage from '@/app/pages/ForgotPasswordPage'
import LoginPage from '@/app/pages/LoginPage'
import ProjectDetailPage from '@/app/pages/ProjectDetailPage'
import ProjectsPage from '@/app/pages/ProjectsPage'
import RecommendationsPage from '@/app/pages/RecommendationsPage'
import ReportsPage from '@/app/pages/ReportsPage'
import SettingsPage from '@/app/pages/SettingsPage'
import SignalsPage from '@/app/pages/SignalsPage'
import UnauthorizedPage from '@/app/pages/UnauthorizedPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/:id', element: <CustomerDetailPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'signals', element: <SignalsPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'recommendations', element: <RecommendationsPage /> },
      { path: 'actions', element: <ActionItemsPage /> },
      { path: 'escalations', element: <EscalationsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
