// ============================================
// Shared Mock Data
// ============================================

import type {
  Case,
  Document,
  ExtractedData,
  ExtractedField,
  RuleResult,
  Decision,
  TimelineEvent,
  ProcessingState,
  ProcessingStage,
} from '@/types'

// Re-export types from components for convenience
export type { ProcessingLog } from '@/components/features/ai-logs'
export type { DecisionTrace } from '@/components/features/decision-trace'

// ============================================
// Mock Documents
// ============================================

export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'medical_report.pdf',
    type: 'application/pdf',
    size: 2458624,
    url: '/documents/doc-1.pdf',
    thumbnail: '/thumbnails/doc-1.png',
    uploadedAt: '2024-01-27T14:32:00Z',
    qualityScore: 96,
    qualityChecks: [
      { name: 'Resolution', status: 'pass', score: 100, detail: '300 DPI - Excellent' },
      { name: 'Clarity', status: 'pass', score: 95, detail: 'Text clearly readable' },
      { name: 'Completeness', status: 'pass', score: 94, detail: 'All pages present' },
      { name: 'Orientation', status: 'pass', score: 98, detail: 'Correct rotation' },
      { name: 'Noise', status: 'pass', score: 92, detail: 'Minimal artifacts' },
    ],
    classification: {
      type: 'medical',
      confidence: 0.96,
      manuallyOverridden: false,
    },
    extractionStatus: 'complete',
  },
  {
    id: 'doc-2',
    name: 'policy_document.pdf',
    type: 'application/pdf',
    size: 1890432,
    url: '/documents/doc-2.pdf',
    thumbnail: '/thumbnails/doc-2.png',
    uploadedAt: '2024-01-27T14:32:05Z',
    qualityScore: 98,
    qualityChecks: [
      { name: 'Resolution', status: 'pass', score: 100, detail: '300 DPI - Excellent' },
      { name: 'Clarity', status: 'pass', score: 98, detail: 'Text clearly readable' },
      { name: 'Completeness', status: 'pass', score: 96, detail: 'All pages present' },
      { name: 'Orientation', status: 'pass', score: 99, detail: 'Correct rotation' },
      { name: 'Noise', status: 'pass', score: 95, detail: 'No artifacts detected' },
    ],
    classification: {
      type: 'policy',
      confidence: 0.98,
      manuallyOverridden: false,
    },
    extractionStatus: 'complete',
  },
  {
    id: 'doc-3',
    name: 'receipt.jpg',
    type: 'image/jpeg',
    size: 524288,
    url: '/documents/doc-3.jpg',
    thumbnail: '/thumbnails/doc-3.png',
    uploadedAt: '2024-01-27T14:32:10Z',
    qualityScore: 89,
    qualityChecks: [
      { name: 'Resolution', status: 'pass', score: 90, detail: '250 DPI - Good' },
      { name: 'Clarity', status: 'warning', score: 85, detail: 'Slightly blurred text' },
      { name: 'Completeness', status: 'pass', score: 92, detail: 'Full document visible' },
      { name: 'Orientation', status: 'pass', score: 95, detail: 'Correct rotation' },
      { name: 'Noise', status: 'pass', score: 88, detail: 'Minor artifacts' },
    ],
    classification: {
      type: 'receipt',
      confidence: 0.89,
      manuallyOverridden: false,
    },
    extractionStatus: 'complete',
  },
]

// ============================================
// Mock Extracted Data
// ============================================

