// ============================================
// Global State Store - Zustand
// ============================================

import { useMemo } from 'react'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type {
  AppState,
  Case,
  ProcessingState,
  ProcessingStage,
  StageStatus,
  UIState,
  CasesState,
  CaseFilters,
  SortOption,
  ProcessingStateMap,
  SessionState,
} from '@/types'

// ============================================
// Initial States
// ============================================

const initialUIState: UIState = {
  activeCaseId: null,
  leftPanelOpen: true,
  rightPanelOpen: true,
  rightPanelActiveTab: 'timeline',
  sidebarCollapsed: false,
}

const initialCasesState: CasesState = {
  byId: {},
  allIds: [],
  filters: {
    status: [],
    type: [],
  },
  sortBy: 'createdAt-desc',
}

const initialProcessingState: ProcessingStateMap = {
  byCaseId: {},
}

const initialSessionState: SessionState = {
  user: {
    id: 'user-1',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'admin',
  },
  permissions: [
    { resource: 'cases', actions: ['read', 'write', 'delete'] },
    { resource: 'documents', actions: ['read', 'write', 'delete'] },
    { resource: 'decisions', actions: ['read', 'approve', 'reject'] },
  ],
}

// ============================================
// Store Definition
// ============================================

interface AppStore extends AppState {
  // UI Actions
  setActiveCaseId: (caseId: string | null) => void
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  setRightPanelActiveTab: (tab: 'timeline' | 'logs' | 'trace') => void
  toggleSidebar: () => void

  // Case Actions
  setCases: (cases: Case[]) => void
  addCase: (cas: Case) => void
  updateCase: (caseId: string, updates: Partial<Case>) => void
  deleteCase: (caseId: string) => void
  setCaseFilters: (filters: Partial<CaseFilters>) => void
  setSortBy: (sortBy: SortOption) => void

  // Processing Actions
  setProcessingState: (caseId: string, state: ProcessingState) => void
  updateProcessingStage: (caseId: string, stageId: number, status: StageStatus) => void
  resetProcessing: (caseId: string) => void

  // Session Actions
  setUser: (user: SessionState['user']) => void
  logout: () => void

  // Computed
  getActiveCase: () => Case | null
  getFilteredCases: () => Case[]
  getProcessingState: (caseId: string) => ProcessingState | null
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        ui: initialUIState,
        cases: initialCasesState,
        processing: initialProcessingState,
        session: initialSessionState,

        // ============================================
        // UI Actions
        // ============================================

        setActiveCaseId: (caseId) =>
          set((state) => ({
            ui: { ...state.ui, activeCaseId: caseId },
          })),

        toggleLeftPanel: () =>
          set((state) => ({
            ui: { ...state.ui, leftPanelOpen: !state.ui.leftPanelOpen },
          })),

        toggleRightPanel: () =>
          set((state) => ({
            ui: { ...state.ui, rightPanelOpen: !state.ui.rightPanelOpen },
          })),

        setRightPanelActiveTab: (tab) =>
          set((state) => ({
            ui: { ...state.ui, rightPanelActiveTab: tab },
          })),

        toggleSidebar: () =>
          set((state) => ({
            ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
          })),

        // ============================================
        // Case Actions
        // ============================================

        setCases: (cases) =>
          set((state) => ({
            cases: {
              ...state.cases,
              byId: cases.reduce((acc, cas) => ({ ...acc, [cas.id]: cas }), {}),
              allIds: cases.map((c) => c.id),
            },
          })),

        addCase: (cas) =>
          set((state) => ({
            cases: {
              ...state.cases,
              byId: { ...state.cases.byId, [cas.id]: cas },
              allIds: [...state.cases.allIds, cas.id],
            },
          })),

        updateCase: (caseId, updates) =>
          set((state) => ({
            cases: {
              ...state.cases,
              byId: {
                ...state.cases.byId,
                [caseId]: { ...state.cases.byId[caseId], ...updates, updatedAt: new Date().toISOString() },
              },
            },
          })),

        deleteCase: (caseId) =>
          set((state) => {
            const byId = { ...state.cases.byId }
            delete byId[caseId]
            return {
              cases: {
                ...state.cases,
                byId,
                allIds: state.cases.allIds.filter((id) => id !== caseId),
              },
              ui: {
                ...state.ui,
                activeCaseId: state.ui.activeCaseId === caseId ? null : state.ui.activeCaseId,
              },
            }
          }),

        setCaseFilters: (filters) =>
          set((state) => ({
            cases: {
              ...state.cases,
              filters: { ...state.cases.filters, ...filters },
            },
          })),

        setSortBy: (sortBy) =>
          set((state) => ({
            cases: { ...state.cases, sortBy },
          })),

        // ============================================
        // Processing Actions
        // ============================================

