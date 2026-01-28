// ============================================
// WebSocket Client for Real-Time Updates
// ============================================

export type WebSocketEventType =
  | 'case.updated'
  | 'case.status_changed'
  | 'document.uploaded'
  | 'document.quality_checked'
  | 'extraction.started'
  | 'extraction.progress'
  | 'extraction.completed'
  | 'rules.evaluated'
  | 'rules.replayed'
  | 'decision.generated'
  | 'timeline.event_added'
  | 'log.entry_added'
  | 'processing.error'
  | 'user.notification'

export interface WebSocketMessage<T = any> {
  type: WebSocketEventType
  caseId?: string
  data: T
  timestamp: string
  id: string
}

export interface WebSocketConfig {
  url?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

// ============================================
// WebSocket Client Class
// ============================================

export class WSClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectInterval: number
  private maxReconnectAttempts: number
  private heartbeatInterval: number
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private isIntentionalClose = false
  private listeners: Map<WebSocketEventType, Set<(data: any) => void>> = new Map()
  private messageQueue: any[] = []

  constructor(config: WebSocketConfig = {}) {
    this.url = config.url || this.getWebSocketURL()
    this.reconnectInterval = config.reconnectInterval || 3000
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10
    this.heartbeatInterval = config.heartbeatInterval || 30000
  }

  private getWebSocketURL(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = process.env.NEXT_PUBLIC_WS_URL || window.location.host
    return `${protocol}//${host}/ws`
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)

      console.log('WebSocket connecting to...', this.url)
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.scheduleReconnect()
    }
  }

  disconnect(): void {
    this.isIntentionalClose = true
    this.clearTimers()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.reconnectAttempts = 0
  }

  private handleOpen(): void {
    console.log('WebSocket connected')
    this.reconnectAttempts = 0

    // Start heartbeat
    this.startHeartbeat()

    // Send queued messages
    this.flushMessageQueue()

    // Emit connection event
    this.emit('user.notification', {
      type: 'info',
      message: 'Real-time connection established',
    })
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)

      // Reset heartbeat timer on any message
      this.resetHeartbeat()

      // Dispatch to listeners
      this.emit(message.type, message.data)

      // Handle case updates (update Zustand store)
      if (message.caseId) {
        this.emit('case.updated', { caseId: message.caseId, data: message.data })
      }
    } catch (error) {
      console.error('WebSocket message parse error:', error)
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason)
    this.clearTimers()

    if (!this.isIntentionalClose) {
      this.scheduleReconnect()
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error)
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.emit('user.notification', {
        type: 'error',
        message: 'Real-time connection lost. Please refresh the page.',
      })
      return
    }

    this.reconnectAttempts++
    console.log(`Reconnecting in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.reconnectInterval)
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', data: {} })
      }
    }, this.heartbeatInterval)
  }

  private resetHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }
    this.startHeartbeat()
  }

  // ============================================
  // Public API
  // ============================================

  subscribe(eventType: WebSocketEventType, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    this.listeners.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback)
    }
  }

  private emit(eventType: WebSocketEventType, data: any): void {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error)
        }
      })
    }
  }

  send(type: string, data: any = {}): void {
    const message = {
      type,
      data,
      timestamp: new Date().toISOString(),
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message)
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()
      this.ws.send(JSON.stringify(message))
    }
  }

  // Subscribe to case updates
  subscribeToCase(caseId: string): void {
    this.send('subscribe', { caseId })
  }

  // Unsubscribe from case updates
  unsubscribeFromCase(caseId: string): void {
    this.send('unsubscribe', { caseId })
  }

  // Get connection state
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// ============================================
// Global WebSocket Client Instance
// ============================================

let wsClient: WSClient | null = null

export function getWSClient(): WSClient {
  if (!wsClient) {
    wsClient = new WSClient()
  }
  return wsClient
}

export function disconnectWS(): void {
  if (wsClient) {
    wsClient.disconnect()
    wsClient = null
  }
}