export const mockExtractedData: ExtractedData = {
  fields: [
    {
      id: 'field-1',
      name: 'claimantName',
      label: 'Claimant Name',
      value: 'John A. Smith',
      confidence: 98,
      source: { documentId: 'doc-1', page: 1, region: [100, 200, 300, 50] },
      status: 'auto-accepted',
      manuallyEdited: false,
    },
    {
      id: 'field-2',
      name: 'claimAmount',
      label: 'Claim Amount',
      value: 3280,
      confidence: 92,
      source: { documentId: 'doc-3', page: 1, region: [150, 400, 200, 40] },
      status: 'auto-accepted',
      manuallyEdited: true,
      originalValue: 3500,
      editedBy: 'Sarah Chen',
      editedAt: '2024-01-27T14:42:30Z',
    },
    {
      id: 'field-3',
      name: 'treatmentDate',
      label: 'Treatment Date',
      value: '2024-01-15',
      confidence: 96,
      source: { documentId: 'doc-1', page: 1, region: [100, 300, 250, 45] },
      status: 'auto-accepted',
      manuallyEdited: false,
    },
    {
      id: 'field-4',
      name: 'provider',
      label: 'Healthcare Provider',
      value: 'City Medical Center',
      confidence: 94,
      source: { documentId: 'doc-1', page: 1, region: [100, 350, 350, 50] },
      status: 'auto-accepted',
      manuallyEdited: false,
    },
    {
      id: 'field-5',
      name: 'diagnosisCode',
      label: 'Diagnosis Code',
      value: 'E11',
      confidence: 88,
      source: { documentId: 'doc-1', page: 2, region: [100, 250, 150, 40] },
      status: 'review-suggested',
      manuallyEdited: false,
    },
    {
      id: 'field-6',
      name: 'policyNumber',
      label: 'Policy Number',
      value: 'POL-2024-08947',
      confidence: 99,
      source: { documentId: 'doc-2', page: 1, region: [200, 150, 200, 35] },
      status: 'auto-accepted',
      manuallyEdited: false,
    },
    {
      id: 'field-7',
      name: 'policyStartDate',
      label: 'Policy Start Date',
      value: '2023-06-01',
      confidence: 97,
      source: { documentId: 'doc-2', page: 1, region: [200, 200, 180, 40] },
      status: 'auto-accepted',
      manuallyEdited: false,
    },
    {
      id: 'field-8',
      name: 'policyEndDate',
      label: 'Policy End Date',
      value: '2024-06-01',
      confidence: 97,
      source: { documentId: 'doc-2', page: 1, region: [200, 250, 180, 40] },
      status: 'auto-accepted',
      manuallyEdited: false,
    },
  ],
  confidence: 87,
  extractionTime: 45000,
}

// ============================================
// Mock Rule Results
// ============================================

export const mockRuleResults: RuleResult[] = [
  {
    id: 'rule-1',
    name: 'Policy Term Validation',
    category: 'Coverage Eligibility',
    status: 'pass',
    inputFields: {
      treatmentDate: '2024-01-15',
      policyStart: '2023-06-01',
      policyEnd: '2024-06-01',
    },
    reasoning: 'Treatment date (2024-01-15) falls within policy term (2023-06-01 to 2024-06-01)',
    clause: 'Clause 3.1 - Coverage Period',
    canOverride: false,
  },
  {
    id: 'rule-2',
    name: 'Pre-Existing Condition',
    category: 'Coverage Eligibility',
    status: 'fail',
    inputFields: {
      conditionCode: 'E11',
      diagnosisDate: '2022-03-10',
      policyStartDate: '2023-06-01',
    },
    reasoning: 'Condition E11 (Type 2 Diabetes) was diagnosed before policy start date (2023-06-01). Exclusion clause 4.2 applies.',
    clause: 'Clause 4.2 - Pre-Existing Conditions',
    canOverride: true,
  },
  {
    id: 'rule-3',
    name: 'Documentation Completeness',
    category: 'Documentation Completeness',
    status: 'pass',
    inputFields: {
      documents: ['medical-report', 'receipts', 'policy-copy', 'id-proof'],
      required: ['medical-report', 'receipts', 'policy-copy', 'id-proof'],
    },
    reasoning: 'All required documents have been submitted',
    canOverride: false,
  },
  {
    id: 'rule-4',
    name: 'Amount Validation',
    category: 'Amount Validation',
    status: 'pass',
    inputFields: {
      claimedAmount: 3280,
      policyLimit: 10000,
      remainingCoverage: 7500,
    },
    reasoning: 'Claimed amount is within policy limits',
    canOverride: false,
  },
  {
    id: 'rule-5',
    name: 'Fraud Detection',
    category: 'Fraud Detection',
    status: 'skipped',
    inputFields: {
      claimAmount: 3280,
      previousClaims: 0,
    },
    reasoning: 'Fraud detection skipped for first-time claimant with clean history',
    canOverride: false,
  },
  {
    id: 'rule-6',
    name: 'Waiting Period Compliance',
    category: 'Compliance Requirements',
    status: 'pass',
    inputFields: {
      policyStartDate: '2023-06-01',
      treatmentDate: '2024-01-15',
      waitingPeriodDays: 30,
    },
    reasoning: 'Treatment date is more than 30 days after policy start date',
    canOverride: false,
  },
]

// ============================================
// Mock Decision
// ============================================

