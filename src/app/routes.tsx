import { createBrowserRouter } from 'react-router-dom'

import {
  AccountPage,
  AlertDetailPage,
  AlertsPage,
  AuditPage,
  CustomerDetailPage,
  CustomerHealthApp,
  CustomersPage,
  DashboardPage,
  ForgotPasswordPage,
  LoginPage,
  NotFoundPage,
  OnboardingPage,
  PmoPage,
  ProjectsImportPage,
  RedirectToDashboard,
  RegisterPage,
  RequireAuth,
  ResetPasswordPage,
  SettingsPage,
  SignalsPage,
} from '@/app/prototype/CustomerHealthPrototype'

const protectedRoute = (element: JSX.Element): JSX.Element => <RequireAuth>{element}</RequireAuth>

export const router = createBrowserRouter([
  {
    element: <CustomerHealthApp />,
    path: '/',
    children: [
      { index: true, element: protectedRoute(<RedirectToDashboard />) },
      { path: 'dashboard', element: protectedRoute(<DashboardPage />) },
      { path: 'alerts', element: protectedRoute(<AlertsPage />) },
      { path: 'alerts/:alertId', element: protectedRoute(<AlertDetailPage />) },
      { path: 'signals', element: protectedRoute(<SignalsPage />) },
      { path: 'customers', element: protectedRoute(<CustomersPage />) },
      { path: 'customers/:customerId', element: protectedRoute(<CustomerDetailPage />) },
      { path: 'pmo', element: protectedRoute(<PmoPage />) },
      { path: 'settings', element: protectedRoute(<SettingsPage />) },
      { path: 'account', element: protectedRoute(<AccountPage />) },
      { path: 'onboarding', element: protectedRoute(<OnboardingPage />) },
      { path: 'audit', element: protectedRoute(<AuditPage />) },
      { path: 'projects', element: protectedRoute(<ProjectsImportPage />) },
      { path: 'recommendations', element: protectedRoute(<PmoPage />) },
      { path: 'actions', element: protectedRoute(<AlertsPage />) },
      { path: 'escalations', element: protectedRoute(<PmoPage />) },
      { path: 'reports', element: protectedRoute(<PmoPage />) },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'unauthorized', element: protectedRoute(<NotFoundPage />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
