'use client'

/**
 * ExtractionDocumentViewer Component
 *
 * A sophisticated document viewer for the extraction workflow that displays
 * source documents with bounding box highlights for extracted fields.
 *
 * UX Decisions:
 * - Split-view allows side-by-side validation of extracted data
 * - Color-coded bounding boxes match field confidence levels for quick scanning
 * - Hover interactions create bidirectional sync between fields and document
 * - Only active/hovered fields are highlighted to reduce visual clutter
 * - Zoom and pan allow detailed inspection of specific regions
 * - Page navigation supports multi-page documents
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Move,
  MousePointer2,
} from 'lucide-react'

// ============================================
// Types
// ============================================

export interface BoundingBox {
  id: string
  fieldId: string
  page: number
  x: number      // percentage from left (0-100)
  y: number      // percentage from top (0-100)
  width: number  // percentage width
  height: number // percentage height
  label: string
  value: string
  confidence: number
  confidenceLevel: 'high' | 'medium' | 'low'
}

export interface DocumentPage {
  pageNumber: number
  imageUrl: string  // Mock image URL or base64
  width: number     // Original width in pixels
  height: number    // Original height in pixels
}

export interface ExtractionDocumentViewerProps {
  pages: DocumentPage[]
  boundingBoxes: BoundingBox[]
  currentPage?: number
  onPageChange?: (page: number) => void
  activeFieldId?: string | null
  hoveredFieldId?: string | null
  onFieldHover?: (fieldId: string | null) => void
  onFieldClick?: (fieldId: string) => void
  showAllHighlights?: boolean
  onToggleHighlights?: (show: boolean) => void
  className?: string
}

// ============================================
// Confidence Color Utilities
// ============================================

const getConfidenceColors = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high':
      return {
        border: 'border-emerald-500',
        bg: 'bg-emerald-500/20',
        bgHover: 'bg-emerald-500/40',
        text: 'text-emerald-700',
        shadow: 'shadow-emerald-500/30',
        stroke: '#10b981', // emerald-500
        fill: 'rgba(16, 185, 129, 0.15)',
        fillHover: 'rgba(16, 185, 129, 0.35)',
      }
    case 'medium':
      return {
        border: 'border-amber-500',
        bg: 'bg-amber-500/20',
        bgHover: 'bg-amber-500/40',
        text: 'text-amber-700',
        shadow: 'shadow-amber-500/30',
        stroke: '#f59e0b', // amber-500
        fill: 'rgba(245, 158, 11, 0.15)',
        fillHover: 'rgba(245, 158, 11, 0.35)',
      }
    case 'low':
      return {
        border: 'border-red-500',
        bg: 'bg-red-500/20',
        bgHover: 'bg-red-500/40',
        text: 'text-red-700',
        shadow: 'shadow-red-500/30',
        stroke: '#ef4444', // red-500
        fill: 'rgba(239, 68, 68, 0.15)',
        fillHover: 'rgba(239, 68, 68, 0.35)',
      }
  }
}

// ============================================
// BoundingBoxOverlay Component
// ============================================

interface BoundingBoxOverlayProps {
  box: BoundingBox
  isActive: boolean
  isHovered: boolean
  showLabel: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  scale: number
}

function BoundingBoxOverlay({
  box,
  isActive,
  isHovered,
  showLabel,
  onClick,
  onMouseEnter,
  onMouseLeave,
  scale,
}: BoundingBoxOverlayProps) {
  const colors = getConfidenceColors(box.confidenceLevel)
  const isHighlighted = isActive || isHovered

  return (
    <div
      className={cn(
        'absolute cursor-pointer transition-all duration-200',
        'border-2 rounded-sm',
        isHighlighted ? 'z-20' : 'z-10',
        colors.border,
        isHighlighted ? colors.bgHover : colors.bg,
        isHighlighted && `shadow-lg ${colors.shadow}`,
      )}
      style={{
        left: `${box.x}%`,
        top: `${box.y}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
        // Animate the border when active
        animation: isActive ? 'pulse-border 1.5s ease-in-out infinite' : 'none',
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      aria-label={`Field: ${box.label}, Value: ${box.value}`}
      tabIndex={0}
    >
      {/* Field Label Tooltip - shown on hover or when active */}
      {(showLabel || isHighlighted) && (
        <div
          className={cn(
            'absolute -top-8 left-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
            'transform transition-all duration-200',
            'shadow-md',
            colors.text,
            isHighlighted ? 'bg-white' : 'bg-white/90',
            isHighlighted ? 'opacity-100 scale-100' : 'opacity-80 scale-95',
          )}
          style={{
            // Adjust position based on zoom scale
            fontSize: `${Math.max(10, 12 / scale)}px`,
          }}
        >
          <span className="font-semibold">{box.label}:</span>{' '}
          <span className="font-normal">{box.value.slice(0, 30)}{box.value.length > 30 ? '...' : ''}</span>
        </div>
      )}

      {/* Confidence indicator dot */}
      <div
        className={cn(
          'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white',
          box.confidenceLevel === 'high' && 'bg-emerald-500',
          box.confidenceLevel === 'medium' && 'bg-amber-500',
          box.confidenceLevel === 'low' && 'bg-red-500',
        )}
      />
    </div>
  )
}

