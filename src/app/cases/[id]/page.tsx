'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useAppStore, useActiveCase } from '@/lib/store'
import { mockCases, mockTimelineEvents, mockProcessingLogs, mockDecisionTrace } from '@/lib/mock-data'
import { StatusBadge } from '@/components/ui/status-badge'
import { ConfidenceMeter } from '@/components/ui/confidence-meter'
import { SLATimer } from '@/components/ui/sla-timer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { WorkflowStepperWithProgress } from '@/components/features/workflow-stepper'
import { Timeline } from '@/components/features/timeline'
import { ProcessingLogs, type ProcessingLog } from '@/components/features/ai-logs'
import { DecisionTraceViewer, type DecisionTrace } from '@/components/features/decision-trace'
import { TimelineEvent } from '@/types'
import {
  Search,
  FileText,
  AlertCircle,
  CheckCircle2,
  User,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function CaseDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const activeCase = useActiveCase()
  const setActiveCaseId = useAppStore((state) => state.setActiveCaseId)
  const cases = useAppStore((state) => state.cases.allIds.map((id) => state.cases.byId[id]))
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>([])

  useEffect(() => {
    // Set active case
    setActiveCaseId(id)
  }, [id, setActiveCaseId])

  const caseData = activeCase || mockCases.find((c) => c.id === id)

  if (!caseData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Case not found</h2>
          <p className="text-text-secondary mb-4">The case you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Filter cases list
  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(c.status)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* LEFT PANEL - Case Navigator (300px) */}
      <aside className="w-[300px] flex-shrink-0 border-r border-border-light bg-bg-primary flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border-light">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Cases</h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              placeholder="Search cases..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-border-light rounded-md bg-bg-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 border-b border-border-light">
          <p className="text-xs font-medium text-text-secondary mb-2">STATUS</p>
          <div className="space-y-1">
            {['pending', 'in-progress', 'completed', 'rejected'].map((status) => (
              <label key={status} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={statusFilters.includes(status)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStatusFilters([...statusFilters, status])
                    } else {
                      setStatusFilters(statusFilters.filter((s) => s !== status))
                    }
                  }}
                />
                <span className="capitalize">{status.replace('-', ' ')} ({cases.filter((c) => c.status === status).length})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Case List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  c.id === caseData.id
                    ? 'bg-bg-secondary border border-border-medium'
                    : 'hover:bg-bg-tertiary'
                }`}
                onClick={() => router.push(`/cases/${c.id}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium line-clamp-2 flex-1">{c.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">{c.id}</span>
                  <StatusBadge status={c.status} size="sm" showIcon>{c.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* CENTER PANEL - Case Details */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-bg-secondary">
        <ScrollArea className="h-full min-h-0">
          <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Back Button */}
            <Link href="/">
              <Button variant="ghost" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>

            {/* Case Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{caseData.id}</h1>
                      <StatusBadge status={caseData.status}>{caseData.status}</StatusBadge>
                    </div>
                    <p className="text-text-secondary">{caseData.title}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <SLATimer deadline={caseData.slaDeadline} />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {caseData.id.includes('John') ? 'John Smith' :
                       caseData.id.includes('Jane') ? 'Jane Doe' :
                       caseData.id.includes('ABC') ? 'ABC Corp' :
                       caseData.id.includes('XYZ') ? 'XYZ Ltd' :
                       caseData.id.includes('Tech') ? 'Tech Startup' : 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1" suppressHydrationWarning>
                      <Calendar className="h-4 w-4" />
                      {new Date(caseData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href="/quality-check">
                      <Button variant="outline" size="sm">
                        Quality Check
                      </Button>
                    </Link>
                    <Link href="/extraction">
                      <Button variant="outline" size="sm">
                        Extraction
                      </Button>
                    </Link>
                    <Link href="/rules">
                      <Button variant="outline" size="sm">
                        Rules
                      </Button>
                    </Link>
                    <Link href="/decision">
                      <Button variant="outline" size="sm">
                        Decision
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkflowStepperWithProgress
                  currentStep={4}
                  showProgressBar={true}
                  showPercentage={true}
                  onStepClick={(step) => {
                    const stepRoutes = ['', '/upload', '/quality-check', '/extraction', '/rules', '/decision']
                    if (stepRoutes[step]) router.push(stepRoutes[step])
                  }}
                />
              </CardContent>
            </Card>

            {/* Extraction Data Preview */}
            {caseData.extractedData?.fields?.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Extracted Data</CardTitle>
                    <ConfidenceMeter value={caseData.extractedData.confidence} size="sm" showLabel />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {caseData.extractedData.fields.slice(0, 8).map((field) => (
                      <div key={field.id} className="space-y-1">
                        <p className="text-sm font-medium">{field.label}</p>
                        <p className="text-sm text-text-secondary">{String(field.value)}</p>
                        <ConfidenceMeter value={field.confidence} size="sm" variant="linear" />
                      </div>
                    ))}
                  </div>
                  <Link href="/extraction">
                    <Button variant="outline" className="mt-4 w-full">
                      View All Extraction Data
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Rules Results */}
            {caseData.ruleResults?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rules Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {caseData.ruleResults.map((rule) => (
                      <div key={rule.id} className="flex items-start gap-3 p-3 border border-border-light rounded-lg">
                        <StatusBadge status={rule.status} size="sm">{rule.status}</StatusBadge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{rule.name}</p>
                          <p className="text-xs text-text-secondary mt-1">{rule.reasoning}</p>
                          {rule.clause && (
                            <p className="text-xs text-primary mt-1">{rule.clause}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/rules">
                    <Button variant="outline" className="mt-4 w-full">
                      View All Rules
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* RIGHT PANEL - Context & Audit (400px) */}
      <aside className="w-[400px] border-l border-border-light bg-bg-primary flex flex-col">
        <Tabs defaultValue="timeline" className="h-full flex flex-col">
          {/* Tab Headers */}
          <div className="p-4 border-b border-border-light">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="trace">Trace</TabsTrigger>
            </TabsList>
          </div>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="flex-1 m-0 p-0 overflow-hidden">
            <Timeline
              events={caseData.timeline || mockTimelineEvents}
              onEventClick={(event) => console.log('Event clicked:', event)}
              showFilters={true}
            />
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="flex-1 m-0 p-0 overflow-hidden">
            <ProcessingLogs logs={mockProcessingLogs} />
          </TabsContent>

          {/* Trace Tab */}
          <TabsContent value="trace" className="flex-1 m-0 p-0 overflow-hidden">
            <DecisionTraceViewer
              trace={mockDecisionTrace as DecisionTrace}
              onNodeAction={(node) => console.log('Node action:', node)}
            />
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  )
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <CaseDetailContent id={(React.use(params)).id} />
    </Suspense>
  )
}
