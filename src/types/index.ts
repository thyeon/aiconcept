// ============================================
// AI Document Processing Platform - Type Definitions
// ============================================

// ============================================
// Application State Types
// ============================================

export interface AppState {
  ui: UIState;
  cases: CasesState;
  processing: ProcessingStateMap;
  session: SessionState;
}

export interface UIState {
  activeCaseId: string | null;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelActiveTab: 'timeline' | 'logs' | 'trace';
  sidebarCollapsed: boolean;
}

export interface CasesState {
  byId: Record<string, Case>;
  allIds: string[];
  filters: CaseFilters;
  sortBy: SortOption;
}

export interface ProcessingStateMap {
  byCaseId: Record<string, ProcessingState>;
}

export interface SessionState {
  user: User | null;
  permissions: Permission[];
}

// ============================================
// Case & Document Types
// ============================================

export interface Case {
  id: string;
  title: string;
  status: CaseStatus;
  type: CaseType;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  documents: Document[];
  extractedData: ExtractedData;
  ruleResults: RuleResult[];
  decision: Decision | null;
  timeline: TimelineEvent[];
}

export type CaseStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';

export type CaseType = 'insurance' | 'finance' | 'compliance';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail: string;
  uploadedAt: string;
  qualityScore: number;
  qualityChecks: QualityCheck[];
  classification: Classification;
  extractionStatus: ExtractionStatus;
}

export type ExtractionStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface QualityCheck {
  name: string;
  status: CheckStatus;
  score: number;
  detail: string;
}

export type CheckStatus = 'pass' | 'warning' | 'fail';

export interface Classification {
  type: string;
  confidence: number;
  manuallyOverridden: boolean;
}

// ============================================
// Extraction Types
// ============================================

export interface ExtractedData {
  fields: ExtractedField[];
  confidence: number;
  extractionTime: number;
}

export interface ExtractedField {
  id: string;
  name: string;
  label: string;
  value: any;
  confidence: number;
  source: FieldSource;
  status: FieldStatus;
  manuallyEdited: boolean;
  originalValue?: any;
  editedBy?: string;
  editedAt?: string;
}

export interface FieldSource {
  documentId: string;
  page: number;
  region: [number, number, number, number]; // x, y, width, height
}

export type FieldStatus = 'auto-accepted' | 'review-suggested' | 'review-required';

// ============================================
// Rules Engine Types
// ============================================

export interface RuleResult {
  id: string;
  name: string;
  category: RuleCategory;
  status: RuleStatus;
  inputFields: Record<string, any>;
  reasoning: string;
  clause?: string;
  canOverride: boolean;
}

export type RuleCategory =
  | 'Coverage Eligibility'
  | 'Documentation Completeness'
  | 'Amount Validation'
  | 'Fraud Detection'
  | 'Compliance Requirements';

export type RuleStatus = 'pass' | 'fail' | 'warning' | 'skipped';

// ============================================
// Decision Types
// ============================================

export interface Decision {
  id: string;
  status: DecisionStatus;
  approvedAmount: number;
  claimAmount: number;
  deduction: number;
  deductionReason: string;
  confidence: number;
  rationale: string;
  approvalWorkflow: ApprovalStep[];
  createdAt: string;
  createdBy: string;
}

export type DecisionStatus = 'approved' | 'rejected' | 'partial';

export interface ApprovalStep {
  name: string;
  status: StepStatus;
  actor: string;
  time: string;
}

export type StepStatus = 'complete' | 'active' | 'pending' | 'error' | 'future';

// ============================================
// Timeline Types
// ============================================

export interface TimelineEvent {
  id: string;
  type: EventType;
  date: string;
  title: string;
  detail: string;
  link?: string;
  metadata?: Record<string, any>;
}

export type EventType =
  | 'document-issued'
  | 'upload'
  | 'quality-check'
  | 'processing'
  | 'rules'
  | 'decision'
  | 'payment'
  | 'field-update';

// ============================================
// Processing Types
// ============================================

export interface ProcessingState {
  currentStage: number;
  stages: ProcessingStage[];
  completedStages: number[];
  errors: ProcessingError[];
}

export interface ProcessingStage {
  id: number;
  name: string;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
}

export type StageStatus = 'pending' | 'in-progress' | 'complete' | 'error';

export interface ProcessingError {
  id: string;
  stage: number;
  message: string;
  details?: string;
  retryable: boolean;
  timestamp: string;
}

// ============================================
// User & Permission Types
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type UserRole = 'admin' | 'manager' | 'analyst' | 'viewer';

export interface Permission {
  resource: string;
  actions: string[];
}

// ============================================
// Filter & Sort Types
// ============================================

export interface CaseFilters {
  status: CaseStatus[];
  type: CaseType[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

export type SortOption =
  | 'createdAt-desc'
  | 'createdAt-asc'
  | 'updatedAt-desc'
  | 'updatedAt-asc'
  | 'slaDeadline-asc'
  | 'slaDeadline-desc';

// ============================================
// UI Component Types
// ============================================

export interface StatusBadgeProps {
  status: CaseStatus | DecisionStatus | RuleStatus | CheckStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export interface ConfidenceMeterProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'circular' | 'linear';
}

export interface SLATimerProps {
  deadline: string;
  warningThreshold?: number; // hours
  criticalThreshold?: number; // hours
}

// ============================================
// API Types
// ============================================

export interface UploadResponse {
  documents: Document[];
  errors?: UploadError[];
}

export interface UploadError {
  file: string;
  message: string;
}

export interface QualityCheckResponse {
  documentId: string;
  qualityScore: number;
  checks: QualityCheck[];
}

export interface ExtractionResponse {
  fields: ExtractedField[];
  confidence: number;
  extractionTime: number;
}

export interface RulesEvaluationResponse {
  results: RuleResult[];
  passed: number;
  failed: number;
  warnings: number;
}

// ============================================
// Workflow Types
// ============================================

export type WorkflowStage =
  | 'upload'
  | 'quality-check'
  | 'processing'
  | 'extraction'
  | 'rules'
  | 'decision';

export interface WorkflowStep {
  id: number;
  label: string;
  status: StepStatus;
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Dict<T> = Record<string, T>;
