/**
 * Enhanced Card component with modern design system
 * Professional styling with improved shadows, spacing, and animations
 */

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps extends MotionProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'outlined' | 'elevated' | 'gradient';
  noBorder?: boolean;
}

/**
 * Enhanced animated card with modern design and professional styling
 */
export const Card = ({ 
  children, 
  className,
  hover = true,
  padding = 'md',
  variant = 'default',
  noBorder = false,
  ...motionProps 
}: CardProps) => {
  // Padding using semantic spacing tokens
  const paddingClasses = {
    sm: `p-[var(--spacing-md)]`,    // 16px
    md: `p-[var(--spacing-lg)]`,    // 24px
    lg: `p-[var(--spacing-2xl)]`,   // 48px
    xl: `p-[var(--spacing-3xl)]`    // 64px
  };

  // Variant styles using semantic color, shadow and border tokens
  const variantClasses = {
    default: clsx(
      'bg-[var(--bg-primary)]',
      noBorder ? 'border-transparent' : 'border border-[var(--border)]',
      'shadow-[var(--shadow-sm)]'
    ),
    outlined: 'bg-[var(--bg-primary)] border-2 border-[var(--border-strong)] shadow-[var(--shadow-sm)]',
    elevated: 'bg-[var(--bg-primary)] shadow-[var(--shadow-md)] border border-[var(--border)]',
    gradient: 'bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] shadow-[var(--shadow-md)] border border-[var(--border)]'
  };

  // Hover animations using semantic timing tokens
  const hoverAnimation = hover ? {
    whileHover: { 
      y: -4,
      scale: 1.01,
      boxShadow: 'var(--shadow-lg)',
      transition: { 
        duration: 'var(--anim-fast)',
        ease: 'var(--ease-out)'
      }
    },
    whileTap: {
      scale: 0.98,
      transition: { 
        duration: 'var(--anim-fast)',
        ease: 'var(--ease-out)'
      }
    }
  } : {};

  return (
    <motion.div
      className={clsx(
        'backdrop-blur-sm transition-all anim-medium',
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'cursor-pointer',
        className
      )}
      style={{
        borderRadius: 'var(--radius-2xl)' // Semantic border radius
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 'var(--anim-medium)', 
        ease: 'var(--ease-out)' 
      }}
      {...hoverAnimation}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};