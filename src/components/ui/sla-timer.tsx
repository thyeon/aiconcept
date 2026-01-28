'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle } from 'lucide-react'
import { getTimeRemaining, getDeadlineStatus, formatRelativeTime } from '@/lib/utils'

// ============================================
// SLA Timer Component
// Shows countdown to deadline with color coding
// ============================================

const timerVariants = cva(
  'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
  {
    variants: {
      status: {
        ok: 'bg-green-50 text-green-700 border border-green-200',
        warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        critical: 'bg-red-50 text-red-700 border border-red-200 animate-pulse',
        overdue: 'bg-gray-100 text-gray-500 border border-gray-200',
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
      },
    },
    defaultVariants: {
      status: 'ok',
      size: 'md',
    },
  }
)

export interface SLATimerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timerVariants> {
  deadline: string
  warningThreshold?: number // hours (default: 24)
  criticalThreshold?: number // hours (default: 4)
  showLabel?: boolean
  format?: 'countdown' | 'relative'
}

function SLATimer({
  deadline,
  warningThreshold = 24,
  criticalThreshold = 4,
  showLabel = true,
  format = 'countdown',
  size = 'md',
  className,
  ...props
}: SLATimerProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date())

  // Update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const status = getDeadlineStatus(deadline, warningThreshold, criticalThreshold)
  const { days, hours, minutes, seconds } = getTimeRemaining(deadline)

  // Format display based on preference
  const formatCountdown = () => {
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    }
    return `${minutes}m ${seconds}s`
  }

  const displayTime = format === 'countdown' ? formatCountdown() : formatRelativeTime(deadline)

  const icon = status === 'critical' || status === 'overdue' ? (
    <AlertTriangle className="h-3.5 w-3.5" />
  ) : (
    <Clock className="h-3.5 w-3.5" />
  )

  return (
    <div className={cn(timerVariants({ status, size }), className)} {...props}>
      <span className="flex-shrink-0">{icon}</span>
      {showLabel && <span className="flex-shrink-0">SLA:</span>}
      <span className="tabular-nums">{displayTime}</span>
      {status === 'overdue' && <span className="ml-1">(Overdue)</span>}
    </div>
  )
}

export { SLATimer, timerVariants }
