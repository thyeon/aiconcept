// ============================================
// Accessibility Utilities & Components
// ============================================

import { useEffect, useRef, type RefObject } from 'react'

// ============================================
// Focus Management
// ============================================

/**
 * Trap focus within a container (for modals, dialogs)
 * @param containerRef - Ref to container element
 * @param enabled - Whether focus trap is active
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)

    // Focus first element on mount
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTab)
    }
  }, [enabled, containerRef])
}

/**
 * Restore focus to element after unmount
 * @param element - Element to restore focus to
 */
export function useFocusRestoration(element: HTMLElement | null): void {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!element) return

    // Store current focused element
    previousFocusRef.current = document.activeElement as HTMLElement

    // Focus new element
    element.focus()

    return () => {
      // Restore focus when component unmounts
      previousFocusRef.current?.focus()
    }
  }, [element])
}

/**
 * Manage focus for custom components
 * @param options - Focus options
 */
export function useFocusManager(options: {
  autoFocus?: boolean
  restoreFocus?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref.current) return

    if (options.autoFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement
      ref.current.focus()
    }

    return () => {
      if (options.restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [options.autoFocus, options.restoreFocus])

  return ref
}

// ============================================
// Keyboard Navigation
// ============================================

interface KeyboardNavigationOptions {
  onEnter?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onSpace?: () => void
}

/**
 * Handle keyboard navigation
 * @param options - Key handlers
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          options.onEnter?.()
          break
        case 'Escape':
          options.onEscape?.()
          break
        case 'ArrowUp':
          options.onArrowUp?.()
          break
        case 'ArrowDown':
          options.onArrowDown?.()
          break
        case 'ArrowLeft':
          options.onArrowLeft?.()
          break
        case 'ArrowRight':
          options.onArrowRight?.()
          break
        case ' ':
          options.onSpace?.()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [options])
}

// ============================================
// ARIA Attributes Helper
// ============================================

/**
 * Generate ARIA attributes for common patterns
 */
export const aria = {
  /**
   * ARIA for live regions (announcements to screen readers)
   */
  live: (politeness: 'polite' | 'assertive' = 'polite') => ({
    role: 'status' as const,
    'aria-live': politeness,
  }),

  /**
   * ARIA for modal dialogs
   */
  modal: (label: string, describedBy?: string) => ({
    role: 'dialog' as const,
    'aria-modal': true,
    'aria-labelledby': label,
    'aria-describedby': describedBy,
  }),

  /**
   * ARIA for alerts
   */
  alert: (message: string) => ({
    role: 'alert' as const,
    'aria-live': 'assertive' as const,
    children: message,
  }),

  /**
   * ARIA for progress bar
   */
  progressbar: (value: number, max: number = 100, label?: string) => ({
    role: 'progressbar' as const,
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-label': label,
  }),

  /**
   * ARIA for switch/toggle
   */
  switch: (checked: boolean, label: string) => ({
    role: 'switch' as const,
    'aria-checked': checked,
    'aria-label': label,
  }),

  /**
   * ARIA for expandable/collapsible
   */
  expanded: (expanded: boolean, controls: string, label?: string) => ({
    'aria-expanded': expanded,
    'aria-controls': controls,
    'aria-label': label,
  }),

  /**
   * ARIA for pressed state (toggle buttons)
   */
  pressed: (pressed: boolean, label?: string) => ({
    'aria-pressed': pressed,
    'aria-label': label,
  }),

  /**
   * ARIA for disabled state
   */
  disabled: (disabled: boolean) => ({
    'aria-disabled': disabled,
  }),

  /**
   * ARIA for hidden elements
   */
  hidden: (hidden: boolean) => ({
    'aria-hidden': hidden,
  }),
}

// ============================================
// Screen Reader Only Text
// ============================================

/**
 * Text that's visually hidden but accessible to screen readers
 */
export function SrOnly({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }}
    >
      {children}
    </span>
  )
}

/**
 * Remove content from accessibility tree
 */
export function HiddenFromScreenReaders({ children }: { children: React.ReactNode }) {
  return <span aria-hidden="true">{children}</span>
}

// ============================================
// Skip Links
// ============================================

/**
 * Skip to main content link (for keyboard users)
 */
export function SkipLinks() {
  return (
    <>
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: -40,
          left: 0,
          background: '#0369A1',
          color: 'white',
          padding: '8px',
          textDecoration: 'none',
          zIndex: 9999,
        }}
        onFocus={(e) => {
          (e.target as HTMLAnchorElement).style.top = '0'
        }}
        onBlur={(e) => {
          (e.target as HTMLAnchorElement).style.top = '-40px'
        }}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        style={{
          position: 'absolute',
          top: -40,
          left: 100,
          background: '#0369A1',
          color: 'white',
          padding: '8px',
          textDecoration: 'none',
          zIndex: 9999,
        }}
        onFocus={(e) => {
          (e.target as HTMLAnchorElement).style.top = '0'
        }}
        onBlur={(e) => {
          (e.target as HTMLAnchorElement).style.top = '-40px'
        }}
      >
        Skip to navigation
      </a>
    </>
  )
}

// ============================================
// Reduced Motion Detection
// ============================================

/**
 * Detect if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}

/**
 * Apply reduced motion to animations
 * @param duration - Normal animation duration
 */
export function useReducedMotionDuration(duration: number): number {
  const prefersReducedMotion = useReducedMotion()

  return prefersReducedMotion ? 0.01 : duration
}

// ============================================
// Color Contrast Utilities
// ============================================

/**
 * Calculate luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [R, G, B] = [r, g, b].map((val) => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  const luminance1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const luminance2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast meets WCAG AA standard (4.5:1 for normal text)
 */
export function meetsWCAG_AA(foreground: string, background: string, largeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background)
  return largeText ? ratio >= 3 : ratio >= 4.5
}

/**
 * Check if contrast meets WCAG AAA standard (7:1 for normal text)
 */
export function meetsWCAG_AAA(foreground: string, background: string, largeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background)
  return largeText ? ratio >= 4.5 : ratio >= 7
}

// ============================================
// Focus Ring Utilities
// ============================================

/**
 * Add visible focus indicator to elements
 */
export const focusRing = {
  base: 'focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  primary: 'focus-visible:ring-primary',
  secondary: 'focus-visible:ring-secondary',
  error: 'focus-visible:ring-destructive',
}

// ============================================
// Form Accessibility
// ============================================

/**
 * Generate accessible form field props
 */
export function accessibleField(id: string, label: string, required?: boolean, error?: string) {
  return {
    id,
    label,
    required,
    error,
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : `${id}-description`,
  }
}

/**
 * Generate accessible button props
 */
export function accessibleButton(label: string, pressed?: boolean, disabled?: boolean) {
  return {
    'aria-label': label,
    'aria-pressed': pressed,
    'aria-disabled': disabled,
    role: 'button',
  }
}

// ============================================
// Heading Hierarchy
// ============================================

/**
 * Get heading level for component based on context
 * @param level - Current heading level (1-6)
 * @param offset - Offset to add (for nested components)
 */
export function getHeadingLevel(level: number, offset: number = 0): number {
  const newLevel = level + offset
  return Math.min(Math.max(newLevel, 1), 6)
}

// ============================================
// Export All Utilities
// ============================================

import { useState } from 'react'
