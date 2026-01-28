'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  IdCard,
  FileText,
  Receipt,
  Scale,
  File,
  Check,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ConfidenceMeter } from '@/components/ui/confidence-meter'

// ============================================
// Document Classification Types
// ============================================

export type DocumentClassType =
  | 'identity'
  | 'medical'
  | 'receipt'
  | 'policy'
  | 'invoice'
  | 'unknown'

export interface DocumentClassification {
  type: DocumentClassType
  confidence: number
  detectedAt: Date
  processingTime: number // milliseconds
  manualOverride?: boolean
  originalType?: DocumentClassType
}

export interface ClassificationResult {
  documentId: string
  classification: DocumentClassification
  alternativeTypes?: Array<{
    type: DocumentClassType
    confidence: number
  }>
}

// Document type configurations
const documentTypeConfig: Record<
  DocumentClassType,
  { icon: React.ReactNode; label: string; color: string; description: string }
> = {
  identity: {
    icon: <IdCard className="h-4 w-4" />,
    label: 'Identity Document',
    color: 'text-blue-600',
    description: 'Passport, ID card, driver license, etc.',
  },
  medical: {
    icon: <FileText className="h-4 w-4" />,
    label: 'Medical Report',
    color: 'text-red-600',
    description: 'Lab results, diagnosis, treatment records',
  },
  receipt: {
    icon: <Receipt className="h-4 w-4" />,
    label: 'Receipt',
    color: 'text-green-600',
    description: 'Purchase receipts, payment records',
  },
  policy: {
    icon: <Scale className="h-4 w-4" />,
    label: 'Policy Document',
    color: 'text-purple-600',
    description: 'Insurance policy, terms & conditions',
  },
  invoice: {
    icon: <FileText className="h-4 w-4" />,
    label: 'Invoice',
    color: 'text-orange-600',
    description: 'Billing statements, invoices',
  },
  unknown: {
    icon: <File className="h-4 w-4" />,
    label: 'Unknown',
    color: 'text-gray-600',
    description: 'Document type could not be determined',
  },
}

// ============================================
// Document Classification Badge
// Shows detected document type with confidence
// ============================================

export interface DocumentClassificationBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Classification result */
  classification: ClassificationResult
  /** Show confidence score */
  showConfidence?: boolean
  /** Show processing time */
  showProcessingTime?: boolean
  /** Show manual override indicator */
  showOverrideIndicator?: boolean
  /** Enable manual override */
  enableOverride?: boolean
  /** Callback when type is manually changed */
  onTypeChange?: (documentId: string, newType: DocumentClassType) => void
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

