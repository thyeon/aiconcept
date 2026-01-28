// ============================================
// Real-Time Notification System
// ============================================

import { toast } from 'sonner'
import { getWSClient, WebSocketEventType } from './websocket'

interface NotificationConfig {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// ============================================
// Notification Handlers
// ============================================

export class NotificationManager {
  private wsClient: ReturnType<typeof getWSClient>
  private unsubscribeFunctions: Array<() => void> = []

  constructor() {
    this.wsClient = getWSClient()
    this.setupListeners()
  }

  private setupListeners(): void {
    // Document uploaded
    this.unsubscribeFunctions.push(
      this.wsClient.subscribe('document.uploaded', (data) => {
        toast.success('Document Uploaded', {
          description: `${data.document?.name || 'File'} has been uploaded successfully`,
        })
      })
    )

    // Quality check completed
    this.unsubscribeFunctions.push(
      this.wsClient.subscribe('document.quality_checked', (data) => {
        if (data.passed) {
          toast.success('Quality Check Passed', {
            description: `Score: ${data.score}% - Document quality is acceptable`,
          })
        } else {
          toast.error('Quality Check Failed', {
            description: `Score: ${data.score}% - Document needs attention`,
            action: {
              label: 'Review',
              onClick: () => console.log('Navigate to quality check'),
            },
          })
        }
      })
    )

    // Extraction started
    this.unsubscribeFunctions.push(
      this.wsClient.subscribe('extraction.started', (data) => {
        toast.info('AI Extraction Started', {
          description: 'Processing documents with AI...',
        })
      })
    )

    // Extraction completed
    this.unsubscribeFunctions.push(
      this.wsClient.subscribe('extraction.completed', (data) => {
        const { fieldsExtracted, confidence } = data

        toast.success('Extraction Complete', {
          description: `Extracted ${fieldsExtracted} fields with ${confidence}% confidence`,
          action: {
            label: 'View',
            onClick: () => console.log('Navigate to extraction'),
          },
        })
      })
    )

    // Extraction progress
    this.unsubscribeFunctions.push(
      this.wsClient.subscribe('extraction.progress', (data) => {
        const { progress, stage } = data

        // Don't show toast for every progress update
        // Just log it
        console.log(`Extraction progress: ${progress}% - ${stage}`)
      })
    )

    // Rules evaluated
    this.unsubscribeFunctions.push(
      this.wsClient.subscribe('rules.evaluated', (data) => {
        const { passed, failed, warnings } = data.results

        if (failed > 0) {
          toast.error('Rules Evaluation Failed', {
            description: `${failed} rule(s) failed - Review required`,
            action: {
              label: 'View Rules',
              onClick: () => console.log('Navigate to rules'),
            },
          })
        } else if (warnings > 0) {
          toast.warning('Rules Evaluation Complete', {
            description: `${passed} passed, ${warnings} warnings`,
            action: {
              label: 'Review',
              onClick: () => console.log('Navigate to rules'),
            },
          })
        } else {
          toast.success('All Rules Passed', {
            description: `All ${passed} rules passed successfully`,
          })
        }
      })
    )

    // Rules replayed
    this.unsubscribeFunctions.push(
      this.wsClient.subscribe('rules.replayed', (data) => {
        toast.info('Rules Replayed', {
          description: 'Rules re-evaluated after field update',
        })
      })
    )

    // Decision generated
    this.unsubscribeFunctions.push(
      this.wsClient.subscribe('decision.generated', (data) => {
        const { decision } = data

        if (decision.status === 'approved') {
          toast.success('Claim Approved', {
            description: `Amount: $${decision.approvedAmount?.toFixed(2)}`,
          })
        } else if (decision.status === 'rejected') {
          toast.error('Claim Rejected', {
            description: decision.rationale?.substring(0, 100),
            action: {
              label: 'View Details',
              onClick: () => console.log('Navigate to decision'),
            },
          })
        } else {
          toast.warning('Partial Approval', {
            description: `Approved: $${decision.approvedAmount?.toFixed(2)}`,
            action: {
              label: 'Review',
              onClick: () => console.log('Navigate to decision'),
            },
          })
        }
      })
    )

    // Timeline event
    this.unsubscribeFunctions.push(
      this.wsClient.subscribe('timeline.event_added', (data) => {
        // Don't show toast for every timeline event
        // Just log it for debugging
        console.log('Timeline event:', data.event)
      })
    )

    // Processing error
    this.unsubscribeFunctions.push(
      this.wsClient.subscribe('processing.error', (data) => {
        toast.error('Processing Error', {
          description: data.message || 'An error occurred during processing',
          action: data.retryable
            ? {
                label: 'Retry',
                onClick: () => console.log('Retry operation'),
              }
            : undefined,
        })
      })
    )

    // Case status changed
    this.unsubscribeFunctions.push(
      this.wsClient.subscribe('case.status_changed', (data) => {
        const { status, previousStatus } = data

        toast.info('Case Status Updated', {
          description: `Status changed from ${previousStatus} to ${status}`,
        })
      })
    )
  }

