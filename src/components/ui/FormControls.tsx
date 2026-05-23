import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>): JSX.Element => (
  <input
    className={cn(
      'block h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-950 shadow-panel outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
      className,
    )}
    {...props}
  />
)

const Select = ({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>): JSX.Element => (
  <select
    className={cn(
      'block h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-950 shadow-panel outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
      className,
    )}
    {...props}
  >
    {children}
  </select>
)

const Textarea = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>): JSX.Element => (
  <textarea
    className={cn(
      'block min-h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-950 shadow-panel outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
      className,
    )}
    {...props}
  />
)

export { Input, Select, Textarea }
