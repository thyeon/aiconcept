'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================
// Confidence Meter Component
// Displays confidence score with color coding
// ============================================

const meterVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition-all',
  {
    variants: {
      size: {
        sm: 'text-xs h-12 w-12 border-2',
        md: 'text-sm h-16 w-16 border-3',
        lg: 'text-base h-20 w-20 border-4',
      },
      level: {
        high: 'text-green-700 border-green-500 bg-green-50',
        medium: 'text-yellow-700 border-yellow-500 bg-yellow-50',
        low: 'text-red-700 border-red-500 bg-red-50',
      },
    },
    defaultVariants: {
      size: 'md',
      level: 'medium',
    },
  }
)

const progressVariants = cva(
  'absolute top-0 left-0 w-full h-full rounded-full transition-all duration-500',
  {
    variants: {
      level: {
        high: 'bg-green-500',
        medium: 'bg-yellow-500',
        low: 'bg-red-500',
      },
    },
    defaultVariants: {
      level: 'medium',
    },
  }
)

export interface ConfidenceMeterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof meterVariants> {
  value: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  variant?: 'circular' | 'linear'
}

function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 90) return 'high'
  if (score >= 70) return 'medium'
  return 'low'
}

// Circular Progress Component
function CircularProgress({
  value,
  size = 'md',
  showLabel = true,
  className,
  ...props
}: ConfidenceMeterProps) {
  const level = getConfidenceLevel(value)
  const radius = size === 'sm' ? 20 : size === 'md' ? 26 : 34
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={cn('relative inline-flex', className)} {...props}>
      <svg
        className={cn(
          'transform -rotate-90',
          size === 'sm' && 'h-12 w-12',
          size === 'md' && 'h-16 w-16',
          size === 'lg' && 'h-20 w-20'
        )}
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className={cn(
            'stroke-current opacity-20',
            level === 'high' && 'text-green-500',
            level === 'medium' && 'text-yellow-500',
            level === 'low' && 'text-red-500'
          )}
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'stroke-current transition-all duration-500 ease-out',
            level === 'high' && 'text-green-500',
            level === 'medium' && 'text-yellow-500',
            level === 'low' && 'text-red-500'
          )}
          strokeWidth="8"
        />
      </svg>

      {/* Center text */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'font-semibold',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base',
              level === 'high' && 'text-green-700',
              level === 'medium' && 'text-yellow-700',
              level === 'low' && 'text-red-700'
            )}
          >
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  )
}

// Linear Progress Component
function LinearProgress({
  value,
  size = 'md',
  showLabel = true,
  className,
  ...props
}: ConfidenceMeterProps) {
  const level = getConfidenceLevel(value)

  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      {showLabel && (
        <span
          className={cn(
            'text-sm font-medium tabular-nums whitespace-nowrap',
            level === 'high' && 'text-green-700',
            level === 'medium' && 'text-yellow-700',
            level === 'low' && 'text-red-700'
          )}
        >
          {Math.round(value)}%
        </span>
      )}
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            level === 'high' && 'bg-green-500',
            level === 'medium' && 'bg-yellow-500',
            level === 'low' && 'bg-red-500'
          )}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}

function ConfidenceMeter({ variant = 'circular', ...props }: ConfidenceMeterProps) {
  if (variant === 'linear') {
    return <LinearProgress {...props} />
  }

  return <CircularProgress {...props} />
}

export { ConfidenceMeter, meterVariants, progressVariants }
