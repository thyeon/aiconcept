// ============================================
// Zustand Store - Application State Management
// ============================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  UIState,
  CasesState,
  SessionState,
  Case,
  CaseStatus,
  CaseType,
  CaseFilters,
  SortOption,
  User,
  Permission,
} from '@/types'

// ============================================
// UI State Slice
// ============================================

interface UIStateActions {
  setActiveCaseId: (caseId: string | null) => void
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  setRightPanelActiveTab: (tab: 'timeline' | 'logs' | 'trace') => void
  toggleSidebar: () => void
  resetUIState: () => void
}

const initialUIState: UIState = {
  activeCaseId: null,
  leftPanelOpen: true,
  rightPanelOpen: true,
  rightPanelActiveTab: 'timeline',
  sidebarCollapsed: false,
}

const createUIStateSlice = (
  set: (partial: UIState | Partial<UIState> | ((state: UIState) => UIState | Partial<UIState>)) => void
) => ({
  ...initialUIState,
  setActiveCaseId: (caseId: string | null) =>
    set((state) => ({ ...state, activeCaseId: caseId })),
  toggleLeftPanel: () =>
    set((state) => ({ ...state, leftPanelOpen: !state.leftPanelOpen })),
  toggleRightPanel: () =>
    set((state) => ({ ...state, rightPanelOpen: !state.rightPanelOpen })),
  setRightPanelActiveTab: (tab: 'timeline' | 'logs' | 'trace') =>
    set((state) => ({ ...state, rightPanelActiveTab: tab })),
  toggleSidebar: () =>
    set((state) => ({ ...state, sidebarCollapsed: !state.sidebarCollapsed })),
  resetUIState: () => set(initialUIState),
})

// ============================================
// Cases State Slice
// ============================================

interface CasesStateActions {
  setCases: (cases: Case[]) => void
  addCase: (newCase: Case) => void
  updateCase: (caseId: string, updates: Partial<Case>) => void
  removeCase: (caseId: string) => void
  setFilters: (filters: Partial<CaseFilters>) => void
  setSortBy: (sortBy: SortOption) => void
  resetCasesState: () => void
}

const initialCasesState: CasesState = {
  byId: {},
  allIds: [],
  filters: {
    status: ['pending', 'in-progress', 'completed', 'rejected'],
    type: ['insurance', 'finance', 'compliance'],
    searchQuery: '',
  },
  sortBy: 'updatedAt-desc',
}

const createCasesStateSlice = (
  set: (partial: CasesState | Partial<CasesState> | ((state: CasesState) => CasesState | Partial<CasesState>)) => void,
  get: () => CasesState
) => ({
  ...initialCasesState,

  setCases: (cases: Case[]) =>
    set(() => ({
      byId: cases.reduce((acc, caseItem) => {
        acc[caseItem.id] = caseItem
        return acc
      }, {} as Record<string, Case>),
      allIds: cases.map((c) => c.id),
    })),

  addCase: (newCase: Case) =>
    set((state) => ({
      byId: { ...state.byId, [newCase.id]: newCase },
      allIds: [...state.allIds, newCase.id],
    })),

  updateCase: (caseId: string, updates: Partial<Case>) =>
    set((state) => ({
      byId: {
        ...state.byId,
        [caseId]: { ...state.byId[caseId], ...updates },
      },
    })),

  removeCase: (caseId: string) =>
    set((state) => {
      const { [caseId]: removed, ...remainingById } = state.byId
      return {
        byId: remainingById,
        allIds: state.allIds.filter((id) => id !== caseId),
      }
    }),

  setFilters: (filters: Partial<CaseFilters>) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setSortBy: (sortBy: SortOption) =>
    set((state) => ({ sortBy })),

  resetCasesState: () => set(initialCasesState),
})

// ============================================
// Session State Slice
// ============================================

interface SessionStateActions {
  setUser: (user: User | null) => void
  setPermissions: (permissions: Permission[]) => void
  logout: () => void
}

const initialSessionState: SessionState = {
  user: null,
  permissions: [],
}

const createSessionStateSlice = (
  set: (partial: SessionState | Partial<SessionState> | ((state: SessionState) => SessionState | Partial<SessionState>)) => void
) => ({
  ...initialSessionState,
  setUser: (user: User | null) => set((state) => ({ ...state, user })),
  setPermissions: (permissions: Permission[]) =>
    set((state) => ({ ...state, permissions })),
  logout: () => set(initialSessionState),
})

// ============================================
// Processing State Slice (In-memory only, no persistence)
// ============================================

interface ProcessingStateMap {
  byCaseId: Record<string, {
    currentStage: number
    stages: Array<{
      id: number
      name: string
      status: 'pending' | 'in-progress' | 'complete' | 'error'
      startedAt?: string
      completedAt?: string
    }>
    completedStages: number[]
    errors: Array<{
      id: string
      stage: number
      message: string
      details?: string
      retryable: boolean
      timestamp: string
    }>
  }>
}

interface ProcessingStateActions {
  setProcessingState: (caseId: string, state: ProcessingStateMap['byCaseId'][string]) => void
  updateStage: (caseId: string, stageId: number, updates: Partial<{
    status: 'pending' | 'in-progress' | 'complete' | 'error'
    startedAt?: string
    completedAt?: string
  }>) => void
  addError: (caseId: string, error: {
    id: string
    stage: number
    message: string
    details?: string
    retryable: boolean
  }) => void
  clearProcessingState: (caseId: string) => void
}

