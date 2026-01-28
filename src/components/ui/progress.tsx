'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

// ============================================
// Progress Bar Component
// Determinate and indeterminate progress indicators
// ============================================

const progressVariants = cva(
  'w-full overflow-hidden rounded-full bg-bg-tertiary',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
      color: {
        primary: '[&_.progress-fill]:bg-primary',
        secondary: '[&_.progress-fill]:bg-secondary',
        success: '[&_.progress-fill]:bg-success',
        warning: '[&_.progress-fill]:bg-warning',
        error: '[&_.progress-fill]:bg-error',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
    },
  }
)

export interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof progressVariants> {
  /** Progress value (0-100) for determinate, omit for indeterminate */
  value?: number
  /** Maximum value (default: 100) */
  max?: number
  /** Show percentage label */
  showLabel?: boolean
  /** Custom label */
  label?: string
}

export function ProgressBar({
  value,
  max = 100,
  size,
  color,
  showLabel = false,
  label,
  className,
  ...props
}: ProgressBarProps) {
  const percentage = value !== undefined ? Math.min(100, Math.max(0, (value / max) * 100)) : undefined
  const isIndeterminate = value === undefined

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-text-secondary">
            {label || 'Progress'}
          </span>
          {percentage !== undefined && (
            <span className="text-xs font-medium text-text-secondary tabular-nums">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(progressVariants({ size, color }), className)}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
        {...props}
      >
        <div
          className={cn(
            'progress-fill h-full rounded-full transition-all duration-300 ease-out',
            isIndeterminate && 'animate-indeterminate-progress'
          )}
          style={
            isIndeterminate
              ? undefined
              : { width: `${percentage}%` }
          }
        />
      </div>
    </div>
  )
}

// ============================================
// Circular Progress Component
// Circular progress indicator
// ============================================

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value: number
  /** Size in pixels */
  size?: number
  /** Stroke width in pixels */
  strokeWidth?: number
  /** Show percentage in center */
  showLabel?: boolean
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

const colorClasses = {
  primary: 'stroke-primary',
  secondary: 'stroke-secondary',
  success: 'stroke-success',
  warning: 'stroke-warning',
  error: 'stroke-error',
}

export function CircularProgress({
  value,
  size = 40,
  strokeWidth = 4,
  showLabel = true,
  color = 'primary',
  className,
  ...props
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-bg-tertiary"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn('transition-all duration-300 ease-out', colorClasses[color])}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'font-semibold tabular-nums',
            size < 32 ? 'text-xs' : size < 48 ? 'text-sm' : 'text-base'
          )}>
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  )
}

// ============================================
// Processing Indicator Component
// Shows current processing stage with progress
// ============================================

export interface ProcessingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current stage label */
  stage: string
  /** Progress value (0-100) */
  value?: number
  /** Elapsed time string */
  elapsed?: string
  /** Estimated remaining time string */
  remaining?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export function ProcessingIndicator({
  stage,
  value,
  elapsed,
  remaining,
  size = 'md',
  color = 'primary',
  className,
  ...props
}: ProcessingIndicatorProps) {
  const isIndeterminate = value === undefined

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {/* Stage label */}
      <div className="flex items-center justify-between">
        <span className={cn(
          'font-medium text-text-primary',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg'
        )}>
          {stage}
        </span>
        {elapsed && (
          <span className="text-sm text-text-secondary tabular-nums">
            {elapsed}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={value}
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
        color={color}
      />

      {/* Remaining time */}
      {remaining && (
        <p className={cn(
          'text-text-secondary',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {isIndeterminate ? 'Processing...' : `~${remaining} remaining`}
        </p>
      )}
    </div>
  )
}

// ============================================
// Progress Steps Component
// Shows progress through multiple steps
// ============================================

export interface ProgressStep {
  id: string
  label: string
  status: 'complete' | 'active' | 'pending'
}

export interface ProgressStepsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of steps */
  steps: ProgressStep[]
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

const stepSizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
}

const connectorSizeClasses = {
  sm: 'h-0.5',
  md: 'h-1',
  lg: 'h-1.5',
}

export function ProgressSteps({
  steps,
  size = 'md',
  className,
  ...props
}: ProgressStepsProps) {
  return (
    <div className={cn('flex items-center', className)} {...props}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step circle */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'rounded-full flex items-center justify-center font-medium border-2 transition-colors',
                stepSizeClasses[size],
                step.status === 'complete' && 'bg-success border-success text-white',
                step.status === 'active' && 'bg-primary border-primary text-white animate-pulse',
                step.status === 'pending' && 'bg-white border-border-light text-text-secondary'
              )}
            >
              {step.status === 'complete' ? (
                <svg className="w-3/5 h-3/5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : step.status === 'active' ? (
                <Spinner size="xs" color="white" label="" />
              ) : (
                index + 1
              )}
            </div>
            <span className={cn(
              'text-xs font-medium text-center',
              step.status === 'active' ? 'text-primary' : 'text-text-secondary'
            )}>
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 mx-2 rounded transition-colors',
                connectorSizeClasses[size],
                step.status === 'complete' ? 'bg-success' : 'bg-border-light'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