  // ============================================
  // Manual Notification Methods
  // ============================================

  success(title: string, config?: NotificationConfig): void {
    toast.success(title, {
      description: config?.description,
      duration: config?.duration,
      action: config?.action
        ? {
            label: config.action.label,
            onClick: config.action.onClick,
          }
        : undefined,
    })
  }

  error(title: string, config?: NotificationConfig): void {
    toast.error(title, {
      description: config?.description,
      duration: config?.duration,
      action: config?.action
        ? {
            label: config.action.label,
            onClick: config.action.onClick,
          }
        : undefined,
    })
  }

  info(title: string, config?: NotificationConfig): void {
    toast.info(title, {
      description: config?.description,
      duration: config?.duration,
      action: config?.action
        ? {
            label: config.action.label,
            onClick: config.action.onClick,
          }
        : undefined,
    })
  }

  warning(title: string, config?: NotificationConfig): void {
    toast.warning(title, {
      description: config?.description,
      duration: config?.duration,
      action: config?.action
        ? {
            label: config.action.label,
            onClick: config.action.onClick,
          }
        : undefined,
    })
  }

  promise<TResult>(
    title: string,
    promise: Promise<TResult>,
    {
      success,
      error,
      loading,
    }: {
      success?: string | ((data: TResult) => string)
      error?: string | ((error: any) => string)
      loading?: string
    } = {}
  ): Promise<TResult> {
    return toast.promise(promise, {
      loading: loading || 'Processing...',
      success: (data) => {
        if (typeof success === 'function') {
          return success(data)
        }
        return success || 'Completed successfully'
      },
      error: (err) => {
        if (typeof error === 'function') {
          return error(err)
        }
        return error || 'An error occurred'
      },
    }).unwrap() as Promise<TResult>
  }

  // ============================================
  // Cleanup
  // ============================================

  destroy(): void {
    this.unsubscribeFunctions.forEach((unsub) => unsub())
    this.unsubscribeFunctions = []
  }
}

// ============================================
// Global Notification Manager Instance
// ============================================

let notificationManager: NotificationManager | null = null

export function getNotificationManager(): NotificationManager {
  if (!notificationManager) {
    notificationManager = new NotificationManager()
  }
  return notificationManager
}

// ============================================
// Convenience Functions
// ============================================

export function notifySuccess(title: string, config?: NotificationConfig): void {
  getNotificationManager().success(title, config)
}

export function notifyError(title: string, config?: NotificationConfig): void {
  getNotificationManager().error(title, config)
}

export function notifyInfo(title: string, config?: NotificationConfig): void {
  getNotificationManager().info(title, config)
}

export function notifyWarning(title: string, config?: NotificationConfig): void {
  getNotificationManager().warning(title, config)
}

export function notifyPromise<TResult>(
  title: string,
  promise: Promise<TResult>,
  options?: {
    success?: string | ((data: TResult) => string)
    error?: string | ((error: any) => string)
    loading?: string
  }
): Promise<TResult> {
  return getNotificationManager().promise(title, promise, options)
}