const initialProcessingState: ProcessingStateMap = {
  byCaseId: {},
}

const createProcessingStateSlice = (
  set: (partial: ProcessingStateMap | Partial<ProcessingStateMap> | ((state: ProcessingStateMap) => ProcessingStateMap | Partial<ProcessingStateMap>)) => void
) => ({
  ...initialProcessingState,

  setProcessingState: (caseId: string, state: ProcessingStateMap['byCaseId'][string]) =>
    set((prevState) => ({
      byCaseId: { ...prevState.byCaseId, [caseId]: state },
    })),

  updateStage: (caseId: string, stageId: number, updates: Partial<any>) =>
    set((prevState) => {
      const caseState = prevState.byCaseId[caseId]
      if (!caseState) return prevState

      return {
        byCaseId: {
          ...prevState.byCaseId,
          [caseId]: {
            ...caseState,
            stages: caseState.stages.map((stage) =>
              stage.id === stageId ? { ...stage, ...updates } : stage
            ),
          },
        },
      }
    }),

  addError: (caseId: string, error: {
    id: string
    stage: number
    message: string
    details?: string
    retryable: boolean
  }) =>
    set((prevState) => {
      const caseState = prevState.byCaseId[caseId]
      if (!caseState) return prevState

      return {
        byCaseId: {
          ...prevState.byCaseId,
          [caseId]: {
            ...caseState,
            errors: [
              ...caseState.errors,
              { ...error, timestamp: new Date().toISOString() },
            ],
          },
        },
      }
    }),

  clearProcessingState: (caseId: string) =>
    set((prevState) => {
      const { [caseId]: removed, ...remaining } = prevState.byCaseId
      return { byCaseId: remaining }
    }),
})

// ============================================
// Combined Store
// ============================================

interface AppState extends UIState, UIStateActions,
                              CasesState, CasesStateActions,
                              SessionState, SessionStateActions,
                              ProcessingStateMap, ProcessingStateActions {}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI State
      ...createUIStateSlice(set),

      // Cases State
      ...createCasesStateSlice(set, get as () => CasesState),

      // Session State
      ...createSessionStateSlice(set),

      // Processing State (not persisted)
      ...createProcessingStateSlice(set as (partial: ProcessingStateMap | Partial<ProcessingStateMap> | ((state: ProcessingStateMap) => ProcessingStateMap | Partial<ProcessingStateMap>)) => void),
    }),
    {
      name: 'ai-doc-platform-storage',
      // Only persist UI and cases state, not processing state
      partialize: (state) => ({
        // UI State
        activeCaseId: state.activeCaseId,
        leftPanelOpen: state.leftPanelOpen,
        rightPanelOpen: state.rightPanelOpen,
        rightPanelActiveTab: state.rightPanelActiveTab,
        sidebarCollapsed: state.sidebarCollapsed,

        // Cases State
        byId: state.byId,
        allIds: state.allIds,
        filters: state.filters,
        sortBy: state.sortBy,

        // Session State
        user: state.user,
        permissions: state.permissions,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ============================================
// Selector Hooks (for optimized re-renders)
// ============================================

export const useActiveCase = () =>
  useAppStore((state) =>
    state.activeCaseId ? state.byId[state.activeCaseId] : null
  )

export const useCasesList = () =>
  useAppStore((state) => {
    const { byId, allIds, filters, sortBy } = state

    let filteredCases = allIds
      .map((id) => byId[id])
      .filter((caseItem) => {
        if (!caseItem) return false

        // Status filter
        if (!filters.status.includes(caseItem.status)) return false

        // Type filter
        if (!filters.type.includes(caseItem.type)) return false

        // Search filter
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase()
          return (
            caseItem.title.toLowerCase().includes(query) ||
            caseItem.id.toLowerCase().includes(query)
          )
        }

        return true
      })

    // Sort
    filteredCases.sort((a, b) => {
      const [field, order] = sortBy.split('-') as [keyof Case, 'asc' | 'desc']
      const aValue = a[field]
      const bValue = b[field]

      if (aValue < bValue) return order === 'asc' ? -1 : 1
      if (aValue > bValue) return order === 'asc' ? 1 : -1
      return 0
    })

    return filteredCases
  })

export const useUIState = () =>
  useAppStore((state) => ({
    activeCaseId: state.activeCaseId,
    leftPanelOpen: state.leftPanelOpen,
    rightPanelOpen: state.rightPanelOpen,
    rightPanelActiveTab: state.rightPanelActiveTab,
    sidebarCollapsed: state.sidebarCollapsed,
    setActiveCaseId: state.setActiveCaseId,
    toggleLeftPanel: state.toggleLeftPanel,
    toggleRightPanel: state.toggleRightPanel,
    setRightPanelActiveTab: state.setRightPanelActiveTab,
    toggleSidebar: state.toggleSidebar,
  }))

export const useCasesActions = () =>
  useAppStore((state) => ({
    setCases: state.setCases,
    addCase: state.addCase,
    updateCase: state.updateCase,
    removeCase: state.removeCase,
    setFilters: state.setFilters,
    setSortBy: state.setSortBy,
  }))

export const useProcessingState = (caseId: string) =>
  useAppStore((state) => state.byCaseId[caseId])

export const useSession = () =>
  useAppStore((state) => ({
    user: state.user,
    permissions: state.permissions,
    setUser: state.setUser,
    setPermissions: state.setPermissions,
    logout: state.logout,
  }))
