// ============================================
// Field Update Hook with Optimistic Updates
// ============================================

import { useState, useCallback } from 'react'
import { useUpdateField } from '@/lib/api-hooks'
import { useAppStore } from '@/store'
import { ExtractedField } from '@/types'

interface UseFieldUpdateOptions {
  onSuccess?: (field: ExtractedField) => void
  onError?: (error: any) => void
}

export function useFieldUpdate(options?: UseFieldUpdateOptions) {
  const { mutate: updateFieldApi, isPending } = useUpdateField()
  const updateCase = useAppStore((state) => state.updateCase)

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Start editing a field
  const startEdit = useCallback((field: ExtractedField) => {
    setEditingFieldId(field.id)
    setEditValue(field.value)
    setError(null)
  }, [])

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingFieldId(null)
    setEditValue(null)
    setError(null)
  }, [])

  // Save field update
  const saveUpdate = useCallback(
    async (caseId: string, fieldId: string, value: any) => {
      setIsSaving(true)
      setError(null)

      try {
        // Get current case for optimistic update
        const currentCase = useAppStore.getState().byId[caseId]
        if (!currentCase) {
          throw new Error('Case not found')
        }

        const field = currentCase.extractedData.fields.find((f) => f.id === fieldId)
        if (!field) {
          throw new Error('Field not found')
        }

        // Store original value for rollback
        const originalValue = field.value

        // Optimistic update in Zustand store
        updateCase(caseId, {
          extractedData: {
            ...currentCase.extractedData,
            fields: currentCase.extractedData.fields.map((f) =>
              f.id === fieldId
                ? {
                    ...f,
                    value,
                    manuallyEdited: true,
                    originalValue: f.originalValue || originalValue,
                    editedAt: new Date().toISOString(),
                  }
                : f
            ),
          },
        })

        // API call with rollback on error
        await updateFieldApi(
          { caseId, fieldId, value },
          {
            onSuccess: () => {
              setIsSaving(false)
              setEditingFieldId(null)
              setEditValue(null)

              // Trigger rules replay notification
              // (This would typically show a toast or notification)
              console.log('Field updated, rules will be replayed')

              options?.onSuccess?.(field)
            },
            onError: (updateError) => {
              setIsSaving(false)
              setError(updateError.message || 'Failed to update field')

              // Rollback optimistic update
              updateCase(caseId, {
                extractedData: {
                  ...currentCase.extractedData,
                  fields: currentCase.extractedData.fields.map((f) =>
                    f.id === fieldId ? { ...f, value: originalValue } : f
                  ),
                },
              })

              options?.onError?.(updateError)
            },
          }
        )
      } catch (err) {
        setIsSaving(false)
        setError('An unexpected error occurred')
        options?.onError?.(err)
      }
    },
    [updateFieldApi, updateCase, options]
  )

  return {
    editingFieldId,
    editValue,
    isSaving,
    error,
    startEdit,
    cancelEdit,
    saveUpdate,
    setEditValue,
  }
}