// ============================================
// Mock Document Page Component
// ============================================

interface MockDocumentPageProps {
  pageNumber: number
  children?: React.ReactNode
}

/**
 * Renders a mock document page with realistic content
 * This simulates what a real PDF/image would look like
 */
function MockDocumentPage({ pageNumber, children }: MockDocumentPageProps) {
  return (
    <div className="relative bg-white shadow-lg" style={{ aspectRatio: '8.5/11' }}>
      {/* Mock document content - simulates a form/document */}
      <div className="absolute inset-0 p-8 text-gray-800">
        {pageNumber === 1 && (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-lg font-bold text-blue-800">INSURANCE CLAIM FORM</div>
              <div className="text-xs text-gray-500 mt-1">Form CLM-2024</div>
            </div>

            {/* Section 1: Claimant Information */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-700 border-b border-gray-300 pb-1 mb-3">
                SECTION 1: CLAIMANT INFORMATION
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-500 mb-1">Full Name</div>
                  <div className="border-b border-gray-400 pb-1 font-medium">John Andrew Smith Jr.</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Date of Birth</div>
                  <div className="border-b border-gray-400 pb-1 font-medium">March 15, 1985</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-500 mb-1">Address</div>
                  <div className="border-b border-gray-400 pb-1 font-medium">123 Main Street, Apt 4B, New York, NY 10001</div>
                </div>
              </div>
            </div>

            {/* Section 2: Claim Details */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-700 border-b border-gray-300 pb-1 mb-3">
                SECTION 2: CLAIM DETAILS
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-500 mb-1">Claim Date</div>
                  <div className="border-b border-gray-400 pb-1 font-medium">January 15, 2024</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Claim ID</div>
                  <div className="border-b border-gray-400 pb-1 font-medium">CLM-2024-08947</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-500 mb-1">Treatment Type</div>
                  <div className="border-b border-gray-400 pb-1 font-medium">Emergency Room Visit</div>
                </div>
              </div>
            </div>

            {/* Additional lines to fill page */}
            <div className="text-xs text-gray-400 mt-8">
              <div className="border-t border-gray-200 pt-4">
                <p className="mb-2">Please complete all sections of this form accurately.</p>
                <p className="mb-2">Submit supporting documentation within 30 days of treatment.</p>
                <p>Questions? Call 1-800-CLAIMS or visit www.insurance.com</p>
              </div>
            </div>
          </>
        )}

        {pageNumber === 2 && (
          <>
            {/* Header for page 2 */}
            <div className="text-center mb-6">
              <div className="text-lg font-bold text-blue-800">INSURANCE CLAIM FORM</div>
              <div className="text-xs text-gray-500 mt-1">Page 2 of 2</div>
            </div>

            {/* Section 3: Provider Information */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-700 border-b border-gray-300 pb-1 mb-3">
                SECTION 3: PROVIDER INFORMATION
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="col-span-2">
                  <div className="text-gray-500 mb-1">Provider Name</div>
                  <div className="border-b border-gray-400 pb-1 font-medium">City Medical Center</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">NPI Number</div>
                  <div className="border-b border-gray-400 pb-1 font-medium">1234567890</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Tax ID</div>
                  <div className="border-b border-gray-400 pb-1 font-medium">12-3456789</div>
                </div>
              </div>
            </div>

            {/* Section 4: Billing Information */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-700 border-b border-gray-300 pb-1 mb-3">
                SECTION 4: BILLING INFORMATION
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-500 mb-1">Claim Amount</div>
                  <div className="border-b border-gray-400 pb-1 font-medium text-lg">$3,280.00</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Date of Service</div>
                  <div className="border-b border-gray-400 pb-1 font-medium">January 15, 2024</div>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-8 pt-4 border-t border-gray-300">
              <div className="text-sm font-semibold text-gray-700 mb-4">CERTIFICATION</div>
              <div className="text-xs text-gray-600 mb-4">
                I certify that the information provided is accurate and complete.
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="border-b border-gray-400 h-8"></div>
                  <div className="text-xs text-gray-500 mt-1">Signature</div>
                </div>
                <div>
                  <div className="border-b border-gray-400 h-8"></div>
                  <div className="text-xs text-gray-500 mt-1">Date</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bounding box overlays */}
      {children}
    </div>
  )
}

// ============================================
// Main Document Viewer Component
// ============================================

export function ExtractionDocumentViewer({
  pages,
  boundingBoxes,
  currentPage = 1,
  onPageChange,
  activeFieldId,
  hoveredFieldId,
  onFieldHover,
  onFieldClick,
  showAllHighlights = false,
  onToggleHighlights,
  className,
}: ExtractionDocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [interactionMode, setInteractionMode] = useState<'select' | 'pan'>('select')

  // Get boxes for current page
  const currentPageBoxes = boundingBoxes.filter((box) => box.page === currentPage)

  // Determine which boxes to show
  const visibleBoxes = showAllHighlights
    ? currentPageBoxes
    : currentPageBoxes.filter(
        (box) => box.fieldId === activeFieldId || box.fieldId === hoveredFieldId
      )

  // Zoom controls
  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3))
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5))
  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }
  const fitToWidth = () => {
    if (containerRef.current) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }

  // Pan handling
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (interactionMode === 'pan') {
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
      }
    },
    [interactionMode, position]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && interactionMode === 'pan') {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, interactionMode, dragStart]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Scroll to field when active field changes
  useEffect(() => {
    if (activeFieldId) {
      const box = boundingBoxes.find((b) => b.fieldId === activeFieldId)
      if (box && box.page !== currentPage) {
        onPageChange?.(box.page)
      }
    }
  }, [activeFieldId, boundingBoxes, currentPage, onPageChange])

  const totalPages = Math.max(...pages.map((p) => p.pageNumber), 2)

  return (
    <div className={cn('flex flex-col h-full bg-gray-100', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={zoomIn}
              disabled={scale >= 3}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* View Controls */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={resetZoom}
            title="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={fitToWidth}
            title="Fit to width"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Interaction Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={interactionMode === 'select' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setInteractionMode('select')}
              title="Select mode"
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>
            <Button
              variant={interactionMode === 'pan' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setInteractionMode('pan')}
              title="Pan mode"
            >
              <Move className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Highlight Toggle */}
          <Button
            variant={showAllHighlights ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => onToggleHighlights?.(!showAllHighlights)}
            title={showAllHighlights ? 'Hide all highlights' : 'Show all highlights'}
          >
            {showAllHighlights ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                All
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Active
              </>
            )}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Page Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium min-w-[60px] text-center">
              Page {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Document View Area */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-auto p-4',
          interactionMode === 'pan' && 'cursor-grab',
          isDragging && 'cursor-grabbing'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="mx-auto transition-transform duration-100"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'top center',
            width: 'fit-content',
          }}
        >
          {/* Document Page with Overlays */}
          <div className="relative w-[600px]">
            <MockDocumentPage pageNumber={currentPage}>
              {/* Render bounding boxes */}
              {(showAllHighlights ? currentPageBoxes : visibleBoxes).map((box) => (
                <BoundingBoxOverlay
                  key={box.id}
                  box={box}
                  isActive={activeFieldId === box.fieldId}
                  isHovered={hoveredFieldId === box.fieldId}
                  showLabel={showAllHighlights}
                  onClick={() => onFieldClick?.(box.fieldId)}
                  onMouseEnter={() => onFieldHover?.(box.fieldId)}
                  onMouseLeave={() => onFieldHover?.(null)}
                  scale={scale}
                />
              ))}
            </MockDocumentPage>
          </div>
        </div>
      </div>

      {/* Field Legend / Status Bar */}
      <div className="px-4 py-2 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-gray-600">
                {currentPageBoxes.length} field{currentPageBoxes.length !== 1 ? 's' : ''} on this page
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Low</span>
              </div>
            </div>
          </div>

          {activeFieldId && (
            <Badge variant="outline" className="text-xs">
              Viewing: {boundingBoxes.find((b) => b.fieldId === activeFieldId)?.label}
            </Badge>
          )}
        </div>
      </div>

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>
    </div>
  )
}

// ============================================
// Helper function to create bounding boxes from fields
// ============================================

export function createBoundingBoxesFromFields(
  fields: Array<{
    id: string
    label: string
    value: string
    confidence: number
    confidenceLevel: 'high' | 'medium' | 'low'
    sourceRegion?: {
      page: number
      x: number
      y: number
      width: number
      height: number
    }
  }>
): BoundingBox[] {
  return fields
    .filter((field) => field.sourceRegion)
    .map((field) => ({
      id: `bbox-${field.id}`,
      fieldId: field.id,
      page: field.sourceRegion!.page,
      // Convert pixel coordinates to percentages (assuming 600x780 document size)
      x: (field.sourceRegion!.x / 600) * 100,
      y: (field.sourceRegion!.y / 780) * 100,
      width: (field.sourceRegion!.width / 600) * 100,
      height: (field.sourceRegion!.height / 780) * 100,
      label: field.label,
      value: field.value,
      confidence: field.confidence,
      confidenceLevel: field.confidenceLevel,
    }))
}

export default ExtractionDocumentViewer
