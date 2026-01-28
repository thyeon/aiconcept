'use client'

import React, { useState, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { WorkflowStepper } from '@/components/features/workflow-stepper'
import {
  RulesEnginePanel,
  CompactRuleList,
  type RuleResult,
  type RuleCategory,
} from '@/components/features/rules-engine'
import { FileText, Shield, AlertTriangle, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react'
import { useWorkflowContext } from '@/hooks/useWorkflowContext'

function RulesEnginePageContent() {
  const { caseId, activeCase, navigateToStep } = useWorkflowContext()
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())

  // Mock rules data
  const mockRules: RuleResult[] = [
    // Eligibility Rules
    {
      id: 'rule-1',
      name: 'Policy Term Validation',
      category: 'eligibility' as const,
      status: 'pass' as const,
      inputs: [
        { field: 'treatmentDate', value: 'Jan 15, 2024', displayName: 'Treatment Date' },
        { field: 'policyStartDate', value: 'Jan 1, 2024', displayName: 'Policy Start' },
        { field: 'policyEndDate', value: 'Dec 31, 2024', displayName: 'Policy End' },
      ],
      output: 'Treatment within policy term',
      reasoning: 'The treatment date (Jan 15, 2024) falls within the active policy period (Jan 1, 2024 - Dec 31, 2024). No policy lapse detected.',
      policyClause: 'Clause 3.2 - Coverage Period',
      confidence: 0.98,
      evaluatedAt: new Date(Date.now() - 5000),
    },
    {
      id: 'rule-2',
      name: 'Coverage Type Check',
      category: 'eligibility' as const,
      status: 'pass' as const,
      inputs: [
        { field: 'treatmentType', value: 'Emergency Room', displayName: 'Treatment Type' },
        { field: 'planType', value: 'Premium', displayName: 'Plan Type' },
      ],
      output: 'Covered under policy',
      reasoning: 'Emergency room visits are covered under the Premium plan. No exclusions apply.',
      policyClause: 'Clause 4.1 - Covered Services',
      confidence: 0.95,
      evaluatedAt: new Date(Date.now() - 4500),
    },

    // Validation Rules
    {
      id: 'rule-3',
      name: 'Pre-Existing Condition',
      category: 'validation' as const,
      status: 'fail' as const,
      inputs: [
        { field: 'diagnosisCode', value: 'E11', displayName: 'Diagnosis' },
        { field: 'patientHistory', value: 'Type 2 Diabetes', displayName: 'History' },
      ],
      output: 'Exclusion applied - Clause 4.2',
      reasoning: 'The diagnosis code E11 (Type 2 Diabetes) is listed as a pre-existing condition exclusion in the policy. This condition was diagnosed prior to policy effective date.',
      policyClause: 'Clause 4.2 - Pre-Existing Exclusions',
      confidence: 0.92,
      evaluatedAt: new Date(Date.now() - 4000),
    },
    {
      id: 'rule-4',
      name: 'Waiting Period',
      category: 'validation' as const,
      status: 'pass' as const,
      inputs: [
        { field: 'policyEffectiveDate', value: 'Jan 1, 2024', displayName: 'Effective Date' },
        { field: 'claimDate', value: 'Jan 15, 2024', displayName: 'Claim Date' },
      ],
      output: 'Waiting period satisfied',
      reasoning: '30-day waiting period has elapsed. Policy effective: Jan 1, 2024. Claim filed: Jan 15, 2024.',
      policyClause: 'Clause 5.1 - Waiting Period',
      confidence: 0.96,
      evaluatedAt: new Date(Date.now() - 3500),
    },

    // Compliance Rules
    {
      id: 'rule-5',
      name: 'Authorization Required',
      category: 'compliance' as const,
      status: 'warning' as const,
      inputs: [
        { field: 'procedureCode', value: '99213', displayName: 'Procedure Code' },
        { field: 'authorization', value: 'Not on file', displayName: 'Prior Auth' },
      ],
      output: 'Authorization recommended',
      reasoning: 'Procedure code 99213 (Emergency room visit) typically requires prior authorization. However, emergency exceptions may apply. Manual review recommended.',
      policyClause: 'Clause 6.3 - Prior Authorization',
      confidence: 0.75,
      evaluatedAt: new Date(Date.now() - 3000),
    },
    {
      id: 'rule-6',
      name: 'Network Provider',
      category: 'compliance' as const,
      status: 'pass' as const,
      inputs: [
        { field: 'providerNPI', value: '1234567890', displayName: 'Provider NPI' },
        { field: 'networkStatus', value: 'In-Network', displayName: 'Status' },
      ],
      output: 'In-network provider confirmed',
      reasoning: 'Provider City Medical Center (NPI: 1234567890) is verified as in-network for the Premium plan.',
      policyClause: 'Clause 7.2 - Provider Network',
      confidence: 0.94,
      evaluatedAt: new Date(Date.now() - 2500),
    },

    // Calculation Rules
    {
      id: 'rule-7',
      name: 'Allowable Amount',
      category: 'calculation' as const,
      status: 'pass' as const,
      inputs: [
        { field: 'billedAmount', value: '$3,280.00', displayName: 'Billed' },
        { field: 'allowedAmount', value: '$2,950.00', displayName: 'Allowed' },
        { field: 'negotiatedRate', value: '85%', displayName: 'Rate' },
      ],
      output: '$2,507.50 allowable',
      reasoning: 'Calculated allowable amount: $3,280.00 × 85% = $2,788.00. Less $50 copay = $2,738.00. Less $230.50 deductible = $2,507.50.',
      policyClause: 'Clause 8.1 - Fee Schedule',
      confidence: 0.99,
      evaluatedAt: new Date(Date.now() - 2000),
    },
    {
      id: 'rule-8',
      name: 'Deductible Application',
      category: 'calculation' as const,
      status: 'pass' as const,
      inputs: [
        { field: 'accumulatedDeductible', value: '$450.00', displayName: 'YTD' },
        { field: 'annualDeductible', value: '$500.00', displayName: 'Annual' },
        { field: 'claimAmount', value: '$2,738.00', displayName: 'Claim' },
      ],
      output: '$50.00 remaining',
      reasoning: 'Year-to-date deductible: $450.00 of $500.00. Claim amount $2,738.00 × 10% = $273.80 deductible applied. Remaining deductible: $50.00.',
      policyClause: 'Clause 8.2 - Deductible',
      confidence: 0.97,
      evaluatedAt: new Date(Date.now() - 1000),
    },
  ]

  const handleReplayAll = async () => {
    console.log('Replaying all rules...')
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log('All rules replayed')
  }

  const handleReplayCategory = async (category: RuleCategory) => {
    console.log('Replaying category:', category)
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  const handleReplayRule = async (ruleId: string) => {
    console.log('Replaying rule:', ruleId)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* LEFT PANEL - Rules List (320px) */}
      <aside className="w-[320px] flex-shrink-0 border-r border-border-light bg-bg-primary flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Rules Engine</h2>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
              {/* Summary */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary-light/5">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Total Rules</p>
                      <p className="text-2xl font-bold text-primary">
                        {mockRules.length}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-success">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        {mockRules.filter((r) => r.status === 'pass').length} Pass
                      </span>
                      <span className="flex items-center gap-1 text-error">
                        <div className="w-2 h-2 rounded-full bg-error" />
                        {mockRules.filter((r) => r.status === 'fail').length} Fail
                      </span>
                      <span className="flex items-center gap-1 text-warning">
                        <div className="w-2 h-2 rounded-full bg-warning" />
                        {mockRules.filter((r) => r.status === 'warning').length} Warning
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compact Rules List */}
              <div>
                <p className="text-xs font-medium text-text-secondary px-1 mb-2">
                  ALL RULES
                </p>
                <CompactRuleList
                  rules={mockRules}
                  onRuleClick={(rule) => {
                    setExpandedRules((prev) => {
                      const next = new Set(prev)
                      if (next.has(rule.id)) {
                        next.delete(rule.id)
                      } else {
                        next.add(rule.id)
                      }
                      return next
                    })
                  }}
                />
              </div>

              {/* Critical Alert */}
              {mockRules.filter((r) => r.status === 'fail').length > 0 && (
                <Card className="border-error bg-error/5">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-error mb-1">
                          Rules Failed
                        </p>
                        <p className="text-xs text-text-secondary">
                          {mockRules.filter((r) => r.status === 'fail').length} rule(s) failed
                          validation. Review required before approval.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
      </aside>

      {/* CENTER PANEL - Rules Detail */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-bg-secondary">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* Workflow Stepper */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflow Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowStepper currentStep={5} showLabels showNumbers={false} />
            </CardContent>
          </Card>

          {/* Rules Engine Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Rules Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <RulesEnginePanel
                rules={mockRules}
                onReplayAll={handleReplayAll}
                onReplayCategory={handleReplayCategory}
                onReplayRule={handleReplayRule}
              />
            </CardContent>
          </Card>

          {/* Features Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rules Engine Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border-light space-y-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    <h4 className="text-sm font-semibold">Rules Replay</h4>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Re-evaluate all rules after field edits. Automatically triggered when
                    extracted data is modified.
                  </p>
                  <ul className="text-xs text-text-secondary space-y-1 mt-2">
                    <li>• Replay all rules globally</li>
                    <li>• Replay by category</li>
                    <li>• Replay individual rules</li>
                    <li>• Animated replay indicators</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border border-border-light space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h4 className="text-sm font-semibold">Policy References</h4>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Every rule includes direct links to policy clauses for transparency and
                    audit compliance.
                  </p>
                  <ul className="text-xs text-text-secondary space-y-1 mt-2">
                    <li>• Clause numbers displayed</li>
                    <li>• Clickable policy links</li>
                    <li>• Full reasoning explanations</li>
                    <li>• Confidence scores</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border border-border-light space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h4 className="text-sm font-semibold">Status Tracking</h4>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Clear visual indicators for rule status with color-coded badges
                    and icons.
                  </p>
                  <ul className="text-xs text-text-secondary space-y-1 mt-2">
                    <li>• ✅ Pass - Green</li>
                    <li>• ❌ Fail - Red</li>
                    <li>• ⚠️ Warning - Yellow</li>
                    <li>• ⊘ Skipped - Gray</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border border-border-light space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    <h4 className="text-sm font-semibold">Input Field Display</h4>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Each rule shows the input fields used in evaluation with actual values
                    from extracted data.
                  </p>
                  <ul className="text-xs text-text-secondary space-y-1 mt-2">
                    <li>• Field labels and values</li>
                    <li>• Output results</li>
                    <li>• Detailed reasoning</li>
                    <li>• Confidence scores</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigateToStep('extraction', caseId || undefined)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Extraction
                </Button>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {mockRules.filter(r => r.status === 'pass').length} of {mockRules.length} rules passed
                  </p>
                  <p className="text-xs text-text-secondary">
                    {mockRules.filter(r => r.status === 'fail').length > 0
                      ? `${mockRules.filter(r => r.status === 'fail').length} failed - review required`
                      : 'Ready to generate decision'}
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => navigateToStep('decision', caseId || undefined)}
                  className="gap-2"
                >
                  Continue to Decision
                  <ArrowRight className="h-4 w-4" />
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
export default function RulesEnginePage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
      <RulesEnginePageContent />
    </Suspense>
  )
}
