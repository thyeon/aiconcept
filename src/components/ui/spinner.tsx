'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================
// Spinner Component
// Loading spinner with size variants
// ============================================

const spinnerVariants = cva(
  'animate-spin',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border-2',
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-3',
        xl: 'h-12 w-12 border-4',
      },
      color: {
        primary: 'border-primary border-t-transparent',
        secondary: 'border-secondary border-t-transparent',
        success: 'border-success border-t-transparent',
        error: 'border-error border-t-transparent',
        white: 'border-white border-t-transparent',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
    },
  }
)

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {
  /** Label for screen readers */
  label?: string
}

export function Spinner({ size, color, label, className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label || 'Loading'}
      className={cn('inline-block rounded-full', spinnerVariants({ size, color }), className)}
      {...props}
    >
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  )
}

// ============================================
// Dot Spinner (alternative style)
// ============================================

interface DotSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'success' | 'error'
}

const dotSizeClasses = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-3 w-3',
}

const dotColorClasses = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  error: 'bg-error',
}

export function DotSpinner({
  size = 'md',
  color = 'primary',
  className,
  ...props
}: DotSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            dotSizeClasses[size],
            dotColorClasses[color]
          )}
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// Bar Spinner (horizontal loading)
// ============================================

interface BarSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'success' | 'error'
}

const barSizeClasses = {
  sm: 'h-1 w-12',
  md: 'h-1.5 w-16',
  lg: 'h-2 w-24',
}

const barColorClasses = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  error: 'bg-error',
}

export function BarSpinner({
  size = 'md',
  color = 'primary',
  className,
  ...props
}: BarSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('overflow-hidden rounded-full', className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
      <div
        className={cn(
          'animate-pulse rounded-full',
          barSizeClasses[size],
          barColorClasses[color]
        )}
      />
    </div>
  )
}
