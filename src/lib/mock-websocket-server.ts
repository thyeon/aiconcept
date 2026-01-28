// ============================================
// Mock WebSocket Server for Testing
// ============================================

// This simulates a WebSocket server for development/testing
// In production, this would be replaced by a real WebSocket server

export class MockWebSocketServer {
  private clients: Set<WebSocket> = new Set()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private isConnected = false

  connect(): void {
    this.isConnected = true
    console.log('🔌 Mock WebSocket Server connected')
  }

  disconnect(): void {
    this.isConnected = false
    this.clients.forEach((client) => client.close())
    this.clients.clear()

    // Clear all intervals
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()

    console.log('🔌 Mock WebSocket Server disconnected')
  }

  // Simulate a client connecting
  addClient(ws: WebSocket): void {
    this.clients.add(ws)
    console.log(`👤 Client connected. Total clients: ${this.clients.size}`)

    // Send connection confirmation
    this.sendToClient(ws, {
      type: 'user.notification',
      data: {
        type: 'info',
        message: 'Real-time connection established',
      },
      timestamp: new Date().toISOString(),
      id: this.generateId(),
    })

    // Simulate periodic updates
    this.startSimulation(ws)
  }

  removeClient(ws: WebSocket): void {
    this.clients.delete(ws)
    console.log(`👤 Client disconnected. Total clients: ${this.clients.size}`)

    // Clear intervals for this client
    const clientId = this.getClientId(ws)
    const interval = this.intervals.get(clientId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(clientId)
    }
  }

  private startSimulation(ws: WebSocket): void {
    const clientId = this.getClientId(ws)

    // Simulate random updates every 10-30 seconds
    const interval = setInterval(() => {
      if (!this.isConnected || this.clients.size === 0) return

      // Random event type
      const eventTypes = [
        'extraction.progress',
        'timeline.event_added',
        'log.entry_added',
      ]
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

      // Send mock event
      this.sendMockEvent(ws, eventType)
    }, 10000 + Math.random() * 20000)

    this.intervals.set(clientId, interval)
  }

  private sendMockEvent(ws: WebSocket, eventType: string): void {
    const mockEvent = this.generateMockEvent(eventType)
    this.sendToClient(ws, mockEvent)
  }

  private generateMockEvent(eventType: string): any {
    const timestamp = new Date().toISOString()
    const id = this.generateId()

    switch (eventType) {
      case 'extraction.progress':
        return {
          type: 'extraction.progress',
          data: {
            caseId: 'CLM-2024-08947',
            progress: Math.floor(Math.random() * 100),
            stage: ['OCR', 'Classification', 'Extraction', 'Validation'][
              Math.floor(Math.random() * 4)
            ],
          },
          timestamp,
          id,
        }

      case 'timeline.event_added':
        return {
          type: 'timeline.event_added',
          data: {
            caseId: 'CLM-2024-08947',
            event: {
              id: this.generateId(),
              type: ['upload', 'processing', 'rules'][Math.floor(Math.random() * 3)],
              title: 'Mock Timeline Event',
              detail: 'This is a simulated event',
              date: timestamp,
            },
          },
          timestamp,
          id,
        }

      case 'log.entry_added':
        return {
          type: 'log.entry_added',
          data: {
            caseId: 'CLM-2024-08947',
            log: {
              id: this.generateId(),
              timestamp,
              severity: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)],
              category: 'extraction',
              message: 'Mock log entry from simulated server',
            },
          },
          timestamp,
          id,
        }

      default:
        return {
          type: 'user.notification',
          data: {
            type: 'info',
            message: 'Unknown event type',
          },
          timestamp,
          id,
        }
    }
  }

  // Simulate specific events for testing
  simulateDocumentUpload(caseId: string, documentId: string): void {
    this.broadcast({
      type: 'document.uploaded',
      caseId,
      data: {
        caseId,
        document: {
          id: documentId,
          name: 'test-document.pdf',
          type: 'application/pdf',
          size: 1234567,
          uploadedAt: new Date().toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
      id: this.generateId(),
    })
  }

  simulateQualityCheck(caseId: string, documentId: string, score: number): void {
    this.broadcast({
      type: 'document.quality_checked',
      caseId,
      data: {
        caseId,
        documentId,
        score,
        passed: score >= 70,
      },
      timestamp: new Date().toISOString(),
      id: this.generateId(),
    })
  }

  simulateExtractionProgress(caseId: string, progress: number, stage: string): void {
    this.broadcast({
      type: 'extraction.progress',
      caseId,
      data: {
        caseId,
        progress,
        stage,
      },
      timestamp: new Date().toISOString(),
      id: this.generateId(),
    })
  }

  simulateExtractionComplete(caseId: string, fieldsCount: number, confidence: number): void {
    this.broadcast({
      type: 'extraction.completed',
      caseId,
      data: {
        caseId,
        fieldsExtracted: fieldsCount,
        confidence,
        duration: 5000,
      },
      timestamp: new Date().toISOString(),
      id: this.generateId(),
    })
  }

  simulateRulesEvaluated(caseId: string, results: any): void {
    this.broadcast({
      type: 'rules.evaluated',
      caseId,
      data: {
        caseId,
        results,
      },
      timestamp: new Date().toISOString(),
      id: this.generateId(),
    })
  }

  simulateDecisionGenerated(caseId: string, decision: any): void {
    this.broadcast({
      type: 'decision.generated',
      caseId,
      data: {
        caseId,
        decision,
      },
      timestamp: new Date().toISOString(),
      id: this.generateId(),
    })
  }

  private sendToClient(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  private broadcast(message: any): void {
    this.clients.forEach((client) => {
      this.sendToClient(client, message)
    })
  }

  private getClientId(ws: WebSocket): string {
    // Generate a unique ID for the client
    return `client-${Array.from(this.clients).indexOf(ws)}`
  }

  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// ============================================
// Global Mock Server Instance
// ============================================

let mockServer: MockWebSocketServer | null = null

export function getMockWebSocketServer(): MockWebSocketServer {
  if (!mockServer) {
    mockServer = new MockWebSocketServer()
  }
  return mockServer
}

// Auto-connect in development
if (process.env.NODE_ENV === 'development') {
  // Only enable if you want to use the mock server
  // Uncomment the next line to enable
  // getMockWebSocketServer().connect()
}
