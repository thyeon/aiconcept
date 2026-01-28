// ============================================
// React Hook for WebSocket
// ============================================

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store'
import {
  getWSClient,
  WSClient,
  WebSocketEventType,
  WebSocketMessage,
} from '@/lib/websocket'

interface UseWebSocketOptions {
  autoConnect?: boolean
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options

  const wsClientRef = useRef<WSClient | null>(null)
  const updateCase = useAppStore((state) => state.updateCase)

  // Connect to WebSocket
  useEffect(() => {
    if (!autoConnect) return

    const client = getWSClient()
    wsClientRef.current = client

    // Connect if not already connected
    if (!client.isConnected()) {
      client.connect()
    }

    // Setup event listeners
    const unsubscribes: Array<(() => void) | undefined> = []

    // Connection events
    if (onConnect) {
      const unsub = client.subscribe('user.notification', (data) => {
        if (data.type === 'info' && data.message === 'Real-time connection established') {
          onConnect()
        }
      })
      unsubscribes.push(unsub)
    }

    // General message handler
    if (onMessage) {
      const unsub = client.subscribe('case.updated', (data) => {
        onMessage({
          type: 'case.updated',
          caseId: data.caseId,
          data: data.data,
          timestamp: new Date().toISOString(),
          id: `msg-${Date.now()}`,
        })
      })
      unsubscribes.push(unsub)
    }

    // Handle case updates from WebSocket
    const unsubCaseUpdate = client.subscribe('case.updated', (data) => {
      if (data.caseId && data.data) {
        updateCase(data.caseId, data.data)
      }
    })
    unsubscribes.push(unsubCaseUpdate)

    // Handle document uploads
    const unsubUpload = client.subscribe('document.uploaded', (data) => {
      if (data.caseId && data.document) {
        const currentCase = useAppStore.getState().byId[data.caseId]
        if (currentCase) {
          updateCase(data.caseId, {
            documents: [...currentCase.documents, data.document],
          })
        }
      }
    })
    unsubscribes.push(unsubUpload)

    // Handle extraction progress
    const unsubExtraction = client.subscribe('extraction.progress', (data) => {
      if (data.caseId) {
        // Update processing state
        console.log('Extraction progress:', data)
      }
    })
    unsubscribes.push(unsubExtraction)

    // Handle errors
    if (onError) {
      client.subscribe('processing.error', (data) => {
        onError(data as any)
      })
    }

    // Cleanup on unmount
    return () => {
      unsubscribes.forEach((unsub) => unsub?.())
    }
  }, [autoConnect, onMessage, onConnect, onDisconnect, onError, updateCase])

  // Send message through WebSocket
  const send = useCallback(
    (type: string, data: any) => {
      wsClientRef.current?.send(type, data)
    },
    []
  )

  // Subscribe to specific event type
  const subscribe = useCallback(
    (eventType: WebSocketEventType, callback: (data: any) => void) => {
      return wsClientRef.current?.subscribe(eventType, callback)
    },
    []
  )

  // Subscribe to case updates
  const subscribeToCase = useCallback(
    (caseId: string) => {
      wsClientRef.current?.subscribeToCase(caseId)
    },
    []
  )

  // Unsubscribe from case updates
  const unsubscribeFromCase = useCallback(
    (caseId: string) => {
      wsClientRef.current?.unsubscribeFromCase(caseId)
    },
    []
  )

  // Check connection status
  const isConnected = useCallback(() => {
    return wsClientRef.current?.isConnected() ?? false
  }, [])

  // Disconnect
  const disconnect = useCallback(() => {
    wsClientRef.current?.disconnect()
    onDisconnect?.()
  }, [onDisconnect])

  return {
    send,
    subscribe,
    subscribeToCase,
    unsubscribeFromCase,
    isConnected,
    disconnect,
    client: wsClientRef.current,
  }
}

// ============================================
// Hook for Real-Time Case Updates
// ============================================

interface UseRealTimeCaseOptions {
  caseId: string
  onDocumentUploaded?: (document: any) => void
  onExtractionProgress?: (progress: any) => void
  onRulesEvaluated?: (results: any) => void
  onDecisionGenerated?: (decision: any) => void
  onTimelineEvent?: (event: any) => void
  onError?: (error: any) => void
}

export function useRealTimeCase(options: UseRealTimeCaseOptions) {
  const { caseId, onDocumentUploaded, onExtractionProgress, onRulesEvaluated, onDecisionGenerated, onTimelineEvent, onError } = options
  const { subscribe, subscribeToCase, unsubscribeFromCase } = useWebSocket()

  useEffect(() => {
    if (!caseId) return

    // Subscribe to case updates
    subscribeToCase(caseId)

    const unsubscribes: Array<(() => void) | undefined> = []

    // Document uploaded
    if (onDocumentUploaded) {
      const unsub = subscribe('document.uploaded', (data) => {
        if (data.caseId === caseId) {
          onDocumentUploaded(data.document)
        }
      })
      unsubscribes.push(unsub)
    }

    // Extraction progress
    if (onExtractionProgress) {
      const unsub = subscribe('extraction.progress', (data) => {
        if (data.caseId === caseId) {
          onExtractionProgress(data)
        }
      })
      unsubscribes.push(unsub)
    }

    // Extraction completed
    const unsubExtractionComplete = subscribe('extraction.completed', (data) => {
      if (data.caseId === caseId) {
        console.log('Extraction completed:', data)
      }
    })
    unsubscribes.push(unsubExtractionComplete)

    // Rules evaluated
    if (onRulesEvaluated) {
      const unsub = subscribe('rules.evaluated', (data) => {
        if (data.caseId === caseId) {
          onRulesEvaluated(data.results)
        }
      })
      unsubscribes.push(unsub)
    }

    // Rules replayed
    const unsubRulesReplay = subscribe('rules.replayed', (data) => {
      if (data.caseId === caseId) {
        console.log('Rules replayed:', data)
      }
    })
    unsubscribes.push(unsubRulesReplay)

    // Decision generated
    if (onDecisionGenerated) {
      const unsub = subscribe('decision.generated', (data) => {
        if (data.caseId === caseId) {
          onDecisionGenerated(data.decision)
        }
      })
      unsubscribes.push(unsub)
    }

    // Timeline events
    if (onTimelineEvent) {
      const unsub = subscribe('timeline.event_added', (data) => {
        if (data.caseId === caseId) {
          onTimelineEvent(data.event)
        }
      })
      unsubscribes.push(unsub)
    }

    // Errors
    if (onError) {
      const unsub = subscribe('processing.error', (data) => {
        if (data.caseId === caseId) {
          onError(data)
        }
      })
      unsubscribes.push(unsub)
    }

    // Cleanup
    return () => {
      unsubscribes.forEach((unsub) => unsub?.())
      unsubscribeFromCase(caseId)
    }
  }, [caseId, subscribe, subscribeToCase, unsubscribeFromCase, onDocumentUploaded, onExtractionProgress, onRulesEvaluated, onDecisionGenerated, onTimelineEvent, onError])
}

// ============================================
// Hook for WebSocket Connection Status
// ============================================

export function useWebSocketStatus() {
  const { isConnected } = useWebSocket()

  return {
    isConnected: isConnected(),
    status: isConnected() ? 'connected' : 'disconnected',
  }
}
