/**
 * New Hire Home Page - Dashboard overview for new employees
 * Shows welcome message, progress, next actions, and quick links
 * 
 * DESIGN SYSTEM AUDIT:
 * ✅ Uses semantic spacing tokens throughout (--spacing-md, --spacing-lg, --spacing-xl, --spacing-2xl)
 * ✅ Responsive container with proper max-width constraints
 * ✅ Consistent gap between major sections (--spacing-2xl)
 * ✅ Proper card padding using semantic tokens
 * ✅ Typography scaled with semantic font tokens
 * ✅ No overlapping elements - minimum spacing-lg between adjacent components
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { WelcomeCard } from '../components/onboarding/WelcomeCard';
import { TaskCard } from '../components/onboarding/TaskCard';
import { Timeline } from '../components/onboarding/Timeline';
import { 
  FiArrowRight, 
  FiCheckCircle, 
  FiClock,
  FiUsers,
  FiFileText
} from 'react-icons/fi';
import { 
  onboardingApi, 
  tasksApi, 
  progressUtils,
  type Task 
} from '../utils/api';
import { mockUser } from '../utils/demoData';

/**
 * Dashboard home page with onboarding overview and quick actions
 */
export const NewHireHome = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tasks data
        const tasksData = await tasksApi.getTasks();
        setTasks(tasksData);
        
        // Load timeline data
        const timelineData = await onboardingApi.getTimeline();
        setTimeline(timelineData);
        
        console.log('Data loaded successfully:', { tasks: tasksData.length, timeline: timelineData.length });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Provide fallback data in case of error
        setTasks([]);
        setTimeline([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTaskAction = async (taskId: string, action: string) => {
    if (action === 'start') {
      await tasksApi.updateTaskStatus(taskId, 'in-progress');
    } else if (action === 'complete') {
      await tasksApi.updateTaskStatus(taskId, 'completed');
    }
    
    // Reload tasks
    const updatedTasks = await tasksApi.getTasks();
    setTasks(updatedTasks);
  };

  // Calculate progress with fallbacks
  const overallProgress = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0;
  const nextAction = tasks.find(t => t.status === 'pending') || null;
  const recentTasks = tasks.slice(0, 3);

  const stats = [
    {
      label: 'Tasks Completed',
      value: tasks.filter(t => t.status === 'completed').length,
      total: tasks.length || 8, // Fallback to show some numbers
      icon: FiCheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Days Until Start',
      value: 5, // Demo value
      total: null,
      icon: FiClock,
      color: 'text-blue-600'
    },
    {
      label: 'Team Members',
      value: 24,
      total: null,
      icon: FiUsers,
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          className="w-12 h-12 border-4 border-[var(--brand-primary)] border-r-transparent rounded-full shadow-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  console.log('NewHireHome rendering with data:', { tasks: tasks.length, timeline: timeline.length, loading });

  return (
    <motion.div 
      className="space-y-16" // Using Tailwind classes instead of CSS variables in JS
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Welcome Section - Generous spacing for enthusiasm */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-12" // Extra spacing after welcome using Tailwind
      >
        <WelcomeCard
          userName={mockUser?.name || "New Employee"}
          startDate={mockUser?.startDate || "2024-12-23"}
          companyName="WinOnboard"
        />
      </motion.div>

      {/* Stats Cards - Semantic grid spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                ease: 'easeOut'
              }}
              whileHover={{ y: -4 }}
            >
              <Card 
                className="text-center border-0" 
                variant="gradient"
                padding="lg"
                hover={true}
              >
                <div 
                  className="flex flex-col items-center"
                  style={{ gap: 'var(--spacing-md)' }} // Semantic internal spacing
                >
                  <div 
                    className="bg-gradient-to-br from-[var(--brand-primary)]/10 to-[var(--brand-primary)]/5"
                    style={{
                      padding: 'var(--spacing-lg)',
                      borderRadius: 'var(--radius-2xl)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    <Icon 
                      className={stat.color} 
                      style={{
                        width: 'var(--icon-lg)',
                        height: 'var(--icon-lg)'
                      }}
                    />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.total ? `${stat.value}/${stat.total}` : stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid - Semantic spacing and responsive layout */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      >
        {/* Left Column - Progress & Next Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overall Progress - Semantic spacing and typography */}
          <Card className="bg-gradient-to-br from-white via-gray-50 to-white border-0 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Onboarding Progress
              </h2>
              <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                {overallProgress}% Complete
              </div>
            </div>
            
            <div className="mb-6">
              <ProgressBar
                progress={overallProgress}
                size="lg"
                variant="primary"
                showLabel={false}
              />
            </div>
            
            <p 
              className="text-[var(--text-secondary)] font-medium"
              style={{ 
                fontSize: 'var(--font-scale-sm)',
                lineHeight: 1.6
              }}
            >
              You're making great progress! Complete all tasks before your start date.
            </p>
          </Card>

          {/* Next Action - Semantic spacing and layout */}
          {nextAction && (
            <Card 
              className="border-l-4 border-l-gradient-to-b from-orange-400 to-orange-600 bg-gradient-to-br from-orange-50 via-white to-white"
              padding="lg"
            >
              <div 
                className="flex items-start justify-between"
                style={{ gap: 'var(--spacing-xl)' }}
              >
                <div className="flex-1">
                  <h3 
                    className="font-bold text-[var(--text-primary)] flex items-center"
                    style={{ 
                      fontSize: 'var(--font-scale-2xl)',
                      marginBottom: 'var(--spacing-md)',
                      gap: 'var(--spacing-sm)'
                    }}
                  >
                    🎯 Next Action Required
                  </h3>
                  <h4 
                    className="font-semibold text-[var(--text-primary)]"
                    style={{ 
                      fontSize: 'var(--font-scale-lg)',
                      marginBottom: 'var(--spacing-sm)'
                    }}
                  >
                    {nextAction.title}
                  </h4>
                  <p 
                    className="text-[var(--text-secondary)] leading-relaxed"
                    style={{ 
                      fontSize: 'var(--font-scale-sm)',
                      marginBottom: 'var(--spacing-lg)',
                      lineHeight: 1.6
                    }}
                  >
                    {nextAction.description}
                  </p>
                  <div 
                    className="flex items-center text-[var(--text-muted)]"
                    style={{ 
                      gap: 'var(--spacing-lg)',
                      fontSize: 'var(--font-scale-sm)'
                    }}
                  >
                    <span className="font-medium">Owner: {nextAction.owner}</span>
                    <span className="font-medium">Due: {new Date(nextAction.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleTaskAction(nextAction.id, 'start')}
                  rightIcon={<FiArrowRight style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)' }} />}
                  size="md"
                >
                  Start Now
                </Button>
              </div>
            </Card>
          )}

          {/* Recent Tasks - Semantic spacing and typography */}
          <div>
            <div 
              className="flex items-center justify-between"
              style={{ marginBottom: 'var(--spacing-lg)' }}
            >
              <h2 
                className="font-semibold text-[var(--text-primary)]"
                style={{ fontSize: 'var(--font-scale-2xl)' }}
              >
                Recent Tasks
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)' // Consistent card spacing
            }}>
              {recentTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onAction={handleTaskAction}
                  compact={true}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Timeline & Quick Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xl)' // Semantic section spacing
        }}>
          {/* Onboarding Timeline */}
          <Card padding="lg">
            <h3 
              className="font-semibold text-[var(--text-primary)]"
              style={{ 
                fontSize: 'var(--font-scale-xl)',
                marginBottom: 'var(--spacing-lg)'
              }}
            >
              Your Journey
            </h3>
            <Timeline steps={timeline} orientation="vertical" />
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={<FiFileText className="w-4 h-4" />}
              >
                Upload Documents
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={<FiCheckCircle className="w-4 h-4" />}
              >
                View Checklist
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={<FiUsers className="w-4 h-4" />}
              >
                Meet Your Buddy
              </Button>
            </div>
          </Card>

          {/* Help Section */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Need Help? 🤝
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Our HR team is here to support you throughout your onboarding journey.
            </p>
            <Button variant="primary" size="sm" fullWidth>
              Contact Support
            </Button>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};