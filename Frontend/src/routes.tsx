/**
 * Application Routes Configuration
 * Defines all routes for the New Hire Onboarding Portal and HR Portal
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { NewHireHome } from './pages/NewHireHome';
import { Documents } from './pages/Documents';
import { ReviewAndSubmit } from './pages/ReviewAndSubmit';
import { Policies } from './pages/Policies';
import { UserLearning } from './pages/UserLearning';
import { Notifications } from './pages/Notifications';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RootRedirect } from './components/auth/RootRedirect';

// HR Portal Components
import { HrShell } from './pages/hr/HrShell';
import { HrDashboard } from './pages/hr/HrDashboard';
import { HrAddUser } from './pages/hr/HrAddUser';
import { HrCandidatesOffers } from './pages/hr/HrCandidatesOffers';
import { HrPreJoinTasks } from './pages/hr/HrPreJoinTasks';
import { HrDocumentsBGV } from './pages/hr/HrDocumentsBGV';
import { HrBGVVerification } from './pages/hr/HrBGVVerification';
import { HrPoliciesTemplates } from './pages/hr/HrPoliciesTemplates';
import { HrItProgress } from './pages/hr/HrItProgress';
import { HrReportsExports } from './pages/hr/HrReportsExports';
import { HrSettings } from './pages/hr/HrSettings';
import { HrBirthdays } from './pages/hr/HrBirthdays';

// IT Portal Components
import { ItShell } from './pages/it/ItShell';
import { ItTaskDetail } from './pages/it/ItTaskDetail';

// L&D Portal Components
import { LdShell } from './pages/ld/LdShell';
import { LdDashboard } from './pages/ld/LdDashboard';
import { LDNewEmployees } from './pages/ld/LDNewEmployees';
import { LDEmployeeDetail } from './pages/ld/LDEmployeeDetail';

/**
 * Router configuration with all application routes
 */
export const router = createBrowserRouter([
  // Root redirect (determines where to send user based on auth status)
  {
    path: '/',
    element: <RootRedirect />
  },
  // Login page (public route)
  {
    path: '/login',
    element: <Login />
  },
  // Fresher/User routes (protected)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requiredRole="FRESHER">
        <Shell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <NewHireHome />
      },
      {
        path: 'documents',
        element: <Documents />
      },
      {
        path: 'review-submit',
        element: <ReviewAndSubmit />
      },
      {
        path: 'policies',
        element: <Policies />
      },
      {
        path: 'learning',
        element: <UserLearning />
      },
      {
        path: 'notifications',
        element: <Notifications />
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />
      }
    ]
  },
  // HR Portal Routes (protected)
  {
    path: '/hr',
    element: (
      <ProtectedRoute requiredRole="HR">
        <HrShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HrDashboard />
      },
      {
        path: 'add-user',
        element: <HrAddUser />
      },
      {
        path: 'candidates',
        element: <HrCandidatesOffers />
      },
      {
        path: 'prejoin',
        element: <HrPreJoinTasks />
      },
      {
        path: 'documents',
        element: <HrDocumentsBGV />
      },
      {
        path: 'documents/:fresherId',
        element: <HrBGVVerification />
      },
      {
        path: 'policies',
        element: <HrPoliciesTemplates />
      },
      {
        path: 'it-progress',
        element: <HrItProgress />
      },
      {
        path: 'reports',
        element: <HrReportsExports />
      },
      {
        path: 'birthdays',
        element: <HrBirthdays />
      },
      {
        path: 'settings',
        element: <HrSettings />
      },
      {
        path: '*',
        element: <Navigate to="/hr" replace />
      }
    ]
  },
  // IT Portal Routes (protected)
  {
    path: '/it',
    element: (
      <ProtectedRoute requiredRole="IT">
        <ItShell />
      </ProtectedRoute>
    )
  },
  {
    path: '/it/tasks/:fresherId',
    element: (
      <ProtectedRoute requiredRole="IT">
        <ItTaskDetail />
      </ProtectedRoute>
    )
  },
  // L&D Portal Routes (protected)
  {
    path: '/ld',
    element: (
      <ProtectedRoute requiredRole="LD">
        <LdShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <LdDashboard />
      },
      {
        path: 'training-assignments',
        element: <div style={{ padding: '2rem' }}>Training Assignments - Coming Soon</div>
      },
      {
        path: 'new-employees',
        element: <LDNewEmployees />
      },
      {
        path: 'employee/:id',
        element: <LDEmployeeDetail />
      },
      {
        path: 'employees',
        element: <LDNewEmployees />
      },
      {
        path: 'schedule',
        element: <div style={{ padding: '2rem' }}>Training Schedule - Coming Soon</div>
      },
      {
        path: 'reports',
        element: <div style={{ padding: '2rem' }}>Reports - Coming Soon</div>
      },
      {
        path: '*',
        element: <Navigate to="/ld" replace />
      }
    ]
  },
  // Catch-all route for undefined paths
  {
    path: '*',
    element: <RootRedirect />
  }
]);