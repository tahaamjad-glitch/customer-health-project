import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/Card'

const UnauthorizedPage = (): JSX.Element => (
  <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    <Card className="w-full max-w-md">
      <CardContent className="py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-700">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-gray-950">Unauthorized Access</h1>
        <p className="mt-2 text-sm text-gray-500">Your current role cannot access this workspace.</p>
        <Link className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-gray-950 px-4 text-sm font-medium text-white hover:bg-gray-800" to="/login">
          Return to login
        </Link>
      </CardContent>
    </Card>
  </main>
)

export default UnauthorizedPage
