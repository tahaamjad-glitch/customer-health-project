import { Bell, Mail, Smartphone } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/FormControls'
import { NOTIFICATION_FREQUENCY_LABELS, NOTIFICATION_FREQUENCY_OPTIONS } from '@/constants'
import type { NotificationDigestFrequency, NotificationPreference } from '@/types'

interface NotificationPreferencesPanelProps {
  preferences: NotificationPreference[]
  isSaving: boolean
  onUpdate: (id: string, data: Partial<NotificationPreference>) => void
}

const NotificationPreferencesPanel = ({
  preferences,
  isSaving,
  onUpdate,
}: NotificationPreferencesPanelProps): JSX.Element => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle>Notification Preferences</CardTitle>
          <p className="mt-1 text-sm text-gray-500">Low alerts can stay in-app; medium and high alerts can roll into daily or twice-daily email digests.</p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="grid gap-4 xl:grid-cols-2">
      {preferences.map((preference) => (
        <div className="rounded-lg border border-gray-200 p-4" key={preference.id}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-950">{preference.role}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={preference.inAppEnabled ? 'green' : 'gray'}>
                  <Smartphone className="h-3 w-3" aria-hidden="true" />
                  In-app
                </Badge>
                <Badge tone={preference.emailEnabled ? 'blue' : 'gray'}>
                  <Mail className="h-3 w-3" aria-hidden="true" />
                  Email
                </Badge>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  checked={preference.inAppEnabled}
                  className="h-4 w-4 rounded border-gray-300 text-gray-950 focus:ring-gray-500"
                  disabled={isSaving}
                  onChange={(event) => onUpdate(preference.id, { inAppEnabled: event.target.checked })}
                  type="checkbox"
                />
                In-app
              </label>
              <label className="flex items-center gap-2">
                <input
                  checked={preference.emailEnabled}
                  className="h-4 w-4 rounded border-gray-300 text-gray-950 focus:ring-gray-500"
                  disabled={isSaving}
                  onChange={(event) => onUpdate(preference.id, { emailEnabled: event.target.checked })}
                  type="checkbox"
                />
                Email
              </label>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Low
              <Select
                className="mt-2"
                disabled={isSaving}
                onChange={(event) => onUpdate(preference.id, { lowSeverity: event.target.value as NotificationDigestFrequency })}
                value={preference.lowSeverity}
              >
                {NOTIFICATION_FREQUENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{NOTIFICATION_FREQUENCY_LABELS[option]}</option>
                ))}
              </Select>
            </label>
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Medium
              <Select
                className="mt-2"
                disabled={isSaving}
                onChange={(event) => onUpdate(preference.id, { mediumSeverity: event.target.value as NotificationDigestFrequency })}
                value={preference.mediumSeverity}
              >
                {NOTIFICATION_FREQUENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{NOTIFICATION_FREQUENCY_LABELS[option]}</option>
                ))}
              </Select>
            </label>
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
              High
              <Select
                className="mt-2"
                disabled={isSaving}
                onChange={(event) => onUpdate(preference.id, { highSeverity: event.target.value as NotificationDigestFrequency })}
                value={preference.highSeverity}
              >
                {NOTIFICATION_FREQUENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{NOTIFICATION_FREQUENCY_LABELS[option]}</option>
                ))}
              </Select>
            </label>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)

export { NotificationPreferencesPanel }
