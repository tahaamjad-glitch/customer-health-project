import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel: string
  children: ReactNode
  isActive?: boolean
}

const IconButton = ({ ariaLabel, children, className, isActive = false, type = 'button', ...props }: IconButtonProps): JSX.Element => (
  <button
    aria-label={ariaLabel}
    className={cn(
      'inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-gray-600 transition hover:border-gray-200 hover:bg-white hover:text-gray-950',
      isActive && 'border-gray-300 bg-white text-gray-950 shadow-panel',
      className,
    )}
    type={type}
    {...props}
  >
    {children}
  </button>
)

export { IconButton }
