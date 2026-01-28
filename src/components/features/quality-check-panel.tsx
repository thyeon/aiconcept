'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  FileText,
  Check,
  X,
  AlertCircle,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfidenceMeter } from '@/components/ui/confidence-meter'
import { ScrollArea } from '@/components/ui/scroll-area'

// ============================================
// Quality Check Types
// ============================================

export type CheckStatus = 'pass' | 'warning' | 'fail'

export interface QualityCheck {
  id: string
  name: string
  status: CheckStatus
  score: number // 0-100
  severity: 'low' | 'medium' | 'high'
  details: string
  recommendation?: string
  affectedRegions?: Array<{
    page: number
    x: number
    y: number
    width: number
    height: number
  }>
}

export interface DocumentQuality {
  documentId: string
  fileName: string
  thumbnail?: string
  overallScore: number // 0-100
  overallStatus: 'high' | 'medium' | 'fail'
  checks: QualityCheck[]
  processingTime: number // milliseconds
  checkedAt: Date
}

// ============================================
// Quality Score Badge Component
// ============================================

export interface QualityScoreBadgeProps {
  score: number
  status: 'high' | 'medium' | 'fail'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function QualityScoreBadge({
  score,
  status,
  size = 'md',
  showLabel = true,
}: QualityScoreBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const statusConfig = {
    high: {
      label: 'High Quality',
      className: 'bg-success/10 text-success border-success',
      icon: <Check className="h-3 w-3" />,
    },
    medium: {
      label: 'Medium Quality',
      className: 'bg-warning/10 text-warning border-warning',
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    fail: {
      label: 'Failed',
      className: 'bg-error/10 text-error border-error',
      icon: <X className="h-3 w-3" />,
    },
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-medium', sizeClasses[size], config.className)}
    >
      {config.icon}
      {showLabel && <span>{config.label}</span>}
      <span className="ml-1">{score}%</span>
    </Badge>
  )
}

// ============================================
// Check Item Component
// ============================================

export interface CheckItemProps {
  check: QualityCheck
  expanded?: boolean
  onToggle?: () => void
}

export function CheckItem({ check, expanded = false, onToggle }: CheckItemProps) {
  const statusConfig = {
    pass: {
      icon: <Check className="h-4 w-4" />,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
    },
    fail: {
      icon: <X className="h-4 w-4" />,
      color: 'text-error',
      bgColor: 'bg-error/10',
      borderColor: 'border-error/20',
    },
  }

  const config = statusConfig[check.status]

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        config.bgColor,
        config.borderColor
      )}
    >
      {/* Summary Row */}
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
      >
        {/* Status Icon */}
        <div className={cn('flex-shrink-0', config.color)}>
          {config.icon}
        </div>

