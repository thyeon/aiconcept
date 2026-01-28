'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Check,
  X,
  AlertCircle,
  Edit2,
  Eye,
  EyeOff,
  History,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ConfidenceMeter } from '@/components/ui/confidence-meter'

// ============================================
// Extraction Field Types
// ============================================

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface ExtractedField {
  id: string
  label: string
  value: string
  originalValue: string
  confidence: number // 0-100
  confidenceLevel: ConfidenceLevel
  status: 'auto-accepted' | 'review-suggested' | 'review-required' | 'edited'
  sourceRegion?: {
    page: number
    x: number
    y: number
    width: number
    height: number
  }
  editHistory?: Array<{
    timestamp: Date
    oldValue: string
    newValue: string
    editedBy: string
  }>
  isRequired?: boolean
}

export interface FieldGroup {
  id: string
  name: string
  fields: ExtractedField[]
  icon?: React.ReactNode
  isExpanded?: boolean
}

// ============================================
// Confidence Utilities
// ============================================

export const getConfidenceLevel = (score: number): ConfidenceLevel => {
  if (score >= 90) return 'high'
  if (score >= 70) return 'medium'
  return 'low'
}

export const getStatusFromConfidence = (
  confidence: number,
  isEdited: boolean
): ExtractedField['status'] => {
  if (isEdited) return 'edited'
  if (confidence >= 90) return 'auto-accepted'
  if (confidence >= 70) return 'review-suggested'
  return 'review-required'
}

export const confidenceConfig = {
  high: {
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    label: 'High Confidence',
  },
  medium: {
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
    label: 'Medium Confidence',
  },
  low: {
    color: 'text-error',
    bgColor: 'bg-error/10',
    borderColor: 'border-error/20',
    label: 'Low Confidence',
  },
} as const

// ============================================
// ExtractedField Component
// ============================================

export interface ExtractedFieldProps {
  field: ExtractedField
  isEditing?: boolean
  onEdit?: () => void
  onSave?: (value: string) => Promise<void>
  onCancel?: () => void
  onViewSource?: () => void
  onReExtract?: () => void
  onShowHistory?: () => void
  className?: string
}

