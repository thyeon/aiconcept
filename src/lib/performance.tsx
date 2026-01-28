// ============================================
// Performance Optimization Utilities
// ============================================

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { debounce, throttle } from 'lodash-es'

// ============================================
// Memoization Helpers
// ============================================

/**
 * Memoize a component with custom comparison
 * @param Component - Component to memoize
 * @param areEqual - Custom comparison function
 */
export function memoize<T extends object>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return React.memo(Component, areEqual)
}

/**
 * Memoize expensive computations
 * @param factory - Function to compute value
 * @param deps - Dependencies
 */
export function useMemoize<T>(factory: () => T, deps: React.DependencyList = []): T {
  return useMemo(factory, deps)
}

/**
 * Memoize event handlers to prevent child re-renders
 * @param callback - Function to memoize
 * @param deps - Dependencies
 */
export function useEvent<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList = []
): T {
  return useCallback(callback, deps) as T
}

/**
 * Stable callback that never changes
 * Useful for event handlers passed to multiple children
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const ref = useRef(callback)
  ref.current = callback

  return useCallback((...args: any[]) => ref.current(...args), []) as T
}

// ============================================
// Debounce & Throttle Hooks
// ============================================

/**
 * Debounce a function call
 * @param func - Function to debounce
 * @param wait - Wait time in ms
 * @param deps - Dependencies
 */
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): ReturnType<typeof debounce<T>> {
  return useMemo(
    () => debounce(func, wait),
    [func, wait]
  )
}

/**
 * Throttle a function call
 * @param func - Function to throttle
 * @param wait - Wait time in ms
 * @param deps - Dependencies
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): ReturnType<typeof throttle<T>> {
  return useMemo(
    () => throttle(func, wait),
    [func, wait]
  )
}

/**
 * Debounced value hook
 * @param value - Value to debounce
 * @param delay - Delay in ms
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// ============================================
// Previous Value Hook
// ============================================

/**
 * Get the previous value of a variable
 * @param value - Current value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// ============================================
// Mounted State Hook
// ============================================

/**
 * Check if component is mounted
 * Useful for async operations to avoid state updates on unmounted components
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(true)
  const isMounted = useCallback(() => isMountedRef.current, [])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return isMounted
}

// ============================================
// Idle Callback Hook
// ============================================

/**
 * Run a function during browser idle periods
 * @param callback - Function to run
 * @param deps - Dependencies
 */
export function useIdleCallback(
  callback: () => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    const id = requestIdleCallback(() => {
      callback()
    })

    return () => cancelIdleCallback(id)
  }, deps)
}

// ============================================
// Intersection Observer Hook
// ============================================

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  rootMargin?: string
  triggerOnce?: boolean
  enabled?: boolean
}

/**
 * Detect when element enters viewport
 * @param options - Intersection observer options
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const { threshold = 0, rootMargin = '0px', triggerOnce = false, enabled = true } = options
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)

          if (triggerOnce) {
            observer.disconnect()
          }
        } else {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, enabled])

  return { ref, isVisible }
}

// ============================================
// Image Loading Optimization
// ============================================

/**
 * Generate blur placeholder for images
 */
export function generateBlurPlaceholder(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(0, 0, width, height)
  }

  return canvas.toDataURL()
}

/**
 * Preload images
 * @param srcs - Image URLs to preload
 */
export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(
    srcs.map(
      (src) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = reject
          img.src = src
        })
    )
  )
}

// ============================================
// Performance Monitoring
// ============================================

/**
 * Measure render time of a component
 * @param componentName - Name of component
 */
export function useRenderTime(componentName: string): void {
  const renderCount = useRef(0)
  const renderStart = useRef<number>(performance.now())

  useEffect(() => {
    renderCount.current++
    const renderEnd = performance.now()
    const renderTime = renderEnd - renderStart.current

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`
      )
    }

    renderStart.current = performance.now()
  })
}

/**
 * Measure function execution time
 * @param fn - Function to measure
 * @param label - Label for logging
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  label: string
): T {
  return ((...args: any[]) => {
    const start = performance.now()
    const result = fn(...args)

    const end = performance.now()
    const duration = end - start

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
    }

    return result
  }) as T
}

// ============================================
// Batch State Updates
// ============================================

import { unstable_batchedUpdates } from 'react-dom'

/**
 * Batch multiple state updates together
 * @param callback - Function containing state updates
 */
export function batchUpdates(callback: () => void): void {
  unstable_batchedUpdates(callback)
}

// ============================================
// Resource Hints
// ============================================

/**
 * Add DNS prefetch hint
 * @param href - URL to prefetch
 */
export function dnsPrefetch(href: string): void {
  const link = document.createElement('link')
  link.rel = 'dns-prefetch'
  link.href = href
  document.head.appendChild(link)
}

/**
 * Add preconnect hint
 * @param href - URL to preconnect to
 */
export function preconnect(href: string): void {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = href
  document.head.appendChild(link)
}

/**
 * Prefetch a resource
 * @param href - URL to prefetch
 */
export function prefetchResource(href: string): void {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

// ============================================
// Lazy Load Images with Intersection Observer
// ============================================

interface LazyImageOptions {
  src: string
  alt: string
  className?: string
  placeholder?: string
  threshold?: number
}

/**
 * Lazy load image when it enters viewport
 */
export function LazyImage({
  src,
  alt,
  className = '',
  placeholder,
  threshold = 0.1,
}: LazyImageOptions) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState(placeholder || '')

  useEffect(() => {
    const imgElement = imgRef.current
    if (!imgElement) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(imgElement)

    return () => {
      observer.disconnect()
    }
  }, [src, threshold])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
    />
  )
}
