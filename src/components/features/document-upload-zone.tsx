'use client'

import React, { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Upload,
  File,
  FileImage,
  FileText,
  X,
  Check,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress'

// ============================================
// Document Upload Zone Component
// Drag-and-drop file upload with validation
// ============================================

export type DocumentFileType = 'pdf' | 'image' | 'docx' | 'unknown'

export interface UploadedFile {
  id: string
  file: File
  type: DocumentFileType
  size: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  preview?: string
}

export interface DocumentUploadZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accepted file types (MIME types) */
  accept?: string
  /** Maximum file size in bytes (default 50MB) */
  maxFileSize?: number
  /** Maximum number of files (default 50) */
  maxFiles?: number
  /** Enable multiple file upload */
  multiple?: boolean
  /** Callback when files are selected/validated */
  onFilesSelected?: (files: UploadedFile[]) => void
  /** Callback when file upload progress updates */
  onUploadProgress?: (fileId: string, progress: number) => void
  /** Callback when upload completes */
  onUploadComplete?: (file: UploadedFile) => void
  /** Callback when upload fails */
  onUploadError?: (fileId: string, error: string) => void
  /** Disable the upload zone */
  disabled?: boolean
  /** Custom upload handler (if not provided, simulates upload) */
  onUpload?: (file: UploadedFile) => Promise<void>
}