export function DocumentClassificationBadge({
  classification,
  showConfidence = true,
  showProcessingTime = false,
  showOverrideIndicator = true,
  enableOverride = true,
  onTypeChange,
  size = 'md',
  className,
  ...props
}: DocumentClassificationBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSimulating, setIsSimulating] = useState(true)

  const { type, confidence, manualOverride, processingTime } = classification.classification
  const config = documentTypeConfig[type]
  const isHighConfidence = confidence >= 0.9
  const isMediumConfidence = confidence >= 0.7 && confidence < 0.9
  const isLowConfidence = confidence < 0.7

  // Simulate AI classification delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSimulating(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleTypeChange = (newType: DocumentClassType) => {
    setIsOpen(false)
    onTypeChange?.(classification.documentId, newType)
  }

  if (isSimulating) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border',
          'border-border-light bg-bg-tertiary',
          className
        )}
        {...props}
      >
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm text-text-secondary">
          Analyzing...
        </span>
      </div>
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)} {...props}>
      {/* Main Badge */}
      <Badge
        variant={isHighConfidence ? 'default' : isMediumConfidence ? 'secondary' : 'outline'}
        className={cn(
          'gap-1.5 px-3 py-1.5',
          isLowConfidence && 'border-warning'
        )}
      >
        {/* Type Icon */}
        <span className={config.color}>{config.icon}</span>

        {/* Type Label */}
        <span className="font-medium">{config.label}</span>

        {/* Confidence Badge */}
        {showConfidence && (
          <span
            className={cn(
              'ml-1 text-xs',
              isHighConfidence && 'text-success',
              isMediumConfidence && 'text-warning',
              isLowConfidence && 'text-error'
            )}
          >
            {Math.round(confidence * 100)}%
          </span>
        )}

        {/* Manual Override Indicator */}
        {showOverrideIndicator && manualOverride && (
          <span
            className={cn(
              'ml-1 px-1.5 py-0.5 rounded text-xs',
              'bg-warning/20 text-warning'
            )}
          >
            Manual
          </span>
        )}

        {/* Type Selector (if enabled) */}
        {enableOverride && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button
                className="ml-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Change document type"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1">
                <p className="text-xs font-medium text-text-secondary px-2 py-1">
                  Change document type
                </p>
                {(Object.keys(documentTypeConfig) as DocumentClassType[]).map((typeOption) => {
                  const optionConfig = documentTypeConfig[typeOption]
                  const altConfidence = classification.alternativeTypes?.find(
                    (alt) => alt.type === typeOption
                  )?.confidence

                  return (
                    <button
                      key={typeOption}
                      onClick={() => handleTypeChange(typeOption)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-2 rounded',
                        'hover:bg-bg-secondary transition-colors',
                        'text-left'
                      )}
                    >
                      <span className={optionConfig.color}>
                        {optionConfig.icon}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{optionConfig.label}</p>
                        <p className="text-xs text-text-tertiary">
                          {optionConfig.description}
                        </p>
                      </div>
                      {altConfidence && (
                        <span className="text-xs text-text-tertiary">
                          {Math.round(altConfidence * 100)}%
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </Badge>

      {/* Processing Time */}
      {showProcessingTime && (
        <span className="text-xs text-text-tertiary">
          {processingTime}ms
        </span>
      )}

      {/* Confidence Indicator Icon */}
      {showConfidence && isLowConfidence && (
        <AlertCircle className="h-4 w-4 text-warning" aria-label="Low confidence" />
      )}
      {showConfidence && isHighConfidence && !manualOverride && (
        <Check className="h-4 w-4 text-success" aria-label="High confidence" />
      )}
    </div>
  )
}

// ============================================
// Document Classification Card
// Expanded view with full details
// ============================================

export interface DocumentClassificationCardProps {
  classification: ClassificationResult
  onTypeChange?: (documentId: string, newType: DocumentClassType) => void
  className?: string
}

export function DocumentClassificationCard({
  classification,
  onTypeChange,
  className,
}: DocumentClassificationCardProps) {
  const { type, confidence, manualOverride, originalType } = classification.classification
  const config = documentTypeConfig[type]
  const originalConfig = originalType ? documentTypeConfig[originalType] : null

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold mb-1">Document Classification</h4>
              <p className="text-xs text-text-secondary">
                AI-detected document type with confidence score
              </p>
            </div>
            <ConfidenceMeter value={Math.round(confidence * 100)} size="sm" />
          </div>

          {/* Current Classification */}
          <div className="p-3 rounded-lg bg-bg-tertiary space-y-2">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-full bg-white', config.color)}>
                {config.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{config.label}</p>
                <p className="text-xs text-text-secondary">{config.description}</p>
              </div>
              <DocumentClassificationBadge
                classification={classification}
                showConfidence={false}
                onTypeChange={onTypeChange}
              />
            </div>
          </div>

          {/* Manual Override Notice */}
          {manualOverride && originalType && (
            <div className="flex items-start gap-2 p-2 rounded bg-warning/5 border border-warning/20">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-warning">Manually Reclassified</p>
                <p className="text-xs text-text-secondary">
                  Changed from{' '}
                  <span className="font-medium">{originalConfig?.label}</span> to{' '}
                  <span className="font-medium">{config.label}</span>
                </p>
              </div>
            </div>
          )}

          {/* Alternative Classifications */}
          {classification.alternativeTypes && classification.alternativeTypes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-secondary">
                Alternative Types
              </p>
              <div className="space-y-1">
                {classification.alternativeTypes.map((alt) => {
                  const altConfig = documentTypeConfig[alt.type]
                  return (
                    <div
                      key={alt.type}
                      className="flex items-center justify-between p-2 rounded bg-bg-tertiary"
                    >
                      <div className="flex items-center gap-2">
                        <span className={altConfig.color}>{altConfig.icon}</span>
                        <span className="text-sm">{altConfig.label}</span>
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {Math.round(alt.confidence * 100)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-text-tertiary pt-2 border-t border-border-light">
            <span>Detected in {classification.classification.processingTime}ms</span>
            <span>•</span>
            <span suppressHydrationWarning>
              {classification.classification.detectedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Classification Preview List
// Shows multiple document classifications
// ============================================

export interface ClassificationPreviewListProps {
  classifications: ClassificationResult[]
  onTypeChange?: (documentId: string, newType: DocumentClassType) => void
  className?: string
}

export function ClassificationPreviewList({
  classifications,
  onTypeChange,
  className,
}: ClassificationPreviewListProps) {
  if (classifications.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-text-tertiary mb-3" />
          <p className="text-sm text-text-secondary mb-1">
            No documents classified yet
          </p>
          <p className="text-xs text-text-tertiary">
            Upload documents to see AI classification
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">
          Document Classifications ({classifications.length})
        </h4>
      </div>

      <div className="space-y-2">
        {classifications.map((classification) => (
          <div
            key={classification.documentId}
            className="flex items-center gap-3 p-3 rounded-lg border border-border-light bg-bg-tertiary"
          >
            {/* Document Icon */}
            <div className="flex-shrink-0 p-2 rounded bg-white">
              <FileText className="h-4 w-4 text-text-secondary" />
            </div>

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                Document {classification.documentId.slice(-6)}
              </p>
              <DocumentClassificationBadge
                classification={classification}
                onTypeChange={onTypeChange}
              />
            </div>

            {/* Confidence Meter */}
            <ConfidenceMeter
              value={Math.round(classification.classification.confidence * 100)}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Classification Stats
// Overview of classification results
// ============================================

export interface ClassificationStatsProps {
  classifications: ClassificationResult[]
  className?: string
}

export function ClassificationStats({
  classifications,
  className,
}: ClassificationStatsProps) {
  const stats = React.useMemo(() => {
    const total = classifications.length
    const highConfidence = classifications.filter(
      (c) => c.classification.confidence >= 0.9
    ).length
    const manualOverrides = classifications.filter(
      (c) => c.classification.manualOverride
    ).length

    const byType: Record<DocumentClassType, number> = {
      identity: 0,
      medical: 0,
      receipt: 0,
      policy: 0,
      invoice: 0,
      unknown: 0,
    }

    classifications.forEach((c) => {
      byType[c.classification.type]++
    })

    return { total, highConfidence, manualOverrides, byType }
  }, [classifications])

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {/* Total Documents */}
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-text-secondary">Total Documents</p>
        </CardContent>
      </Card>

      {/* High Confidence */}
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-success">
            {stats.highConfidence}
          </p>
          <p className="text-xs text-text-secondary">High Confidence</p>
        </CardContent>
      </Card>

      {/* Manual Overrides */}
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-warning">
            {stats.manualOverrides}
          </p>
          <p className="text-xs text-text-secondary">Manual Overrides</p>
        </CardContent>
      </Card>

      {/* Unknown Types */}
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-error">
            {stats.byType.unknown}
          </p>
          <p className="text-xs text-text-secondary">Unknown Types</p>
        </CardContent>
      </Card>
    </div>
  )
}
