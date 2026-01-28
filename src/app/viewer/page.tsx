'use client'

import React, { useState } from 'react'
import { AppShell, CenterPanel, PanelHeader, PanelContent } from '@/components/layout/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DocumentViewer,
  DocumentGrid,
  DocumentCarousel,
  DocumentThumbnail,
  DocumentViewerSkeleton,
  type DocumentFile,
  type SourceRegion,
} from '@/components/features/document-viewer'
import { WorkflowStepper } from '@/components/features/workflow-stepper'
import { FileText, Grid, Rows } from 'lucide-react'

export default function DocumentViewerPage() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  // Mock documents
  const mockDocuments: DocumentFile[] = [
    {
      id: 'doc-1',
      name: 'insurance_claim_001.pdf',
      type: 'pdf',
      url: '/documents/insurance_claim_001.pdf',
      pageCount: 3,
    },
    {
      id: 'doc-2',
      name: 'medical_report_002.pdf',
      type: 'pdf',
      url: '/documents/medical_report_002.pdf',
      pageCount: 2,
    },
    {
      id: 'doc-3',
      name: 'id_card_front.jpg',
      type: 'image',
      url: '/documents/id_card_front.jpg',
      pageCount: 1,
    },
    {
      id: 'doc-4',
      name: 'receipt_003.pdf',
      type: 'pdf',
      url: '/documents/receipt_003.pdf',
      pageCount: 1,
    },
    {
      id: 'doc-5',
      name: 'policy_document_004.pdf',
      type: 'pdf',
      url: '/documents/policy_document_004.pdf',
      pageCount: 5,
    },
  ]

  // Mock source regions for highlighting
  const mockHighlights: SourceRegion[] = [
    {
      id: 'region-1',
      page: 1,
      x: 100,
      y: 200,
      width: 200,
      height: 30,
      label: 'Claimant Name',
      color: 'success',
    },
    {
      id: 'region-2',
      page: 1,
      x: 100,
      y: 240,
      width: 150,
      height: 25,
      label: 'Date of Birth',
      color: 'warning',
    },
    {
      id: 'region-3',
      page: 1,
      x: 100,
      y: 400,
      width: 250,
      height: 25,
      label: 'Address',
      color: 'error',
    },
  ]

  const [activeRegionId, setActiveRegionId] = useState<string | null>(null)

  const selectedDocument = mockDocuments.find((d) => d.id === selectedDocumentId) || mockDocuments[0]

  const handleRegionClick = (region: SourceRegion) => {
    setActiveRegionId(region.id)
    console.log('Region clicked:', region)
  }

  return (
    <main className="flex-1 min-h-0 overflow-y-auto bg-bg-secondary">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Workflow Stepper */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workflow Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowStepper currentStep={4} showLabels showNumbers={false} />
          </CardContent>
        </Card>

        {/* Document Viewer Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Viewer Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="viewer">
                <TabsList className="mb-4">
                  <TabsTrigger value="viewer">Single Viewer</TabsTrigger>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="carousel">Carousel</TabsTrigger>
                  <TabsTrigger value="thumbnails">Thumbnails</TabsTrigger>
                </TabsList>

                {/* Single Viewer */}
                <TabsContent value="viewer">
                  <DocumentViewer
                    document={selectedDocument}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    highlights={mockHighlights}
                    onRegionClick={handleRegionClick}
                    activeRegionId={activeRegionId || undefined}
                  />
                </TabsContent>

                {/* Grid View */}
                <TabsContent value="grid">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">
                        Document Grid ({mockDocuments.length})
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Grid className="h-4 w-4" />
                        <span>Grid layout with selection</span>
                      </div>
                    </div>
                    <DocumentGrid
                      documents={mockDocuments}
                      selectedDocumentId={selectedDocumentId || undefined}
                      onSelectDocument={setSelectedDocumentId}
                    />
                  </div>
                </TabsContent>

                {/* Carousel */}
                <TabsContent value="carousel">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">
                        Document Carousel
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Rows className="h-4 w-4" />
                        <span>Horizontal scrolling cards</span>
                      </div>
                    </div>
                    <DocumentCarousel
                      documents={mockDocuments}
                      selectedIndex={mockDocuments.findIndex((d) => d.id === selectedDocumentId)}
                      onSelectDocument={(index) => setSelectedDocumentId(mockDocuments[index].id)}
                    />
                  </div>
                </TabsContent>

                {/* Thumbnails */}
                <TabsContent value="thumbnails">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold mb-4">
                      Document Thumbnails
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                      {mockDocuments.map((doc) => (
                        <div key={doc.id} className="space-y-2">
                          <DocumentThumbnail
                            document={doc}
                            isActive={selectedDocumentId === doc.id}
                            onClick={() => setSelectedDocumentId(doc.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Source Highlighting Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Source Highlighting Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-success/30 bg-success/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-sm font-medium">High Confidence</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Green highlight for fields with ≥90% confidence
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-warning/30 bg-warning/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="text-sm font-medium">Medium Confidence</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Yellow highlight for fields with 70-89% confidence
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-error/30 bg-error/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-error" />
                    <span className="text-sm font-medium">Low Confidence</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Red highlight for fields with &lt;70% confidence
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-bg-tertiary border border-border-light">
                <h4 className="text-sm font-semibold mb-3">Interactive Features</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Click highlighted regions</strong> to view field details and
                      jump to extracted data
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Pulsing animation</strong> on active region to draw attention
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Zoom controls</strong> with 50%, 75%, 100%, 125%, 150%, 200% options
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Page navigation</strong> for multi-page PDF documents
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Loading Skeleton Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Loading State</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentViewerSkeleton />
            </CardContent>
          </Card>
        </div>
      </main>
  )
}
