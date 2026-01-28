'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore, useFilteredCases } from '@/lib/store'
import { initializeMockData, mockCases } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { ConfidenceMeter } from '@/components/ui/confidence-meter'
import { SLATimer } from '@/components/ui/sla-timer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Upload,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const cases = useFilteredCases()
  const filters = useAppStore((state) => state.cases.filters)
  const setCaseFilters = useAppStore((state) => state.setCaseFilters)

  // Initialize mock data on mount
  useEffect(() => {
    initializeMockData()
  }, [])

  // Calculate stats
  const stats = {
    total: cases.length,
    pending: cases.filter((c) => c.status === 'pending').length,
    inProgress: cases.filter((c) => c.status === 'in-progress').length,
    completed: cases.filter((c) => c.status === 'completed').length,
    rejected: cases.filter((c) => c.status === 'rejected').length,
  }

  const handleStatusFilterChange = (status: string, checked: boolean) => {
    const currentFilters = filters.status || []
    const updatedFilters = checked
      ? [...currentFilters, status as any]
      : currentFilters.filter((s) => s !== status)
    setCaseFilters({ status: updatedFilters })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaseFilters({ searchQuery: e.target.value })
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-bg-secondary">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-secondary mt-1">
              Monitor and manage all document processing cases
            </p>
          </div>
          <Link href="/upload">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              New Case
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Total Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <span className="text-2xl font-bold">{stats.pending}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-info" />
                <span className="text-2xl font-bold">{stats.inProgress}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">{stats.completed}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-error" />
                <span className="text-2xl font-bold">{stats.rejected}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cases List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Cases</CardTitle>

              {/* Search */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Search cases..."
                  className="pl-9"
                  value={filters.searchQuery || ''}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Filters */}
            <div className="px-6 py-3 border-b border-border-light flex items-center gap-4">
              <span className="text-sm font-medium text-text-secondary">Status:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={filters.status?.includes('pending')}
                    onCheckedChange={(checked) =>
                      handleStatusFilterChange('pending', checked === true)
                    }
                  />
                  Pending ({stats.pending})
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={filters.status?.includes('in-progress')}
                    onCheckedChange={(checked) =>
                      handleStatusFilterChange('in-progress', checked === true)
                    }
                  />
                  In Progress ({stats.inProgress})
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={filters.status?.includes('completed')}
                    onCheckedChange={(checked) =>
                      handleStatusFilterChange('completed', checked === true)
                    }
                  />
                  Completed ({stats.completed})
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={filters.status?.includes('rejected')}
                    onCheckedChange={(checked) =>
                      handleStatusFilterChange('rejected', checked === true)
                    }
                  />
                  Rejected ({stats.rejected})
                </label>
              </div>
            </div>

            {/* Cases */}
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-border-light">
                {cases.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      No cases found
                    </h3>
                    <p className="text-text-secondary mb-4">
                      {filters.searchQuery || filters.status?.length
                        ? 'Try adjusting your filters'
                        : 'Get started by uploading your first case'}
                    </p>
                    {!filters.searchQuery && !filters.status?.length && (
                      <Link href="/upload">
                        <Button>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Documents
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  cases.map((cas) => (
                    <div
                      key={cas.id}
                      className="p-4 hover:bg-bg-tertiary transition-colors cursor-pointer"
                      onClick={() => router.push(`/cases/${cas.id}`)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-text-primary">{cas.title}</h3>
                            <StatusBadge status={cas.status} size="sm" showIcon>{cas.status}</StatusBadge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <span className="font-mono">{cas.id}</span>
                            <span>•</span>
                            <span className="capitalize">{cas.type}</span>
                            <span>•</span>
                            <span suppressHydrationWarning>
                              {new Date(cas.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span>•</span>
                            <span>{cas.documents.length} documents</span>
                          </div>

                          {/* Progress for in-progress cases */}
                          {cas.status === 'in-progress' && cas.extractedData.confidence > 0 && (
                            <div className="flex items-center gap-4">
                              <ConfidenceMeter
                                value={cas.extractedData.confidence}
                                size="sm"
                                variant="linear"
                                showLabel
                              />
                              <span className="text-xs text-text-secondary">
                                {cas.extractedData.fields.length} fields extracted
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <SLATimer deadline={cas.slaDeadline} size="sm" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary-dark"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/cases/${cas.id}`)
                            }}
                          >
                            View
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/upload">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Upload Documents</h3>
                    <p className="text-sm text-text-secondary">
                      Start a new case
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/quality-check">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Quality Check</h3>
                    <p className="text-sm text-text-secondary">
                      Verify document quality
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/extraction">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">View Extractions</h3>
                    <p className="text-sm text-text-secondary">
                      Review AI results
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
