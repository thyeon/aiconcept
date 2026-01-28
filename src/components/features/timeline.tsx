'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  FileText,
  Upload,
  CheckCircle,
  Cpu,
  Scale,
  Gavel,
  DollarSign,
  Edit3,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Calendar,
} from 'lucide-react'
import { TimelineEvent, EventType } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// ============================================
// Timeline Event Type Configuration
// ============================================

interface EventTypeConfig {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  bgColor: string
  borderColor: string
}

const EVENT_TYPE_CONFIG: Record<EventType, EventTypeConfig> = {
  'document-issued': {
    icon: FileText,
    label: 'Document',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  upload: {
    icon: Upload,
    label: 'Upload',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  'quality-check': {
    icon: CheckCircle,
    label: 'Quality Check',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  processing: {
    icon: Cpu,
    label: 'Processing',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  rules: {
    icon: Scale,
    label: 'Rules',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  decision: {
    icon: Gavel,
    label: 'Decision',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  payment: {
    icon: DollarSign,
    label: 'Payment',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  'field-update': {
    icon: Edit3,
    label: 'Field Update',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
}

// ============================================
// Timeline Navigation & Filters
// ============================================

interface TimelineFiltersProps {
  selectedTypes: EventType[]
  onTypeFilterChange: (types: EventType[]) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onDateRangeChange?: (start: string, end: string) => void
}

export function TimelineFilters({
  selectedTypes,
  onTypeFilterChange,
  searchQuery,
  onSearchChange,
}: TimelineFiltersProps) {
  const eventTypes: EventType[] = [
    'document-issued',
    'upload',
    'quality-check',
    'processing',
    'rules',
    'decision',
    'payment',
    'field-update',
  ]

  const toggleType = (type: EventType) => {
    if (selectedTypes.includes(type)) {
      onTypeFilterChange(selectedTypes.filter((t) => t !== type))
    } else {
      onTypeFilterChange([...selectedTypes, type])
    }
  }

  return (
    <div className="space-y-3 p-4 border-b">
      {/* Search */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search timeline..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-1.5">
        {eventTypes.map((type) => {
          const config = EVENT_TYPE_CONFIG[type]
          const isSelected = selectedTypes.includes(type)

          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
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
  )
}

// ============================================
// Timeline Event Component
// ============================================

interface TimelineEventItemProps {
  event: TimelineEvent
  onEventClick?: (event: TimelineEvent) => void
  isActive?: boolean
}

export function TimelineEventItem({
  event,
  onEventClick,
  isActive = false,
}: TimelineEventItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = EVENT_TYPE_CONFIG[event.type]
  const Icon = config.icon

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const hasDetails = event.metadata || event.link

  return (
    <div
      className={cn(
        'relative pl-8 pb-6 last:pb-0',
        onEventClick && 'cursor-pointer'
      )}
      onClick={() => onEventClick && onEventClick(event)}
    >
      {/* Timeline Line */}
      <div className="absolute left-[7px] top-8 bottom-0 w-0.5 bg-border last:hidden" />

      {/* Event Dot */}
      <div className="absolute left-0 top-1">
        <div
          className={cn(
            'relative flex h-4 w-4 items-center justify-center rounded-full border-2',
            config.bgColor,
            config.borderColor,
            isActive && 'ring-4 ring-offset-2'
          )}
        >
          <Icon className={cn('h-2.5 w-2.5', config.color)} />
        </div>
      </div>

      {/* Event Content */}
      <div className="space-y-2">
        {/* Event Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-foreground">
                {event.title}
              </h4>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-normal',
                  config.bgColor,
                  config.borderColor,
                  config.color
                )}
              >
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{event.detail}</p>
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap mt-1">
            {formatDate(event.date)}
          </span>
        </div>

        {/* Event Actions */}
        <div className="flex items-center gap-2">
          {/* Link */}
          {event.link && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.open(event.link, '_blank')
              }}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View details →
            </button>
          )}

          {/* Expand Button */}
          {hasDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show more
                </>
              )}
            </Button>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && hasDetails && (
          <div className="mt-3 space-y-3 p-3 rounded-lg bg-muted/50 border">
            {/* Full Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatFullDate(event.date)}</span>
            </div>

            {/* Metadata */}
            {event.metadata && Object.keys(event.metadata).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">
                  Additional Details
                </p>
                <div className="space-y-1.5">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-2 text-xs"
                    >
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="font-medium text-foreground text-right">
                        {typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actor Info (if available in metadata) */}
            {event.metadata?.actor && (
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">By:</span>
                <span className="font-medium text-foreground">
                  {event.metadata.actor}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Main Timeline Component
// ============================================

interface TimelineProps {
  events: TimelineEvent[]
  onEventClick?: (event: TimelineEvent) => void
  showFilters?: boolean
  className?: string
}

export function Timeline({
  events,
  onEventClick,
  showFilters = true,
  className,
}: TimelineProps) {
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([
    'document-issued',
    'upload',
    'quality-check',
    'processing',
    'rules',
    'decision',
    'payment',
    'field-update',
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeEventId, setActiveEventId] = useState<string | null>(null)

  // Filter and sort events
  const filteredEvents = events
    .filter((event) => {
      // Type filter
      if (!selectedTypes.includes(event.type)) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          event.title.toLowerCase().includes(query) ||
          event.detail.toLowerCase().includes(query) ||
          event.type.toLowerCase().includes(query)
        )
      }

      return true
    })
    .sort((a, b) => {
      // Sort chronologically (oldest first for timeline)
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

  const handleEventClick = (event: TimelineEvent) => {
    setActiveEventId(event.id)
    onEventClick?.(event)
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Filters */}
      {showFilters && (
        <TimelineFilters
          selectedTypes={selectedTypes}
          onTypeFilterChange={setSelectedTypes}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Events List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No events match your filters
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredEvents.map((event) => (
                <TimelineEventItem
                  key={event.id}
                  event={event}
                  onEventClick={handleEventClick}
                  isActive={activeEventId === event.id}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with count */}
      <div className="px-4 py-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>
    </div>
  )
}
