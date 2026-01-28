'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  AlertTriangle,
  X,
  Sparkles,
  FileText,
  RotateCcw,
  Shield,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { DocumentQuality } from './quality-check-panel'

// ============================================
// AI Explanation Component
// ============================================

export interface AIExplanationProps {
  title: string
  explanation: string
  technicalDetails?: string[]
  confidence?: number
  icon?: React.ReactNode
}

export function AIExplanation({
  title,
  explanation,
  technicalDetails,
  confidence,
  icon = <Sparkles className="h-4 w-4" />,
}: AIExplanationProps) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 text-left"
      >
        <div className="text-primary">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">{title}</p>
        </div>
        {expanded ? (
          <X className="h-4 w-4 text-text-tertiary" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-primary" />
        )}
      </button>

      {/* Explanation */}
      <p className="text-xs text-text-secondary pl-6">{explanation}</p>

      {/* Technical Details (Expanded) */}
      {expanded && technicalDetails && technicalDetails.length > 0 && (
        <div className="pl-6 pt-2 space-y-1">
          <p className="text-xs font-medium text-text-tertiary">Technical Details:</p>
          <ul className="text-xs text-text-secondary list-disc list-inside space-y-0.5">
            {technicalDetails.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence */}
      {confidence !== undefined && (
        <div className="pl-6 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Confidence:</span>
            <Badge variant="outline">
              {Math.round(confidence * 100)}%
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Quality Gate Modal Component
// ============================================

export interface QualityGateModalProps {
  open: boolean
  quality: DocumentQuality
  onOpenChange: (open: boolean) => void
  onReplace?: () => void
  onAcceptWithRisk?: () => void
  allowRiskAcceptance?: boolean
  userPermission?: boolean
}

export function QualityGateModal({
  open,
  quality,
  onOpenChange,
  onReplace,
  onAcceptWithRisk,
  allowRiskAcceptance = false,
  userPermission = false,
}: QualityGateModalProps) {
  const failedChecks = quality.checks.filter((c) => c.status === 'fail')
  const warningChecks = quality.checks.filter((c) => c.status === 'warning')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-error/10">
              <AlertCircle className="h-6 w-6 text-error" />
            </div>
            <div>
              <DialogTitle className="text-lg">Quality Check Failed</DialogTitle>
              <DialogDescription>
                Document does not meet minimum quality standards
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {/* Document Summary */}
            <Card className="border-error/30 bg-error/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-text-secondary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{quality.fileName}</p>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-error text-error">
                        Score: {quality.overallScore}%
                      </Badge>
                      <span className="text-xs text-text-secondary">
                        {failedChecks.length} critical issues
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Explanation */}
            <AIExplanation
              title="Why did this document fail quality check?"
              explanation="The quality analysis detected critical issues that will affect OCR accuracy and data extraction reliability. Processing this document may result in incorrect or incomplete data."
              technicalDetails={[
                `Overall quality score (${quality.overallScore}%) is below the 70% threshold`,
                `${failedChecks.length} critical check(s) failed: ${failedChecks.map((c) => c.name).join(', ')}`,
                'Low quality regions detected in document',
                'Extraction confidence may be reduced by 30-50%',
              ]}
              confidence={0.95}
            />

            {/* Failed Checks */}
            {failedChecks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-error flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Failed Checks ({failedChecks.length})
                </h4>
                <div className="space-y-2">
                  {failedChecks.map((check) => (
                    <Card key={check.id} className="border-error/30">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <X className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{check.name}</p>
                                                              <Badge
                                variant="outline"
                                                  className="border-error text-error"
                              >
                                {check.score}%
                              </Badge>
                            </div>
                            <p className="text-xs text-text-secondary mb-2">
                              {check.details}
                            </p>
                            {check.recommendation && (
                              <div className="p-2 rounded bg-bg-tertiary border border-border-light">
                                <p className="text-xs">
                                  <span className="font-medium">Recommendation: </span>
                                  {check.recommendation}
                                </p>
                                                              </div>
                            )}
                                                          </div>
                                                        </div>
                                                      </CardContent>
                                                    </Card>
                                                  ))}
                                                </div>
                                              </div>
                                            )}

            {/* Warning Checks */}
            {warningChecks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-warning flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings ({warningChecks.length})
                </h4>
                <div className="space-y-2">
                  {warningChecks.map((check) => (
                    <Card key={check.id} className="border-warning/30">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{check.name}</p>
                              <Badge
                                variant="outline"
                                                  className="border-warning text-warning"
                              >
                                {check.score}%
                              </Badge>
                            </div>
                            <p className="text-xs text-text-secondary">{check.details}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Warning */}
            {allowRiskAcceptance && (
              <Card className="border-warning bg-warning/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-warning mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-warning mb-1">
                        Proceed at Your Own Risk
                      </p>
                      <p className="text-xs text-text-secondary">
                        Accepting this document may result in extraction errors and
                        require manual review. This action will be logged for audit
                        purposes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <div className="flex items-center justify-between w-full">
            {/* Permission Info */}
            {allowRiskAcceptance && !userPermission && (
              <p className="text-xs text-text-tertiary">
                Risk acceptance requires supervisor permission
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className="border-border-medium"
                onClick={onReplace}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Replace Document
              </Button>
              {allowRiskAcceptance && userPermission && (
                <Button
                  variant="outline"
                  className="border-warning text-warning hover:bg-warning/5"
                  onClick={onAcceptWithRisk}
                >
                  Accept with Risk
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Quality Check Summary Banner
// Inline banner for quality check results
// ============================================

export interface QualityCheckBannerProps {
  quality: DocumentQuality
  onViewDetails?: () => void
}

export function QualityCheckBanner({
  quality,
  onViewDetails,
}: QualityCheckBannerProps) {
  const failedChecks = quality.checks.filter((c) => c.status === 'fail')
  const hasFailedChecks = failedChecks.length > 0

  return (
    <Card
      className={cn(
        'border-2',
        hasFailedChecks ? 'border-error/50 bg-error/5' : 'border-success/50 bg-success/5'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {hasFailedChecks ? (
              <AlertCircle className="h-5 w-5 text-error mt-0.5 flex-shrink-0" />
            ) : (
              <Shield className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium mb-1">
                {hasFailedChecks
                  ? 'Quality Check Failed'
                  : 'Quality Check Passed'}
              </p>
              <p className="text-xs text-text-secondary">
                {hasFailedChecks
                  ? `${failedChecks.length} critical issue(s) found - Score: ${quality.overallScore}%`
                  : `Document meets quality standards - Score: ${quality.overallScore}%`}
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
