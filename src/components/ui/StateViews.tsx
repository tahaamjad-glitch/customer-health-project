import { AlertTriangle, Inbox } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'

const SkeletonList = (): JSX.Element => (
  <div className="space-y-3">
    {Array.from({ length: 5 }, (_, index) => (
      <div className="h-20 animate-pulse rounded-lg border border-gray-200 bg-white" key={index}>
        <div className="space-y-3 p-4">
          <div className="h-3 w-1/3 rounded bg-gray-200" />
          <div className="h-3 w-2/3 rounded bg-gray-100" />
        </div>
      </div>
    ))}
  </div>
)

const EmptyState = ({ title, message }: { title: string; message: string }): JSX.Element => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="h-8 w-8 text-gray-400" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-gray-950">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-gray-500">{message}</p>
    </CardContent>
  </Card>
)

const ErrorMessage = ({ message = 'Something went wrong.' }: { message?: string }): JSX.Element => (
  <Card className="border-red-200 bg-red-50">
    <CardContent className="flex items-center gap-3 text-sm text-red-800">
      <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      <span>{message}</span>
    </CardContent>
  </Card>
)

export { EmptyState, ErrorMessage, SkeletonList }
