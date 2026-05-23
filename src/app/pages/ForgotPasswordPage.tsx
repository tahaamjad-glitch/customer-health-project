import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/FormControls'

const ForgotPasswordPage = (): JSX.Element => (
  <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Reset Access</CardTitle>
        <p className="mt-1 text-sm text-gray-500">Use email reset or continue with the SSO placeholder.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input aria-label="Email" placeholder="name@company.com" type="email" />
        <Button className="w-full">Send reset link</Button>
        <Link className="block text-center text-sm text-gray-600 hover:text-gray-950" to="/login">
          Back to login
        </Link>
      </CardContent>
    </Card>
  </main>
)

export default ForgotPasswordPage
