/**
 * API utilities for the onboarding portal
 * Currently uses mock data, ready for backend integration
 */

import { 
  mockTasks, 
  mockTimeline, 
  mockTraining, 
  mockNotifications, 
  mockDocuments,
  mockBuddy,
  mockOrientation,
  mockUser,
  type Task,
  type Training,
  type Notification,
  type Document,
  type TimelineStep
} from './demoData';

// Simulate API delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Task-related API functions
 */
export const tasksApi = {
  /**
   * Get all tasks for the current user
   */
  async getTasks(): Promise<Task[]> {
    await delay(300);
    return mockTasks;
  },

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    await delay(200);
    const task = mockTasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    task.status = status;
    return task;
  }
};

/**
 * Training-related API functions
 */
export const trainingApi = {
  /**
   * Get all training courses
   */
  async getTraining(): Promise<Training[]> {
    await delay(250);
    return mockTraining;
  },

  /**
   * Update training progress
   */
  async updateProgress(trainingId: string, progress: number): Promise<Training> {
    await delay(150);
    const training = mockTraining.find(t => t.id === trainingId);
    if (!training) throw new Error('Training not found');
    training.progress = progress;
    if (progress === 100) training.status = 'completed';
    else if (progress > 0) training.status = 'in-progress';
    return training;
  }
};

/**
 * Notification-related API functions
 */
export const notificationsApi = {
  /**
   * Get all notifications
   */
  async getNotifications(): Promise<Notification[]> {
    await delay(200);
    return mockNotifications;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await delay(100);
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) notification.read = true;
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    await delay(50);
    return mockNotifications.filter(n => !n.read).length;
  }
};

/**
 * Document-related API functions
 */
export const documentsApi = {
  /**
   * Get all uploaded documents
   */
  async getDocuments(): Promise<Document[]> {
    await delay(300);
    return mockDocuments;
  },

  /**
   * Upload a new document
   */
  async uploadDocument(file: File): Promise<Document> {
    await delay(2000); // Simulate upload time
    const newDoc: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'uploaded'
    };
    mockDocuments.push(newDoc);
    return newDoc;
  }
};

/**
 * General onboarding data
 */
export const onboardingApi = {
  /**
   * Get timeline steps
   */
  async getTimeline(): Promise<TimelineStep[]> {
    await delay(200);
    return mockTimeline;
  },

  /**
   * Get buddy information
   */
  async getBuddy() {
    await delay(150);
    return mockBuddy;
  },

  /**
   * Get orientation schedule
   */
  async getOrientation() {
    await delay(100);
    return mockOrientation;
  },

  /**
   * Get user profile
   */
  async getUser() {
    await delay(50);
    return mockUser;
  }
};

/**
 * Progress calculation utilities
 */
export const progressUtils = {
  /**
   * Calculate overall onboarding progress
   */
  calculateOverallProgress(): number {
    const completedTasks = mockTasks.filter(task => task.status === 'completed').length;
    const totalTasks = mockTasks.length;
    return Math.round((completedTasks / totalTasks) * 100);
  },

  /**
   * Get next action for the user
   */
  getNextAction(): Task | null {
    const pendingTasks = mockTasks
      .filter(task => task.status === 'pending')
      .sort((a, b) => {
        // Sort by priority (high first) then by due date
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    
    return pendingTasks[0] || null;
  }
};