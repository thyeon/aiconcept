// ============================================
// Upload Flow Hook
// ============================================

import { useState, useCallback } from 'react'
import { useUploadDocuments } from '@/lib/api-hooks'
import { useAppStore } from '@/store'

interface UploadProgress {
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

interface UseUploadFlowOptions {
  onSuccess?: (documents: any[]) => void
  onError?: (error: any) => void
}

export function useUploadFlow(options?: UseUploadFlowOptions) {
  const { mutate: uploadDocuments, isPending } = useUploadDocuments()
  const updateCase = useAppStore((state) => state.updateCase)

  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [totalProgress, setTotalProgress] = useState(0)

  // Add files to upload queue
  const addFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])

    // Initialize progress for new files
    const initialProgress: UploadProgress[] = newFiles.map((file) => ({
      fileName: file.name,
      progress: 0,
      status: 'pending',
    }))

    setUploadProgress((prev) => [...prev, ...initialProgress])
  }, [])

  // Remove file from queue
  const removeFile = useCallback((fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName))
    setUploadProgress((prev) => prev.filter((p) => p.fileName !== fileName))
  }, [])

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([])
    setUploadProgress([])
    setTotalProgress(0)
  }, [])

  // Start upload
  const startUpload = useCallback(
    async (caseId: string) => {
      if (files.length === 0) return

      try {
        // Update status to uploading
        setUploadProgress((prev) =>
          prev.map((p) => ({ ...p, status: 'uploading' as const, progress: 0 }))
        )

        // Upload files
        await uploadDocuments(
          {
            caseId,
            files,
            onProgress: (progress) => {
              setTotalProgress(progress)

              // Update individual file progress (estimated)
              setUploadProgress((prev) =>
                prev.map((p) => ({
                  ...p,
                  progress: Math.min(100, progress + (Math.random() * 10 - 5)),
                }))
              )
            },
          },
          {
            onSuccess: (documents) => {
              // Mark all as complete
              setUploadProgress((prev) =>
                prev.map((p) => ({ ...p, status: 'complete' as const, progress: 100 }))
              )

              // Update case with new documents
              updateCase(caseId, { documents })

              // Clear files after a delay
              setTimeout(() => {
                clearFiles()
              }, 2000)

              options?.onSuccess?.(documents)
            },
            onError: (error) => {
              // Mark all as error
              setUploadProgress((prev) =>
                prev.map((p) => ({
                  ...p,
                  status: 'error' as const,
                  error: error.message || 'Upload failed',
                }))
              )

              options?.onError?.(error)
            },
          }
        )
      } catch (error) {
        options?.onError?.(error)
      }
    },
    [files, uploadDocuments, updateCase, clearFiles, options]
  )

  return {
    files,
    uploadProgress,
    totalProgress,
    isUploading: isPending,
    addFiles,
    removeFile,
    clearFiles,
    startUpload,
  }
}