export const mockDecision: Decision = {
  id: 'decision-1',
  status: 'partial',
  approvedAmount: 2847.5,
  claimAmount: 3280,
  deduction: 432.5,
  deductionReason: '15% deduction applied for pre-existing condition (E11) per clause 4.2',
  confidence: 87,
  rationale: 'Based on the analysis of submitted documents and business rules, the claim is partially approved. The treatment falls within the policy term, but a pre-existing condition exclusion applies. All required documentation is present and the claimed amount is within policy limits.',
  approvalWorkflow: [
    {
      name: 'System Validation',
      status: 'complete',
      actor: 'System',
      time: '2024-01-27T14:39:35Z',
    },
    {
      name: 'Analyst Review',
      status: 'active',
      actor: 'Sarah Chen',
      time: '2024-01-27T14:40:00Z',
    },
    {
      name: 'Manager Approval',
      status: 'pending',
      actor: 'Pending',
      time: '',
    },
  ],
  createdAt: '2024-01-27T14:39:35Z',
  createdBy: 'System',
}

// ============================================
// Mock Timeline Events
// ============================================

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'document-issued',
    date: '2024-01-15T09:00:00Z',
    title: 'Medical Treatment',
    detail: 'Dr. Sarah Johnson, City Medical Center',
    link: '/documents/doc-1',
    metadata: { provider: 'City Medical Center', cost: 350 },
  },
  {
    id: '2',
    type: 'upload',
    date: '2024-01-27T14:32:00Z',
    title: 'Documents Uploaded',
    detail: '5 files uploaded by John Smith',
    link: '/documents',
    metadata: { actor: 'John Smith', fileCount: 5 },
  },
  {
    id: '3',
    type: 'quality-check',
    date: '2024-01-27T14:35:22Z',
    title: 'Quality Check Passed',
    detail: 'Score: 96% - All documents acceptable',
    metadata: { qualityScore: 96, documentsChecked: 5 },
  },
  {
    id: '4',
    type: 'processing',
    date: '2024-01-27T14:36:15Z',
    title: 'AI Extraction Completed',
    detail: '47 fields extracted • 3 require review',
    link: '/extraction',
    metadata: { fieldsExtracted: 47, fieldsNeedingReview: 3, duration: 45000 },
  },
  {
    id: '5',
    type: 'rules',
    date: '2024-01-27T14:38:45Z',
    title: 'Business Rules Evaluated',
    detail: '12 rules • 10 passed, 1 failed, 1 warning',
    link: '/rules',
    metadata: { totalRules: 12, passed: 10, failed: 1, warnings: 1 },
  },
  {
    id: '6',
    type: 'field-update',
    date: '2024-01-27T14:42:30Z',
    title: 'Claim Amount Updated',
    detail: 'Updated from $3,500.00 to $3,280.00',
    metadata: {
      field: 'claimAmount',
      oldValue: 3500,
      newValue: 3280,
      actor: 'Sarah Chen',
    },
  },
  {
    id: '7',
    type: 'rules',
    date: '2024-01-27T14:43:00Z',
    title: 'Rules Replayed',
    detail: 'Rules re-evaluated after field update',
    metadata: { trigger: 'fieldUpdate', duration: 1200 },
  },
  {
    id: '8',
    type: 'decision',
    date: '2024-01-27T14:44:00Z',
    title: 'Decision Generated',
    detail: 'Partial approval - $2,847.50 of $3,280.00',
    link: '/decision',
    metadata: {
      approvedAmount: 2847.5,
      claimAmount: 3280,
      confidence: 87,
    },
  },
]

// ============================================
// Mock Processing State
// ============================================

export const createMockProcessingState = (): ProcessingState => ({
  currentStage: 1,
  stages: [
    { id: 1, name: 'Upload Documents', status: 'complete' },
    { id: 2, name: 'Quality Check', status: 'pending' },
    { id: 3, name: 'AI Extraction', status: 'pending' },
    { id: 4, name: 'Rules Engine', status: 'pending' },
    { id: 5, name: 'Decision', status: 'pending' },
  ],
  completedStages: [1],
  errors: [],
})

export const updateMockProcessingState = (
  state: ProcessingState,
  stageId: number,
  status: ProcessingStage['status']
): ProcessingState => {
  const stages = state.stages.map((stage) =>
    stage.id === stageId
      ? {
          ...stage,
          status,
          ...(status === 'in-progress' && { startedAt: new Date().toISOString() }),
          ...(status === 'complete' && { completedAt: new Date().toISOString() }),
        }
      : stage
  )

  const completedStages = stages.filter((s) => s.status === 'complete').map((s) => s.id)

  const currentStage =
    status === 'in-progress'
      ? stageId
      : status === 'complete'
        ? stages.find((s) => s.status === 'pending')?.id ?? stages.length
        : state.currentStage

  return {
    ...state,
    stages,
    completedStages,
    currentStage,
  }
}

