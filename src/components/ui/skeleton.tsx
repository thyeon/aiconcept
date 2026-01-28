'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================
// Skeleton Component
// Loading placeholder with animated shimmer effect
// ============================================

const skeletonVariants = cva(
  'animate-pulse rounded-md bg-bg-tertiary',
  {
    variants: {
      variant: {
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        circle: 'rounded-full',
        rectangle: 'rounded-md',
      },
      size: {
        sm: 'h-3',
        md: 'h-4',
        lg: 'h-6',
        xl: 'h-8',
      },
    },
    defaultVariants: {
      variant: 'text',
      size: 'md',
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Width of skeleton (e.g., '100%', '50%', '200px') */
  width?: string
  /** Height of skeleton (e.g., '20px', '2rem') */
  height?: string
  /** Number of lines to repeat */
  count?: number
  /** Spacing between repeated lines */
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

const spacingClasses = {
  none: '',
  sm: 'space-y-1',
  md: 'space-y-2',
  lg: 'space-y-3',
}

export function Skeleton({
  variant,
  size,
  width,
  height,
  count = 1,
  spacing = 'sm',
  className,
  ...props
}: SkeletonProps) {
  const skeletonElement = (
    <div
      className={cn(
        skeletonVariants({ variant, size }),
        width && `w-[${width}]`,
        height && `h-[${height}]`,
        className
      )}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
      {...props}
    />
  )

  if (count > 1) {
    return (
      <div className={cn(spacingClasses[spacing])}>
        {Array.from({ length: count }).map((_, i) => (
          <React.Fragment key={i}>
            {React.cloneElement(skeletonElement as React.ReactElement)}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return skeletonElement
}

// ============================================
// Skeleton Card Component
// Pre-built card skeleton
// ============================================

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show avatar in header */
  showAvatar?: boolean
  /** Number of text lines */
  lines?: number
  /** Show footer */
  showFooter?: boolean
}

export function SkeletonCard({
  showAvatar = false,
  lines = 3,
  showFooter = false,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <div className={cn('p-4 rounded-lg border border-border-light bg-bg-primary', className)} {...props}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {showAvatar && (
          <Skeleton variant="circle" width="40px" height="40px" className="flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" width="60%" />
          <Skeleton size="sm" width="40%" />
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} width={i === lines - 1 ? '80%' : '100%'} />
        ))}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="mt-4 pt-4 border-t border-border-light flex justify-between">
          <Skeleton width="60px" />
          <Skeleton width="80px" />
        </div>
      )}
    </div>
  )
}

// ============================================
// Skeleton Table Component
// Pre-built table skeleton
// ============================================

export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of rows */
  rows?: number
  /** Number of columns */
  columns?: number
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: SkeletonTableProps) {
  return (
    <div className={cn('w-full', className)} {...props}>
      {/* Header */}
      <div className="flex gap-4 mb-2 pb-2 border-b border-border-light">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="title" size="sm" className="flex-1" />
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Skeleton List Component
// Pre-built list skeleton
// ============================================

export interface SkeletonListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of list items */
  items?: number
  /** Show icon for each item */
  showIcon?: boolean
}

export function SkeletonList({
  items = 5,
  showIcon = false,
  className,
  ...props
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {showIcon && <Skeleton variant="circle" width="20px" height="20px" />}
          <div className="flex-1 space-y-1">
            <Skeleton width={i === items - 1 ? '70%' : '90%'} />
            <Skeleton size="sm" width="50%" />
          </div>
        </div>
      ))}
    </div>
  )
}
