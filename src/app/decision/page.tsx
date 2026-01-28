'use client'

import React, { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { WorkflowStepper } from '@/components/features/workflow-stepper'
import {
  DecisionSummaryCard,
  DecisionHistory,
  DecisionStats,
  DecisionBadge,
  type DecisionSummary,
  type DecisionType,
} from '@/components/features/decision-summary'
import { Shield, ArrowLeft, Home, CheckCircle } from 'lucide-react'
import { useWorkflowContext } from '@/hooks/useWorkflowContext'
import { toast } from 'sonner'

function DecisionPageContent() {
  const router = useRouter()
  const { caseId, activeCase, navigateToStep, updateCaseStatus, navigateToCase } = useWorkflowContext()
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null)

  // Mock decisions data
  const mockDecisions: DecisionSummary[] = [
    {
      id: 'decision-1',
      caseId: 'CLM-2024-08947',
      decisionType: 'approved' as DecisionType,
      confidence: 95,
      rationale: {
        title: 'Claim Approved',
        summary: 'All required documentation verified and policy coverage confirmed.',
        detailedExplanation:
          'The claim meets all eligibility requirements. Treatment dates fall within policy period, provider is in-network, and all pre-authorizations are valid.',
        keyFactors: [
          {
            factor: 'Policy Active',
            impact: 'positive',
            description: 'Policy was active on treatment date with no lapses',
          },
          {
            factor: 'In-Network Provider',
            impact: 'positive',
            description: 'Services rendered by verified in-network provider',
          },
          {
            factor: 'Pre-Authorization Valid',
            impact: 'positive',
            description: 'Required prior authorization obtained and valid',
          },
          {
            factor: 'Documentation Complete',
            impact: 'positive',
            description: 'All required medical records and receipts submitted',
          },
        ],
        policyReferences: [
          'Clause 3.2 - Coverage Period',
          'Clause 4.1 - Covered Services',
          'Clause 7.2 - Provider Network',
        ],
      },
      approvedAmount: 3280,
      payoutAmount: 3280,
      approvedAt: new Date(Date.now() - 86400000),
      approver: 'Sarah Johnson',
      approvalSteps: [
        {
          id: 'step-1',
          actor: 'AI System',
          role: 'Automated Processing',
          status: 'approved',
          timestamp: new Date(Date.now() - 180000000),
          comment: 'Initial validation passed',
        },
        {
          id: 'step-2',
          actor: 'AI System',
          role: 'Rules Engine',
          status: 'approved',
          timestamp: new Date(Date.now() - 179000000),
          comment: 'All business rules evaluated successfully',
        },
        {
          id: 'step-3',
          actor: 'Sarah Johnson',
          role: 'Senior Adjuster',
          status: 'approved',
          timestamp: new Date(Date.now() - 86400000),
          comment: 'Manual review completed - all documents verified',
        },
      ],
      exceptions: [],
      requiresManualReview: false,
      isFinal: true,
      createdAt: new Date(Date.now() - 180000000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: 'decision-2',
      caseId: 'CLM-2024-08956',
      decisionType: 'rejected' as DecisionType,
      confidence: 88,
      rationale: {
        title: 'Claim Rejected',
        summary: 'Pre-existing condition exclusion applies per policy terms.',
        detailedExplanation:
          'The claimed condition (Type 2 Diabetes) was diagnosed prior to the policy start date. According to clause 4.2 of the policy, pre-existing conditions are excluded from coverage for the first 12 months.',
        keyFactors: [
          {
            factor: 'Pre-Existing Condition',
            impact: 'negative',
            description: 'Condition diagnosed 15 months before policy start date',
          },
          {
            factor: 'Policy Exclusion Clause',
            impact: 'negative',
            description: 'Clause 4.2 excludes pre-existing conditions for 12 months',
          },
          {
            factor: 'No Overriding Coverage',
            impact: 'neutral',
            description: 'No additional riders or exceptions apply',
          },
        ],
        policyReferences: ['Clause 4.2 - Pre-Existing Conditions'],
      },
      approvalSteps: [
        {
          id: 'step-1',
          actor: 'AI System',
          role: 'Automated Processing',
          status: 'approved',
          timestamp: new Date(Date.now() - 180000000),
        },
        {
          id: 'step-2',
          actor: 'AI System',
          role: 'Rules Engine',
          status: 'rejected',
          timestamp: new Date(Date.now() - 179000000),
          comment: 'Pre-existing condition rule triggered',
        },
        {
          id: 'step-3',
          actor: 'Sarah Johnson',
          role: 'Senior Adjuster',
          status: 'rejected',
          timestamp: new Date(Date.now() - 172800000),
          comment: 'Confirmed exclusion applies per policy terms',
        },
      ],
      exceptions: [],
      requiresManualReview: false,
      isFinal: true,
      createdAt: new Date(Date.now() - 180000000),
      updatedAt: new Date(Date.now() - 172800000),
    },
    {
      id: 'decision-3',
      caseId: 'CLM-2024-08958',
      decisionType: 'partial' as DecisionType,
      confidence: 78,
      rationale: {
        title: 'Partial Approval',
        summary: 'Emergency room visit approved, but specialist consultation requires additional documentation.',
        detailedExplanation:
          'The emergency room visit is covered under the policy. However, the specialist consultation requires prior authorization which was not obtained. The ER portion is approved for $1,200.00, while the specialist consultation of $850.00 is pending.',
        keyFactors: [
          {
            factor: 'Emergency Services Covered',
            impact: 'positive',
            description: 'Emergency room visit falls under covered emergency services',
          },
          {
            factor: 'Missing Authorization',
            impact: 'negative',
            description: 'Specialist consultation (procedure 99213) requires prior authorization',
          },
          {
            factor: 'Partial Documentation',
            impact: 'neutral',
            description: 'ER documentation complete, specialist notes incomplete',
          },
        ],
        policyReferences: [
          'Clause 5.1 - Emergency Services',
          'Clause 6.3 - Prior Authorization',
        ],
      },
      approvedAmount: 1200,
      approvalSteps: [
        {
          id: 'step-1',
          actor: 'AI System',
          role: 'Automated Processing',
          status: 'approved',
          timestamp: new Date(Date.now() - 7200000),
        },
        {
          id: 'step-2',
          actor: 'AI System',
          role: 'Rules Engine',
          status: 'pending',
          timestamp: new Date(Date.now() - 3600000),
          comment: 'Partial match - some items require review',
        },
      ],
      exceptions: ['Missing prior authorization for specialist consultation'],
      requiresManualReview: true,
      isFinal: false,
      createdAt: new Date(Date.now() - 7200000),
      updatedAt: new Date(Date.now() - 3600000),
    },
  ]

  const selectedDecision = selectedDecisionId
    ? mockDecisions.find((d) => d.id === selectedDecisionId)
    : mockDecisions[0]

  // Handlers
  const handleApprove = () => {
    console.log('Approving decision:', selectedDecision?.id)
    updateCaseStatus('completed')
    toast.success('Decision approved successfully!', {
      description: 'The case has been marked as completed.',
    })
    // Navigate back to dashboard after a delay
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }

  const handleReject = () => {
    console.log('Rejecting decision:', selectedDecision?.id)
    updateCaseStatus('rejected')
    toast.error('Decision rejected', {
      description: 'The case has been marked as rejected.',
    })
    // Navigate back to dashboard after a delay
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }

  const handleRequestInfo = () => {
    console.log('Requesting info for decision:', selectedDecision?.id)
    toast.info('Information request sent', {
      description: 'The claimant will be notified to provide additional information.',
    })
  }

  const handleDownloadReport = () => {
    console.log('Downloading report for:', selectedDecisionId)
    toast.success('Report downloaded', {
      description: 'The decision report has been downloaded.',
    })
  }

  const handleViewHistory = () => {
    console.log('Viewing history for:', selectedDecisionId)
    if (caseId) {
      navigateToCase(caseId)
    }
  }

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* LEFT PANEL - Decision History (320px) */}
      <aside className="w-[320px] flex-shrink-0 border-r border-border-light bg-bg-primary flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Decisions</h2>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <DecisionStats decisions={mockDecisions} />
            <DecisionHistory
              decisions={mockDecisions}
              selectedDecisionId={selectedDecisionId || mockDecisions[0].id}
              onSelectDecision={setSelectedDecisionId}
            />
          </div>
        </ScrollArea>
      </aside>

      {/* CENTER PANEL - Decision Details */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-bg-secondary">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          <WorkflowStepper currentStep={6} showLabels showNumbers={false} />

          {selectedDecision && (
            <DecisionSummaryCard
              decision={selectedDecision}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestInfo={handleRequestInfo}
              onDownloadReport={handleDownloadReport}
              onViewHistory={handleViewHistory}
            />
          )}

          {/* Navigation */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigateToStep('rules', caseId || undefined)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Rules
                </Button>
                <div className="text-center">
                  <p className="text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Workflow Complete
                  </p>
                  <p className="text-xs text-text-secondary">
                    Review the decision and approve or reject
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

// Wrap with Suspense for useSearchParams
export default function DecisionPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
      <DecisionPageContent />
    </Suspense>
  )
}