        {/* Check Name & Score */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-medium">{check.name}</p>
            <Badge
              variant="outline"
                           className={cn(config.color, 'border-current')}
            >
              {check.score}%
            </Badge>
          </div>
          <p className="text-xs text-text-secondary truncate">{check.details}</p>
        </div>

        {/* Severity Badge */}
        {check.status !== 'pass' && (
          <Badge
            variant="outline"
                       className={cn(
              'capitalize',
              check.severity === 'high' && 'text-error border-error',
              check.severity === 'medium' && 'text-warning border-warning',
              check.severity === 'low' && 'text-text-secondary border-border-medium'
            )}
          >
            {check.severity}
          </Badge>
        )}

        {/* Expand Icon */}
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-text-tertiary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-tertiary" />
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 space-y-3">
          {/* Recommendation */}
          {check.recommendation && (
            <div className="p-2 rounded bg-bg-tertiary border border-border-light">
              <p className="text-xs font-medium text-text-secondary mb-1">
                Recommendation:
              </p>
              <p className="text-xs">{check.recommendation}</p>
            </div>
          )}

          {/* Affected Regions */}
          {check.affectedRegions && check.affectedRegions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2">
                Affected Regions ({check.affectedRegions.length}):
              </p>
              <div className="space-y-1">
                {check.affectedRegions.map((region, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs p-2 rounded bg-bg-tertiary"
                  >
                    <Eye className="h-3 w-3 text-text-tertiary" />
                    <span>Page {region.page}</span>
                    <span className="text-text-tertiary">
                      at ({region.x}, {region.y})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Quality Check Panel Component
// ============================================

type AffectedRegion = NonNullable<QualityCheck['affectedRegions']>[number]

export interface QualityCheckPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  quality: DocumentQuality
  showDocumentPreview?: boolean
  allowProceed?: boolean
  onProceed?: () => void
  onReplaceDocument?: () => void
  onViewRegion?: (region: AffectedRegion) => void
}

export function QualityCheckPanel({
  quality,
  showDocumentPreview = true,
  allowProceed = false,
  onProceed,
  onReplaceDocument,
  onViewRegion,
  className,
  ...props
}: QualityCheckPanelProps) {
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set())

  const toggleCheck = (checkId: string) => {
    setExpandedChecks((prev) => {
      const next = new Set(prev)
      if (next.has(checkId)) {
        next.delete(checkId)
      } else {
        next.add(checkId)
      }
      return next
    })
  }

  const failedChecks = quality.checks.filter((c) => c.status === 'fail')
  const warningChecks = quality.checks.filter((c) => c.status === 'warning')
  const passedChecks = quality.checks.filter((c) => c.status === 'pass')
  const hasFailedChecks = failedChecks.length > 0

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Document Info */}
            <div className="flex items-start gap-3 flex-1">
              {/* Thumbnail */}
              {showDocumentPreview && (
                <div className="flex-shrink-0 w-16 h-20 rounded bg-bg-tertiary border border-border-light flex items-center justify-center">
                  {quality.thumbnail ? (
                    <img
                      src={quality.thumbnail}
                      alt={quality.fileName}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <FileText className="h-6 w-6 text-text-tertiary" />
                  )}
                </div>
              )}

              {/* Document Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{quality.fileName}</p>
                <p className="text-xs text-text-secondary mb-2">
                  Processed in {quality.processingTime}ms
                </p>

                <div className="flex items-center gap-3">
                  <QualityScoreBadge
                    score={quality.overallScore}
                    status={quality.overallStatus}
                  />
                  <ConfidenceMeter value={quality.overallScore} size="sm" />
                </div>
              </div>
            </div>

            {/* Quality Gate Status */}
            {hasFailedChecks ? (
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 text-error">
                  <X className="h-4 w-4" />
                  <span className="text-sm font-medium">Quality Gate Failed</span>
                </div>
                <p className="text-xs text-text-secondary max-w-[200px] text-right">
                  {failedChecks.length} critical issue(s) must be resolved
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 text-success">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">Quality Gate Passed</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Document meets quality standards
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quality Checks */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Quality Checks</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-error" />
                {failedChecks.length} Failed
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-warning" />
                {warningChecks.length} Warning
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-success" />
                {passedChecks.length} Passed
              </span>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {/* Failed Checks */}
              {failedChecks.map((check) => (
                <CheckItem
                  key={check.id}
                  check={check}
                  expanded={expandedChecks.has(check.id)}
                  onToggle={() => toggleCheck(check.id)}
                />
              ))}

              {/* Warning Checks */}
              {warningChecks.map((check) => (
                <CheckItem
                  key={check.id}
                  check={check}
                  expanded={expandedChecks.has(check.id)}
                  onToggle={() => toggleCheck(check.id)}
                />
              ))}

              {/* Passed Checks */}
              {passedChecks.map((check) => (
                <CheckItem
                  key={check.id}
                  check={check}
                  expanded={expandedChecks.has(check.id)}
                  onToggle={() => toggleCheck(check.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className={hasFailedChecks ? 'border-error' : 'border-success'}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {hasFailedChecks ? (
                <AlertCircle className="h-5 w-5 text-error" />
              ) : (
                <Check className="h-5 w-5 text-success" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {hasFailedChecks
                    ? 'Action Required'
                    : 'Document Ready for Processing'}
                </p>
                <p className="text-xs text-text-secondary">
                  {hasFailedChecks
                    ? 'Please replace or fix the document to continue'
                    : 'Quality checks passed successfully'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasFailedChecks ? (
                <>
                  <Button variant="outline" onClick={onReplaceDocument}>
                    Replace Document
                  </Button>
                  <Button
                    variant="outline"
                    className="border-warning text-warning hover:bg-warning/5"
                    disabled={!allowProceed}
                    onClick={onProceed}
                  >
                    Accept with Risk
                  </Button>
                </>
              ) : (
                <Button onClick={onProceed}>
                  Continue to Extraction
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Compact Quality Check Component
// Minimal version for summary views
// ============================================

export interface CompactQualityCheckProps {
  quality: DocumentQuality
  onClick?: () => void
}

export function CompactQualityCheck({
  quality,
  onClick,
}: CompactQualityCheckProps) {
  const failedChecks = quality.checks.filter((c) => c.status === 'fail').length
  const hasIssues = failedChecks > 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 rounded-lg border transition-all hover:shadow-md',
        'flex items-center gap-3 text-left',
        hasIssues
          ? 'border-error/30 bg-error/5 hover:border-error/50'
          : 'border-success/30 bg-success/5 hover:border-success/50'
      )}
    >
      {/* Status Icon */}
      {hasIssues ? (
        <X className="h-5 w-5 text-error flex-shrink-0" />
      ) : (
        <Check className="h-5 w-5 text-success flex-shrink-0" />
      )}

      {/* Document Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{quality.fileName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <QualityScoreBadge
            score={quality.overallScore}
            status={quality.overallStatus}
                     />
          {hasIssues && (
            <span className="text-xs text-error">
              {failedChecks} issue(s)
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <ChevronDown className="h-4 w-4 text-text-tertiary" />
    </button>
  )
}
