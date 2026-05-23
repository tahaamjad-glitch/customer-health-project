import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gray-950 text-white shadow-panel hover:bg-gray-800 disabled:bg-gray-400',
  secondary: 'border border-gray-300 bg-white text-gray-900 shadow-panel hover:border-gray-400 hover:bg-gray-50 disabled:text-gray-400',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-950 disabled:text-gray-400',
  danger: 'bg-red-600 text-white shadow-panel hover:bg-red-700 disabled:bg-red-300',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
}

const Button = ({ children, className, variant = 'primary', size = 'md', type = 'button', ...props }: ButtonProps): JSX.Element => (
  <button
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      className,
    )}
    type={type}
    {...props}
  >
    {children}
  </button>
)

export { Button }
