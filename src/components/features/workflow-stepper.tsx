'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Upload,
  FileCheck,
  Cpu,
  FileText,
  Scale as ScaleIcon,
  Gavel,
} from 'lucide-react'
import { WorkflowStep } from '@/types'

// ============================================
// Workflow Stepper Component
// Shows 6-step document processing workflow
// ============================================

const workflowSteps: WorkflowStep[] = [
  { id: 1, label: 'Upload', status: 'pending' },
  { id: 2, label: 'Quality', status: 'pending' },
  { id: 3, label: 'Processing', status: 'pending' },
  { id: 4, label: 'Extraction', status: 'pending' },
  { id: 5, label: 'Rules', status: 'pending' },
  { id: 6, label: 'Decision', status: 'pending' },
]

const stepIcons: Record<number, React.ReactNode> = {
  1: <Upload className="h-4 w-4" />,
  2: <FileCheck className="h-4 w-4" />,
  3: <Cpu className="h-4 w-4" />,
  4: <FileText className="h-4 w-4" />,
  5: <ScaleIcon className="h-4 w-4" />,
  6: <Gavel className="h-4 w-4" />,
}

export interface WorkflowStepperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current active step (1-6) */
  currentStep: number
  /** Array of steps with their statuses */
  steps?: WorkflowStep[]
  /** Allow clicking on completed steps to navigate back */
  clickable?: boolean
  /** Callback when step is clicked */
  onStepClick?: (step: number) => void
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show step labels */
  showLabels?: boolean
  /** Show step numbers */
  showNumbers?: boolean
}

