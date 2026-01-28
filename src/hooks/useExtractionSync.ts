'use client'

/**
 * useExtractionSync Hook
 *
 * Manages synchronization state between the document viewer and field cards
 * in the extraction workflow. Handles:
 * - Active field selection
 * - Hover state coordination
 * - Page navigation based on field location
 * - Highlight visibility toggles
 * - Scroll-to-field behavior
 *
 * UX Decisions:
 * - Bidirectional sync: clicking a field scrolls document, clicking doc region focuses field
 * - Hover states are synchronized for visual feedback
 * - Only shows highlights for active/hovered fields by default to reduce clutter
 * - Provides smooth scrolling to field cards when selected from document
 */

import { useState, useCallback, useRef, useEffect } from 'react'

export interface ExtractionField {
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
  groupId?: string
}

export interface UseExtractionSyncOptions {
  fields: ExtractionField[]
  initialPage?: number
  onFieldChange?: (fieldId: string | null) => void
  scrollBehavior?: 'smooth' | 'instant'
}

export interface UseExtractionSyncReturn {
  // State
  activeFieldId: string | null
  hoveredFieldId: string | null
  currentPage: number
  showAllHighlights: boolean
  isDocumentPanelOpen: boolean

  // Actions
  setActiveField: (fieldId: string | null) => void
  setHoveredField: (fieldId: string | null) => void
  setCurrentPage: (page: number) => void
  setShowAllHighlights: (show: boolean) => void
  setIsDocumentPanelOpen: (open: boolean) => void
  toggleDocumentPanel: () => void

  // Field card refs for scroll-to behavior
  registerFieldRef: (fieldId: string, ref: HTMLElement | null) => void
  scrollToField: (fieldId: string) => void

  // Derived state
  activeField: ExtractionField | null
  fieldsOnCurrentPage: ExtractionField[]
  totalPages: number
}

export function useExtractionSync({
  fields,
  initialPage = 1,
  onFieldChange,
  scrollBehavior = 'smooth',
}: UseExtractionSyncOptions): UseExtractionSyncReturn {
  // Core state
  const [activeFieldId, setActiveFieldIdState] = useState<string | null>(null)
  const [hoveredFieldId, setHoveredField] = useState<string | null>(null)
  const [currentPage, setCurrentPageState] = useState(initialPage)
  const [showAllHighlights, setShowAllHighlights] = useState(false)
  const [isDocumentPanelOpen, setIsDocumentPanelOpen] = useState(true)

  // Refs for field card elements
  const fieldRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Calculate total pages from field source regions
  const totalPages = Math.max(
    ...fields
      .filter((f) => f.sourceRegion)
      .map((f) => f.sourceRegion!.page),
    1
  )

  // Get active field object
  const activeField = activeFieldId
    ? fields.find((f) => f.id === activeFieldId) || null
    : null

  // Get fields on current page
  const fieldsOnCurrentPage = fields.filter(
    (f) => f.sourceRegion?.page === currentPage
  )

  // Set active field with page navigation
  const setActiveField = useCallback(
    (fieldId: string | null) => {
      setActiveFieldIdState(fieldId)
      onFieldChange?.(fieldId)

      // If field has a source region on a different page, navigate to it
      if (fieldId) {
        const field = fields.find((f) => f.id === fieldId)
        if (field?.sourceRegion && field.sourceRegion.page !== currentPage) {
          setCurrentPageState(field.sourceRegion.page)
        }
      }
    },
    [fields, currentPage, onFieldChange]
  )

  // Set current page
  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  // Toggle document panel
  const toggleDocumentPanel = useCallback(() => {
    setIsDocumentPanelOpen((prev) => !prev)
  }, [])

  // Register field card ref for scroll-to behavior
  const registerFieldRef = useCallback((fieldId: string, ref: HTMLElement | null) => {
    if (ref) {
      fieldRefs.current.set(fieldId, ref)
    } else {
      fieldRefs.current.delete(fieldId)
    }
  }, [])

  // Scroll to a field card
  const scrollToField = useCallback(
    (fieldId: string) => {
      const element = fieldRefs.current.get(fieldId)
      if (element) {
        element.scrollIntoView({
          behavior: scrollBehavior,
          block: 'center',
        })
      }
    },
    [scrollBehavior]
  )

  // When active field changes from document click, scroll to the field card
  useEffect(() => {
    if (activeFieldId) {
      // Small delay to allow DOM updates
      const timer = setTimeout(() => {
        scrollToField(activeFieldId)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeFieldId, scrollToField])

  return {
    // State
    activeFieldId,
    hoveredFieldId,
    currentPage,
    showAllHighlights,
    isDocumentPanelOpen,

    // Actions
    setActiveField,
    setHoveredField,
    setCurrentPage,
    setShowAllHighlights,
    setIsDocumentPanelOpen,
    toggleDocumentPanel,

    // Refs
    registerFieldRef,
    scrollToField,

    // Derived
    activeField,
    fieldsOnCurrentPage,
    totalPages,
  }
}

export default useExtractionSync
