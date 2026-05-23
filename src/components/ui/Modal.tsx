import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/utils'

interface ModalProps {
  title: string
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

const Modal = ({ title, children, isOpen, onClose, footer, size = 'md' }: ModalProps): JSX.Element | null => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
      <section
        className={cn('flex max-h-[calc(100vh-2rem)] w-full flex-col rounded-lg bg-white shadow-xl', sizeClasses[size])}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-950">{title}</h2>
          <IconButton ariaLabel="Close modal" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-5 py-4">{footer}</div> : null}
      </section>
    </div>
  )
}

export { Modal }
