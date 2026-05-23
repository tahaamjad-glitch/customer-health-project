import { GitPullRequest, Mail, MessageSquare, MonitorUp, ReceiptText, Video } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DATA_SOURCE_LABELS, SIGNAL_CONCERN_LABELS } from '@/constants'
import type { CommunicationSignal, SignalReview } from '@/types'

interface SignalCardProps {
  signal: CommunicationSignal
  review?: SignalReview
  clientName?: string
  projectName?: string
  onOpenEvidence: (signal: CommunicationSignal) => void
  onReview: (signal: CommunicationSignal) => void
}

const sourceIcon = {
  email: Mail,
  slack: MessageSquare,
  zoom: Video,
  google_meet: Video,
  teams: Video,
  jira: MonitorUp,
  jira_pulse: MonitorUp,
  bitbucket: GitPullRequest,
  invoice: ReceiptText,
  manual: MessageSquare,
}

const sentimentTone = {
  positive: 'green',
  neutral: 'gray',
  negative: 'red',
  mixed: 'amber',
} as const

const SignalCard = ({ signal, review, clientName, projectName, onOpenEvidence, onReview }: SignalCardProps): JSX.Element => {
  const Icon = sourceIcon[signal.source]

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={sentimentTone[signal.sentiment]}>{signal.sentiment}</Badge>
                <Badge tone="blue">{SIGNAL_CONCERN_LABELS[signal.concernType]}</Badge>
                <Badge tone="gray">{review?.lifecycleStatus.replace('_', ' ') ?? 'new'}</Badge>
                <span className="text-xs text-gray-500">Confidence {review?.confidence ?? 70}%</span>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-950">{signal.summary}</p>
              <p className="mt-1 text-xs text-gray-500">
                {clientName ? `${clientName} · ` : ''}
                {projectName ? `${projectName} · ` : ''}
                {signal.participant} · {DATA_SOURCE_LABELS[signal.source]} · {new Date(signal.timestamp).toLocaleDateString()}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {signal.riskFlags.map((flag) => (
                  <Badge key={flag} tone="red">
                    {flag}
                  </Badge>
                ))}
                {signal.topics.map((topic) => (
                  <Badge key={topic} tone="blue">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onOpenEvidence(signal)} variant="secondary">
              Evidence
            </Button>
            <Button onClick={() => onReview(signal)}>Review</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { SignalCard }
