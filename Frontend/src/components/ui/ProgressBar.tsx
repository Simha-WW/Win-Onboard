/**
 * Animated Progress Bar component
 * Shows completion percentage with smooth animations
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

/**
 * Animated progress bar with brand colors and smooth fill animation
 */
export const ProgressBar = ({
  progress,
  size = 'md',
  variant = 'primary',
  showLabel = true,
  label,
  className
}: ProgressBarProps) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-5'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary-dark)]',
    success: 'bg-gradient-to-r from-[var(--success)] to-emerald-600',
    warning: 'bg-gradient-to-r from-[var(--warning)] to-amber-600',
    danger: 'bg-gradient-to-r from-[var(--error)] to-red-700'
  };

  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {label || 'Progress'}
          </span>
          <span className="text-sm font-medium text-[var(--text-secondary)] bg-[var(--brand-muted)] px-2 py-1 rounded-md">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      
      <div className={clsx(
        'w-full bg-[var(--border)] rounded-full overflow-hidden relative',
        sizeClasses[size]
      )}>
        <motion.div
          className={clsx(
            'h-full rounded-full relative overflow-hidden',
            variantClasses[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94] // Smoother custom easing
          }}
        >
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatDelay: 2,
              ease: 'linear'
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};