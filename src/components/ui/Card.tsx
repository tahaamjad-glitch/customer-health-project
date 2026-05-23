import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

const Card = ({ children, className, ...props }: CardProps): JSX.Element => (
  <div className={cn('rounded-lg border border-white/80 bg-white/[0.88] shadow-card backdrop-blur', className)} {...props}>
    {children}
  </div>
)

const CardHeader = ({ children, className, ...props }: CardProps): JSX.Element => (
  <div className={cn('border-b border-gray-100/80 px-5 py-4', className)} {...props}>
    {children}
  </div>
)

const CardTitle = ({ children, className, ...props }: CardProps): JSX.Element => (
  <h2 className={cn('text-sm font-semibold tracking-tight text-gray-950', className)} {...props}>
    {children}
  </h2>
)

const CardContent = ({ children, className, ...props }: CardProps): JSX.Element => (
  <div className={cn('p-5', className)} {...props}>
    {children}
  </div>
)

export { Card, CardContent, CardHeader, CardTitle }
