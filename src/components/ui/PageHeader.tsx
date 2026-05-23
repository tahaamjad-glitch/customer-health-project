import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description: string
  actions?: ReactNode
}

const PageHeader = ({ title, description, actions }: PageHeaderProps): JSX.Element => (
  <div className="border-b border-white/70 bg-gradient-to-r from-blue-50 via-white/90 to-emerald-50 px-6 py-6 shadow-panel">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-10 w-1 rounded-full bg-gradient-to-b from-blue-600 via-amber-500 to-emerald-600" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  </div>
)

export { PageHeader }
