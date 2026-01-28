'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Move,
  Loader2,
  File,
  Check,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

// ============================================
// Document Viewer Types
// ============================================

export type DocumentType = 'pdf' | 'image'

export interface SourceRegion {
  id: string
  page: number
  x: number
  y: number
  width: number
  height: number
  label?: string
  color?: string
}

export interface DocumentFile {
  id: string
  name: string
  type: DocumentType
  url: string
  pageCount?: number
}

export interface DocumentViewerProps {
  document: DocumentFile
  currentPage?: number
  onPageChange?: (page: number) => void
  zoom?: number
  onZoomChange?: (zoom: number) => void
  highlights?: SourceRegion[]
  onRegionClick?: (region: SourceRegion) => void
  activeRegionId?: string
  className?: string
}

// ============================================
// Document Viewer Component
// ============================================

export function DocumentViewer({
  document,
  currentPage = 1,
  onPageChange,
  zoom = 100,
  onZoomChange,
  highlights = [],
  onRegionClick,
  activeRegionId,
  className,
}: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const zoomLevels = [50, 75, 100, 125, 150, 200]
  const zoomIndex = zoomLevels.indexOf(zoom)
  const canZoomIn = zoomIndex < zoomLevels.length - 1
  const canZoomOut = zoomIndex > 0

  const handleZoomIn = () => {
    if (canZoomIn && onZoomChange) {
      onZoomChange(zoomLevels[zoomIndex + 1])
    }
  }

  const handleZoomOut = () => {
    if (canZoomOut && onZoomChange) {
      onZoomChange(zoomLevels[zoomIndex - 1])
    }
  }

  const handleFitWidth = () => {
    if (onZoomChange) {
      onZoomChange(100)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-4">
            {/* Document Info */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-bg-tertiary">
                <File className="h-5 w-5 text-text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium line-clamp-1 max-w-[200px]">
                  {document.name}
                </p>
                {document.pageCount && (
                  <p className="text-xs text-text-tertiary">
                    {document.pageCount} page{document.pageCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Page Navigation */}
            {document.pageCount && document.pageCount > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-text-secondary min-w-[80px] text-center">
                  Page {currentPage} of {document.pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(Math.min(document.pageCount ?? 1, currentPage + 1))}
                  disabled={currentPage >= (document.pageCount ?? 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={!canZoomOut}
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={!canZoomIn}
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFitWidth}
                title="Fit to width"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>

            {/* Highlights Badge */}
            {highlights.length > 0 && (
              <Badge variant="secondary">
                {highlights.length} region{highlights.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Display */}
      <Card>
        <CardContent className="p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-text-secondary">Loading document...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <File className="h-12 w-12 text-text-tertiary" />
              <p className="text-sm text-text-secondary">{error}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && (
            <div
              ref={containerRef}
              className="relative mx-auto bg-bg-tertiary rounded overflow-hidden"
              style={{
                maxWidth: '100%',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
              }}
            >
              {/* PDF Placeholder - In production, integrate actual PDF.js */}
              <div className="min-h-[800px] w-[600px] bg-white shadow-lg mx-auto p-8">
                <div className="space-y-4">
                  {/* Mock document content */}
                  <div className="text-center border-b border-border-light pb-4 mb-6">
                    <h2 className="text-lg font-bold">INSURANCE CLAIM FORM</h2>
                    <p className="text-xs text-text-secondary mt-2">
                      Claim ID: CLM-2024-08947
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-text-tertiary mb-1">CLAIMANT INFORMATION</p>
                      <div className="border border-border-light rounded p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-text-tertiary">Full Name</p>
                            <p className="text-sm font-medium">John Andrew Smith Jr.</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-tertiary">Date of Birth</p>
                            <p className="text-sm">March 15, 1985</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Highlight Regions */}
                    {highlights
                      .filter((h) => h.page === currentPage)
                      .map((region) => (
                        <div
                          key={region.id}
                          onClick={() => onRegionClick?.(region)}
                          className={cn(
                            'absolute border-2 rounded cursor-pointer transition-all',
                            'hover:opacity-80',
                            activeRegionId === region.id && 'ring-2 ring-offset-2 ring-primary',
                            region.color === 'success' && 'border-success bg-success/10 animate-pulse',
                            region.color === 'warning' && 'border-warning bg-warning/10',
                            region.color === 'error' && 'border-error bg-error/10',
                            !region.color && 'border-primary bg-primary/10'
                          )}
                          style={{
                            left: `${region.x}px`,
                            top: `${region.y}px`,
                            width: `${region.width}px`,
                            height: `${region.height}px`,
                          }}
                          title={region.label}
                        >
                          {region.label && (
                            <span className="text-xs font-medium p-1">
                              {region.label}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Document Grid Component
// ============================================

export interface DocumentGridProps {
  documents: DocumentFile[]
  selectedDocumentId?: string
  onSelectDocument?: (documentId: string) => void
  onDeleteDocument?: (documentId: string) => void
  className?: string
}

export function DocumentGrid({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onDeleteDocument,
  className,
}: DocumentGridProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
      {documents.map((doc, index) => (
        <Card
          key={doc.id}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            selectedDocumentId === doc.id && 'ring-2 ring-primary'
          )}
          onClick={() => onSelectDocument?.(doc.id)}
        >
          <CardContent className="p-4">
            {/* Thumbnail */}
            <div className="aspect-[3/4] bg-bg-tertiary rounded mb-3 flex items-center justify-center relative overflow-hidden">
              <File className="h-12 w-12 text-text-tertiary" />
              {selectedDocumentId === doc.id && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="p-2 rounded-full bg-primary text-white">
                    <Move className="h-4 w-4" />
                  </div>
                </div>
              )}
              {/* Page count badge */}
              {doc.pageCount && (
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  {doc.pageCount}p
                </div>
              )}
            </div>

            {/* Document Info */}
            <div className="space-y-1">
              <p className="text-sm font-medium truncate">{doc.name}</p>
              <p className="text-xs text-text-tertiary capitalize">{doc.type}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============================================
// Document Carousel Component
// ============================================

export interface DocumentCarouselProps {
  documents: DocumentFile[]
  selectedIndex?: number
  onSelectDocument?: (index: number) => void
  className?: string
}

export function DocumentCarousel({
  documents,
  selectedIndex = 0,
  onSelectDocument,
  className,
}: DocumentCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const scrollAmount = 320 // Card width + gap
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount)

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Documents ({documents.length})
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            disabled={selectedIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            disabled={selectedIndex === documents.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <ScrollArea>
        <div
          ref={scrollContainerRef}
          className="flex gap-4 pb-4"
          style={{ maxWidth: '100%' }}
        >
          {documents.map((doc, index) => (
            <Card
              key={doc.id}
              className={cn(
                'flex-shrink-0 w-80 cursor-pointer transition-all hover:shadow-md',
                selectedIndex === index && 'ring-2 ring-primary'
              )}
              onClick={() => onSelectDocument?.(index)}
            >
              <CardContent className="p-4">
                {/* Thumbnail */}
                <div className="aspect-[3/4] bg-bg-tertiary rounded mb-3 flex items-center justify-center relative">
                  <File className="h-12 w-12 text-text-tertiary" />
                  {selectedIndex === index && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <div className="p-2 rounded-full bg-primary text-white">
                        <Move className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Document Info */}
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-tertiary capitalize">{doc.type}</p>
                    {doc.pageCount && (
                      <Badge variant="outline">
                        {doc.pageCount}p
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// ============================================
// Document Thumbnail Component
// ============================================

export interface DocumentThumbnailProps {
  document: DocumentFile
  isActive?: boolean
  onClick?: () => void
  className?: string
}

export function DocumentThumbnail({
  document,
  isActive = false,
  onClick,
  className,
}: DocumentThumbnailProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative aspect-[3/4] w-full bg-bg-tertiary rounded-lg overflow-hidden',
        'transition-all hover:shadow-md',
        isActive && 'ring-2 ring-primary ring-offset-2',
        className
      )}
    >
      {/* File Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <File className="h-12 w-12 text-text-tertiary" />
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
          <div className="p-2 rounded-full bg-primary text-white shadow-lg">
            <Check className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Page Count */}
      {document.pageCount && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
          {document.pageCount}p
        </div>
      )}

      {/* Document Name */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-xs text-white truncate">{document.name}</p>
      </div>
    </button>
  )
}

// ============================================
// Document Loading Skeleton
// ============================================

export function DocumentViewerSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar Skeleton */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-12">
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
