'use client'

import React, { useState, Suspense, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { WorkflowStepper } from '@/components/features/workflow-stepper'
import {
  QualityCheckPanel,
  CompactQualityCheck,
  type DocumentQuality,
} from '@/components/features/quality-check-panel'
import {
  QualityGateModal,
  QualityCheckBanner,
  AIExplanation,
} from '@/components/features/quality-check-modal'
import { Shield, FileText, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react'
import { useWorkflowContext } from '@/hooks/useWorkflowContext'

function QualityCheckPageContent() {
  const { caseId, activeCase, navigateToStep } = useWorkflowContext()
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Mock quality data - Failed example
  const failedQuality: DocumentQuality = {
    documentId: 'doc-001',
    fileName: 'insurance_claim_001.pdf',
    overallScore: 45,
    overallStatus: 'fail',
    processingTime: 1245,
    checkedAt: new Date(),
    checks: [
      {
        id: 'blur-1',
        name: 'Blurriness Detection',
        status: 'fail',
        score: 35,
        severity: 'high',
        details: 'Multiple regions show significant blurriness affecting text readability',
        recommendation: 'Re-scan the document with proper focus and higher resolution',
        affectedRegions: [
          { page: 1, x: 120, y: 340, width: 200, height: 80 },
          { page: 2, x: 80, y: 200, width: 150, height: 60 },
        ],
      },
      {
        id: 'glare-1',
        name: 'Glare & Reflection',
        status: 'fail',
        score: 28,
        severity: 'high',
        details: 'Strong light reflections detected in header and footer areas',
        recommendation: 'Use matte finish or adjust lighting during scanning',
        affectedRegions: [
          { page: 1, x: 0, y: 0, width: 600, height: 100 },
        ],
      },
      {
        id: 'resolution-1',
        name: 'Resolution Check',
        status: 'warning',
        score: 68,
        severity: 'medium',
        details: 'Document resolution is below recommended 300 DPI',
        recommendation: 'Scan at 300 DPI or higher for best OCR results',
      },
      {
        id: 'cropping-1',
        name: 'Cropping & Cut-off',
        status: 'pass',
        score: 95,
        severity: 'low',
        details: 'All content properly captured within document boundaries',
      },
      {
        id: 'tampering-1',
        name: 'Tampering Detection',
        status: 'pass',
        score: 100,
        severity: 'low',
        details: 'No signs of document manipulation or alteration detected',
      },
    ],
  }

  // Mock quality data - Warning example
  const warningQuality: DocumentQuality = {
    documentId: 'doc-002',
    fileName: 'medical_report_002.pdf',
    overallScore: 72,
    overallStatus: 'medium',
    processingTime: 892,
    checkedAt: new Date(),
    checks: [
      {
        id: 'blur-2',
        name: 'Blurriness Detection',
        status: 'pass',
        score: 88,
        severity: 'low',
        details: 'Minor blurriness in one region, overall text is clear',
      },
      {
        id: 'glare-2',
        name: 'Glare & Reflection',
        status: 'warning',
        score: 65,
        severity: 'medium',
        details: 'Slight glare detected in top margin, may affect header recognition',
        recommendation: 'Consider re-scanning with adjusted lighting',
      },
      {
        id: 'resolution-2',
        name: 'Resolution Check',
        status: 'pass',
        score: 92,
        severity: 'low',
        details: 'Document scanned at adequate resolution (298 DPI)',
      },
      {
        id: 'cropping-2',
        name: 'Cropping & Cut-off',
        status: 'pass',
        score: 98,
        severity: 'low',
        details: 'All content properly captured',
      },
      {
        id: 'tampering-2',
        name: 'Tampering Detection',
        status: 'pass',
        score: 100,
        severity: 'low',
        details: 'No signs of manipulation detected',
      },
    ],
  }

  // Mock quality data - High quality example
  const highQuality: DocumentQuality = {
    documentId: 'doc-003',
    fileName: 'policy_document_003.pdf',
    overallScore: 96,
    overallStatus: 'high',
    processingTime: 756,
    checkedAt: new Date(),
    checks: [
      {
        id: 'blur-3',
        name: 'Blurriness Detection',
        status: 'pass',
        score: 98,
        severity: 'low',
        details: 'Excellent clarity throughout document',
      },
      {
        id: 'glare-3',
        name: 'Glare & Reflection',
        status: 'pass',
        score: 95,
        severity: 'low',
        details: 'No glare or reflections detected',
      },
      {
        id: 'resolution-3',
        name: 'Resolution Check',
        status: 'pass',
        score: 96,
        severity: 'low',
        details: 'Optimal resolution for OCR (305 DPI)',
      },
      {
        id: 'cropping-3',
        name: 'Cropping & Cut-off',
        status: 'pass',
        score: 95,
        severity: 'low',
        details: 'Perfectly aligned and cropped',
      },
      {
        id: 'tampering-3',
        name: 'Tampering Detection',
        status: 'pass',
        score: 100,
        severity: 'low',
        details: 'Authenticity verified - no alterations detected',
      },
    ],
  }

  const allDocuments: DocumentQuality[] = [
    failedQuality,
    warningQuality,
    highQuality,
  ]

  const selectedQuality = allDocuments.find((d) => d.documentId === selectedDocument) || failedQuality

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* LEFT PANEL - Document List (300px) */}
      <aside className="w-[300px] flex-shrink-0 border-r border-border-light bg-bg-primary flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Quality Checks</h2>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {allDocuments.map((doc) => (
              <CompactQualityCheck
                key={doc.documentId}
                quality={doc}
                onClick={() => setSelectedDocument(doc.documentId)}
              />
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* CENTER PANEL - Quality Check Details */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-bg-secondary">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* Workflow Stepper */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowStepper currentStep={2} showLabels showNumbers={false} />
            </CardContent>
          </Card>

          {/* Banner */}
          <QualityCheckBanner
            quality={selectedQuality}
            onViewDetails={() => setShowModal(true)}
          />

          {/* Full Quality Check Panel */}
          <QualityCheckPanel
            quality={selectedQuality}
            showDocumentPreview
            allowProceed={selectedQuality.overallStatus !== 'fail'}
            onProceed={() => console.log('Proceed with extraction')}
            onReplaceDocument={() => console.log('Replace document')}
            onViewRegion={(region) => console.log('View region:', region)}
          />

          {/* AI Explanations Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Explanations Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AIExplanation
                title="How is blurriness detected?"
                explanation="Our AI uses edge detection algorithms to analyze sharpness across the document. Regions with poor edge definition are flagged as blurry."
                technicalDetails={[
                  'Laplacian variance analysis applied to 10x10 pixel blocks',
                  'Threshold: variance < 100 indicates blur',
                  'Affected regions: 2 of 85 regions analyzed',
                  'Confidence: 96.4%',
                ]}
                confidence={0.964}
              />

              <AIExplanation
                title="Why does glare affect OCR?"
                explanation="Glare creates high-contrast regions that confuse OCR engines, causing characters to be misidentified or skipped entirely."
                technicalDetails={[
                  'Glare reduces character contrast by 40-60%',
                  'OCR accuracy drops from 98% to 62% in glare regions',
                  'Recommended: Re-scan with diffuse lighting',
                ]}
                icon={<AlertTriangle className="h-4 w-4" />}
              />
            </CardContent>
          </Card>

          {/* Quality Gates Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quality Gates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border border-success/30 bg-success/5">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">High Quality (≥70%)</p>
                    <p className="text-xs text-text-secondary">
                      Proceeds directly to extraction. No manual review needed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Medium Quality (50-69%)</p>
                    <p className="text-xs text-text-secondary">
                      Allowed with warnings. Extraction may have reduced accuracy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-error/30 bg-error/5">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-error mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Failed (&lt;50%)</p>
                    <p className="text-xs text-text-secondary">
                      Blocks workflow. Requires document replacement or supervisor approval.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigateToStep('upload', caseId || undefined)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Upload
                </Button>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Quality check complete
                  </p>
                  <p className="text-xs text-text-secondary">
                    {allDocuments.filter(d => d.overallStatus === 'high').length} of {allDocuments.length} documents passed
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => navigateToStep('extraction', caseId || undefined)}
                  disabled={allDocuments.some(d => d.overallStatus === 'fail')}
                  className="gap-2"
                >
                  Continue to Extraction
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
export default function QualityCheckPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
      <QualityCheckPageContent />
    </Suspense>
  )
}
