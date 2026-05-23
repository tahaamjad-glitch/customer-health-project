import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/FormControls'
import { APP_NAME, APP_POSITIONING } from '@/constants'

const LoginPage = (): JSX.Element => (
  <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-950 text-white">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">{APP_NAME}</CardTitle>
        <p className="mt-1 text-sm text-gray-500">{APP_POSITIONING}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input aria-label="Email" placeholder="name@company.com" type="email" />
        <Input aria-label="Password" placeholder="Password" type="password" />
        <Link className="inline-flex h-10 w-full items-center justify-center rounded-md bg-gray-950 px-4 text-sm font-medium text-white hover:bg-gray-800" to="/">
          Sign in
        </Link>
        <div className="flex justify-between text-sm">
          <Link className="text-gray-600 hover:text-gray-950" to="/forgot-password">
            Forgot password
          </Link>
          <Link className="text-gray-600 hover:text-gray-950" to="/unauthorized">
            SSO placeholder
          </Link>
        </div>
      </CardContent>
    </Card>
  </main>
)

export default LoginPage
