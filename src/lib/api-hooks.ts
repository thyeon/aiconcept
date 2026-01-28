// ============================================
// React Query Hooks for API Calls
// ============================================

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query'
import {
  casesApi,
  documentsApi,
  qualityCheckApi,
  extractionApi,
  rulesApi,
  decisionApi,
  timelineApi,
  logsApi,
  ApiError,
} from './api-client'
import { queryKeys } from './react-query'
import {
  Case,
  Document,
  QualityCheckResponse,
  ExtractionResponse,
  RuleResult,
  RulesEvaluationResponse,
  Decision,
  TimelineEvent,
} from '@/types'
import type { ProcessingLog } from '@/components/features/ai-logs'

// ============================================
// Cases Hooks
// ============================================

export function useCases(params?: any) {
  return useQuery({
    queryKey: queryKeys.cases.list(params),
    queryFn: async () => {
      const { data } = await casesApi.list(params)
      return data as Case[]
    },
  })
}

export function useCase(id: string, options?: Omit<UseQueryOptions<Case>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.cases.detail(id),
    queryFn: async () => {
      const { data } = await casesApi.get(id)
      return data as Case
    },
    enabled: !!id,
    ...options,
  })
}

export function useCreateCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Case>) => {
      const response = await casesApi.create(data)
      return response.data as Case
    },
    onSuccess: (newCase) => {
      // Invalidate and refetch cases list
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.lists() })
      // Add new case to cache
      queryClient.setQueryData(queryKeys.cases.detail(newCase.id), newCase)
    },
  })
}

export function useUpdateCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Case>) => {
      const response = await casesApi.update(id, data)
      return response.data as Case
    },
    onSuccess: (updatedCase) => {
      // Update case in cache
      queryClient.setQueryData(queryKeys.cases.detail(updatedCase.id), updatedCase)
      // Invalidate cases list
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.lists() })
    },
  })
}

// ============================================
// Documents Hooks
// ============================================

export function useDocuments(caseId: string) {
  return useQuery({
    queryKey: queryKeys.documents.list(caseId),
    queryFn: async () => {
      const { data } = await documentsApi.list(caseId)
      return data as Document[]
    },
    enabled: !!caseId,
  })
}

export function useUploadDocuments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      caseId,
      files,
      onProgress,
    }: {
      caseId: string
      files: File[]
      onProgress?: (progress: number) => void
    }) => {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))

      const response = await documentsApi.upload(caseId, formData, onProgress)
      return response.data as Document[]
    },
    onSuccess: (documents, variables) => {
      // Invalidate documents list
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.list(variables.caseId) })
      // Invalidate case data
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.detail(variables.caseId) })
    },
  })
}

// ============================================
// Quality Check Hooks
// ============================================

export function useQualityCheck(documentId: string) {
  return useQuery({
    queryKey: queryKeys.qualityChecks.detail(documentId),
    queryFn: async () => {
      const { data } = await qualityCheckApi.getResult(documentId)
      return data as QualityCheckResponse
    },
    enabled: !!documentId,
  })
}

export function useRunQualityCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await qualityCheckApi.run(documentId)
      return response.data as QualityCheckResponse
    },
    onSuccess: (result, documentId) => {
      // Update quality check in cache
      queryClient.setQueryData(queryKeys.qualityChecks.detail(documentId), result)
    },
  })
}

// ============================================
// Extraction Hooks
// ============================================

export function useExtraction(caseId: string) {
  return useQuery({
    queryKey: queryKeys.extraction.detail(caseId),
    queryFn: async () => {
      const { data } = await extractionApi.getResults(caseId)
      return data as ExtractionResponse
    },
    enabled: !!caseId,
  })
}

export function useStartExtraction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (caseId: string) => {
      const response = await extractionApi.start(caseId)
      return response.data
    },
    onSuccess: (_, caseId) => {
      // Invalidate extraction data
      queryClient.invalidateQueries({ queryKey: queryKeys.extraction.detail(caseId) })
    },
  })
}

