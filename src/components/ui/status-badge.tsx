import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, AlertCircle, Clock, Loader2 } from 'lucide-react'

// ============================================
// Status Badge Component
// Displays status with appropriate colors and icons
// ============================================

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        // Case statuses
        pending: 'bg-gray-100 text-gray-700 border border-gray-200',
        'in-progress': 'bg-blue-50 text-blue-700 border border-blue-200',
        completed: 'bg-green-50 text-green-700 border border-green-200',
        rejected: 'bg-red-50 text-red-700 border border-red-200',

        // Decision statuses
        approved: 'bg-green-50 text-green-700 border border-green-200',
        partial: 'bg-yellow-50 text-yellow-700 border border-yellow-200',

        // Rule statuses
        pass: 'bg-green-50 text-green-700 border border-green-200',
        fail: 'bg-red-50 text-red-700 border border-red-200',
        warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        skipped: 'bg-gray-50 text-gray-500 border border-gray-200',

        // Quality check statuses
        'quality-high': 'bg-green-50 text-green-700 border border-green-200',
        'quality-medium': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        'quality-low': 'bg-red-50 text-red-700 border border-red-200',

        // Extraction statuses
        processing: 'bg-blue-50 text-blue-700 border border-blue-200',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'pending',
      size: 'md',
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: string
  showIcon?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

// Status to variant mapping
const statusToVariant: Record<string, StatusBadgeProps['variant']> = {
  // Case statuses
  pending: 'pending',
  'in-progress': 'in-progress',
  completed: 'completed',
  rejected: 'rejected',

  // Decision statuses
  approved: 'approved',
  partial: 'partial',

  // Rule statuses
  pass: 'pass',
  fail: 'fail',
  warning: 'warning',
  skipped: 'skipped',

  // Quality check
  high: 'quality-high',
  medium: 'quality-medium',
  low: 'quality-low',

  // Extraction
  processing: 'processing',
}

// Status to icon mapping
const statusToIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  'in-progress': <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5" />,
  approved: <CheckCircle2 className="h-3.5 w-3.5" />,
  pass: <CheckCircle2 className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
  fail: <XCircle className="h-3.5 w-3.5" />,
  warning: <AlertCircle className="h-3.5 w-3.5" />,
  partial: <AlertCircle className="h-3.5 w-3.5" />,
  skipped: <Clock className="h-3.5 w-3.5" />,
  processing: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
}

function StatusBadge({
  className,
  variant,
  status,
  showIcon = true,
  icon,
  children,
  ...props
}: StatusBadgeProps) {
  // If status is provided, map it to variant
  const mappedVariant = status && statusToVariant[status] ? statusToVariant[status] : variant

  // If showIcon is true and status is provided, get the icon
  const mappedIcon = showIcon && status && statusToIcon[status] ? statusToIcon[status] : icon

  return (
    <div className={cn(badgeVariants({ variant: mappedVariant, size: props.size }), className)} {...props}>
      {mappedIcon && <span className="flex-shrink-0">{mappedIcon}</span>}
      <span>{children}</span>
    </div>
  )
}

export { StatusBadge, badgeVariants }