        setProcessingState: (caseId, processingState) =>
          set((state) => ({
            processing: {
              ...state.processing,
              byCaseId: {
                ...state.processing.byCaseId,
                [caseId]: processingState,
              },
            },
          })),

        updateProcessingStage: (caseId, stageId, status) =>
          set((state) => {
            const currentProcessing = state.processing.byCaseId[caseId]
            if (!currentProcessing) return state

            const updatedStages = currentProcessing.stages.map((stage) =>
              stage.id === stageId
                ? {
                    ...stage,
                    status,
                    ...(status === 'in-progress' && { startedAt: new Date().toISOString() }),
                    ...(status === 'complete' && { completedAt: new Date().toISOString() }),
                  }
                : stage
            )

            const completedStages = updatedStages
              .filter((s) => s.status === 'complete')
              .map((s) => s.id)

            const currentStage =
              status === 'in-progress'
                ? stageId
                : status === 'complete'
                  ? updatedStages.find((s) => s.status === 'pending')?.id ?? updatedStages.length
                  : currentProcessing.currentStage

            return {
              processing: {
                ...state.processing,
                byCaseId: {
                  ...state.processing.byCaseId,
                  [caseId]: {
                    ...currentProcessing,
                    stages: updatedStages,
                    completedStages,
                    currentStage,
                  },
                },
              },
            }
          }),

        resetProcessing: (caseId) =>
          set((state) => {
            const byCaseId = { ...state.processing.byCaseId }
            delete byCaseId[caseId]
            return {
              processing: { ...state.processing, byCaseId },
            }
          }),

        // ============================================
        // Session Actions
        // ============================================

        setUser: (user) =>
          set((state) => ({
            session: { ...state.session, user },
          })),

        logout: () =>
          set(() => ({
            session: {
              user: null,
              permissions: [],
            },
          })),

        // ============================================
        // Computed Getters
        // ============================================

        getActiveCase: () => {
          const state = get()
          return state.ui.activeCaseId ? state.cases.byId[state.ui.activeCaseId] || null : null
        },

        getFilteredCases: () => {
          const state = get()
          let cases = state.cases.allIds.map((id) => state.cases.byId[id])

          // Apply filters
          const { status, type, searchQuery } = state.cases.filters
          if (status.length > 0) {
            cases = cases.filter((c) => status.includes(c.status))
          }
          if (type.length > 0) {
            cases = cases.filter((c) => type.includes(c.type))
          }
          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            cases = cases.filter(
              (c) =>
                c.title.toLowerCase().includes(query) ||
                c.id.toLowerCase().includes(query)
            )
          }

          // Apply sorting
          const [sortBy, sortOrder] = state.cases.sortBy.split('-')
          cases.sort((a, b) => {
            const aVal = a[sortBy as keyof Case]
            const bVal = b[sortBy as keyof Case]
            if (!aVal || !bVal) return 0
            const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
            return sortOrder === 'asc' ? comparison : -comparison
          })

          return cases
        },

        getProcessingState: (caseId) => {
          const state = get()
          return state.processing.byCaseId[caseId] || null
        },
      }),
      {
        name: 'ai-doc-platform-storage',
        partialize: (state) => ({
          ui: {
            sidebarCollapsed: state.ui.sidebarCollapsed,
          },
          session: state.session,
        }),
      }
    ),
    { name: 'AI Doc Platform Store' }
  )
)

// ============================================
// Hook Selectors
// ============================================

// Use shallow comparison for object selectors to prevent infinite loops
export const useActiveCase = () => {
  const activeCaseId = useAppStore((state) => state.ui.activeCaseId)
  const caseById = useAppStore((state) => state.cases.byId)
  return activeCaseId ? caseById[activeCaseId] || null : null
}

// Custom hook with memoization to prevent infinite re-renders
export const useFilteredCases = () => {
  const allIds = useAppStore((state) => state.cases.allIds)
  const byId = useAppStore((state) => state.cases.byId)
  const filters = useAppStore(useShallow((state) => state.cases.filters))
  const sortBy = useAppStore((state) => state.cases.sortBy)

  return useMemo(() => {
    let cases = allIds.map((id) => byId[id]).filter(Boolean) as Case[]

    // Apply filters
    const { status, type, searchQuery } = filters
    if (status && status.length > 0) {
      cases = cases.filter((c) => status.includes(c.status))
    }
    if (type && type.length > 0) {
      cases = cases.filter((c) => type.includes(c.type))
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      cases = cases.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    const [sortField, sortOrder] = sortBy.split('-')
    cases.sort((a, b) => {
      const aVal = a[sortField as keyof Case]
      const bVal = b[sortField as keyof Case]
      if (!aVal || !bVal) return 0
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return cases
  }, [allIds, byId, filters, sortBy])
}

export const useProcessingState = (caseId: string) =>
  useAppStore((state) => state.processing.byCaseId[caseId] || null)