export function WorkflowStepper({
  currentStep,
  steps = workflowSteps,
  clickable = true,
  onStepClick,
  orientation = 'horizontal',
  size = 'md',
  showLabels = true,
  showNumbers = false,
  className,
  ...props
}: WorkflowStepperProps) {
  // Update step statuses based on currentStep
  const updatedSteps: WorkflowStep[] = steps.map((step) => {
    if (step.id < currentStep) {
      return { ...step, status: 'complete' }
    } else if (step.id === currentStep) {
      return { ...step, status: 'active' }
    }
    return { ...step, status: 'pending' }
  })

  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      className={cn(
        'w-full',
        isHorizontal ? 'flex items-center' : 'flex flex-col',
        className
      )}
      role="navigation"
      aria-label="Workflow progress"
      {...props}
    >
      {updatedSteps.map((step, index) => {
        const isClickable = clickable && step.status === 'complete'
        const isLastStep = index === updatedSteps.length - 1

        return (
          <React.Fragment key={step.id}>
            {/* Step */}
            <WorkflowStepItem
              step={step}
              size={size}
              showLabel={showLabels}
              showNumber={showNumbers}
              isClickable={isClickable}
              orientation={orientation}
              onClick={() => {
                if (isClickable && onStepClick) {
                  onStepClick(step.id)
                }
              }}
            />

            {/* Connector Line */}
            {!isLastStep && (
              <StepConnector
                status={step.status}
                orientation={orientation}
                size={size}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ============================================
// Workflow Step Item Component
// Individual step in the workflow
// ============================================

interface WorkflowStepItemProps {
  step: WorkflowStep
  size: 'sm' | 'md' | 'lg'
  showLabel: boolean
  showNumber: boolean
  isClickable: boolean
  orientation: 'horizontal' | 'vertical'
  onClick?: () => void
}

function WorkflowStepItem({
  step,
  size,
  showLabel,
  showNumber,
  isClickable,
  orientation,
  onClick,
}: WorkflowStepItemProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const getStatusStyles = () => {
    switch (step.status) {
      case 'complete':
        return {
          container: 'bg-success border-success text-white shadow-sm',
          icon: <CheckCircle2 className={iconSizes[size]} />,
        }
      case 'active':
        return {
          container: 'bg-primary border-primary text-white animate-pulse shadow-md',
          icon: <Clock className={cn(iconSizes[size], 'animate-spin')} />,
        }
      case 'error':
        return {
          container: 'bg-error border-error text-white',
          icon: <AlertCircle className={iconSizes[size]} />,
        }
      case 'future':
      default:
        return {
          container: 'bg-white border-border-light text-text-secondary',
          icon: <Circle className={iconSizes[size]} />,
        }
    }
  }

  const styles = getStatusStyles()
  const isVertical = orientation === 'vertical'

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2',
        isVertical ? 'w-full' : 'flex-1'
      )}
    >
      {/* Step Circle */}
      <button
        onClick={onClick}
        disabled={!isClickable}
        className={cn(
          'relative flex items-center justify-center rounded-full border-2 font-semibold transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          sizeClasses[size],
          styles.container,
          isClickable && 'cursor-pointer hover:scale-105',
          !isClickable && 'cursor-default'
        )}
        aria-label={`Step ${step.id}: ${step.label}`}
        aria-current={step.status === 'active' ? 'step' : undefined}
      >
        {step.status === 'complete' ? (
          styles.icon
        ) : step.status === 'active' ? (
          styles.icon
        ) : step.status === 'error' ? (
          styles.icon
        ) : (
          <>
            {showNumber && (
              <span className={textSizeClasses[size]}>{step.id}</span>
            )}
            {!showNumber && stepIcons[step.id]}
          </>
        )}

        {/* Step number badge for complete state */}
        {step.status === 'complete' && showNumber && (
          <span className="sr-only">Step {step.id} complete</span>
        )}
      </button>

      {/* Step Label */}
      {showLabel && (
        <span
          className={cn(
            'text-center font-medium whitespace-nowrap',
            textSizeClasses[size],
            step.status === 'active'
              ? 'text-primary'
              : step.status === 'complete'
              ? 'text-success'
              : 'text-text-secondary'
          )}
        >
          {step.label}
        </span>
      )}
    </div>
  )
}

// ============================================
// Step Connector Component
// Line connecting steps
// ============================================

interface StepConnectorProps {
  status: 'complete' | 'active' | 'pending' | 'error' | 'future'
  orientation: 'horizontal' | 'vertical'
  size: 'sm' | 'md' | 'lg'
}

function StepConnector({ status, orientation, size }: StepConnectorProps) {
  const thicknessClasses = {
    sm: orientation === 'horizontal' ? 'h-0.5' : 'w-0.5',
    md: orientation === 'horizontal' ? 'h-1' : 'w-1',
    lg: orientation === 'horizontal' ? 'h-1.5' : 'w-1.5',
  }

  const lengthClasses = {
    sm: 'flex-1',
    md: 'flex-1',
    lg: 'flex-1',
  }

  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return 'bg-success'
      case 'active':
        return 'bg-primary/50'
      case 'error':
        return 'bg-error'
      default:
        return 'bg-border-light'
    }
  }

  return (
    <div
      className={cn(
        'rounded-full transition-colors duration-300',
        thicknessClasses[size],
        lengthClasses[size],
        getStatusColor(),
        orientation === 'horizontal' ? 'mx-1' : 'my-1'
      )}
      aria-hidden="true"
    />
  )
}

// ============================================
// Workflow Stepper with Progress Bar
// Combines stepper with linear progress indicator
// ============================================

export interface WorkflowStepperWithProgressProps extends WorkflowStepperProps {
  /** Show progress bar below stepper */
  showProgressBar?: boolean
  /** Show percentage complete */
  showPercentage?: boolean
}

export function WorkflowStepperWithProgress({
  currentStep,
  steps = workflowSteps,
  showProgressBar = true,
  showPercentage = true,
  ...props
}: WorkflowStepperWithProgressProps) {
  const totalSteps = steps.length
  const percentage = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="w-full space-y-4">
      {/* Stepper */}
      <WorkflowStepper
        currentStep={currentStep}
        steps={steps}
        {...props}
      />

      {/* Progress Bar */}
      {showProgressBar && (
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-text-secondary">
            <span>Progress</span>
            {showPercentage && <span className="tabular-nums">{percentage}%</span>}
          </div>
          <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Vertical Workflow Stepper
// Optimized for mobile or sidebar display
// ============================================

export interface VerticalWorkflowStepperProps extends Omit<
  WorkflowStepperProps,
  'orientation'
> {
  /** Compact mode for narrow sidebars */
  compact?: boolean
}

export function VerticalWorkflowStepper({
  currentStep,
  steps,
  clickable = true,
  onStepClick,
  size = 'md',
  showLabels = true,
  compact = false,
  className,
  ...props
}: VerticalWorkflowStepperProps) {
  const updatedSteps: WorkflowStep[] = steps?.map((step) => {
    if (step.id < currentStep) {
      return { ...step, status: 'complete' }
    } else if (step.id === currentStep) {
      return { ...step, status: 'active' }
    }
    return { ...step, status: 'pending' }
  }) || []

  return (
    <div className={cn('space-y-0', className)} {...props}>
      {updatedSteps?.map((step, index) => {
        const isClickable = clickable && step.status === 'complete'
        const isLastStep = index === (updatedSteps?.length || 0) - 1

        return (
          <div key={step.id} className="relative">
            {/* Step */}
            <div
              className={cn(
                'flex items-start gap-3 pb-6',
                isLastStep && 'pb-0'
              )}
            >
              {/* Step Circle */}
              <button
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(step.id)
                  }
                }}
                disabled={!isClickable}
                className={cn(
                  'flex-shrink-0 relative z-10 flex items-center justify-center rounded-full border-2 font-semibold transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  size === 'sm' && 'w-7 h-7 text-xs',
                  size === 'md' && 'w-9 h-9 text-sm',
                  size === 'lg' && 'w-11 h-11 text-base',
                  step.status === 'complete' &&
                    'bg-success border-success text-white',
                  step.status === 'active' &&
                    'bg-primary border-primary text-white animate-pulse',
                  step.status === 'error' &&
                    'bg-error border-error text-white',
                  step.status === 'pending' &&
                    'bg-white border-border-light text-text-secondary',
                  isClickable && 'cursor-pointer hover:scale-105',
                  !isClickable && 'cursor-default'
                )}
              >
                {step.status === 'complete' ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : step.status === 'active' ? (
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                ) : step.status === 'error' ? (
                  <AlertCircle className="h-3.5 w-3.5" />
                ) : (
                  stepIcons[step.id]
                )}
              </button>

              {/* Step Content */}
              {!compact && showLabels && (
                <div className="flex-1 pt-0.5">
                  <p
                    className={cn(
                      'font-medium',
                      size === 'sm' && 'text-xs',
                      size === 'md' && 'text-sm',
                      size === 'lg' && 'text-base',
                      step.status === 'active'
                        ? 'text-primary'
                        : step.status === 'complete'
                        ? 'text-success'
                        : 'text-text-secondary'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.status === 'active' && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      In progress...
                    </p>
                  )}
                  {step.status === 'complete' && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      Completed
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Connector Line */}
            {!isLastStep && (
              <div
                className={cn(
                  'absolute left-[17px] top-9 w-0.5 bg-border-light transition-colors',
                  size === 'sm' && 'left-[13px] top-7',
                  size === 'lg' && 'left-[21px] top-11',
                  step.status === 'complete' && 'bg-success'
                )}
                style={{ height: 'calc(100% - 2rem)' }}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