export function ExtractedField({
  field,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  onViewSource,
  onReExtract,
  onShowHistory,
  className,
}: ExtractedFieldProps) {
  const [editValue, setEditValue] = useState(field.value)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const config = confidenceConfig[field.confidenceLevel]

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    setSaveError(null)

    try {
      await onSave(editValue)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(field.value)
    setSaveError(null)
    onCancel?.()
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isSaving && 'opacity-50 pointer-events-none',
        showSuccess && 'ring-2 ring-success ring-offset-2',
        config.bgColor,
        field.status === 'edited' && 'border-l-4 border-l-primary',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            {/* Label */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium">{field.label}</p>
                {field.isRequired && (
                  <span className="text-error" aria-label="Required">
                    *
                  </span>
                )}
                {field.status === 'edited' && (
                  <Badge variant="outline" className="text-xs">
                    <Edit2 className="h-2.5 w-2.5 mr-1" />
                    Edited
                  </Badge>
                )}
              </div>

              {/* Confidence Badge */}
              <div className="flex items-center gap-2">
                <ConfidenceMeter value={field.confidence} size="sm" />
                <span className={cn('text-xs', config.color)}>
                  {config.label}
                </span>
              </div>
            </div>

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-1">
                {field.sourceRegion && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onViewSource}
                    title="View source"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onShowHistory}
                  title="View history"
                >
                  <History className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onReExtract}
                  title="Re-extract"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onEdit}
                  title="Edit field"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* View Mode */}
          {!isEditing && (
            <div
              className={cn(
                'p-3 rounded border transition-colors',
                config.borderColor,
                field.status === 'edited'
                  ? 'bg-bg-tertiary border-primary/30'
                  : 'bg-white'
              )}
            >
              <p className="text-sm break-words">{field.value}</p>
              {field.originalValue !== field.value && (
                <p className="text-xs text-text-tertiary mt-1">
                  Original: {field.originalValue}
                </p>
              )}
            </div>
          )}

          {/* Edit Mode */}
          {isEditing && (
            <div className="space-y-2">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter value..."
                className={cn(saveError && 'border-error')}
                autoFocus
              />

              {saveError && (
                <div className="flex items-center gap-1 text-xs text-error">
                  <AlertCircle className="h-3 w-3" />
                  {saveError}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={editValue === field.value || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Warning for low confidence */}
          {field.confidenceLevel === 'low' && !isEditing && (
            <div className="flex items-start gap-2 p-2 rounded bg-error/5 border border-error/20">
              <AlertCircle className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary">
                Low confidence detected. Manual review required.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// FieldGroup Component
// ============================================

export interface FieldGroupProps {
  group: FieldGroup
  isExpanded?: boolean
  onToggle?: () => void
  onFieldEdit?: (fieldId: string) => void
  onFieldSave?: (fieldId: string, value: string) => Promise<void>
  onFieldCancel?: () => void
  editingFieldId?: string | null
  className?: string
}

export function FieldGroup({
  group,
  isExpanded = true,
  onToggle,
  onFieldEdit,
  onFieldSave,
  onFieldCancel,
  editingFieldId = null,
  className,
}: FieldGroupProps) {
  const [fieldStates, setFieldStates] = useState<
    Record<string, ExtractedField>
  >(
    group.fields.reduce(
      (acc, field) => ({ ...acc, [field.id]: field }),
      {}
    )
  )

  const handleFieldSave = async (fieldId: string, value: string) => {
    const field = group.fields.find((f) => f.id === fieldId)
    if (!field || !onFieldSave) return

    await onFieldSave(fieldId, value)

    // Update local state
    setFieldStates((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        value,
        status: 'edited' as const,
        editHistory: [
          ...(prev[fieldId].editHistory || []),
          {
            timestamp: new Date(),
            oldValue: field.value,
            newValue: value,
            editedBy: 'user',
          },
        ],
      },
    }))
  }

  const displayFields = editingFieldId
    ? group.fields.filter((f) => f.id === editingFieldId)
    : group.fields

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Group Header */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between mb-4 text-left hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            {group.icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {group.icon}
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold">{group.name}</h3>
              <p className="text-xs text-text-secondary">
                {group.fields.length} field{group.fields.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Summary */}
            <div className="flex items-center gap-1 text-xs">
              <span className="flex items-center gap-1 text-success">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                {group.fields.filter((f) => f.confidenceLevel === 'high').length}
              </span>
              <span className="flex items-center gap-1 text-warning">
                <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                {group.fields.filter((f) => f.confidenceLevel === 'medium').length}
              </span>
              <span className="flex items-center gap-1 text-error">
                <div className="w-1.5 h-1.5 rounded-full bg-error" />
                {group.fields.filter((f) => f.confidenceLevel === 'low').length}
              </span>
            </div>
          </div>
        </button>

        {/* Fields */}
        {isExpanded && (
          <div className="space-y-3">
            {displayFields.map((field) => {
              const currentState = fieldStates[field.id] || field
              return (
                <ExtractedField
                  key={field.id}
                  field={currentState}
                  isEditing={editingFieldId === field.id}
                  onEdit={() => onFieldEdit?.(field.id)}
                  onSave={(value) => handleFieldSave(field.id, value)}
                  onCancel={onFieldCancel}
                  onViewSource={() => console.log('View source:', field.sourceRegion)}
                  onReExtract={() => console.log('Re-extract:', field.id)}
                  onShowHistory={() => console.log('Show history:', field.id)}
                />
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Compact ExtractedField Component
// Minimal version for list views
// ============================================

export interface CompactExtractedFieldProps {
  field: ExtractedField
  onClick?: () => void
  isActive?: boolean
}

export function CompactExtractedField({
  field,
  onClick,
  isActive = false,
}: CompactExtractedFieldProps) {
  const config = confidenceConfig[field.confidenceLevel]

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 rounded-lg border transition-all hover:shadow-md text-left',
        'flex items-center gap-3',
        isActive && 'ring-2 ring-primary ring-offset-2',
        config.bgColor,
        config.borderColor,
        field.status === 'edited' && 'border-l-4 border-l-primary'
      )}
    >
      {/* Status Indicator */}
      <div
        className={cn(
          'w-2 h-2 rounded-full flex-shrink-0',
          field.confidenceLevel === 'high' && 'bg-success',
          field.confidenceLevel === 'medium' && 'bg-warning',
          field.confidenceLevel === 'low' && 'bg-error'
        )}
      />

      {/* Label & Value */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-tertiary">{field.label}</p>
        <p className="text-sm font-medium truncate">{field.value}</p>
      </div>

      {/* Confidence */}
      <div className="text-right flex-shrink-0">
        <ConfidenceMeter value={field.confidence} size="sm" />
      </div>
    </button>
  )
}
