'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Check,
  X,
  AlertCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Shield,
  DollarSign,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfidenceMeter } from '@/components/ui/confidence-meter'
import { Separator } from '@/components/ui/separator'

// ============================================
// Decision Types
// ============================================

export type DecisionType = 'approved' | 'rejected' | 'partial' | 'pending'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface DecisionRationale {
  title: string
  summary: string
  detailedExplanation: string
  keyFactors: Array<{
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
    description: string
  }>
  policyReferences?: string[]
}

export interface ApprovalStep {
  id: string
  actor: string
  role: string
  status: ApprovalStatus
  timestamp: Date
  comment?: string
}

export interface DecisionSummary {
  id: string
  caseId: string
  decisionType: DecisionType
  confidence: number // 0-100
  rationale: DecisionRationale
  approvedAmount?: number
  payoutAmount?: number
  approvedAt?: Date
  approver?: string
  approvalSteps: ApprovalStep[]
  exceptions: string[]
  requiresManualReview: boolean
  isFinal: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Decision Types Configuration
// ============================================

export const decisionConfig = {
  approved: {
    icon: <Check className="h-5 w-5" />,
    label: 'Approved',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
  },
  rejected: {
    icon: <X className="h-5 w-5" />,
    label: 'Rejected',
    color: 'text-error',
    bgColor: 'bg-error/10',
    borderColor: 'border-error/20',
  },
  partial: {
    icon: <AlertCircle className="h-5 w-5" />,
    label: 'Partial Approval',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
  },
  pending: {
    icon: <Clock className="h-5 w-5" />,
    label: 'Pending',
    color: 'text-text-tertiary',
    bgColor: 'bg-bg-tertiary',
    borderColor: 'border-border-light',
  },
} as const

// ============================================
// Utility Functions
// ============================================

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// ============================================
// DecisionBadge Component
// ============================================

export interface DecisionBadgeProps {
  decision: DecisionType
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showLabel?: boolean
  className?: string
}

export function DecisionBadge({
  decision,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className,
}: DecisionBadgeProps) {
  const config = decisionConfig[decision]

  // Map size to appropriate text classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-3 py-1',
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 font-semibold',
        sizeClasses[size],
        config.bgColor,
        config.borderColor,
        config.color,
        className
      )}
    >
      {showIcon && config.icon}
      {showLabel && <span>{config.label}</span>}
    </Badge>
  )
}

// ============================================
// DecisionSummaryCard Component
// ============================================

export interface DecisionSummaryCardProps {
  decision: DecisionSummary
  onApprove?: () => void
  onReject?: () => void
  onRequestInfo?: () => void
  onDownloadReport?: () => void
  onViewHistory?: () => void
  className?: string
}

