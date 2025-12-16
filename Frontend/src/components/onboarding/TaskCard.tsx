/**
 * Task Card component for displaying individual onboarding tasks
 * Shows task details, status, and actionable buttons
 */

import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { clsx } from 'clsx';
import { 
  FiClock, 
  FiUser, 
  FiCheckCircle, 
  FiCircle, 
  FiAlertCircle,
  FiPlay
} from 'react-icons/fi';
import type { Task } from '../../utils/demoData';

interface TaskCardProps {
  task: Task;
  onAction?: (taskId: string, action: string) => void;
  compact?: boolean;
}

/**
 * Individual task card with status indicators and action buttons
 */
export const TaskCard = ({ task, onAction, compact = false }: TaskCardProps) => {
  const statusConfig = {
    pending: {
      icon: FiCircle,
      color: 'text-slate-400',
      bgColor: 'bg-slate-100',
      label: 'Pending'
    },
    'in-progress': {
      icon: FiPlay,
      color: 'text-[var(--brand-accent)]',
      bgColor: 'bg-blue-100',
      label: 'In Progress'
    },
    completed: {
      icon: FiCheckCircle,
      color: 'text-[var(--success)]',
      bgColor: 'bg-green-100',
      label: 'Completed'
    },
    overdue: {
      icon: FiAlertCircle,
      color: 'text-[var(--error)]',
      bgColor: 'bg-red-100',
      label: 'Overdue'
    }
  };

  const priorityConfig = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500'
  };

  const status = statusConfig[task.status];
  const StatusIcon = status.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays > 1) return `Due in ${diffDays} days`;
    if (diffDays === -1) return 'Due yesterday';
    return `${Math.abs(diffDays)} days overdue`;
  };

  const getCategoryColor = (category: Task['category']) => {
    const colors = {
      HR: 'bg-purple-100 text-purple-800',
      IT: 'bg-blue-100 text-blue-800',
      Compliance: 'bg-orange-100 text-orange-800',
      Training: 'bg-green-100 text-green-800'
    };
    return colors[category];
  };

  return (
    <Card 
      className={clsx(
        'border-l-4 transition-all duration-200',
        priorityConfig[task.priority]
      )}
      padding={compact ? 'sm' : 'md'}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={clsx('p-2 rounded-full', status.bgColor)}>
              <StatusIcon className={clsx('w-4 h-4', status.color)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={clsx(
                'font-semibold text-slate-900',
                compact ? 'text-sm' : 'text-base'
              )}>
                {task.title}
              </h3>
              
              {!compact && (
                <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Category Badge */}
          <span className={clsx(
            'px-2 py-1 rounded-full text-xs font-medium',
            getCategoryColor(task.category)
          )}>
            {task.category}
          </span>
        </div>

        {/* Task Details */}
        {!compact && (
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <FiUser className="w-4 h-4" />
              <span>{task.owner}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              <span className={clsx(
                task.status === 'overdue' && 'text-red-600 font-medium'
              )}>
                {formatDate(task.dueDate)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        {task.status !== 'completed' && (
          <div className="flex gap-2">
            {task.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => onAction?.(task.id, 'start')}
                className="flex-1"
              >
                Start Task
              </Button>
            )}
            
            {task.status === 'in-progress' && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onAction?.(task.id, 'complete')}
                className="flex-1"
              >
                Mark Complete
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAction?.(task.id, 'details')}
            >
              View Details
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};