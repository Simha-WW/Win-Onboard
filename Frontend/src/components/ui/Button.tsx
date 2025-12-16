/**
 * Reusable Button component with consistent branding and animations
 * Supports multiple variants, sizes, and states
 */

import { motion, MotionProps } from 'framer-motion';
import { ReactNode, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>, MotionProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Animated button with brand styling and interactive states
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) => {
  // Base classes using semantic tokens
  const baseClasses = 'inline-flex items-center justify-center font-medium relative overflow-hidden transition-all anim-medium focus-ring';
  
  // Variant styles using semantic color and shadow tokens
  const variantClasses = {
    primary: 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)] border border-[var(--brand-primary)]',
    secondary: 'bg-[var(--brand-muted)] text-[var(--brand-primary)] hover:bg-[var(--brand-muted-dark)] border border-[var(--brand-muted-dark)]',
    outline: 'border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white bg-white',
    ghost: 'text-[var(--brand-primary)] hover:bg-[var(--brand-muted)] hover:text-[var(--brand-primary-dark)] bg-transparent',
    danger: 'bg-[var(--error)] text-white hover:bg-red-700 border border-[var(--error)]'
  };

  // Size classes using semantic target and spacing tokens
  const sizeClasses = {
    sm: `gap-[var(--spacing-sm)] min-h-[var(--target-sm)]`,
    md: `gap-[var(--spacing-sm)] min-h-[var(--target-md)]`, 
    lg: `gap-[var(--spacing-md)] min-h-[var(--target-lg)]`
  };

  // Padding styles using semantic spacing tokens
  const paddingClasses = {
    sm: `px-[var(--spacing-md)] py-[var(--spacing-sm)]`,
    md: `px-[var(--spacing-lg)] py-[var(--spacing-sm)]`,
    lg: `px-[var(--spacing-xl)] py-[var(--spacing-md)]`
  };

  // Font size using semantic typography tokens
  const fontClasses = {
    sm: `text-[var(--font-scale-sm)]`,
    md: `text-[var(--font-scale-sm)]`,
    lg: `text-[var(--font-scale-md)]`
  };

  // Border radius using semantic tokens
  const radiusClasses = {
    sm: `rounded-[var(--radius-lg)]`,
    md: `rounded-[var(--radius-xl)]`,
    lg: `rounded-[var(--radius-xl)]`
  };

  // Shadow classes using semantic shadow tokens
  const shadowClasses = {
    sm: `shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]`,
    md: `shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]`,
    lg: `shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)]`
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';
  const loadingClasses = 'cursor-wait';

  return (
    <motion.button
      type={type}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        paddingClasses[size],
        fontClasses[size],
        radiusClasses[size],
        shadowClasses[size],
        fullWidth && 'w-full',
        (disabled || loading) && disabledClasses,
        loading && loadingClasses,
        className
      )}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { 
        scale: 1.02,
        y: -1,
        transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
      } : {}}
      whileTap={!disabled && !loading ? { 
        scale: 0.98,
        y: 0,
        transition: { duration: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }
      } : {}}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-r-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {leftIcon && !loading && leftIcon}
      {children}
      {rightIcon && !loading && rightIcon}
    </motion.button>
  );
};