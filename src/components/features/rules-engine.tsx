'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Check,
  X,
  AlertTriangle,
  Minus,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Eye,
  Info,
  FileText,
  Shield,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// ============================================
// Rules Engine Types
// ============================================

export type RuleStatus = 'pass' | 'fail' | 'warning' | 'skipped'
export type RuleCategory = 'eligibility' | 'validation' | 'compliance' | 'calculation'

export interface RuleInput {
  field: string
  value: string
  displayName: string
}

export interface RuleResult {
  id: string
  name: string
  category: RuleCategory
  status: RuleStatus
  inputs: RuleInput[]
  output: string
  reasoning: string
  policyClause?: string
  confidence: number
  evaluatedAt: Date
  isReplaying?: boolean
}

export interface RuleCategoryGroup {
  category: RuleCategory
  name: string
  icon: React.ReactNode
  rules: RuleResult[]
  isExpanded?: boolean
}

// ============================================
// Category Configuration
// ============================================

export const categoryConfig: Record<
  RuleCategory,
  { icon: React.ReactNode; color: string; label: string }
> = {
  eligibility: {
    icon: <Shield className="h-4 w-4" />,
    color: 'text-blue-600',
    label: 'Eligibility',
  },
  validation: {
    icon: <Check className="h-4 w-4" />,
    color: 'text-purple-600',
    label: 'Validation',
  },
  compliance: {
    icon: <FileText className="h-4 w-4" />,
    color: 'text-orange-600',
    label: 'Compliance',
  },
  calculation: {
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-green-600',
    label: 'Calculation',
  },
}

export const statusConfig: Record<
  RuleStatus,
  { icon: React.ReactNode; color: string; bgColor: string; borderColor: string; label: string }
> = {
  pass: {
    icon: <Check className="h-4 w-4" />,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    label: 'Pass',
  },
  fail: {
    icon: <X className="h-4 w-4" />,
    color: 'text-error',
    bgColor: 'bg-error/10',
    borderColor: 'border-error/20',
    label: 'Fail',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
    label: 'Warning',
  },
  skipped: {
    icon: <Minus className="h-4 w-4" />,
    color: 'text-text-tertiary',
    bgColor: 'bg-bg-tertiary',
    borderColor: 'border-border-light',
    label: 'Skipped',
  },
}

// ============================================
// RuleCard Component
// ============================================

export interface RuleCardProps {
  rule: RuleResult
  isExpanded?: boolean
  onToggle?: () => void
  onViewDetails?: () => void
  className?: string
}