export function DocumentUploadZone({
  accept = '.pdf,.jpg,.jpeg,.png,.docx',
  maxFileSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 50,
  multiple = true,
  onFilesSelected,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onUpload,
  disabled = false,
  className,
  ...props
}: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileType = (file: File): DocumentFileType => {
    const type = file.type.toLowerCase()
    if (type === 'application/pdf') return 'pdf'
    if (type.startsWith('image/')) return 'image'
    if (
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type === 'application/msword'
    ) return 'docx'
    return 'unknown'
  }

  const getFileIcon = (type: DocumentFileType) => {
    switch (type) {
      case 'pdf':
      case 'docx':
        return <FileText className="h-5 w-5" />
      case 'image':
        return <FileImage className="h-5 w-5" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  const getFileTypeBadge = (type: DocumentFileType) => {
    const labels = {
      pdf: 'PDF',
      image: 'Image',
      docx: 'DOCX',
      unknown: 'File',
    }
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      pdf: 'default',
      image: 'secondary',
      docx: 'outline',
      unknown: 'outline',
    }
    return (
      <Badge variant={variants[type]}>
        {labels[type]}
      </Badge>
    )
  }

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = []

    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return []
    }

    Array.from(files).forEach((file) => {
      if (file.size > maxFileSize) {
        alert(`File "${file.name}" exceeds ${formatFileSize(maxFileSize)} limit`)
        return
      }
      validFiles.push(file)
    })

    return validFiles
  }

  const handleFiles = useCallback(
    (files: FileList) => {
      const validFiles = validateFiles(files)

      const newFiles: UploadedFile[] = validFiles.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        type: getFileType(file),
        size: file.size,
        status: 'pending',
        progress: 0,
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])
      onFilesSelected?.(newFiles)

      // Start upload simulation if no custom handler
      if (!onUpload) {
        newFiles.forEach((uploadedFile) => simulateUpload(uploadedFile))
      } else {
        newFiles.forEach((uploadedFile) => {
          onUpload(uploadedFile)
            .then(() => {
              updateFileStatus(uploadedFile.id, 'success', 100)
              onUploadComplete?.(uploadedFile)
            })
            .catch((error) => {
              updateFileStatus(uploadedFile.id, 'error', 0, error.message)
              onUploadError?.(uploadedFile.id, error.message)
            })
        })
      }
    },
    [uploadedFiles.length, maxFiles, maxFileSize, onFilesSelected, onUpload, onUploadComplete, onUploadError]
  )

  const simulateUpload = (uploadedFile: UploadedFile) => {
    updateFileStatus(uploadedFile.id, 'uploading', 0)

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        updateFileStatus(uploadedFile.id, 'success', 100)
        onUploadComplete?.(uploadedFile)
      } else {
        updateFileStatus(uploadedFile.id, 'uploading', progress)
        onUploadProgress?.(uploadedFile.id, progress)
      }
    }, 200)
  }

  const updateFileStatus = (
    id: string,
    status: UploadedFile['status'],
    progress: number,
    error?: string
  ) => {
    setUploadedFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, status, progress, error } : file
      )
    )
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.target === e.currentTarget) setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
      // Reset input to allow selecting the same file again
      e.target.value = ''
    }
  }

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Upload Zone */}
      <Card
        className={cn(
          'border-2 border-dashed transition-all duration-200',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && 'border-border-light hover:border-border-medium',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {/* Upload Icon */}
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
                isDragging ? 'bg-primary text-white' : 'bg-bg-tertiary text-text-secondary'
              )}
            >
              <Upload className="h-8 w-8" />
            </div>

            {/* Main Text */}
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-text-secondary">
                or click to browse from your computer
              </p>
            </div>

            {/* Supported Formats */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-text-tertiary">
              <span>Supported:</span>
              <Badge variant="outline">PDF</Badge>
              <Badge variant="outline">JPG</Badge>
              <Badge variant="outline">PNG</Badge>
              <Badge variant="outline">DOCX</Badge>
              <span>• Max {formatFileSize(maxFileSize)} per file</span>
              <span>• Up to {maxFiles} files</span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileInput}
              disabled={disabled}
              className="hidden"
              id="file-upload"
            />
            <Button
              asChild
              variant="outline"
              disabled={disabled}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                Browse Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Uploaded Files ({uploadedFiles.length}/{maxFiles})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFiles([])}
                  disabled={disabled}
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                      file.status === 'error' && 'border-error bg-error/5',
                      file.status !== 'error' && 'border-border-light bg-bg-tertiary'
                    )}
                  >
                    {/* File Icon */}
                    <div className="text-text-secondary">
                      {getFileIcon(file.type)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{file.file.name}</p>
                        {getFileTypeBadge(file.type)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span>{formatFileSize(file.size)}</span>
                        {file.status === 'uploading' && (
                          <span>Uploading... {Math.round(file.progress)}%</span>
                        )}
                        {file.status === 'success' && (
                          <span className="text-success">Uploaded successfully</span>
                        )}
                        {file.status === 'error' && (
                          <span className="text-error">{file.error || 'Upload failed'}</span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {file.status === 'uploading' && (
                        <ProgressBar value={file.progress} max={100} size="sm" />
                      )}
                    </div>

                    {/* Status Icon & Remove Button */}
                    <div className="flex items-center gap-2">
                      {file.status === 'success' && (
                        <div className="text-success">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                      {file.status === 'error' && (
                        <div className="text-error">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === 'uploading' || disabled}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// Compact Upload Zone Component
// Smaller version for inline use
// ============================================

export interface CompactUploadZoneProps extends Omit<
  DocumentUploadZoneProps,
  'className'
> {
  /** Compact mode label */
  label?: string
  /** Icon size */
  iconSize?: 'sm' | 'md' | 'lg'
}

export function CompactUploadZone({
  label = 'Upload Document',
  iconSize = 'md',
  ...props
}: CompactUploadZoneProps) {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <Card
      className={cn(
        'border-2 border-dashed border-border-light hover:border-border-medium',
        'transition-all duration-200 cursor-pointer'
      )}
    >
      <CardContent className="p-4">
        <label
          htmlFor="compact-file-upload"
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="bg-bg-tertiary p-2 rounded-full">
            <Upload className={iconSizes[iconSize]} />
          </div>
          <span className="text-sm font-medium">{label}</span>
          <input
            type="file"
            accept={props.accept}
            multiple={props.multiple}
            onChange={(e) => {
              if (e.target.files && props.onFilesSelected) {
                // Handle file selection logic
              }
            }}
            disabled={props.disabled}
            className="hidden"
            id="compact-file-upload"
          />
        </label>
      </CardContent>
    </Card>
  )
}
