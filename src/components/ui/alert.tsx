'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react'

// ============================================
// Alert Banner Component
// Used for displaying important messages, warnings, errors
// ============================================

const alertVariants = cva(
  'relative w-full rounded-lg border p-4',
  {
    variants: {
      variant: {
        default: 'bg-bg-primary border-border-light text-text-primary',
        info: 'bg-blue-50 border-blue-200 text-blue-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        error: 'bg-red-50 border-red-200 text-red-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof alertVariants> {
  /** Alert title */
  title?: string
  /** Show dismiss button */
  dismissible?: boolean
  /** Callback when dismissed */
  onDismiss?: () => void
  /** Icon to display */
  icon?: React.ReactNode
  /** Show icon based on variant */
  showIcon?: boolean
}

const iconMap = {
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
}

export function Alert({
  variant,
  title,
  dismissible = false,
  onDismiss,
  icon,
  showIcon = true,
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        {(icon || (showIcon && variant !== 'default')) && (
          <div className="flex-shrink-0 mt-0.5">
            {icon || (variant && variant !== 'default' && iconMap[variant])}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 space-y-1">
          {title && (
            <h5 className="font-semibold leading-none tracking-tight">
              {title}
            </h5>
          )}
          {children && (
            <div className={cn('text-sm', title ? 'text-[15px]' : '')}>
              {children}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded-sm opacity-70 ring-offset-bg-primary transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================
// Alert Description Component
// For multi-line alert content
// ============================================

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

// ============================================
// Alert Title Component
// Explicit title component for composability
// ============================================

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
AlertTitle.displayName = 'AlertTitle'

// ============================================
// Inline Alert Component
// Compact inline alert for smaller spaces
// ============================================

export interface InlineAlertProps extends Omit<AlertProps, 'title' | 'dismissible'> {
  /** Compact size */
  size?: 'sm' | 'md'
}

export function InlineAlert({
  variant = 'info',
  size = 'md',
  icon,
  showIcon = true,
  className,
  children,
  ...props
}: InlineAlertProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1.5',
    md: 'px-3 py-2 text-sm gap-2',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
  }

  return (
    <div
      role="alert"
      className={cn(
        'inline-flex items-center rounded-md border',
        alertVariants({ variant }),
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {(icon || (showIcon && variant !== 'default')) && (
        <span className={cn('flex-shrink-0', iconSizes[size])}>
          {icon || (variant && variant !== 'default' && iconMap[variant])}
        </span>
      )}
      <span className="flex-1">{children}</span>
    </div>
  )
}

// ============================================
// Alert List Component
// Stack multiple alerts
// ============================================

export interface AlertListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alerts to display */
  alerts: Array<{
    id: string
    variant?: VariantProps<typeof alertVariants>['variant']
    title?: string
    message: string
  }>
  /** Allow dismissing alerts */
  dismissible?: boolean
  /** Callback when alert is dismissed */
  onDismiss?: (id: string) => void
}

export function AlertList({
  alerts,
  dismissible = false,
  onDismiss,
  className,
  ...props
}: AlertListProps) {
  if (alerts.length === 0) return null

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant || 'default'}
          title={alert.title}
          dismissible={dismissible}
          onDismiss={() => onDismiss?.(alert.id)}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  )
}
