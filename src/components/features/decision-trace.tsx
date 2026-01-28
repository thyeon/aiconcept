'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  GitBranch,
  Scale,
  FileText,
  Search,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'

// ============================================
// Decision Trace Types
// ============================================

export type DecisionNodeType = 'rule' | 'condition' | 'action' | 'result'
export type NodeStatus = 'pass' | 'fail' | 'skipped' | 'pending'

export interface DecisionNode {
  id: string
  type: DecisionNodeType
  status: NodeStatus
  name: string
  description?: string
  input: Record<string, any>
  output?: Record<string, any>
  reasoning?: string
  policyReference?: string
  children?: DecisionNode[]
  evaluatedAt?: string
  evaluationDuration?: number // in ms
  canOverride?: boolean
}

export interface DecisionTrace {
  id: string
  caseId: string
  decisionId: string
  rootNode: DecisionNode
  totalNodes: number
  passedNodes: number
  failedNodes: number
  skippedNodes: number
  evaluationDuration: number // in ms
  evaluatedAt: string
}

// ============================================
// Node Status Configuration
// ============================================

interface NodeStatusConfig {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  bgColor: string
  borderColor: string
}

const NODE_STATUS_CONFIG: Record<NodeStatus, NodeStatusConfig> = {
  pass: {
    icon: CheckCircle,
    label: 'Pass',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  fail: {
    icon: XCircle,
    label: 'Fail',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  skipped: {
    icon: MinusCircle,
    label: 'Skipped',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  pending: {
    icon: AlertTriangle,
    label: 'Pending',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
}

// ============================================
// Decision Tree Node Component
// ============================================

interface DecisionTreeNodeProps {
  node: DecisionNode
  level?: number
  onNodeClick?: (node: DecisionNode) => void
}

export function DecisionTreeNode({
  node,
  level = 0,
  onNodeClick,
}: DecisionTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
  const [isDetailExpanded, setIsDetailExpanded] = useState(false)
  const statusConfig = NODE_STATUS_CONFIG[node.status]
  const StatusIcon = statusConfig.icon

  const hasChildren = node.children && node.children.length > 0
  const hasDetails = node.description || node.reasoning || node.input || node.output

  const getNodeTypeColor = (type: DecisionNodeType) => {
    switch (type) {
      case 'rule':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'condition':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'action':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'result':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="decision-tree-node">
      {/* Node Header */}
      <div
        className={cn(
          'flex items-start gap-2 py-2.5 px-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50',
          statusConfig.bgColor,
          statusConfig.borderColor,
          isDetailExpanded && 'bg-muted/70'
        )}
        style={{ marginLeft: `${level * 16}px` }}
        onClick={() => hasDetails && setIsDetailExpanded(!isDetailExpanded)}
      >
        {/* Expand/Collapse Button (for children) */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="flex-shrink-0 h-6 w-6" />
        )}

        {/* Status Icon */}
        <div
          className={cn(
            'flex-shrink-0 p-1 rounded-md border',
            statusConfig.bgColor,
            statusConfig.borderColor
          )}
        >
          <StatusIcon className={cn('h-3.5 w-3.5', statusConfig.color)} />
        </div>

        {/* Node Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Title Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">
              {node.name}
            </span>
            <Badge
              variant="outline"
              className={cn('text-xs capitalize', getNodeTypeColor(node.type))}
            >
              {node.type}
            </Badge>
            {node.evaluationDuration && (
              <Badge variant="secondary" className="text-xs font-mono">
                {node.evaluationDuration}ms
              </Badge>
            )}
          </div>

          {/* Description */}
          {node.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {node.description}
            </p>
          )}
        </div>

        {/* Detail Expand Button */}
        {hasDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsDetailExpanded(!isDetailExpanded)
            }}
          >
            {isDetailExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Expanded Details */}
      {isDetailExpanded && hasDetails && (
        <div
          className="mt-2 mb-3 mx-3 p-3 rounded-lg bg-background border shadow-sm"
          style={{ marginLeft: `${level * 16 + 12}px` }}
        >
          {/* Description */}
          {node.description && (
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm text-foreground">{node.description}</p>
            </div>
          )}

          {/* Reasoning */}
          {node.reasoning && (
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Reasoning
              </p>
              <p className="text-sm text-foreground">{node.reasoning}</p>
            </div>
          )}

          {/* Input */}
          {node.input && Object.keys(node.input).length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Input
              </p>
              <div className="bg-muted/50 rounded border p-2">
                <pre className="text-xs font-mono text-foreground overflow-x-auto">
                  {JSON.stringify(node.input, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Output */}
          {node.output && Object.keys(node.output).length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Output
              </p>
              <div className="bg-muted/50 rounded border p-2">
                <pre className="text-xs font-mono text-foreground overflow-x-auto">
                  {JSON.stringify(node.output, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Policy Reference */}
          {node.policyReference && (
            <div className="flex items-start gap-2 p-2 rounded bg-blue-50 border border-blue-200">
              <FileText className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-900">
                  Policy Reference
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  {node.policyReference}
                </p>
              </div>
            </div>
          )}

          {/* Override Option */}
          {node.canOverride && (
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onNodeClick?.(node)}
              >
                Request Exception
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Children Nodes */}
      {isExpanded && hasChildren && (
        <div className="space-y-1">
          {node.children!.map((child) => (
            <DecisionTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Decision Trace Header
// ============================================

interface DecisionTraceHeaderProps {
  trace: DecisionTrace
}

function DecisionTraceHeader({ trace }: DecisionTraceHeaderProps) {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-4 border-b space-y-3">
      {/* Title */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Decision Chain
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Complete evaluation path and rule dependencies
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Scale className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Total:</span>
          <span className="font-medium text-foreground">{trace.totalNodes}</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600">
          <CheckCircle className="h-3.5 w-3.5" />
          <span className="font-medium">{trace.passedNodes} passed</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-600">
          <XCircle className="h-3.5 w-3.5" />
          <span className="font-medium">{trace.failedNodes} failed</span>
        </div>
        {trace.skippedNodes > 0 && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <MinusCircle className="h-3.5 w-3.5" />
            <span className="font-medium">{trace.skippedNodes} skipped</span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Dur: {formatDuration(trace.evaluationDuration)}</span>
        <span>{formatDate(trace.evaluatedAt)}</span>
      </div>
    </div>
  )
}

// ============================================
// Main Decision Trace Component
// ============================================

interface DecisionTraceViewerProps {
  trace: DecisionTrace
  onNodeAction?: (node: DecisionNode) => void
  className?: string
}

export function DecisionTraceViewer({
  trace,
  onNodeAction,
  className,
}: DecisionTraceViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Count nodes by status
  const failedNodes = countNodesByStatus(trace.rootNode, 'fail')

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <DecisionTraceHeader trace={trace} />

      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search decision chain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Warning Banner */}
      {failedNodes > 0 && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-xs text-red-700">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">
              {failedNodes} node{failedNodes > 1 ? 's' : ''} in the chain
              failed
            </span>
          </div>
        </div>
      )}

      {/* Decision Tree */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <DecisionTreeNode
            node={trace.rootNode}
            onNodeClick={onNodeAction}
          />
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Decision tree with {trace.totalNodes} nodes evaluated
        </p>
      </div>
    </div>
  )
}

// ============================================
// Utility Functions
// ============================================

function countNodesByStatus(node: DecisionNode, status: NodeStatus): number {
  let count = node.status === status ? 1 : 0
  if (node.children) {
    for (const child of node.children) {
      count += countNodesByStatus(child, status)
    }
  }
  return count
}
