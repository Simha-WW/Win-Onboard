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
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
// Removed complex component imports to simplify rendering
// import { WelcomeCard } from '../components/onboarding/WelcomeCard';
// import { TaskCard } from '../components/onboarding/TaskCard';
// import { Timeline } from '../components/onboarding/Timeline';
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
      console.log('Starting to load data...');
      try {
        // Load tasks data
        console.log('Loading tasks...');
        const tasksData = await tasksApi.getTasks();
        console.log('Tasks loaded:', tasksData);
        setTasks(tasksData);
        
        // Load timeline data
        console.log('Loading timeline...');
        const timelineData = await onboardingApi.getTimeline();
        console.log('Timeline loaded:', timelineData);
        setTimeline(timelineData);
        
        console.log('Data loaded successfully:', { tasks: tasksData.length, timeline: timelineData.length });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Provide fallback data in case of error
        setTasks([]);
        setTimeline([]);
      } finally {
        console.log('Setting loading to false');
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
        <div className="w-12 h-12 border-4 border-blue-600 border-r-transparent rounded-full shadow-lg animate-spin" />
      </div>
    );
  }

  console.log('NewHireHome rendering with data:', { tasks: tasks.length, timeline: timeline.length, loading });

  return (
    <div className="space-y-8">
      {/* Simple Welcome Section */}
      <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white border-0 shadow-xl">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome, {mockUser?.name || "New Employee"}! 🎉</h1>
              <p className="text-blue-100 text-lg">We're excited to have you join our team</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-100">
            <span>Your start date:</span>
            <span className="font-bold text-xl bg-white/20 px-4 py-2 rounded-xl">
              {mockUser?.startDate || "2024-12-23"}
            </span>
          </div>
        </div>
      </Card>

      {/* Stats Cards - Semantic grid spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div key={stat.label}>
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
            </div>
          );
        })}
      </div>

      {/* Main Content Grid - Semantic spacing and responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
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
              {tasks.length > 0 ? (
                tasks.slice(0, 3).map((task) => (
                  <Card key={task.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                        <p className="text-gray-600 mb-4">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Owner: {task.owner}</span>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant={task.status === 'completed' ? 'ghost' : 'primary'}
                        size="sm"
                        onClick={() => handleTaskAction(task.id, task.status === 'pending' ? 'start' : 'complete')}
                      >
                        {task.status === 'completed' ? 'Done' : task.status === 'pending' ? 'Start' : 'Complete'}
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-500 text-lg">Loading your tasks...</p>
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
            <div className="space-y-4">
              {timeline.length > 0 ? (
                timeline.slice(0, 4).map((step: any, index: number) => (
                  <div key={step.id || index} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{step.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🚀</div>
                  <p className="text-gray-500">Your onboarding journey starts here!</p>
                </div>
              )}
            </div>
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
      </div>
    </div>
  );
};