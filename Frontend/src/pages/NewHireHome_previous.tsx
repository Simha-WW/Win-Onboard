/**
 * New Hire Home Page - Simple version for testing
 */

import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { 
  FiCheckCircle, 
  FiClock,
  FiUsers,
  FiFileText
} from 'react-icons/fi';

export const NewHireHome = () => {
  console.log('NewHireHome component rendering...');
  
  return (
    <div className="space-y-8">
      {/* Test Header */}
      <div className="text-center p-8 bg-blue-600 text-white rounded-lg">
        <h1 className="text-3xl font-bold mb-4">🎉 Welcome to WinOnboard!</h1>
        <p className="text-xl">Hello Bunny, we're excited to have you join our team!</p>
        <p className="mt-2 text-blue-200">Start Date: December 23, 2024</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-4">
            <FiCheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">6/8</div>
          <div className="text-sm text-gray-600">Tasks Completed</div>
        </Card>
        
        <Card className="text-center p-6">
          <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-4">
            <FiClock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-sm text-gray-600">Days Until Start</div>
        </Card>
        
        <Card className="text-center p-6">
          <div className="p-3 bg-purple-100 rounded-full w-12 h-12 mx-auto mb-4">
            <FiUsers className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-sm text-gray-600">Team Members</div>
        </Card>
      </div>

      {/* Progress Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Onboarding Progress</h2>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-medium">75% Complete</span>
        </div>
        <ProgressBar progress={75} size="lg" variant="primary" />
        <p className="text-gray-600 mt-4">You're making great progress! Complete all tasks before your start date.</p>
      </Card>

      {/* Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Next Tasks</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-orange-400 bg-orange-50 p-4 rounded">
              <h4 className="font-semibold text-gray-900">Upload Government ID</h4>
              <p className="text-sm text-gray-600 mt-1">Please upload a clear photo of your driver's license</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">Due: Dec 15, 2024</span>
                <Button size="sm" variant="primary">Start</Button>
              </div>
            </div>
            
            <div className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded">
              <h4 className="font-semibold text-gray-900">Complete I-9 Form</h4>
              <p className="text-sm text-gray-600 mt-1">Fill out employment eligibility verification</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">Due: Dec 16, 2024</span>
                <Button size="sm" variant="outline">In Progress</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" size="sm" fullWidth leftIcon={<FiFileText className="w-4 h-4" />}>
              Upload Documents
            </Button>
            <Button variant="outline" size="sm" fullWidth leftIcon={<FiCheckCircle className="w-4 h-4" />}>
              View Checklist
            </Button>
            <Button variant="outline" size="sm" fullWidth leftIcon={<FiUsers className="w-4 h-4" />}>
              Meet Your Buddy
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Need Help? 🤝</h4>
            <p className="text-sm text-blue-700 mt-1">Our HR team is here to support you!</p>
            <Button variant="primary" size="sm" fullWidth className="mt-3">
              Contact Support
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};