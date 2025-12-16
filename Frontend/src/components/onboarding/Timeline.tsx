/**
 * Timeline component showing onboarding progress steps
 * Visual representation of the employee journey
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { FiCheck, FiCircle, FiClock } from 'react-icons/fi';
import type { TimelineStep } from '../../utils/demoData';

interface TimelineProps {
  steps: TimelineStep[];
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Animated timeline showing onboarding journey progress
 */
export const Timeline = ({ steps, orientation = 'horizontal' }: TimelineProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStepIcon = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return FiCheck;
      case 'current':
        return FiClock;
      default:
        return FiCircle;
    }
  };

  const getStepColors = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-[var(--success)]',
          text: 'text-white',
          border: 'border-[var(--success)]'
        };
      case 'current':
        return {
          bg: 'bg-[var(--brand-primary)]',
          text: 'text-white',
          border: 'border-[var(--brand-primary)]'
        };
      default:
        return {
          bg: 'bg-slate-200',
          text: 'text-slate-500',
          border: 'border-slate-200'
        };
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = getStepIcon(step.status);
          const colors = getStepColors(step.status);
          
          return (
            <motion.div
              key={step.id}
              className="flex gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Icon */}
              <div className="flex flex-col items-center">
                <div className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2',
                  colors.bg,
                  colors.border
                )}>
                  <Icon className={clsx('w-5 h-5', colors.text)} />
                </div>
                
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-12 bg-slate-200 mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-slate-900">{step.title}</h3>
                  <span className="text-sm text-slate-500">
                    {formatDate(step.date)}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">{step.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Horizontal timeline
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200">
        <motion.div
          className="h-full bg-[var(--brand-primary)]"
          initial={{ width: 0 }}
          animate={{
            width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
          }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const Icon = getStepIcon(step.status);
          const colors = getStepColors(step.status);

          return (
            <motion.div
              key={step.id}
              className="flex flex-col items-center max-w-[200px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              {/* Icon */}
              <div className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white',
                colors.border
              )}>
                <div className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center',
                  colors.bg
                )}>
                  <Icon className={clsx('w-3 h-3', colors.text)} />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mt-3">
                <h4 className="font-medium text-sm text-slate-900 mb-1">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 mb-1">
                  {step.description}
                </p>
                <span className="text-xs text-slate-500">
                  {formatDate(step.date)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};