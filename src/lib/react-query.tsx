'use client'

// ============================================
// React Query Provider Setup
// ============================================

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Create QueryClient with optimized defaults
const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5 minutes stale time for data
        staleTime: 5 * 60 * 1000,
        // 30 minutes garbage collection time
        gcTime: 30 * 60 * 1000,
        // Retry failed requests 3 times
        retry: 3,
        // Retry with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always create a new client
    return makeQueryClient()
  } else {
    // Browser: create client once and reuse
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may
  // suspend because React will throw away the client on the initial
  // render if it suspends and there is no boundary
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}

// ============================================
// Query Keys Factory
// ============================================

export const queryKeys = {
  // Cases
  cases: {
    all: ['cases'] as const,
    lists: () => [...queryKeys.cases.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.cases.lists(), filters] as const,
    details: () => [...queryKeys.cases.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.cases.details(), id] as const,
  },

  // Documents
  documents: {
    all: ['documents'] as const,
    lists: () => [...queryKeys.documents.all, 'list'] as const,
    list: (caseId: string) => [...queryKeys.documents.lists(), caseId] as const,
    detail: (id: string) => [...queryKeys.documents.all, 'detail', id] as const,
  },

  // Quality Checks
  qualityChecks: {
    all: ['quality-checks'] as const,
    detail: (documentId: string) => [...queryKeys.qualityChecks.all, documentId] as const,
  },

  // Extraction
  extraction: {
    all: ['extraction'] as const,
    detail: (caseId: string) => [...queryKeys.extraction.all, caseId] as const,
  },

  // Rules
  rules: {
    all: ['rules'] as const,
    results: (caseId: string) => [...queryKeys.rules.all, 'results', caseId] as const,
  },

  // Decisions
  decisions: {
    all: ['decisions'] as const,
    detail: (caseId: string) => [...queryKeys.decisions.all, caseId] as const,
  },

  // Timeline
  timeline: {
    all: ['timeline'] as const,
    detail: (caseId: string) => [...queryKeys.timeline.all, caseId] as const,
  },

  // Logs
  logs: {
    all: ['logs'] as const,
    list: (caseId: string) => [...queryKeys.logs.all, caseId] as const,
  },
} as const