// ============================================
// Mock Cases
// ============================================

export const mockCases: Case[] = [
  {
    id: 'CLM-2024-08947',
    title: 'Insurance Claim - John Smith',
    status: 'in-progress',
    type: 'insurance',
    createdAt: '2024-01-27T14:32:00Z',
    updatedAt: '2024-01-27T14:43:00Z',
    slaDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    documents: mockDocuments,
    extractedData: mockExtractedData,
    ruleResults: mockRuleResults,
    decision: mockDecision,
    timeline: mockTimelineEvents,
  },
  {
    id: 'CLM-2024-08946',
    title: 'Finance Application - ABC Corp',
    status: 'pending',
    type: 'finance',
    createdAt: '2024-01-26T10:15:00Z',
    updatedAt: '2024-01-26T10:15:00Z',
    slaDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [],
    extractedData: { fields: [], confidence: 0, extractionTime: 0 },
    ruleResults: [],
    decision: null,
    timeline: [
      {
        id: '1',
        type: 'upload',
        date: '2024-01-26T10:15:00Z',
        title: 'Case Created',
        detail: 'Application submitted by ABC Corp',
        metadata: { actor: 'John Doe' },
      },
    ],
  },
  {
    id: 'CLM-2024-08945',
    title: 'Compliance Review - XYZ Ltd',
    status: 'completed',
    type: 'compliance',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-22T15:30:00Z',
    slaDeadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [],
    extractedData: { fields: [], confidence: 0, extractionTime: 0 },
    ruleResults: [],
    decision: null,
    timeline: [
      {
        id: '1',
        type: 'decision',
        date: '2024-01-22T15:30:00Z',
        title: 'Review Completed',
        detail: 'Compliance verified and approved',
        metadata: { actor: 'System' },
      },
    ],
  },
  {
    id: 'CLM-2024-08944',
    title: 'Insurance Claim - Jane Doe',
    status: 'pending',
    type: 'insurance',
    createdAt: '2024-01-25T16:45:00Z',
    updatedAt: '2024-01-25T16:45:00Z',
    slaDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [],
    extractedData: { fields: [], confidence: 0, extractionTime: 0 },
    ruleResults: [],
    decision: null,
    timeline: [
      {
        id: '1',
        type: 'upload',
        date: '2024-01-25T16:45:00Z',
        title: 'Claim Submitted',
        detail: 'Waiting for document upload',
        metadata: { actor: 'Jane Doe' },
      },
    ],
  },
  {
    id: 'CLM-2024-08943',
    title: 'Finance Application - Tech Startup',
    status: 'rejected',
    type: 'finance',
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-19T14:00:00Z',
    slaDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [],
    extractedData: { fields: [], confidence: 0, extractionTime: 0 },
    ruleResults: [],
    decision: null,
    timeline: [
      {
        id: '1',
        type: 'decision',
        date: '2024-01-19T14:00:00Z',
        title: 'Application Rejected',
        detail: 'Does not meet eligibility criteria',
        metadata: { actor: 'System', reason: 'Insufficient credit score' },
      },
    ],
  },
]

// ============================================
// Mock Processing Logs
// ============================================

