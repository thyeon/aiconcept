'use client'

import React, { useState, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { WorkflowStepper } from '@/components/features/workflow-stepper'
import {
  FieldGroup,
  CompactExtractedField,
  type ExtractedField,
  type FieldGroup as FieldGroupType,
} from '@/components/features/extraction-editor'
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
} from 'lucide-react'
import { useWorkflowContext } from '@/hooks/useWorkflowContext'

function ExtractionEditorPageContent() {
  const { caseId, activeCase, navigateToStep, updateCaseExtraction } = useWorkflowContext()
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['claimant', 'claim', 'provider'])
  )

  // Mock extraction data
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
          sourceRegion: { page: 1, x: 120, y: 200, width: 300, height: 30 },
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
          sourceRegion: { page: 1, x: 120, y: 235, width: 200, height: 25 },
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
          sourceRegion: { page: 1, x: 120, y: 270, width: 400, height: 25 },
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
          sourceRegion: { page: 1, x: 80, y: 320, width: 180, height: 25 },
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
          sourceRegion: { page: 2, x: 200, y: 150, width: 150, height: 25 },
          isRequired: true,
        },
        {
          id: 'field-7',
          label: 'Treatment Type',
          value: 'Emergency Room Visit',
          originalValue: 'Emergency Room Visit',
          confidence: 65,
          confidenceLevel: 'medium',
          status: 'review-suggested',
          sourceRegion: { page: 1, x: 120, y: 400, width: 250, height: 25 },
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
          sourceRegion: { page: 2, x: 80, y: 80, width: 300, height: 30 },
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
          sourceRegion: { page: 2, x: 80, y: 115, width: 150, height: 25 },
        },
        {
          id: 'field-10',
          label: 'Tax ID',
          value: '12-3456789',
          originalValue: '12-3456789',
          confidence: 52,
          confidenceLevel: 'low',
          status: 'review-required',
          sourceRegion: { page: 2, x: 80, y: 145, width: 150, height: 25 },
        },
      ],
    },
  ]

  // Flattened list for compact view
  const allFields = mockFieldGroups.flatMap((group) =>
    group.fields.map((field) => ({
      ...field,
      groupName: group.name,
    }))
  )

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('Field saved successfully')
  }

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* LEFT PANEL - Field List (320px) */}
      <aside className="w-[320px] flex-shrink-0 border-r border-border-light bg-bg-primary flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Extracted Fields</h2>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
              {/* Summary */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary-light/5">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Fields</span>
                      <span className="text-2xl font-bold text-primary">
                        {allFields.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-success">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        {allFields.filter((f) => f.confidenceLevel === 'high').length} High
                      </span>
                      <span className="flex items-center gap-1 text-warning">
                        <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                        {allFields.filter((f) => f.confidenceLevel === 'medium').length} Medium
                      </span>
                      <span className="flex items-center gap-1 text-error">
                        <div className="w-1.5 h-1.5 rounded-full bg-error" />
                        {allFields.filter((f) => f.confidenceLevel === 'low').length} Low
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compact Field List */}
              <div className="space-y-2 pr-4">
                <p className="text-xs font-medium text-text-secondary px-1">
                  ALL FIELDS
                </p>
                {allFields.map((field) => (
                  <CompactExtractedField
                    key={field.id}
                    field={field}
                    isActive={activeFieldId === field.id}
                    onClick={() => setActiveFieldId(field.id)}
                  />
                ))}
              </div>

              {/* Warnings */}
              {allFields.filter((f) => f.confidenceLevel === 'low').length > 0 && (
                <Card className="border-warning bg-warning/5">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-warning mb-1">
                          Review Required
                        </p>
                        <p className="text-xs text-text-secondary">
                          {allFields.filter((f) => f.confidenceLevel === 'low').length}{' '}
                          field(s) need manual review before processing
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
      </aside>

      {/* CENTER PANEL - Field Groups */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-bg-secondary">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* Workflow Stepper */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflow Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowStepper currentStep={4} showLabels showNumbers={false} />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary-light/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileCheck className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">
                    Extraction Editor
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Review and edit extracted data fields. Fields are grouped by category
                    and color-coded by confidence. Click any field to view source or make
                    changes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Groups */}
          <div className="space-y-4">
            {mockFieldGroups.map((group) => (
              <FieldGroup
                key={group.id}
                group={group}
                isExpanded={expandedGroups.has(group.id)}
                onToggle={() => toggleGroup(group.id)}
                editingFieldId={editingFieldId}
                onFieldEdit={(fieldId) => {
                  setEditingFieldId(fieldId)
                  setActiveFieldId(fieldId)
                }}
                onFieldSave={handleFieldSave}
                onFieldCancel={() => {
                  setEditingFieldId(null)
                  setActiveFieldId(null)
                }}
              />
            ))}
          </div>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Confidence Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg border border-success/30 bg-success/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-sm font-medium">High (≥90%)</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Auto-accepted, no review needed
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="text-sm font-medium">Medium (70-89%)</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Review suggested but optional
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-error/30 bg-error/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-error" />
                    <span className="text-sm font-medium">Low (&lt;70%)</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Manual review required
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
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

                <div className="flex items-center gap-2">
                  {allFields.filter((f) => f.confidenceLevel === 'low').length > 0 ? (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  ) : (
                    <FileCheck className="h-5 w-5 text-success" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {allFields.filter((f) => f.confidenceLevel === 'low').length > 0
                        ? 'Action Required'
                        : 'All Fields Ready'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {allFields.filter((f) => f.confidenceLevel === 'low').length > 0
                        ? 'Complete required field reviews'
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
      </main>
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
