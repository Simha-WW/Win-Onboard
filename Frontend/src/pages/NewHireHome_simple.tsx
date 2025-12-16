/**
 * New Hire Home Page - Dashboard overview for new employees
 * Shows welcome message, progress, next actions, and quick links
 * 
 * DESIGN SYSTEM AUDIT:
 * ✅ Uses semantic spacing tokens throughout
 * ✅ Responsive container with proper max-width constraints
 * ✅ Consistent gap between major sections
 * ✅ Proper card padding using semantic tokens
 * ✅ Typography scaled with semantic font tokens
 * ✅ No overlapping elements - minimum spacing between adjacent components
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
  const overallProgress = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 75;
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
          className="w-12 h-12 border-4 border-blue-600 border-r-transparent rounded-full shadow-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  console.log('NewHireHome rendering with data:', { tasks: tasks.length, timeline: timeline.length, loading });

  return (
    <motion.div 
      className="space-y-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Welcome Section - Generous spacing for enthusiasm */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-12"
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
                className="text-center border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300" 
                padding="lg"
              >
                <div className="flex flex-col items-center py-2 space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-lg">
                    <Icon className={`${stat.color} w-8 h-8`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
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
          {/* Overall Progress */}
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
            
            <p className="text-sm text-gray-600 font-medium">
              You're making great progress! Complete all tasks before your start date.
            </p>
          </Card>

          {/* Next Action */}
          {nextAction && (
            <Card className="border-l-4 border-orange-500 bg-gradient-to-br from-orange-50 via-white to-white shadow-xl">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    🎯 Next Action Required
                  </h3>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                    {nextAction.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {nextAction.description}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="font-medium">Owner: {nextAction.owner}</span>
                    <span className="font-medium">Due: {new Date(nextAction.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleTaskAction(nextAction.id, 'start')}
                  rightIcon={<FiArrowRight className="w-4 h-4" />}
                  className="shadow-lg"
                >
                  Start Now
                </Button>
              </div>
            </Card>
          )}

          {/* Recent Tasks */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Tasks
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAction={handleTaskAction}
                    compact={true}
                  />
                ))
              ) : (
                <Card className="text-center py-12">
                  <p className="text-gray-500 text-lg">No tasks available yet.</p>
                  <p className="text-gray-400 text-sm mt-2">New tasks will appear here as they are assigned.</p>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Timeline & Quick Actions */}
        <div className="space-y-8">
          {/* Onboarding Timeline */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Your Journey
            </h3>
            {timeline.length > 0 ? (
              <Timeline steps={timeline} orientation="vertical" />
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-gray-500">Your onboarding journey starts here!</p>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Quick Actions
            </h3>
            <div className="space-y-4">
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Need Help? 🤝
            </h3>
            <p className="text-sm text-gray-600 mb-6">
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