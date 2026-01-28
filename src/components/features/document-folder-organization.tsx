'use client'

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  Folder,
  FolderOpen,
  FileText,
  IdCard,
  Receipt,
  Scale,
  Plus,
  ChevronRight,
  GripVertical,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { UploadedFile } from './document-upload-zone'

// ============================================
// Document Folder Types
// ============================================

export type FolderType =
  | 'identity'
  | 'medical'
  | 'receipts'
  | 'policy'
  | 'other'
  | 'custom'

export interface DocumentFolder {
  id: string
  name: string
  type: FolderType
  documentCount: number
  documents: UploadedFile[]
  icon?: React.ReactNode
  color?: string
  isExpanded?: boolean
}

export interface DocumentFolderListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Folders to display */
  folders: DocumentFolder[]
  /** Enable drag-to-reassign */
  enableDragReassign?: boolean
  /** Enable custom folder creation */
  enableCreateFolder?: boolean
  /** Callback when folder is clicked */
  onFolderClick?: (folderId: string) => void
  /** Callback when document is reassigned */
  onDocumentReassign?: (documentId: string, targetFolderId: string) => void
  /** Callback when new folder is created */
  onCreateFolder?: (folderName: string, folderType: FolderType) => void
  /** Active folder ID */
  activeFolderId?: string
}

// Folder type configurations
const folderTypeConfig: Record<
  FolderType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  identity: {
    icon: <IdCard className="h-4 w-4" />,
    color: 'text-blue-600',
    label: 'Identity Documents',
  },
  medical: {
    icon: <FileText className="h-4 w-4" />,
    color: 'text-red-600',
    label: 'Medical Reports',
  },
  receipts: {
    icon: <Receipt className="h-4 w-4" />,
    color: 'text-green-600',
    label: 'Receipts & Invoices',
  },
  policy: {
    icon: <Scale className="h-4 w-4" />,
    color: 'text-purple-600',
    label: 'Policy Documents',
  },
  other: {
    icon: <Folder className="h-4 w-4" />,
    color: 'text-gray-600',
    label: 'Other Documents',
  },
  custom: {
    icon: <Folder className="h-4 w-4" />,
    color: 'text-orange-600',
    label: 'Custom Folder',
  },
}

