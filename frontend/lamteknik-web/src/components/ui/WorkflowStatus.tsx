'use client';

import React from 'react';
import { ChevronRight, Check, Circle } from 'lucide-react';
import clsx from 'clsx';
import type { StatusAkreditasi } from '@/types';
import { useWorkflowSteps } from '@/lib/hooks';

interface WorkflowStatusProps {
  currentStatus: StatusAkreditasi | string;
  className?: string;
  hideLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function WorkflowStatus({
  currentStatus,
  className,
  hideLabels = false,
  size = 'md',
}: WorkflowStatusProps) {
  const { steps, stepTitles, getStepIndex } = useWorkflowSteps();
  const currentIndex = getStepIndex(currentStatus as StatusAkreditasi);
  const progress = Math.round(((currentIndex + 1) / steps.length) * 100);

  const sizeClasses = {
    sm: {
      circle: 'w-6 h-6',
      text: 'text-xs',
      parentGap: 'gap-1',
    },
    md: {
      circle: 'w-8 h-8',
      text: 'text-sm',
      parentGap: 'gap-2',
    },
    lg: {
      circle: 'w-10 h-10',
      text: 'text-base',
      parentGap: 'gap-3',
    },
  };

  const config = sizeClasses[size];

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Horizontal Timeline - Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <div className={clsx('flex', config.parentGap)}>
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={clsx(
                    'flex items-center justify-center rounded-full border-2 transition-all',
                    config.circle,
                    index < currentIndex
                      ? 'bg-green-500 border-green-500'
                      : index === currentIndex
                      ? 'bg-blue-500 border-blue-500 ring-4 ring-blue-200'
                      : 'bg-gray-200 border-gray-300'
                  )}
                >
                  {index < currentIndex ? (
                    <Check className={clsx('text-white', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
                  ) : (
                    <Circle
                      className={clsx(
                        index === currentIndex ? 'text-white' : 'text-gray-400',
                        size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
                      )}
                      fill="currentColor"
                    />
                  )}
                </div>
                {!hideLabels && (
                  <span
                    className={clsx(
                      'mt-2 text-center whitespace-nowrap transition-colors',
                      config.text,
                      index <= currentIndex ? 'text-gray-900 font-medium' : 'text-gray-500'
                    )}
                  >
                    {stepTitles[step]}
                  </span>
                )}
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex items-center">
                  <div
                    className={clsx(
                      'h-0.5 transition-all',
                      index < currentIndex ? 'bg-green-500' : 'bg-gray-300',
                      size === 'sm' ? 'w-6' : size === 'md' ? 'w-8' : 'w-12'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Vertical Timeline - Mobile View */}
      <div className="md:hidden space-y-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-start gap-3">
            {/* Left: Circle & Line */}
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'flex items-center justify-center rounded-full border-2 transition-all',
                  config.circle,
                  index < currentIndex
                    ? 'bg-green-500 border-green-500'
                    : index === currentIndex
                    ? 'bg-blue-500 border-blue-500 ring-4 ring-blue-200'
                    : 'bg-gray-200 border-gray-300'
                )}
              >
                {index < currentIndex ? (
                  <Check className="text-white w-4 h-4" />
                ) : (
                  <Circle
                    className={clsx(
                      index === currentIndex ? 'text-white' : 'text-gray-400',
                      'w-3 h-3'
                    )}
                    fill="currentColor"
                  />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    'w-0.5 my-2 transition-all',
                    index < currentIndex ? 'bg-green-500' : 'bg-gray-300',
                    'h-10'
                  )}
                />
              )}
            </div>

            {/* Right: Label & Info */}
            {!hideLabels && (
              <div className="pt-1">
                <h3
                  className={clsx(
                    'font-medium transition-colors',
                    config.text,
                    index <= currentIndex ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {stepTitles[step]}
                </h3>
                {index === currentIndex && (
                  <p className="text-xs text-blue-600 mt-1">Current Step</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Status Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">Current Status:</span>{' '}
          <span className="text-blue-600 font-medium">{stepTitles[currentStatus as StatusAkreditasi] || currentStatus}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Step {currentIndex + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}

export default WorkflowStatus;
