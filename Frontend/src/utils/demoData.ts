/**
 * Mock data for the New Hire Onboarding Portal
 * Contains sample data for all components and pages
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'HR' | 'IT' | 'Compliance' | 'Training';
  owner: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
}

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  date: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  dueDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

// Mock Tasks Data
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Upload Government ID',
    description: 'Please upload a clear photo of your driver\'s license or passport',
    category: 'HR',
    owner: 'Sarah Johnson (HR)',
    dueDate: '2024-12-15',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Complete I-9 Form',
    description: 'Fill out employment eligibility verification form',
    category: 'Compliance',
    owner: 'Legal Team',
    dueDate: '2024-12-16',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Set up IT Equipment',
    description: 'Collect laptop and access cards from IT desk',
    category: 'IT',
    owner: 'Mike Chen (IT)',
    dueDate: '2024-12-18',
    status: 'in-progress',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Benefits Enrollment',
    description: 'Review and select your healthcare and retirement benefits',
    category: 'HR',
    owner: 'Benefits Team',
    dueDate: '2024-12-20',
    status: 'pending',
    priority: 'medium'
  },
  {
    id: '5',
    title: 'Security Training',
    description: 'Complete mandatory cybersecurity awareness training',
    category: 'Training',
    owner: 'Security Team',
    dueDate: '2024-12-22',
    status: 'completed',
    priority: 'high'
  }
];

// Mock Timeline Data
export const mockTimeline: TimelineStep[] = [
  {
    id: '1',
    title: 'Offer Accepted',
    description: 'Congratulations! You accepted our job offer',
    status: 'completed',
    date: '2024-12-01'
  },
  {
    id: '2',
    title: 'Documentation',
    description: 'Submit required documents and forms',
    status: 'current',
    date: '2024-12-15'
  },
  {
    id: '3',
    title: 'Background Verification',
    description: 'Complete background check process',
    status: 'upcoming',
    date: '2024-12-20'
  },
  {
    id: '4',
    title: 'First Day',
    description: 'Welcome to the team! Your journey begins',
    status: 'upcoming',
    date: '2024-12-23'
  }
];

// Mock Training Data
export const mockTraining: Training[] = [
  {
    id: '1',
    title: 'Company Overview & Culture',
    description: 'Learn about our mission, values, and company culture',
    duration: '45 minutes',
    progress: 100,
    status: 'completed',
    dueDate: '2024-12-14'
  },
  {
    id: '2',
    title: 'Code of Conduct',
    description: 'Understanding workplace policies and ethical guidelines',
    duration: '30 minutes',
    progress: 60,
    status: 'in-progress',
    dueDate: '2024-12-16'
  },
  {
    id: '3',
    title: 'Security Awareness',
    description: 'Cybersecurity best practices and data protection',
    duration: '1 hour',
    progress: 0,
    status: 'not-started',
    dueDate: '2024-12-18'
  },
  {
    id: '4',
    title: 'Role-Specific Training',
    description: 'Department and position-specific orientation',
    duration: '2 hours',
    progress: 0,
    status: 'not-started',
    dueDate: '2024-12-20'
  }
];

// Mock Notifications Data
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to WinOnboard!',
    message: 'We\'re excited to have you join our team. Please complete your onboarding tasks.',
    type: 'success',
    timestamp: '2024-12-12T09:00:00Z',
    read: false
  },
  {
    id: '2',
    title: 'Action Required: Upload ID',
    message: 'Please upload your government-issued ID to continue the verification process.',
    type: 'warning',
    timestamp: '2024-12-12T10:30:00Z',
    read: false
  },
  {
    id: '3',
    title: 'IT Setup Scheduled',
    message: 'Your laptop setup appointment is scheduled for Dec 18th at 10:00 AM.',
    type: 'info',
    timestamp: '2024-12-11T14:15:00Z',
    read: true
  },
  {
    id: '4',
    title: 'Training Module Completed',
    message: 'Great job completing the Company Overview training!',
    type: 'success',
    timestamp: '2024-12-10T16:45:00Z',
    read: true
  }
];

// Mock Documents Data
export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Employee_Handbook.pdf',
    type: 'application/pdf',
    size: '2.4 MB',
    uploadDate: '2024-12-10',
    status: 'verified'
  },
  {
    id: '2',
    name: 'Tax_Forms_W4.pdf',
    type: 'application/pdf',
    size: '156 KB',
    uploadDate: '2024-12-11',
    status: 'uploaded'
  }
];

// Buddy Information
export const mockBuddy = {
  name: 'Alex Rodriguez',
  role: 'Senior Software Engineer',
  department: 'Engineering',
  email: 'alex.rodriguez@company.com',
  phone: '+1 (555) 123-4567',
  avatar: '/images/avatars/alex.jpg',
  bio: 'I\'ve been with the company for 3 years and I\'m excited to help you get started!'
};

// Orientation Schedule
export const mockOrientation = {
  date: '2024-12-23',
  sessions: [
    {
      time: '9:00 AM',
      title: 'Welcome & Check-in',
      location: 'Main Lobby',
      duration: '30 minutes'
    },
    {
      time: '9:30 AM',
      title: 'CEO Welcome Address',
      location: 'Auditorium',
      duration: '45 minutes'
    },
    {
      time: '10:30 AM',
      title: 'Department Introductions',
      location: 'Conference Room A',
      duration: '1 hour'
    },
    {
      time: '12:00 PM',
      title: 'Lunch & Team Meet',
      location: 'Cafeteria',
      duration: '1 hour'
    }
  ]
};

// User Profile Mock Data
export const mockUser = {
  name: 'Bunny',
  email: 'bunny@company.com',
  role: 'Software Engineer',
  department: 'Engineering',
  startDate: '2024-12-23',
  avatar: '/images/avatars/bunny.jpg'
};