export function DocumentFolderList({
  folders,
  enableDragReassign = true,
  enableCreateFolder = true,
  onFolderClick,
  onDocumentReassign,
  onCreateFolder,
  activeFolderId,
  className,
  ...props
}: DocumentFolderListProps) {
  const [draggedDocId, setDraggedDocId] = useState<string | null>(null)
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedFolderType, setSelectedFolderType] = useState<FolderType>('custom')

  const handleDragStart = useCallback((docId: string) => {
    if (!enableDragReassign) return
    setDraggedDocId(docId)
  }, [enableDragReassign])

  const handleDragOver = useCallback((e: React.DragEvent, folderId: string) => {
    if (!enableDragReassign) return
    e.preventDefault()
    setDragOverFolderId(folderId)
  }, [enableDragReassign])

  const handleDragLeave = useCallback(() => {
    setDragOverFolderId(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetFolderId: string) => {
      if (!enableDragReassign || !draggedDocId) return
      e.preventDefault()
      onDocumentReassign?.(draggedDocId, targetFolderId)
      setDraggedDocId(null)
      setDragOverFolderId(null)
    },
    [enableDragReassign, draggedDocId, onDocumentReassign]
  )

  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) return
    onCreateFolder?.(newFolderName, selectedFolderType)
    setNewFolderName('')
    setShowCreateFolder(false)
  }, [newFolderName, selectedFolderType, onCreateFolder])

  return (
    <div className={cn('space-y-3', className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Document Folders</h3>
          <p className="text-xs text-text-secondary">
            {folders.reduce((sum, f) => sum + f.documentCount, 0)} documents in{' '}
            {folders.length} folders
          </p>
        </div>
        {enableCreateFolder && (
          <Button
            variant="ghost"
                       onClick={() => setShowCreateFolder(!showCreateFolder)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
        )}
      </div>

      {/* Create Folder Input */}
      {showCreateFolder && (
        <Card className="border-primary">
          <CardContent className="p-3 space-y-3">
            <Input
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(folderTypeConfig) as FolderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFolderType(type)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors',
                    selectedFolderType === type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-light hover:border-border-medium'
                  )}
                >
                  {folderTypeConfig[type].icon}
                  {folderTypeConfig[type].label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateFolder}>
                Create
              </Button>
              <Button
                               variant="ghost"
                onClick={() => setShowCreateFolder(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Folder List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-2 pr-4">
          {folders.map((folder) => {
            const config = folderTypeConfig[folder.type]
            const isActive = folder.id === activeFolderId
            const isDragOver = dragOverFolderId === folder.id

            return (
              <div
                key={folder.id}
                className={cn(
                  'rounded-lg border transition-all',
                  isActive && 'border-primary bg-primary/5',
                  isDragOver && 'border-primary bg-primary/10',
                  !isActive && !isDragOver && 'border-border-light hover:border-border-medium'
                )}
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
                {/* Folder Header */}
                <button
                  onClick={() => onFolderClick?.(folder.id)}
                  className="w-full p-3 flex items-center gap-3 text-left"
                >
                  {/* Folder Icon */}
                  <div className={cn('flex-shrink-0', config.color)}>
                    {folder.isExpanded ? (
                      <FolderOpen className="h-5 w-5" />
                    ) : (
                      <Folder className="h-5 w-5" />
                    )}
                  </div>

                  {/* Folder Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{folder.name}</p>
                      <Badge variant="secondary">
                        {folder.documentCount}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary truncate">
                      {config.label}
                    </p>
                  </div>

                  {/* Expand Icon */}
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 text-text-tertiary transition-transform',
                      folder.isExpanded && 'transform rotate-90'
                    )}
                  />
                </button>

                {/* Expanded Documents */}
                {folder.isExpanded && folder.documents.length > 0 && (
                  <div className="px-3 pb-3 pl-11 space-y-1">
                    {folder.documents.map((doc) => (
                      <div
                        key={doc.id}
                        draggable={enableDragReassign}
                        onDragStart={() => handleDragStart(doc.id)}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded text-xs',
                          'bg-bg-tertiary hover:bg-bg-secondary',
                          'transition-colors cursor-grab active:cursor-grabbing'
                        )}
                      >
                        {enableDragReassign && (
                          <GripVertical className="h-3 w-3 text-text-tertiary flex-shrink-0" />
                        )}
                        <FileText className="h-3 w-3 text-text-secondary flex-shrink-0" />
                        <span className="flex-1 truncate">{doc.file.name}</span>
                        <Badge variant="outline">
                          {(doc.file.size / 1024).toFixed(0)}KB
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Empty State */}
          {folders.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Folder className="h-12 w-12 mx-auto text-text-tertiary mb-3" />
                <p className="text-sm text-text-secondary mb-1">No folders yet</p>
                <p className="text-xs text-text-tertiary">
                  Create folders to organize your documents
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// ============================================
// Folder Grid Component
// Visual grid view for folders
// ============================================

export interface DocumentFolderGridProps extends Omit<
  DocumentFolderListProps,
  'className'
> {
  /** Grid columns */
  columns?: number
}

export function DocumentFolderGrid({
  folders,
  enableDragReassign = true,
  onFolderClick,
  onDocumentReassign,
  activeFolderId,
  columns = 3,
  ...props
}: DocumentFolderGridProps) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      {...props}
    >
      {folders.map((folder) => {
        const config = folderTypeConfig[folder.type]
        const isActive = folder.id === activeFolderId

        return (
          <Card
            key={folder.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isActive && 'ring-2 ring-primary'
            )}
            onClick={() => onFolderClick?.(folder.id)}
          >
            <CardContent className="p-4">
              {/* Folder Icon */}
              <div className={cn('flex items-center gap-3 mb-3', config.color)}>
                {folder.isExpanded ? (
                  <FolderOpen className="h-8 w-8" />
                ) : (
                  <Folder className="h-8 w-8" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold truncate">{folder.name}</p>
                  <p className="text-xs text-text-secondary">
                    {folder.documentCount} documents
                  </p>
                </div>
              </div>

              {/* Folder Type Badge */}
              <Badge variant="outline">
                {config.icon}
                <span className="ml-1">{config.label}</span>
              </Badge>

              {/* Document Preview (first 3) */}
              {folder.documents.length > 0 && (
                <div className="mt-3 space-y-1">
                  {folder.documents.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 text-xs p-1 rounded bg-bg-tertiary"
                    >
                      <FileText className="h-3 w-3 text-text-secondary" />
                      <span className="flex-1 truncate">{doc.file.name}</span>
                    </div>
                  ))}
                  {folder.documents.length > 3 && (
                    <p className="text-xs text-text-tertiary text-center pt-1">
                      +{folder.documents.length - 3} more
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ============================================
// Smart Folder Suggestions
// Auto-generate folder suggestions based on documents
// ============================================

export interface FolderSuggestion {
  folderType: FolderType
  folderName: string
  documentIds: string[]
  confidence: number
  reason: string
}

export interface SmartFolderSuggestionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Suggestions to display */
  suggestions: FolderSuggestion[]
  /** Callback when suggestion is applied */
  onApplySuggestion?: (suggestion: FolderSuggestion) => void
  /** Callback when suggestion is dismissed */
  onDismissSuggestion?: (suggestion: FolderSuggestion) => void
}

export function SmartFolderSuggestions({
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
  className,
  ...props
}: SmartFolderSuggestionsProps) {
  if (suggestions.length === 0) return null

  return (
    <Card className={cn('border-primary', className)} {...props}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Smart Folder Suggestions</p>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-border-light bg-bg-tertiary space-y-2"
            >
              {/* Suggestion Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{suggestion.folderName}</p>
                    <Badge variant="outline">
                      {Math.round(suggestion.confidence * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {suggestion.reason}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {suggestion.documentIds.length} document(s) to organize
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <Button
                                       onClick={() => onApplySuggestion?.(suggestion)}
                  >
                    Apply
                  </Button>
                  <Button
                                       variant="ghost"
                    onClick={() => onDismissSuggestion?.(suggestion)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Folder Stats Component
// Overview of folder organization
// ============================================

export interface FolderStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  folders: DocumentFolder[]
}

export function FolderStats({ folders, className, ...props }: FolderStatsProps) {
  const totalDocs = folders.reduce((sum, f) => sum + f.documentCount, 0)
  const emptyFolders = folders.filter((f) => f.documentCount === 0).length

  return (
    <div className={cn('flex items-center gap-4 text-sm', className)} {...props}>
      <div>
        <span className="text-text-tertiary">Total Folders:</span>{' '}
        <span className="font-semibold">{folders.length}</span>
      </div>
      <div>
        <span className="text-text-tertiary">Total Documents:</span>{' '}
        <span className="font-semibold">{totalDocs}</span>
      </div>
      {emptyFolders > 0 && (
        <div>
          <span className="text-text-tertiary">Empty Folders:</span>{' '}
          <span className="font-semibold text-warning">{emptyFolders}</span>
        </div>
      )}
    </div>
  )
}
