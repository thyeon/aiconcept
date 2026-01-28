'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Code,
  Clock,
  XCircle,
  Bug,
  Zap,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

// ============================================
// Log Types
// ============================================

export type LogSeverity = 'info' | 'warning' | 'error' | 'debug' | 'success'
export type LogCategory =
  | 'ocr'
  | 'extraction'
  | 'classification'
  | 'quality'
  | 'rules'
  | 'decision'
  | 'api'
  | 'system'

export interface ProcessingLog {
  id: string
  timestamp: string
  severity: LogSeverity
  category: LogCategory
  message: string
  details?: string
  metadata?: Record<string, any>
  stackTrace?: string
  requestId?: string
  duration?: number // in ms
}

// ============================================
// Log Severity Configuration
// ============================================

interface SeverityConfig {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  bgColor: string
  borderColor: string
}

const SEVERITY_CONFIG: Record<LogSeverity, SeverityConfig> = {
  info: {
    icon: Info,
    label: 'Info',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  debug: {
    icon: Bug,
    label: 'Debug',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  success: {
    icon: CheckCircle,
    label: 'Success',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
}

// ============================================
// Log Filters Component
// ============================================

interface LogFiltersProps {
  selectedSeverities: LogSeverity[]
  onSeverityFilterChange: (severities: LogSeverity[]) => void
  selectedCategories: LogCategory[]
  onCategoryFilterChange: (categories: LogCategory[]) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function LogFilters({
  selectedSeverities,
  onSeverityFilterChange,
  selectedCategories,
  onCategoryFilterChange,
  searchQuery,
  onSearchChange,
}: LogFiltersProps) {
  const severities: LogSeverity[] = ['error', 'warning', 'info', 'success', 'debug']
  const categories: LogCategory[] = [
    'ocr',
    'extraction',
    'classification',
    'quality',
    'rules',
    'decision',
    'api',
    'system',
  ]

  const toggleSeverity = (severity: LogSeverity) => {
    if (selectedSeverities.includes(severity)) {
      onSeverityFilterChange(selectedSeverities.filter((s) => s !== severity))
    } else {
      onSeverityFilterChange([...selectedSeverities, severity])
    }
  }

  const toggleCategory = (category: LogCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoryFilterChange(selectedCategories.filter((c) => c !== category))
    } else {
      onCategoryFilterChange([...selectedCategories, category])
    }
  }

  return (
    <div className="space-y-3 p-4 border-b">
      {/* Search */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
        <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Severity Filters */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Severity</p>
        <div className="flex flex-wrap gap-1.5">
          {severities.map((severity) => {
            const config = SEVERITY_CONFIG[severity]
            const isSelected = selectedSeverities.includes(severity)

            return (
              <button
                key={severity}
                onClick={() => toggleSeverity(severity)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border',
                  isSelected
                    ? `${config.bgColor} ${config.borderColor} ${config.color} border-current`
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                <config.icon className="h-3.5 w-3.5" />
                {config.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Category Filters */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category)

            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-colors border capitalize',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Log Entry Component
// ============================================

interface LogEntryProps {
  log: ProcessingLog
}

export function LogEntry({ log }: LogEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = SEVERITY_CONFIG[log.severity]
  const Icon = config.icon

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  const formatFullTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  const hasDetails = log.details || log.metadata || log.stackTrace

  return (
    <div className="border-b last:border-b-0">
      {/* Log Header (Always Visible) */}
      <div
        className={cn(
          'flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors cursor-pointer',
          isExpanded && 'bg-muted/50'
        )}
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
      >
        {/* Severity Icon */}
        <div
          className={cn(
            'flex-shrink-0 mt-0.5 p-1.5 rounded-md border',
            config.bgColor,
            config.borderColor
          )}
        >
          <Icon className={cn('h-3.5 w-3.5', config.color)} />
        </div>

        {/* Log Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">
              {log.message}
            </span>
            <Badge variant="outline" className="text-xs capitalize">
              {log.category}
            </Badge>
            {log.duration && (
              <Badge variant="secondary" className="text-xs font-mono">
                {log.duration}ms
              </Badge>
            )}
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">{formatTimestamp(log.timestamp)}</span>
            {log.requestId && (
              <>
                <span>•</span>
                <span className="font-mono text-xs">{log.requestId}</span>
              </>
            )}
          </div>
        </div>

        {/* Expand Button */}
        {hasDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && hasDetails && (
        <div className="px-3 pb-3 pl-14">
          <div className="rounded-lg bg-muted/50 border p-3 space-y-3">
            {/* Full Timestamp */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatFullTimestamp(log.timestamp)}</span>
            </div>

            {/* Details */}
            {log.details && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Details</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {log.details}
                </p>
              </div>
            )}

            {/* Metadata */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Metadata</p>
                <div className="bg-background rounded border p-2">
                  <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Stack Trace */}
            {log.stackTrace && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Stack Trace</p>
                <div className="bg-background rounded border p-2 max-h-40 overflow-auto">
                  <pre className="text-xs font-mono text-red-600 whitespace-pre-wrap">
                    {log.stackTrace}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Processing Logs Component
// ============================================

interface ProcessingLogsProps {
  logs: ProcessingLog[]
  className?: string
}

export function ProcessingLogs({ logs, className }: ProcessingLogsProps) {
  const [selectedSeverities, setSelectedSeverities] = useState<LogSeverity[]>([
    'error',
    'warning',
    'info',
    'success',
    'debug',
  ])
  const [selectedCategories, setSelectedCategories] = useState<LogCategory[]>([
    'ocr',
    'extraction',
    'classification',
    'quality',
    'rules',
    'decision',
    'api',
    'system',
  ])
  const [searchQuery, setSearchQuery] = useState('')

  // Filter and sort logs
  const filteredLogs = logs
    .filter((log) => {
      // Severity filter
      if (!selectedSeverities.includes(log.severity)) return false

      // Category filter
      if (!selectedCategories.includes(log.category)) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          log.message.toLowerCase().includes(query) ||
          log.details?.toLowerCase().includes(query) ||
          log.category.toLowerCase().includes(query)
        )
      }

      return true
    })
    .sort((a, b) => {
      // Sort by timestamp (newest first for logs)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

  // Count errors and warnings
  const errorCount = logs.filter((l) => l.severity === 'error').length
  const warningCount = logs.filter((l) => l.severity === 'warning').length

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Filters */}
      <LogFilters
        selectedSeverities={selectedSeverities}
        onSeverityFilterChange={setSelectedSeverities}
        selectedCategories={selectedCategories}
        onCategoryFilterChange={setSelectedCategories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Summary Bar */}
      {(errorCount > 0 || warningCount > 0) && (
        <div className="px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-3 text-xs">
            {errorCount > 0 && (
              <div className="flex items-center gap-1.5 text-red-600">
                <XCircle className="h-3.5 w-3.5" />
                <span className="font-medium">{errorCount} errors</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="font-medium">{warningCount} warnings</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logs List */}
      <ScrollArea className="flex-1">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
            <Zap className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No logs match your filters
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredLogs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer with count */}
      <div className="px-4 py-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredLogs.length} of {logs.length} log entries
        </p>
      </div>
    </div>
  )
}
