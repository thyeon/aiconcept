'use client'

import React, { useState, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { WorkflowStepper } from '@/components/features/workflow-stepper'
import {
  DocumentUploadZone,
  type UploadedFile,
} from '@/components/features/document-upload-zone'
import {
  DocumentFolderList,
  DocumentFolderGrid,
  SmartFolderSuggestions,
  FolderStats,
  type DocumentFolder,
  type FolderType,
} from '@/components/features/document-folder-organization'
import {
  DocumentClassificationBadge,
  DocumentClassificationCard,
  ClassificationPreviewList,
  ClassificationStats,
  type ClassificationResult,
  type DocumentClassType,
} from '@/components/features/document-classification'
import { Upload, FolderOpen, Sparkles, ArrowRight } from 'lucide-react'
import { useWorkflowContext } from '@/hooks/useWorkflowContext'
import type { Document, QualityCheck } from '@/types'

function DocumentUploadPageContent() {
  const { caseId, activeCase, navigateToStep, createCase, updateCaseDocuments, updateCaseStatus } = useWorkflowContext()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [folders, setFolders] = useState<DocumentFolder[]>([
    {
      id: 'folder-1',
      name: 'Identity Documents',
      type: 'identity',
      documentCount: 3,
      documents: [],
      isExpanded: true,
    },
    {
      id: 'folder-2',
      name: 'Medical Reports',
      type: 'medical',
      documentCount: 5,
      documents: [],
      isExpanded: false,
    },
    {
      id: 'folder-3',
      name: 'Receipts',
      type: 'receipts',
      documentCount: 12,
      documents: [],
      isExpanded: false,
    },
  ])

  const [classifications, setClassifications] = useState<ClassificationResult[]>([
    {
      documentId: 'doc-001',
      classification: {
        type: 'identity',
        confidence: 0.96,
        detectedAt: new Date(),
        processingTime: 342,
      },
      alternativeTypes: [
        { type: 'policy', confidence: 0.03 },
        { type: 'medical', confidence: 0.01 },
      ],
    },
    {
      documentId: 'doc-002',
      classification: {
        type: 'medical',
        confidence: 0.89,
        detectedAt: new Date(),
        processingTime: 428,
      },
      alternativeTypes: [
        { type: 'receipt', confidence: 0.08 },
        { type: 'policy', confidence: 0.03 },
      ],
    },
    {
      documentId: 'doc-003',
      classification: {
        type: 'receipt',
        confidence: 0.72,
        detectedAt: new Date(),
        processingTime: 256,
        manualOverride: true,
        originalType: 'unknown',
      },
      alternativeTypes: [
        { type: 'invoice', confidence: 0.20 },
        { type: 'policy', confidence: 0.08 },
      ],
    },
  ])

  const [suggestions] = useState([
    {
      folderType: 'policy' as FolderType,
      folderName: 'Insurance Policies',
      documentIds: ['doc-004', 'doc-005'],
      confidence: 0.92,
      reason: 'Multiple policy documents detected with similar structure',
    },
  ])

  const handleFilesSelected = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files])

    // Simulate classification
    const newClassifications: ClassificationResult[] = files.map((file) => ({
      documentId: file.id,
      classification: {
        type: file.type === 'pdf' ? 'policy' : file.type === 'image' ? 'receipt' : 'unknown',
        confidence: 0.75 + Math.random() * 0.2,
        detectedAt: new Date(),
        processingTime: Math.round(200 + Math.random() * 400),
      },
    }))

    setClassifications((prev) => [...prev, ...newClassifications])
  }

  const handleFolderClick = (folderId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    )
  }

  const handleTypeChange = (documentId: string, newType: DocumentClassType) => {
    setClassifications((prev) =>
      prev.map((c) =>
        c.documentId === documentId
          ? {
              ...c,
              classification: {
                ...c.classification,
                type: newType,
                manualOverride: true,
                originalType: c.classification.originalType || c.classification.type,
              },
            }
          : c
      )
    )
  }

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* LEFT PANEL - Folder Organization (280px) */}
      <aside className="w-[280px] flex-shrink-0 border-r border-border-light bg-bg-primary flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Document Folders</h2>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <FolderStats folders={folders} />
            <Separator />
            <DocumentFolderList
              folders={folders}
              activeFolderId="folder-1"
              onFolderClick={handleFolderClick}
            />
            <SmartFolderSuggestions
              suggestions={suggestions}
              onApplySuggestion={(suggestion) => console.log('Apply suggestion:', suggestion)}
              onDismissSuggestion={(suggestion) => console.log('Dismiss suggestion:', suggestion)}
            />
          </div>
        </ScrollArea>
      </aside>

      {/* CENTER PANEL - Upload Zone */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-bg-secondary">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* Workflow Stepper */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowStepper currentStep={1} showLabels showNumbers={false} />
            </CardContent>
          </Card>

          {/* Upload Zone */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upload Documents</CardTitle>
                <Upload className="h-5 w-5 text-text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <DocumentUploadZone
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                maxFileSize={50 * 1024 * 1024}
                maxFiles={50}
                multiple
                onFilesSelected={handleFilesSelected}
                onUploadComplete={(file) => console.log('Upload complete:', file.id)}
                onUploadError={(fileId, error) => console.error('Upload error:', fileId, error)}
              />
            </CardContent>
          </Card>

          {/* Classification Stats */}
          {classifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Classification Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ClassificationStats classifications={classifications} />
                <Separator />
                <ClassificationPreviewList
                  classifications={classifications}
                  onTypeChange={handleTypeChange}
                />
              </CardContent>
            </Card>
          )}

          {/* Classification Details */}
          {classifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Classification Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={classifications[0]?.documentId}>
                  <TabsList className="mb-4">
                    {classifications.slice(0, 5).map((c) => (
                      <TabsTrigger key={c.documentId} value={c.documentId}>
                        {c.documentId.slice(-4)}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {classifications.slice(0, 5).map((classification) => (
                    <TabsContent key={classification.documentId} value={classification.documentId}>
                      <DocumentClassificationCard
                        classification={classification}
                        onTypeChange={handleTypeChange}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Folder Grid View */}
          {folders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Folder Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentFolderGrid
                  folders={folders}
                  columns={3}
                  onFolderClick={handleFolderClick}
                />
              </CardContent>
            </Card>
          )}

          {/* Continue to Quality Check */}
          {uploadedFiles.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      {uploadedFiles.length} document{uploadedFiles.length > 1 ? 's' : ''} uploaded
                    </p>
                    <p className="text-xs text-text-secondary">
                      Ready to proceed to quality check
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => {
                      // Create a new case if we don't have one
                      let targetCaseId = caseId
                      if (!targetCaseId) {
                        targetCaseId = createCase(
                          `Document Upload - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                          'insurance'
                        )
                      }

                      // Convert uploaded files to documents and update case
                      const documents: Document[] = uploadedFiles.map((uploadedFile, index) => ({
                        id: `doc-${Date.now()}-${index}`,
                        name: uploadedFile.file.name,
                        type: uploadedFile.file.type,
                        size: uploadedFile.size,
                        url: `/documents/${uploadedFile.id}`,
                        thumbnail: `/thumbnails/${uploadedFile.id}.png`,
                        uploadedAt: new Date().toISOString(),
                        qualityScore: 0,
                        qualityChecks: [],
                        classification: {
                          type: classifications.find(c => c.documentId === uploadedFile.id)?.classification.type || 'unknown',
                          confidence: classifications.find(c => c.documentId === uploadedFile.id)?.classification.confidence || 0.5,
                          manuallyOverridden: false,
                        },
                        extractionStatus: 'pending',
                      }))

                      updateCaseDocuments(documents)
                      updateCaseStatus('in-progress')
                      navigateToStep('quality-check', targetCaseId)
                    }}
                    className="gap-2"
                  >
                    Continue to Quality Check
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

// Wrap with Suspense for useSearchParams
export default function DocumentUploadPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
      <DocumentUploadPageContent />
    </Suspense>
  )
}
