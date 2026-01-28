'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Upload,
  FileCheck,
  FileSearch,
  Scale,
  GitBranch,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Settings,
} from 'lucide-react'

// ============================================
// Navigation Items
// ============================================

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  description?: string
  badge?: string | number
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview of all cases',
  },
  {
    title: 'Upload',
    href: '/upload',
    icon: Upload,
    description: 'Upload new documents',
  },
  {
    title: 'Quality Check',
    href: '/quality-check',
    icon: FileCheck,
    description: 'Verify document quality',
  },
  {
    title: 'Extraction',
    href: '/extraction',
    icon: FileSearch,
    description: 'AI data extraction',
  },
  {
    title: 'Rules Engine',
    href: '/rules',
    icon: Scale,
    description: 'Business rules evaluation',
  },
  {
    title: 'Decision',
    href: '/decision',
    icon: GitBranch,
    description: 'Final decisions',
  },
]

const bottomNavItems: NavItem[] = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

// ============================================
// Sidebar Navigation Component
// ============================================

interface SidebarNavProps {
  className?: string
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname()
  const sidebarCollapsed = useAppStore((state) => state.ui.sidebarCollapsed)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const user = useAppStore((state) => state.session.user)
  const logout = useAppStore((state) => state.logout)

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-bg-primary border-r border-border-light transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-border-light">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">AI Docs</h1>
              <p className="text-xs text-text-secondary">Processing Platform</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('h-8 w-8', sidebarCollapsed && 'mx-auto')}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 relative group',
                    sidebarCollapsed ? 'px-3 justify-center' : 'px-3'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-bg-tertiary border border-border-medium rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-text-secondary">{item.description}</p>
                      )}
                    </div>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        {!sidebarCollapsed && (
          <>
            <Separator className="my-4" />
            <div className="px-3">
              <p className="text-xs font-medium text-text-secondary mb-2">WORKFLOW STAGES</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span>1. Upload</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span>2. Quality Check</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>3. Extraction</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="h-2 w-2 rounded-full bg-border-medium" />
                  <span>4. Rules</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="h-2 w-2 rounded-full bg-border-medium" />
                  <span>5. Decision</span>
                </div>
              </div>
            </div>
          </>
        )}
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="border-t border-border-light p-2 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3',
                  sidebarCollapsed ? 'px-3 justify-center' : 'px-3'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.title}</span>}
              </Button>
            </Link>
          )
        })}

        {/* User Info */}
        {!sidebarCollapsed && user && (
          <>
            <Separator className="my-2" />
            <div className="px-3 py-2 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-text-secondary" />
                <span className="font-medium">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-text-secondary hover:text-error"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================
// Mobile Navigation (Bottom Bar)
// ============================================

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border-light md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'flex flex-col items-center gap-1 h-auto py-2 px-3',
                  isActive && 'text-primary'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.title}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