export function DecisionSummaryCard({
  decision,
  onApprove,
  onReject,
  onRequestInfo,
  onDownloadReport,
  onViewHistory,
  className,
}: DecisionSummaryCardProps) {
  const [showFullRationale, setShowFullRationale] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const config = decisionConfig[decision.decisionType]

  const handleApprove = async () => {
    if (!onApprove || isProcessing) return

    setIsProcessing(true)
    try {
      await onApprove()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!onReject || isProcessing) return

    setIsProcessing(true)
    try {
      await onReject()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className={cn('border-2', config.borderColor, className)}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={cn('p-3 rounded-full', config.bgColor)}>
                {config.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Claim Decision</h3>
                <p className="text-sm text-text-secondary">
                  Case: {decision.caseId}
                </p>
              </div>
            </div>

            <DecisionBadge decision={decision.decisionType} />
          </div>

          {/* Confidence & Approval */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-bg-tertiary">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-text-secondary" />
                <div>
                  <p className="text-sm font-medium">AI Confidence</p>
                  <p className="text-xs text-text-tertiary">
                    Based on extracted data and rule evaluation
                  </p>
                </div>
              </div>
              <ConfidenceMeter value={decision.confidence} size="lg" showLabel />
            </div>

            {decision.approver && (
              <div className="flex items-center justify-between p-4 rounded-lg border border-border-light">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-text-secondary" />
                  <div className="text-sm">
                    <p className="font-medium">Approved by</p>
                    <p className="text-xs text-text-secondary">{decision.approver}</p>
                  </div>
                </div>
                <Calendar className="h-4 w-4 text-text-tertiary" />
                <p className="text-sm text-text-secondary" suppressHydrationWarning>
                  {decision.approvedAt
                    ? new Date(decision.approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Not yet approved'}
                </p>
              </div>
            )}
          </div>

          {/* Decision Output */}
          <div className="space-y-3">
            {decision.decisionType === 'approved' && decision.approvedAmount && (
              <div className="p-4 rounded-lg border border-success/30 bg-success/5">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  <h4 className="text-base font-semibold text-success">
                    Approved Amount: {formatAmount(decision.approvedAmount)}
                  </h4>
                </div>
                {decision.payoutAmount && (
                  <p className="text-sm text-text-secondary">
                    Payout: {formatAmount(decision.payoutAmount)}
                  </p>
                )}
              </div>
            )}

            {decision.decisionType === 'rejected' && (
              <div className="p-4 rounded-lg border border-error/30 bg-error/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-error" />
                  <h4 className="text-base font-semibold text-error">Claim Rejected</h4>
                </div>
                <p className="text-sm text-text-secondary">
                  {decision.rationale.summary}
                </p>
              </div>
            )}

            {decision.decisionType === 'partial' && (
              <div className="p-4 rounded-lg border border-warning/30 bg-warning/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <h4 className="text-base font-semibold text-warning">
                    Partial Approval: {formatAmount(decision.approvedAmount || 0)}
                  </h4>
                </div>
                {decision.payoutAmount && (
                  <p className="text-sm text-text-secondary">
                    of {formatAmount(decision.payoutAmount)} claimed
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Rationale */}
          <div className="space-y-3">
            <button
              onClick={() => setShowFullRationale(!showFullRationale)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border-light hover:bg-bg-tertiary transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-text-secondary" />
                <span className="text-sm font-medium">Decision Rationale</span>
              </div>
              {showFullRationale ? (
                <ChevronUp className="h-4 w-4 text-text-tertiary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-text-tertiary" />
              )}
            </button>

            {showFullRationale && (
              <div className="space-y-4 pt-2">
                <p className="text-sm">{decision.rationale.summary}</p>

                {decision.rationale.keyFactors && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-text-tertiary">
                      Key Factors:
                    </p>
                    {decision.rationale.keyFactors.map((factor, index) => (
                      <div
                        key={index}
                        className={cn(
                          'p-2 rounded border',
                          factor.impact === 'positive' && 'border-success/30 bg-success/5',
                          factor.impact === 'negative' && 'border-error/30 bg-error/5',
                          factor.impact === 'neutral' && 'border-border-light bg-bg-tertiary'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-text-tertiary flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{factor.factor}</p>
                            <p className="text-xs text-text-secondary">{factor.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {decision.rationale.policyReferences && (
                  <div className="p-3 rounded bg-bg-tertiary border border-border-light">
                    <p className="text-xs font-medium text-text-tertiary mb-2">
                      Policy References:
                    </p>
                    <ul className="space-y-1">
                      {decision.rationale.policyReferences.map((ref, index) => (
                        <li key={index} className="text-xs text-primary">
                          {ref}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Exceptions */}
          {decision.exceptions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                Exceptions & Conditions
              </h4>
              <div className="space-y-1">
                {decision.exceptions.map((exception, index) => (
                  <div
                    key={index}
                    className="text-xs p-2 rounded bg-warning/5 border border-warning/20"
                  >
                    {exception}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval Workflow */}
          {decision.approvalSteps && decision.approvalSteps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Approval Workflow</h4>
              <div className="space-y-2">
                {decision.approvalSteps.map((step, index) => {
                  const stepConfig = {
                    pending: {
                      icon: <Clock className="h-4 w-4" />,
                      color: 'text-text-tertiary',
                      bgColor: 'bg-bg-tertiary',
                      borderColor: 'border-border-light',
                    },
                    approved: {
                      icon: <Check className="h-4 w-4" />,
                      color: 'text-success',
                      bgColor: 'bg-success/10',
                      borderColor: 'border-success/20',
                    },
                    rejected: {
                      icon: <X className="h-4 w-4" />,
                      color: 'text-error',
                      bgColor: 'bg-error/10',
                      borderColor: 'border-error/20',
                    },
                  }

                  const config = stepConfig[step.status]

                  return (
                    <div
                      key={step.id}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={cn(
                          'relative z-10 flex items-center justify-center rounded-full',
                          'w-8 h-8 text-xs',
                          config.bgColor,
                          config.borderColor
                        )}
                      >
                        {config.icon}
                      </div>

                      {/* Connector Line */}
                      {index < decision.approvalSteps.length - 1 && (
                        <div
                          className={cn(
                            'absolute left-4 top-8 w-0.5 bg-border-light transition-colors',
                            step.status === 'approved' && 'bg-success',
                            step.status === 'rejected' && 'bg-error'
                          )}
                          style={{ height: 'calc(100% - 2rem)' }}
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{step.actor}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs capitalize',
                              config.borderColor.replace('/20', ''),
                              config.color,
                              'flex-shrink-0'
                            )}
                          >
                            {step.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-text-secondary" suppressHydrationWarning>
                          {step.timestamp.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {step.comment && (
                          <p className="text-xs text-text-tertiary italic">
                            "{step.comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          {!decision.isFinal && decision.decisionType === 'pending' && (
            <Card className="border-warning bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-sm font-medium">Decision Pending</p>
                      <p className="text-xs text-text-secondary">
                        Requires manual review before final decision
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {decision.isFinal && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-success" />
                <span className="font-medium">Final Decision</span>
                {decision.isFinal && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewHistory}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownloadReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {decision.isFinal === false && decision.decisionType !== 'pending' && (
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-border-light">
              <div className="text-sm text-text-secondary">
                {decision.requiresManualReview && (
                  <span className="text-warning">Manual review required</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRequestInfo}
                >
                  Request Info
                </Button>

                {decision.decisionType === 'approved' && onApprove && (
                  <Button
                    size="lg"
                    className="bg-success hover:bg-success/90"
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                )}

                {decision.decisionType === 'rejected' && onReject && (
                  <Button
                    size="lg"
                    className="bg-error hover:bg-error/90"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Reject Claim
                      </>
                    )}
                  </Button>
                )}

                {decision.decisionType === 'partial' && (
                  <Button
                    size="lg"
                    className="bg-warning hover:bg-warning/90"
                    onClick={onApprove}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Approve Partial
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// CompactDecisionCard Component
// Minimal version for summaries
// ============================================

export interface CompactDecisionCardProps {
  decision: DecisionSummary
  onClick?: () => void
  isActive?: boolean
}

export function CompactDecisionCard({
  decision,
  onClick,
  isActive = false,
}: CompactDecisionCardProps) {
  const config = decisionConfig[decision.decisionType]

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-lg border transition-all hover:shadow-md text-left',
        isActive && 'ring-2 ring-primary ring-offset-2',
        config.bgColor,
        config.borderColor,
        decision.isFinal && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className={cn('flex-shrink-0', config.color)}>
          {config.icon}
        </div>

        {/* Decision Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium">{decision.caseId}</p>
            <DecisionBadge decision={decision.decisionType} size="sm" />
          </div>
          <p className="text-xs text-text-secondary truncate">
            {decision.rationale.summary}
          </p>
          {decision.approvedAmount && decision.decisionType === 'approved' && (
            <p className="text-sm font-medium text-success">
              {formatAmount(decision.approvedAmount)}
            </p>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight className="h-4 w-4 text-text-tertiary flex-shrink-0" />
      </div>
    </button>
  )
}

// ============================================
// DecisionHistory Component
// Shows audit trail of all decisions
// ============================================

export interface DecisionHistoryProps {
  decisions: DecisionSummary[]
  selectedDecisionId?: string
  onSelectDecision?: (decisionId: string) => void
  className?: string
}

export function DecisionHistory({
  decisions,
  selectedDecisionId,
  onSelectDecision,
  className,
}: DecisionHistoryProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Decision History</h3>
        <span className="text-xs text-text-tertiary">
          {decisions.length} decision{decisions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        {decisions.map((decision) => (
          <CompactDecisionCard
            key={decision.id}
            decision={decision}
            isActive={selectedDecisionId === decision.id}
            onClick={() => onSelectDecision?.(decision.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// DecisionStats Component
// Overview of decision metrics
// ============================================

export interface DecisionStatsProps {
  decisions: DecisionSummary[]
  className?: string
}

export function DecisionStats({ decisions, className }: DecisionStatsProps) {
  const approvedCount = decisions.filter((d) => d.decisionType === 'approved').length
  const rejectedCount = decisions.filter((d) => d.decisionType === 'rejected').length
  const partialCount = decisions.filter((d) => d.decisionType === 'partial').length
  const pendingCount = decisions.filter((d) => d.decisionType === 'pending').length
  const totalApproved = decisions
    .filter((d) => d.decisionType === 'approved')
    .reduce((sum, d) => sum + (d.approvedAmount || 0), 0)

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{decisions.length}</span>
            <span className="text-xs text-text-tertiary">Total</span>
          </div>
          <p className="text-xs text-text-secondary">All decisions</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-success">{approvedCount}</span>
            <span className="text-xs text-text-tertiary">Approved</span>
          </div>
          <p className="text-xs text-text-secondary">Successful claims</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-error">{rejectedCount}</span>
            <span className="text-xs text-text-tertiary">Rejected</span>
          </div>
          <p className="text-xs text-text-secondary">Denied claims</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-warning">{partialCount}</span>
            <span className="text-xs text-text-tertiary">Partial</span>
          </div>
          <p className="text-xs text-text-secondary">Partial approvals</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">
              ${totalApproved.toLocaleString()}
            </span>
            <span className="text-xs text-text-tertiary">Total</span>
          </div>
          <p className="text-xs text-text-secondary">Approved amount</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-text-tertiary">{pendingCount}</span>
            <span className="text-xs text-text-tertiary">Pending</span>
          </div>
          <p className="text-xs text-text-secondary">Awaiting review</p>
        </CardContent>
      </Card>
    </div>
  )
}
