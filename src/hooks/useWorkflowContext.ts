// ============================================
// Workflow Context Hook
// Manages case context across workflow pages
// ============================================

'use client'

import { useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { mockCases, mockExtractedData, mockRuleResults, mockDecision, mockTimelineEvents, mockDocuments } from '@/lib/mock-data'
import type { Case } from '@/types'

export interface WorkflowContext {
  caseId: string | null
  activeCase: Case | null
  isLoading: boolean
  navigateToStep: (step: 'upload' | 'quality-check' | 'extraction' | 'rules' | 'decision', caseId?: string) => void
  navigateToCase: (caseId: string) => void
  setActiveCase: (caseId: string) => void
  createCase: (title: string, type: Case['type']) => string
  updateCaseDocuments: (documents: Case['documents']) => void
  updateCaseExtraction: (extractedData: Case['extractedData']) => void
  updateCaseRules: (ruleResults: Case['ruleResults']) => void
  updateCaseDecision: (decision: Case['decision']) => void
  updateCaseStatus: (status: Case['status']) => void
}

/**
 * Hook to manage workflow context across pages
 * Handles case ID from URL params and store synchronization
 */
export function useWorkflowContext(): WorkflowContext {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get caseId from URL query params
  const caseIdFromUrl = searchParams.get('caseId')

  // Store hooks
  const activeCaseId = useAppStore((state) => state.ui.activeCaseId)
  const setActiveCaseId = useAppStore((state) => state.setActiveCaseId)
  const caseById = useAppStore((state) => state.cases.byId)
  const addCase = useAppStore((state) => state.addCase)
  const updateCase = useAppStore((state) => state.updateCase)

  // Determine the effective case ID (URL takes priority)
  const effectiveCaseId = caseIdFromUrl || activeCaseId

  // Sync URL caseId with store's activeCaseId
  useEffect(() => {
    if (caseIdFromUrl && caseIdFromUrl !== activeCaseId) {
      setActiveCaseId(caseIdFromUrl)
    }
  }, [caseIdFromUrl, activeCaseId, setActiveCaseId])

  // Get the active case from store (or mock data as fallback)
  const activeCase = useMemo(() => {
    if (!effectiveCaseId) return null

    // First try to get from store
    const caseFromStore = caseById[effectiveCaseId]
    if (caseFromStore) return caseFromStore

    // Fallback to mock data for demo purposes
    const mockCase = mockCases.find(c => c.id === effectiveCaseId)
    if (mockCase) return mockCase

    // If no case found, return the first mock case with data
    return mockCases[0] || null
  }, [effectiveCaseId, caseById])

  // Navigation helpers
  const navigateToStep = (step: 'upload' | 'quality-check' | 'extraction' | 'rules' | 'decision', caseId?: string) => {
    const id = caseId || effectiveCaseId
    const queryParam = id ? `?caseId=${id}` : ''
    router.push(`/${step}${queryParam}`)
  }

  const navigateToCase = (caseId: string) => {
    setActiveCaseId(caseId)
    router.push(`/cases/${caseId}`)
  }

  const setActiveCase = (caseId: string) => {
    setActiveCaseId(caseId)
  }

  // Create a new case
  const createCase = (title: string, type: Case['type']): string => {
    const newCaseId = `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`
    const now = new Date().toISOString()

    const newCase: Case = {
      id: newCaseId,
      title,
      status: 'pending',
      type,
      createdAt: now,
      updatedAt: now,
      slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      documents: [],
      extractedData: { fields: [], confidence: 0, extractionTime: 0 },
      ruleResults: [],
      decision: null,
      timeline: [
        {
          id: `timeline-${Date.now()}`,
          type: 'upload',
          date: now,
          title: 'Case Created',
          detail: `New ${type} case created`,
          metadata: { actor: 'System' },
        },
      ],
    }

    addCase(newCase)
    setActiveCaseId(newCaseId)
    return newCaseId
  }

  // Update helpers
  const updateCaseDocuments = (documents: Case['documents']) => {
    if (!effectiveCaseId) return
    updateCase(effectiveCaseId, { documents })
  }

  const updateCaseExtraction = (extractedData: Case['extractedData']) => {
    if (!effectiveCaseId) return
    updateCase(effectiveCaseId, { extractedData })
  }

  const updateCaseRules = (ruleResults: Case['ruleResults']) => {
    if (!effectiveCaseId) return
    updateCase(effectiveCaseId, { ruleResults })
  }

  const updateCaseDecision = (decision: Case['decision']) => {
    if (!effectiveCaseId) return
    updateCase(effectiveCaseId, { decision })
  }

  const updateCaseStatus = (status: Case['status']) => {
    if (!effectiveCaseId) return
    updateCase(effectiveCaseId, { status })
  }

  return {
    caseId: effectiveCaseId,
    activeCase,
    isLoading: false,
    navigateToStep,
    navigateToCase,
    setActiveCase,
    createCase,
    updateCaseDocuments,
    updateCaseExtraction,
    updateCaseRules,
    updateCaseDecision,
    updateCaseStatus,
  }
}

/**
 * Hook to get a specific case by ID with fallback to mock data
 */
export function useCaseById(caseId: string | null) {
  const caseById = useAppStore((state) => state.cases.byId)

  return useMemo(() => {
    if (!caseId) return null

    // First try store
    const caseFromStore = caseById[caseId]
    if (caseFromStore) return caseFromStore

    // Fallback to mock data
    return mockCases.find(c => c.id === caseId) || null
  }, [caseId, caseById])
}
