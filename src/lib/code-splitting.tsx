// ============================================
// Code Splitting & Lazy Loading Utilities
// ============================================

import { lazy, Suspense, ComponentType } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// ============================================
// Lazy Load Wrapper with Loading State
// ============================================

interface LazyLoadOptions {
  fallback?: React.ReactNode
  loadingComponent?: React.ComponentType
}

/**
 * Creates a lazy-loaded component with a loading skeleton
 * @param importFn - Function that imports the component
 * @param options - Optional configuration
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: LazyLoadOptions
): T {
  const LazyComponent = lazy(importFn)

  const LoadingWrapper = (props: any) => (
    <Suspense
      fallback={
        options?.fallback ||
        (options?.loadingComponent ? (
          <options.loadingComponent />
        ) : (
          <DefaultLoadingSkeleton />
        ))
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  )

  return LoadingWrapper as T
}

// Default loading skeleton
function DefaultLoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

// ============================================
// Lazy Load Feature Components
// ============================================

// Document Viewer (heavy component)
export const DocumentViewer = createLazyComponent(
  () => import('@/components/features/document-viewer').then(m => ({ default: m.DocumentViewer })),
  {
    fallback: (
      <div className="h-[600px] flex items-center justify-center">
        <Skeleton className="h-full w-full bg-muted rounded-lg animate-pulse" />
      </div>
    ),
  }
)

// Rules Engine (complex component)
export const RulesEngine = createLazyComponent(
  () => import('@/components/features/rules-engine').then(m => ({ default: m.RulesEnginePanel })),
  {
    loadingComponent: () => (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    ),
  }
)

// Decision Summary (report generation)
export const DecisionSummary = createLazyComponent(
  () => import('@/components/features/decision-summary').then(m => ({ default: m.DecisionHistory })),
  {
    fallback: (
      <div className="p-6">
        <Skeleton className="h-48 bg-muted rounded-lg animate-pulse" />
      </div>
    ),
  }
)

// Extraction Editor (complex forms)
export const ExtractionEditor = createLazyComponent(
  () => import('@/components/features/extraction-editor').then(m => ({ default: m.FieldGroup }))
)

// Quality Check Panel (image heavy)
export const QualityCheckPanel = createLazyComponent(
  () => import('@/components/features/quality-check-panel').then(m => ({ default: m.QualityCheckPanel }))
)

// ============================================
// Route-Based Code Splitting
// ============================================

// These are automatically split by Next.js App Router
// But we can optimize them with loading.tsx files

// ============================================
// Dynamic Import Helper
// ============================================

/**
 * Dynamically import a component with error handling
 * @param importFn - Function that imports the component
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  timeout: number = 5000
): Promise<T> {
  return Promise.race([
    importFn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Import timeout')), timeout)
    ),
  ])
}

// ============================================
// Prefetch Helper
// ============================================

/**
 * Prefetch a component for faster navigation
 * @param importFn - Function that imports the component
 */
export function prefetchComponent(importFn: () => Promise<any>): void {
  // Start loading the component in the background
  importFn().catch((err) => {
    console.warn('Prefetch failed:', err)
  })
}

// ============================================
// Bundle Analysis Utilities
// ============================================

/**
 * Get approximate component size for monitoring
 * Note: This only works in development with webpack-bundle-analyzer
 */
export function getComponentSize(componentName: string): number {
  if (typeof window === 'undefined' || !window.performance) {
    return 0
  }

  // This is a rough estimate
  // Use webpack-bundle-analyzer for accurate measurements
  return 0
}

// ============================================
// Critical Component Indicator
// ============================================

/**
 * Mark a component as critical for LCP (Largest Contentful Paint)
 * These should not be lazy loaded
 */
export function Critical({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
