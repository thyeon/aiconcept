'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react'

// ============================================
// App Shell - 3-Panel Layout
// Left: Case Navigator (280px)
// Center: Workspace (flexible)
// Right: Context & Audit (360px)
// ============================================

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  return (
    <div className={cn('flex h-[100dvh] overflow-hidden bg-bg-secondary', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            leftPanelOpen,
            setLeftPanelOpen,
            rightPanelOpen,
            setRightPanelOpen,
          })
        }
        return child
      })}
    </div>
  )
}

// ============================================
// Left Panel - Case Navigator
// ============================================

interface LeftPanelProps {
  leftPanelOpen: boolean
  setLeftPanelOpen: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function LeftPanel({
  leftPanelOpen,
  setLeftPanelOpen,
  children,
  className,
}: LeftPanelProps) {
  return (
    <>
      {/* Desktop Panel */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-bg-primary border-r border-border-light',
          'transition-all duration-300 ease-in-out',
          leftPanelOpen ? 'w-[280px] min-w-[280px]' : 'w-0 min-w-0 overflow-hidden',
          className
        )}
      >
        {children}
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        className={cn(
          'md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-bg-primary border border-border-light',
          'shadow-md hover:bg-bg-tertiary transition-colors'
        )}
        aria-label={leftPanelOpen ? 'Close left panel' : 'Open left panel'}
      >
        {leftPanelOpen ? (
          <PanelLeftOpen className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {leftPanelOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setLeftPanelOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'md:hidden fixed top-0 left-0 h-full z-50 bg-bg-primary border-r border-border-light',
          'transition-transform duration-300 ease-in-out',
          leftPanelOpen ? 'translate-x-0' : '-translate-x-full',
          'w-[280px] overflow-y-auto',
          className
        )}
      >
        {children}
      </aside>
    </>
  )
}

// ============================================
// Center Panel - Workspace
// ============================================

interface CenterPanelProps {
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  children: React.ReactNode
  className?: string
}

export function CenterPanel({
  leftPanelOpen,
  rightPanelOpen,
  children,
  className,
}: CenterPanelProps) {
  return (
    <main
      className={cn(
        'flex-1 min-w-[800px] overflow-y-auto',
        'bg-bg-secondary',
        'transition-all duration-300',
        className
      )}
    >
      {children}
    </main>
  )
}

// ============================================
// Right Panel - Context & Audit
// ============================================

interface RightPanelProps {
  rightPanelOpen: boolean
  setRightPanelOpen: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function RightPanel({
  rightPanelOpen,
  setRightPanelOpen,
  children,
  className,
}: RightPanelProps) {
  return (
    <>
      {/* Desktop Panel */}
      <aside
        className={cn(
          'hidden xl:flex flex-col bg-bg-primary border-l border-border-light',
          'transition-all duration-300 ease-in-out',
          rightPanelOpen ? 'w-[360px] min-w-[360px]' : 'w-0 min-w-0 overflow-hidden',
          className
        )}
      >
        {children}
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setRightPanelOpen(!rightPanelOpen)}
        className={cn(
          'hidden xl:flex fixed top-4 right-4 z-50 p-2 rounded-md bg-bg-primary border border-border-light',
          'shadow-md hover:bg-bg-tertiary transition-colors',
          rightPanelOpen && 'right-[364px]'
        )}
        aria-label={rightPanelOpen ? 'Close right panel' : 'Open right panel'}
      >
        {rightPanelOpen ? (
          <PanelRightClose className="h-5 w-5" />
        ) : (
          <PanelRightOpen className="h-5 w-5" />
        )}
      </button>

      {/* Mobile/Tablet Drawer */}
      <aside
        className={cn(
          'xl:hidden fixed top-0 right-0 h-full z-50 bg-bg-primary border-l border-border-light',
          'transition-transform duration-300 ease-in-out',
          rightPanelOpen ? 'translate-x-0' : 'translate-x-full',
          'w-[360px] max-w-full overflow-y-auto',
          className
        )}
      >
        {children}
      </aside>

      {/* Mobile/Tablet Overlay */}
      {rightPanelOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setRightPanelOpen(false)}
        />
      )}
    </>
  )
}

// ============================================
// Panel Header Component
// ============================================

interface PanelHeaderProps {
  children: React.ReactNode
  className?: string
}

export function PanelHeader({ children, className }: PanelHeaderProps) {
  return (
    <div className={cn('p-4 border-b border-border-light', className)}>
      {children}
    </div>
  )
}

// ============================================
// Panel Content Component
// ============================================

interface PanelContentProps {
  children: React.ReactNode
  className?: string
}

export function PanelContent({ children, className }: PanelContentProps) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-4', className)}>
      {children}
    </div>
  )
}
