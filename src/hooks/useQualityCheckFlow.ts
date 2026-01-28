// ============================================
// Quality Check Flow Hook
// ============================================

import { useCallback } from 'react'
import { useRunQualityCheck } from '@/lib/api-hooks'
import { useAppStore } from '@/store'
import { QualityCheckResponse } from '@/types'

interface UseQualityCheckFlowOptions {
  onQualityGate?: (result: QualityCheckResponse) => void
  onPass?: (result: QualityCheckResponse) => void
  onFail?: (result: QualityCheckResponse) => void
}

export function useQualityCheckFlow(options?: UseQualityCheckFlowOptions) {
  const { mutate: runQualityCheck, isPending } = useRunQualityCheck()
  const updateCase = useAppStore((state) => state.updateCase)

  const runCheck = useCallback(
    async (documentId: string, caseId: string) => {
      try {
        const result = await new Promise<QualityCheckResponse>((resolve, reject) => {
          runQualityCheck(documentId, {
            onSuccess: resolve,
            onError: reject,
          })
        })

        // Update document quality score in case
        const currentCase = useAppStore.getState().byId[caseId]
        if (currentCase) {
          const updatedDocuments = currentCase.documents.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  qualityScore: result.qualityScore,
                  qualityChecks: result.checks,
                }
              : doc
          )

          updateCase(caseId, { documents: updatedDocuments })
        }

        // Handle quality gate
        if (result.qualityScore < 70) {
          // Quality gate - must replace or accept with risk
          options?.onQualityGate?.(result)
          options?.onFail?.(result)
          return { passed: false, gated: true, result }
        } else if (result.qualityScore < 90) {
          // Warning - review suggested
          options?.onPass?.(result)
          return { passed: true, gated: false, warning: true, result }
        } else {
          // High quality - auto continue
          options?.onPass?.(result)
          return { passed: true, gated: false, warning: false, result }
        }
      } catch (error) {
        options?.onFail?.(error as any)
        throw error
      }
    },
    [runQualityCheck, updateCase, options]
  )

  return {
    runCheck,
    isChecking: isPending,
  }
}
