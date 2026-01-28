'use client'

/**
 * Extraction Editor Page - Split View Layout
 *
 * This page allows users to review and edit extracted data fields while
 * visually validating against the source document.
 *
 * Layout:
 * - Left: Document viewer with bounding box highlights
 * - Right: Field editor cards grouped by category
 *
 * Key UX Features:
 * - Bidirectional sync: hover/click fields ↔ document highlights
 * - Color-coded confidence indicators (green/amber/red)
 * - Collapsible document panel for smaller screens
 * - Only active/hovered fields highlighted by default (toggle for all)
 * - Zoom, pan, and page navigation for document inspection
 */

import React, { useState, useCallback, Suspense, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { WorkflowStepper } from '@/components/features/workflow-stepper'
import {
  FieldGroup,
  CompactExtractedField,
  type ExtractedField,
  type FieldGroup as FieldGroupType,
  confidenceConfig,
} from '@/components/features/extraction-editor'
import {
  ExtractionDocumentViewer,
  createBoundingBoxesFromFields,
  type BoundingBox,
} from '@/components/features/extraction-document-viewer'
import { useExtractionSync } from '@/hooks/useExtractionSync'
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  Building,
  FileCheck,
  Clock,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react'
import { useWorkflowContext } from '@/hooks/useWorkflowContext'
import { cn } from '@/lib/utils'

// ============================================
// Enhanced Field Card with Hover/Click Sync
// ============================================

interface SyncedFieldCardProps {
  field: ExtractedField & { groupName?: string }
  isActive: boolean
  isHovered: boolean
  onHover: (fieldId: string | null) => void
  onClick: (fieldId: string) => void
  onEdit: (fieldId: string) => void
  registerRef: (fieldId: string, ref: HTMLElement | null) => void
}

function SyncedFieldCard({
  field,
  isActive,
  isHovered,
  onHover,
  onClick,
  onEdit,
  registerRef,
}: SyncedFieldCardProps) {
  const config = confidenceConfig[field.confidenceLevel]
  const isHighlighted = isActive || isHovered

  return (
    <div
      ref={(ref) => registerRef(field.id, ref)}
      className={cn(
        'relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer',
        'hover:shadow-md',
        isHighlighted && 'ring-2 ring-offset-2',
        field.confidenceLevel === 'high' && 'border-emerald-300 hover:border-emerald-400',
        field.confidenceLevel === 'medium' && 'border-amber-300 hover:border-amber-400',
        field.confidenceLevel === 'low' && 'border-red-300 hover:border-red-400',
        isActive && field.confidenceLevel === 'high' && 'ring-emerald-500 bg-emerald-50',
        isActive && field.confidenceLevel === 'medium' && 'ring-amber-500 bg-amber-50',
        isActive && field.confidenceLevel === 'low' && 'ring-red-500 bg-red-50',
        isHovered && !isActive && 'bg-gray-50',
        field.status === 'edited' && 'border-l-4 border-l-primary',
      )}
      onMouseEnter={() => onHover(field.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(field.id)}
    >
      {/* Source indicator - shows if field has document mapping */}
      {field.sourceRegion && (
        <div
          className={cn(
            'absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center',
            'text-white text-xs font-bold shadow-sm',
            field.confidenceLevel === 'high' && 'bg-emerald-500',
            field.confidenceLevel === 'medium' && 'bg-amber-500',
            field.confidenceLevel === 'low' && 'bg-red-500',
          )}
          title={`Page ${field.sourceRegion.page}`}
        >
          {field.sourceRegion.page}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Label */}
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-text-secondary">{field.label}</p>
            {field.isRequired && <span className="text-error text-xs">*</span>}
            {field.status === 'edited' && (
              <Badge variant="outline" className="text-xs h-4 px-1">Edited</Badge>
            )}
          </div>

          {/* Value */}
          <p className="text-sm font-medium truncate" title={field.value}>
            {field.value}
          </p>

          {/* Confidence bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  field.confidenceLevel === 'high' && 'bg-emerald-500',
                  field.confidenceLevel === 'medium' && 'bg-amber-500',
                  field.confidenceLevel === 'low' && 'bg-red-500',
                )}
                style={{ width: `${field.confidence}%` }}
              />
            </div>
            <span className={cn('text-xs font-medium', config.color)}>
              {field.confidence}%
            </span>
          </div>
        </div>

        {/* Edit button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(field.id)
          }}
        >
          Edit
        </Button>
      </div>

      {/* Low confidence warning */}
      {field.confidenceLevel === 'low' && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
          <AlertTriangle className="h-3 w-3" />
          <span>Manual review required</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Page Component
// ============================================

function ExtractionEditorPageContent() {
  const { caseId, navigateToStep } = useWorkflowContext()
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['claimant', 'claim', 'provider'])
  )

  // Mock extraction data with source regions for document mapping
  const mockFieldGroups: FieldGroupType[] = [
    {
      id: 'claimant',
      name: 'Claimant Information',
      icon: <User className="h-4 w-4" />,
      isExpanded: true,
      fields: [
        {
          id: 'field-1',
          label: 'Full Name',
          value: 'John Andrew Smith Jr.',
          originalValue: 'John Andrew Smith Jr.',
          confidence: 96,
          confidenceLevel: 'high',
          status: 'auto-accepted',
          sourceRegion: { page: 1, x: 50, y: 145, width: 200, height: 20 },
          isRequired: true,
        },
        {
          id: 'field-2',
          label: 'Date of Birth',
          value: 'March 15, 1985',
          originalValue: 'March 15, 1985',
          confidence: 94,
          confidenceLevel: 'high',
          status: 'auto-accepted',
          sourceRegion: { page: 1, x: 350, y: 145, width: 150, height: 20 },
          isRequired: true,
        },
        {
          id: 'field-3',
          label: 'Address',
          value: '123 Main Street, Apt 4B, New York, NY 10001',
          originalValue: '123 Main Street, Apt 4B, New York, NY 10001',
          confidence: 78,
          confidenceLevel: 'medium',
          status: 'review-suggested',
          sourceRegion: { page: 1, x: 50, y: 195, width: 450, height: 20 },
        },
      ],
    },
    {
      id: 'claim',
      name: 'Claim Details',
      icon: <FileText className="h-4 w-4" />,
      isExpanded: true,
      fields: [
        {
          id: 'field-4',
          label: 'Claim ID',
          value: 'CLM-2024-08947',
          originalValue: 'CLM-2024-08947',
          confidence: 100,
          confidenceLevel: 'high',
          status: 'auto-accepted',
          sourceRegion: { page: 1, x: 350, y: 265, width: 150, height: 20 },
          isRequired: true,
        },
        {
          id: 'field-5',
          label: 'Claim Date',
          value: 'January 15, 2024',
          originalValue: 'January 15, 2024',
          confidence: 98,
          confidenceLevel: 'high',
          status: 'auto-accepted',
          sourceRegion: { page: 1, x: 50, y: 265, width: 150, height: 20 },
          isRequired: true,
        },
        {
          id: 'field-6',
          label: 'Claim Amount',
          value: '$3,280.00',
          originalValue: '$3,280.00',
          confidence: 92,
          confidenceLevel: 'high',
          status: 'auto-accepted',
          sourceRegion: { page: 2, x: 50, y: 265, width: 120, height: 25 },
          isRequired: true,
        },
        {
          id: 'field-7',
          label: 'Treatment Type',
          value: 'Emergency Room Visit',
          originalValue: 'Emergency Room Visit',
          confidence: 65,
          confidenceLevel: 'low',
          status: 'review-required',
          sourceRegion: { page: 1, x: 50, y: 315, width: 200, height: 20 },
        },
      ],
    },
    {
      id: 'provider',
      name: 'Provider Information',
      icon: <Building className="h-4 w-4" />,
      isExpanded: true,
      fields: [
        {
          id: 'field-8',
          label: 'Provider Name',
          value: 'City Medical Center',
          originalValue: 'City Medical Center',
          confidence: 88,
          confidenceLevel: 'medium',
          status: 'review-suggested',
          sourceRegion: { page: 2, x: 50, y: 110, width: 250, height: 20 },
          isRequired: true,
        },
        {
          id: 'field-9',
          label: 'NPI Number',
          value: '1234567890',
          originalValue: '1234567890',
          confidence: 45,
          confidenceLevel: 'low',
          status: 'review-required',
          sourceRegion: { page: 2, x: 50, y: 160, width: 120, height: 20 },
        },
        {
          id: 'field-10',
          label: 'Tax ID',
          value: '12-3456789',
          originalValue: '12-3456789',
          confidence: 52,
          confidenceLevel: 'low',
          status: 'review-required',
          sourceRegion: { page: 2, x: 300, y: 160, width: 120, height: 20 },
        },
      ],
    },
  ]

  // Flatten fields for sync hook
  const allFields = mockFieldGroups.flatMap((group) =>
    group.fields.map((field) => ({
      ...field,
      groupId: group.id,
      groupName: group.name,
    }))
  )

  // Use extraction sync hook for coordinated state
  const {
    activeFieldId,
    hoveredFieldId,
    currentPage,
    showAllHighlights,
    isDocumentPanelOpen,
    setActiveField,
    setHoveredField,
    setCurrentPage,
    setShowAllHighlights,
    toggleDocumentPanel,
    registerFieldRef,
    totalPages,
  } = useExtractionSync({
    fields: allFields,
    initialPage: 1,
  })

  // Create bounding boxes for document viewer
  const boundingBoxes = createBoundingBoxesFromFields(allFields)

  // Mock document pages
  const documentPages = [
    { pageNumber: 1, imageUrl: '/mock-page-1.png', width: 600, height: 780 },
    { pageNumber: 2, imageUrl: '/mock-page-2.png', width: 600, height: 780 },
  ]

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const handleFieldSave = async (fieldId: string, value: string) => {
    console.log('Saving field:', fieldId, 'with value:', value)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('Field saved successfully')
  }

  // Stats
  const highConfidenceCount = allFields.filter((f) => f.confidenceLevel === 'high').length
  const mediumConfidenceCount = allFields.filter((f) => f.confidenceLevel === 'medium').length
  const lowConfidenceCount = allFields.filter((f) => f.confidenceLevel === 'low').length

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* LEFT PANEL - Document Viewer (collapsible) */}
      <div
        className={cn(
          'border-r border-border-light bg-gray-100 flex flex-col transition-all duration-300',
          isDocumentPanelOpen ? 'w-[50%] min-w-[400px]' : 'w-0 min-w-0 overflow-hidden'
        )}
      >
        {isDocumentPanelOpen && (
          <ExtractionDocumentViewer
            pages={documentPages}
            boundingBoxes={boundingBoxes}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            activeFieldId={activeFieldId}
            hoveredFieldId={hoveredFieldId}
            onFieldHover={setHoveredField}
            onFieldClick={setActiveField}
            showAllHighlights={showAllHighlights}
            onToggleHighlights={setShowAllHighlights}
            className="flex-1"
          />
        )}
      </div>

      {/* Document Panel Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 z-30 h-10 w-6 rounded-r-lg rounded-l-none',
          'bg-white shadow-md hover:bg-gray-50 transition-all',
          isDocumentPanelOpen && 'left-[calc(50%-12px)]'
        )}
        onClick={toggleDocumentPanel}
        title={isDocumentPanelOpen ? 'Hide document' : 'Show document'}
      >
        {isDocumentPanelOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </Button>

      {/* RIGHT PANEL - Field Editor */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-bg-secondary">
        {/* Header with controls */}
        <div className="px-4 py-3 bg-white border-b border-border-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Extraction Editor</h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Confidence summary */}
              <div className="flex items-center gap-3 text-xs mr-4">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium">{highConfidenceCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-medium">{mediumConfidenceCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="font-medium">{lowConfidenceCount}</span>
                </div>
              </div>

              {/* Toggle document panel (mobile) */}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 md:hidden"
                onClick={toggleDocumentPanel}
              >
                {isDocumentPanelOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Document
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4 max-w-3xl mx-auto">
            {/* Workflow Stepper */}
            <Card>
              <CardContent className="p-4">
                <WorkflowStepper currentStep={4} showLabels showNumbers={false} />
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary-light/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Layers className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold mb-1">
                      Visual Validation Mode
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Click or hover on any field to see its source location highlighted in the document.
                      Fields are color-coded by confidence level. Edit any field that needs correction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Field Groups */}
            {mockFieldGroups.map((group) => (
              <Card key={group.id}>
                <CardContent className="p-4">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
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

                    {/* Status indicators */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-emerald-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {group.fields.filter((f) => f.confidenceLevel === 'high').length}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {group.fields.filter((f) => f.confidenceLevel === 'medium').length}
                      </span>
                      <span className="flex items-center gap-1 text-red-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {group.fields.filter((f) => f.confidenceLevel === 'low').length}
                      </span>
                    </div>
                  </button>

                  {/* Field Cards */}
                  {expandedGroups.has(group.id) && (
                    <div className="space-y-3">
                      {group.fields.map((field) => (
                        <SyncedFieldCard
                          key={field.id}
                          field={{ ...field, groupName: group.name }}
                          isActive={activeFieldId === field.id}
                          isHovered={hoveredFieldId === field.id}
                          onHover={setHoveredField}
                          onClick={setActiveField}
                          onEdit={setEditingFieldId}
                          registerRef={registerFieldRef}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Legend */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Confidence Levels</CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-medium">High (≥90%)</span>
                    </div>
                    <p className="text-xs text-text-secondary">Auto-accepted</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-xs font-medium">Medium (70-89%)</span>
                    </div>
                    <p className="text-xs text-text-secondary">Review suggested</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-red-200 bg-red-50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-xs font-medium">Low (&lt;70%)</span>
                    </div>
                    <p className="text-xs text-text-secondary">Review required</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Actions */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigateToStep('quality-check', caseId || undefined)}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Quality Check
                  </Button>

                  <div className="flex items-center gap-2 text-center">
                    {lowConfidenceCount > 0 ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <FileCheck className="h-5 w-5 text-emerald-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {lowConfidenceCount > 0
                          ? `${lowConfidenceCount} field${lowConfidenceCount > 1 ? 's' : ''} need review`
                          : 'All fields ready'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {lowConfidenceCount > 0
                          ? 'Complete reviews to continue'
                          : 'Proceed to rules evaluation'}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={() => navigateToStep('rules', caseId || undefined)}
                    className="gap-2"
                  >
                    Continue to Rules
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// Wrap with Suspense for useSearchParams
export default function ExtractionEditorPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
      <ExtractionEditorPageContent />
    </Suspense>
  )
}