export const mockProcessingLogs = [
  {
    id: 'log-1',
    timestamp: '2024-01-27T14:32:00Z',
    severity: 'info' as const,
    category: 'api' as const,
    message: 'Document upload started',
    details: 'Received 5 files for processing',
    requestId: 'req-847362',
    duration: 150,
  },
  {
    id: 'log-2',
    timestamp: '2024-01-27T14:32:15Z',
    severity: 'success' as const,
    category: 'api' as const,
    message: '5 files uploaded successfully',
    details: 'All files validated and stored',
    metadata: { files: ['doc-1.pdf', 'doc-2.pdf', 'doc-3.jpg', 'doc-4.jpg', 'doc-5.pdf'] },
    requestId: 'req-847362',
    duration: 15000,
  },
  {
    id: 'log-3',
    timestamp: '2024-01-27T14:35:00Z',
    severity: 'info' as const,
    category: 'quality' as const,
    message: 'Quality check initiated',
    details: 'Running quality checks on all documents',
    requestId: 'req-847363',
  },
  {
    id: 'log-4',
    timestamp: '2024-01-27T14:35:22Z',
    severity: 'success' as const,
    category: 'quality' as const,
    message: 'Quality check completed',
    details: 'All documents passed quality thresholds',
    metadata: { averageScore: 96, minScore: 89 },
    requestId: 'req-847363',
    duration: 22000,
  },
  {
    id: 'log-5',
    timestamp: '2024-01-27T14:36:00Z',
    severity: 'info' as const,
    category: 'ocr' as const,
    message: 'OCR processing started',
    details: 'Processing 5 documents with OCR engine',
    requestId: 'req-847364',
  },
  {
    id: 'log-6',
    timestamp: '2024-01-27T14:36:15Z',
    severity: 'info' as const,
    category: 'ocr' as const,
    message: 'OCR completed for document 1',
    details: 'Extracted 234 text regions',
    requestId: 'req-847364',
    duration: 15000,
  },
  {
    id: 'log-7',
    timestamp: '2024-01-27T14:38:00Z',
    severity: 'info' as const,
    category: 'extraction' as const,
    message: 'Field extraction started',
    details: 'AI model extracting structured data',
    requestId: 'req-847365',
  },
  {
    id: 'log-8',
    timestamp: '2024-01-27T14:38:45Z',
    severity: 'success' as const,
    category: 'extraction' as const,
    message: 'Data extraction completed',
    details: 'Extracted 47 fields with 87% average confidence',
    metadata: {
      totalFields: 47,
      highConfidence: 38,
      mediumConfidence: 6,
      lowConfidence: 3,
    },
    requestId: 'req-847365',
    duration: 45000,
  },
  {
    id: 'log-9',
    timestamp: '2024-01-27T14:39:00Z',
    severity: 'info' as const,
    category: 'rules' as const,
    message: 'Rules evaluation started',
    details: 'Evaluating 12 business rules',
    requestId: 'req-847366',
  },
  {
    id: 'log-10',
    timestamp: '2024-01-27T14:39:30Z',
    severity: 'warning' as const,
    category: 'rules' as const,
    message: 'Rule failed: Pre-Existing Condition',
    details: 'Condition E11 (Type 2 Diabetes) excluded per clause 4.2',
    metadata: { ruleId: 'rule-12', clause: '4.2', condition: 'E11' },
    requestId: 'req-847366',
  },
  {
    id: 'log-11',
    timestamp: '2024-01-27T14:39:35Z',
    severity: 'success' as const,
    category: 'rules' as const,
    message: 'Rules evaluation completed',
    details: '10 passed, 1 failed, 1 warning',
    metadata: { passed: 10, failed: 1, warnings: 1 },
    requestId: 'req-847366',
    duration: 35000,
  },
]

// ============================================
// Mock Decision Trace
// ============================================

export const mockDecisionTrace = {
  id: 'trace-1',
  caseId: 'CLM-2024-08947',
  decisionId: 'decision-1',
  totalNodes: 14,
  passedNodes: 10,
  failedNodes: 1,
  skippedNodes: 3,
  evaluationDuration: 35000,
  evaluatedAt: '2024-01-27T14:39:35Z',
  rootNode: {
    id: 'node-root',
    type: 'result' as const,
    status: 'pass' as const,
    name: 'Claim Evaluation',
    description: 'Overall claim decision based on all rules',
    input: { claimAmount: 3280, policyValid: true },
    output: { decision: 'partial', approvedAmount: 2847.5 },
    children: [
      {
        id: 'node-1',
        type: 'rule' as const,
        status: 'pass' as const,
        name: 'Policy Term Validation',
        description: 'Check if treatment date is within policy term',
        input: {
          treatmentDate: '2024-01-15',
          policyStart: '2023-06-01',
          policyEnd: '2024-06-01',
        },
        output: { valid: true },
        reasoning: 'Treatment date (2024-01-15) falls within policy term (2023-06-01 to 2024-06-01)',
        policyReference: 'Clause 3.1 - Coverage Period',
        evaluationDuration: 500,
        children: [],
      },
      {
        id: 'node-2',
        type: 'rule' as const,
        status: 'fail' as const,
        name: 'Pre-Existing Condition',
        description: 'Check for pre-existing conditions',
        input: {
          conditionCode: 'E11',
          diagnosisDate: '2022-03-10',
          policyStartDate: '2023-06-01',
        },
        output: { excluded: true, deductible: 432.5 },
        reasoning:
          'Condition E11 (Type 2 Diabetes) was diagnosed before policy start date (2023-06-01). Exclusion clause 4.2 applies.',
        policyReference: 'Clause 4.2 - Pre-Existing Conditions',
        canOverride: true,
        evaluationDuration: 800,
        children: [],
      },
    ],
  },
}

// ============================================
// Initialize Store Helper
// ============================================

export const initializeMockData = () => {
  if (typeof window !== 'undefined') {
    const { useAppStore } = require('@/lib/store')
    useAppStore.getState().setCases(mockCases)
  }
}