export function useUpdateField() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      caseId,
      fieldId,
      value,
    }: {
      caseId: string
      fieldId: string
      value: any
    }) => {
      const response = await extractionApi.updateField(caseId, fieldId, value)
      return response.data
    },
    onMutate: async ({ caseId, fieldId, value }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.extraction.detail(caseId) })

      // Snapshot previous value
      const previousExtraction = queryClient.getQueryData(queryKeys.extraction.detail(caseId))

      // Optimistically update
      queryClient.setQueryData(
        queryKeys.extraction.detail(caseId),
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            fields: old.fields.map((field: any) =>
              field.id === fieldId
                ? { ...field, value, manuallyEdited: true }
                : field
            ),
          }
        }
      )

      // Return context with previous value
      return { previousExtraction, caseId }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousExtraction) {
        queryClient.setQueryData(
          queryKeys.extraction.detail(context.caseId),
          context.previousExtraction
        )
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.extraction.detail(variables.caseId) })
      // Invalidate rules (they need to be replayed)
      queryClient.invalidateQueries({ queryKey: queryKeys.rules.results(variables.caseId) })
    },
  })
}

// ============================================
// Rules Hooks
// ============================================

export function useRulesResults(caseId: string) {
  return useQuery({
    queryKey: queryKeys.rules.results(caseId),
    queryFn: async () => {
      const { data } = await rulesApi.getResults(caseId)
      return data as RulesEvaluationResponse
    },
    enabled: !!caseId,
  })
}

export function useEvaluateRules() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (caseId: string) => {
      const response = await rulesApi.evaluate(caseId)
      return response.data as RulesEvaluationResponse
    },
    onSuccess: (_, caseId) => {
      // Invalidate rules results
      queryClient.invalidateQueries({ queryKey: queryKeys.rules.results(caseId) })
    },
  })
}

export function useReplayRules() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (caseId: string) => {
      const response = await rulesApi.replay(caseId)
      return response.data as RulesEvaluationResponse
    },
    onSuccess: (_, caseId) => {
      // Invalidate rules results
      queryClient.invalidateQueries({ queryKey: queryKeys.rules.results(caseId) })
    },
  })
}

// ============================================
// Decision Hooks
// ============================================

export function useDecision(caseId: string) {
  return useQuery({
    queryKey: queryKeys.decisions.detail(caseId),
    queryFn: async () => {
      const { data } = await decisionApi.get(caseId)
      return data as Decision
    },
    enabled: !!caseId,
  })
}

export function useGenerateDecision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (caseId: string) => {
      const response = await decisionApi.generate(caseId)
      return response.data as Decision
    },
    onSuccess: (_, caseId) => {
      // Invalidate decision
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.detail(caseId) })
    },
  })
}

export function useApproveDecision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ caseId, data }: { caseId: string; data?: any }) => {
      const response = await decisionApi.approve(caseId, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate decision
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.detail(variables.caseId) })
      // Invalidate case
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.detail(variables.caseId) })
    },
  })
}

export function useRejectDecision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ caseId, reason }: { caseId: string; reason: string }) => {
      const response = await decisionApi.reject(caseId, reason)
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate decision
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.detail(variables.caseId) })
      // Invalidate case
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.detail(variables.caseId) })
    },
  })
}

// ============================================
// Timeline Hooks
// ============================================

export function useTimeline(caseId: string) {
  return useQuery({
    queryKey: queryKeys.timeline.detail(caseId),
    queryFn: async () => {
      const { data } = await timelineApi.get(caseId)
      return data as TimelineEvent[]
    },
    enabled: !!caseId,
  })
}

// ============================================
// Logs Hooks
// ============================================

export function useLogs(caseId: string, params?: any) {
  return useQuery({
    queryKey: queryKeys.logs.list(caseId),
    queryFn: async () => {
      const { data } = await logsApi.get(caseId, params)
      return data as ProcessingLog[]
    },
    enabled: !!caseId,
  })
}