export function RuleCard({
  rule,
  isExpanded = false,
  onToggle,
  onViewDetails,
  className,
}: RuleCardProps) {
  const config = statusConfig[rule.status]
  const categoryConf = categoryConfig[rule.category]

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        config.bgColor,
        config.borderColor,
        rule.isReplaying && 'opacity-50',
        className
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <button
          onClick={onToggle}
          className="w-full flex items-start gap-3 text-left"
        >
          {/* Status Icon */}
          <div className={cn('flex-shrink-0 mt-0.5', config.color)}>
            {rule.isReplaying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              config.icon
            )}
          </div>

          {/* Rule Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium truncate">{rule.name}</p>
              <Badge
                variant="outline"
                className={cn(config.color, 'border-current flex-shrink-0')}
              >
                {config.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn(categoryConf.color, 'border-current flex-shrink-0')}
              >
                {categoryConf.label}
              </Badge>
            </div>

            {/* Output */}
            <p className="text-sm text-text-secondary">{rule.output}</p>

            {/* Inputs */}
            {rule.inputs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {rule.inputs.map((input, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded bg-bg-tertiary border border-border-light"
                  >
                    <span className="text-text-tertiary">{input.displayName}:</span>{' '}
                    <span className="font-medium">{input.value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Expand Icon */}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-text-tertiary flex-shrink-0 mt-1" />
          ) : (
            <ChevronRight className="h-4 w-4 text-text-tertiary flex-shrink-0 mt-1" />
          )}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 space-y-3 pl-7">
            {/* Reasoning */}
            <div className="p-3 rounded bg-bg-tertiary border border-border-light">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-text-tertiary" />
                <p className="text-sm font-medium">Reasoning</p>
              </div>
              <p className="text-sm text-text-secondary">{rule.reasoning}</p>
              {rule.policyClause && (
                <div className="mt-2 pt-2 border-t border-border-light">
                  <p className="text-xs text-text-tertiary mb-1">Policy Reference:</p>
                  <p className="text-xs text-primary">{rule.policyClause}</p>
                </div>
              )}
            </div>

            {/* Confidence */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary">Confidence</span>
              <span className={cn('font-medium', config.color)}>
                {Math.round(rule.confidence * 100)}%
              </span>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary">Evaluated</span>
              <span className="text-text-secondary" suppressHydrationWarning>
                {rule.evaluatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// RuleCategoryGroup Component
// ============================================

export interface RuleCategoryGroupProps {
  group: RuleCategoryGroup
  onRuleToggle?: (ruleId: string) => void
  expandedRules?: Set<string>
  onReplayCategory?: (category: RuleCategory) => Promise<void>
  className?: string
}

export function RuleCategoryGroup({
  group,
  onRuleToggle,
  expandedRules = new Set(),
  onReplayCategory,
  className,
}: RuleCategoryGroupProps) {
  const [isReplaying, setIsReplaying] = useState(false)
  const config = categoryConfig[group.category]

  const passCount = group.rules.filter((r) => r.status === 'pass').length
  const failCount = group.rules.filter((r) => r.status === 'fail').length
  const warningCount = group.rules.filter((r) => r.status === 'warning').length

  const handleReplay = async () => {
    if (!onReplayCategory) return

    setIsReplaying(true)
    try {
      await onReplayCategory(group.category)
    } finally {
      setTimeout(() => setIsReplaying(false), 500)
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.color.replace('text-', 'bg-').replace('600', '/10'))}>
              {config.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold">{config.label}</h3>
              <p className="text-xs text-text-secondary">
                {group.rules.length} rule{group.rules.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-success">{passCount} Pass</span>
              {failCount > 0 && <span className="text-error">{failCount} Fail</span>}
              {warningCount > 0 && <span className="text-warning">{warningCount} Warning</span>}
            </div>
            {onReplayCategory && (
              <Button
                variant="outline"
                onClick={handleReplay}
                disabled={isReplaying}
              >
                {isReplaying ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Replaying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Replay
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Rules */}
        <div className="space-y-2">
          {group.rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              isExpanded={expandedRules.has(rule.id)}
              onToggle={() => onRuleToggle?.(rule.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// RulesEnginePanel Component
// ============================================

export interface RulesEnginePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  rules: RuleResult[]
  onReplayAll?: () => Promise<void>
  onReplayCategory?: (category: RuleCategory) => Promise<void>
  onReplayRule?: (ruleId: string) => Promise<void>
  className?: string
}

export function RulesEnginePanel({
  rules,
  onReplayAll,
  onReplayCategory,
  onReplayRule,
  className,
  ...props
}: RulesEnginePanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<RuleCategory>>(
    new Set(['eligibility', 'validation', 'compliance', 'calculation'])
  )
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())

  // Group rules by category
  const groupedRules = rules.reduce<Record<RuleCategory, RuleResult[]>>(
    (acc, rule) => {
      if (!acc[rule.category]) {
        acc[rule.category] = []
      }
      acc[rule.category].push(rule)
      return acc
    },
    {} as Record<RuleCategory, RuleResult[]>
  )

  const categoryGroups: RuleCategoryGroup[] = Object.entries(groupedRules).map(
    ([category, rules]) => ({
      category: category as RuleCategory,
      name: categoryConfig[category as RuleCategory].label,
      icon: categoryConfig[category as RuleCategory].icon,
      rules,
      isExpanded: expandedCategories.has(category as RuleCategory),
    })
  )

  const toggleCategory = (category: RuleCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const toggleRule = (ruleId: string) => {
    setExpandedRules((prev) => {
      const next = new Set(prev)
      if (next.has(ruleId)) {
        next.delete(ruleId)
      } else {
        next.add(ruleId)
      }
      return next
    })
  }

  const passCount = rules.filter((r) => r.status === 'pass').length
  const failCount = rules.filter((r) => r.status === 'fail').length
  const totalRules = rules.length

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Summary Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Business Rules Engine</h3>
                <p className="text-sm text-text-secondary">
                  {totalRules} rules evaluated across {categoryGroups.length} categories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Status Summary */}
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-success">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  {passCount} Pass
                </span>
                {failCount > 0 && (
                  <span className="flex items-center gap-1 text-error">
                    <div className="w-2 h-2 rounded-full bg-error" />
                    {failCount} Fail
                  </span>
                )}
              </div>

              {onReplayAll && (
                <Button variant="outline" onClick={onReplayAll}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Replay All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Groups */}
      <div className="space-y-4">
        {categoryGroups.map((group) => (
          <RuleCategoryGroup
            key={group.category}
            group={group}
            onRuleToggle={toggleRule}
            expandedRules={expandedRules}
            onReplayCategory={onReplayCategory}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Compact RuleList Component
// ============================================

export interface CompactRuleListProps {
  rules: RuleResult[]
  onRuleClick?: (rule: RuleResult) => void
  className?: string
}

export function CompactRuleList({
  rules,
  onRuleClick,
  className,
}: CompactRuleListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {rules.map((rule) => {
        const config = statusConfig[rule.status]
        return (
          <button
            key={rule.id}
            onClick={() => onRuleClick?.(rule)}
            className={cn(
              'w-full p-3 rounded-lg border transition-all hover:shadow-md',
              'flex items-center gap-3 text-left',
              config.bgColor,
              config.borderColor
            )}
          >
            <div className={cn('flex-shrink-0', config.color)}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{rule.name}</p>
              <p className="text-xs text-text-secondary truncate">{rule.output}</p>
            </div>
            <Badge variant="outline" className={config.color + ' border-current flex-shrink-0'}>
              {config.label}
            </Badge>
          </button>
        )
      })}
    </div>
  )
}
