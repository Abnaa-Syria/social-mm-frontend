import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import useAuthStore from './store/authStore';
import { ROUTES } from './config/routes';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import HomeRedirect from './components/layout/HomeRedirect';
import WorkspaceHomePage from './pages/workspace/WorkspaceHomePage';
import MyWorkPage from './pages/workspace/MyWorkPage';
import ReviewsPage from './pages/workspace/ReviewsPage';
import DashboardHome from './pages/dashboard/DashboardHome';
import UsersListPage from './pages/users/UsersListPage';
import UserFormPage from './pages/users/UserFormPage';
import UserDetailsPage from './pages/users/UserDetailsPage';
import RolesListPage from './pages/roles/RolesListPage';
import RoleFormPage from './pages/roles/RoleFormPage';
import RolePermissionsPage from './pages/roles/RolePermissionsPage';
import PermissionsPage from './pages/permissions/PermissionsPage';
import SettingsPage from './pages/settings/SettingsPage';
import AuditLogsPage from './pages/auditLogs/AuditLogsPage';
import PlatformsListPage from './pages/platforms/PlatformsListPage';
import PlatformFormPage from './pages/platforms/PlatformFormPage';
import BoardsListPage from './pages/boards/BoardsListPage';
import BoardFormPage from './pages/boards/BoardFormPage';
import BoardDetailsPage from './pages/boards/BoardDetailsPage';
import CampaignsListPage from './pages/campaigns/CampaignsListPage';
import CampaignFormPage from './pages/campaigns/CampaignFormPage';
import CampaignDetailsPage from './pages/campaigns/CampaignDetailsPage';
import TeamsListPage from './pages/teams/TeamsListPage';
import TeamFormPage from './pages/teams/TeamFormPage';
import TeamDetailsPage from './pages/teams/TeamDetailsPage';
import TaskTypesListPage from './pages/taskTypes/TaskTypesListPage';
import TaskTypeFormPage from './pages/taskTypes/TaskTypeFormPage';
import PostLinksListPage from './pages/postLinks/PostLinksListPage';
import PostLinkFormPage from './pages/postLinks/PostLinkFormPage';
import PostLinkDetailsPage from './pages/postLinks/PostLinkDetailsPage';
import TasksListPage from './pages/tasks/TasksListPage';
import TaskFormPage from './pages/tasks/TaskFormPage';
import TaskDetailsPage from './pages/tasks/TaskDetailsPage';
import AssignmentsListPage from './pages/assignments/AssignmentsListPage';
import AssignmentDetailsPage from './pages/assignments/AssignmentDetailsPage';
import CommentSuggestionsListPage from './pages/commentSuggestions/CommentSuggestionsListPage';
import CommentSuggestionFormPage from './pages/commentSuggestions/CommentSuggestionFormPage';
import ProofsListPage from './pages/proofs/ProofsListPage';
import ProofDetailsPage from './pages/proofs/ProofDetailsPage';
import ReportsOverviewPage from './pages/reports/ReportsOverviewPage';
import CampaignsReportPage from './pages/reports/CampaignsReportPage';
import TeamsReportPage from './pages/reports/TeamsReportPage';
import MembersReportPage from './pages/reports/MembersReportPage';
import TasksReportPage from './pages/reports/TasksReportPage';
import ActivityReportPage from './pages/reports/ActivityReportPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ForbiddenPage from './pages/errors/ForbiddenPage';
import QuickStartPage from './pages/quickStart/QuickStartPage';
import UsageGuidePage from './pages/guide/UsageGuidePage';

function AuthInit({ children }) {
  const { isAuthenticated, fetchMe } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) fetchMe();
  }, []);
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={isAuthenticated ? <HomeRedirect /> : <LoginPage />} />
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path={ROUTES.HOME} element={<HomeRedirect />} />
        <Route path={ROUTES.WORKSPACE} element={<ProtectedRoute permission={['dashboard.view', 'dashboard_stats.view', 'boards.view']}><WorkspaceHomePage /></ProtectedRoute>} />
        <Route path={ROUTES.MY_WORK} element={<ProtectedRoute permission="task_assignments.view"><MyWorkPage /></ProtectedRoute>} />
        <Route path={ROUTES.REVIEWS} element={<ProtectedRoute permission={['task_assignments.approve', 'proofs.approve']}><ReviewsPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute permission={['dashboard_stats.view', 'dashboard.view']}><DashboardHome /></ProtectedRoute>} />
        <Route path={ROUTES.USERS} element={<ProtectedRoute permission="users.view"><UsersListPage /></ProtectedRoute>} />
        <Route path="/users/create" element={<ProtectedRoute permission="users.create"><UserFormPage /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute permission="users.view"><UserDetailsPage /></ProtectedRoute>} />
        <Route path="/users/:id/edit" element={<ProtectedRoute permission="users.update"><UserFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.ROLES} element={<ProtectedRoute permission="roles.view"><RolesListPage /></ProtectedRoute>} />
        <Route path="/roles/create" element={<ProtectedRoute permission="roles.create"><RoleFormPage /></ProtectedRoute>} />
        <Route path="/roles/:id/edit" element={<ProtectedRoute permission="roles.update"><RoleFormPage /></ProtectedRoute>} />
        <Route path="/roles/:id/permissions" element={<ProtectedRoute permission="roles.update"><RolePermissionsPage /></ProtectedRoute>} />
        <Route path={ROUTES.PERMISSIONS} element={<ProtectedRoute permission="permissions.view"><PermissionsPage /></ProtectedRoute>} />
        <Route path={ROUTES.SETTINGS} element={<ProtectedRoute permission="settings.view"><SettingsPage /></ProtectedRoute>} />
        <Route path={ROUTES.AUDIT_LOGS} element={<ProtectedRoute permission="audit_logs.view"><AuditLogsPage /></ProtectedRoute>} />
        <Route path={ROUTES.PLATFORMS} element={<ProtectedRoute permission="platforms.view"><PlatformsListPage /></ProtectedRoute>} />
        <Route path="/platforms/create" element={<ProtectedRoute permission="platforms.create"><PlatformFormPage /></ProtectedRoute>} />
        <Route path="/platforms/:id/edit" element={<ProtectedRoute permission="platforms.update"><PlatformFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.BOARDS} element={<ProtectedRoute permission="boards.view"><BoardsListPage /></ProtectedRoute>} />
        <Route path="/boards/create" element={<ProtectedRoute permission="boards.create"><BoardFormPage /></ProtectedRoute>} />
        <Route path="/boards/:id" element={<ProtectedRoute permission="boards.view"><BoardDetailsPage /></ProtectedRoute>} />
        <Route path="/boards/:id/edit" element={<ProtectedRoute permission="boards.update"><BoardFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.CAMPAIGNS} element={<ProtectedRoute permission="campaigns.view"><CampaignsListPage /></ProtectedRoute>} />
        <Route path="/campaigns/create" element={<ProtectedRoute permission="campaigns.create"><CampaignFormPage /></ProtectedRoute>} />
        <Route path="/campaigns/:id" element={<ProtectedRoute permission="campaigns.view"><CampaignDetailsPage /></ProtectedRoute>} />
        <Route path="/campaigns/:id/edit" element={<ProtectedRoute permission="campaigns.update"><CampaignFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.TEAMS} element={<ProtectedRoute permission="teams.view"><TeamsListPage /></ProtectedRoute>} />
        <Route path="/teams/create" element={<ProtectedRoute permission="teams.create"><TeamFormPage /></ProtectedRoute>} />
        <Route path="/teams/:id" element={<ProtectedRoute permission="teams.view"><TeamDetailsPage /></ProtectedRoute>} />
        <Route path="/teams/:id/edit" element={<ProtectedRoute permission="teams.update"><TeamFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.TASK_TYPES} element={<ProtectedRoute permission="task_types.view"><TaskTypesListPage /></ProtectedRoute>} />
        <Route path="/task-types/create" element={<ProtectedRoute permission="task_types.create"><TaskTypeFormPage /></ProtectedRoute>} />
        <Route path="/task-types/:id/edit" element={<ProtectedRoute permission="task_types.update"><TaskTypeFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.POST_LINKS} element={<ProtectedRoute permission="post_links.view"><PostLinksListPage /></ProtectedRoute>} />
        <Route path="/post-links/create" element={<ProtectedRoute permission="post_links.create"><PostLinkFormPage /></ProtectedRoute>} />
        <Route path="/post-links/:id" element={<ProtectedRoute permission="post_links.view"><PostLinkDetailsPage /></ProtectedRoute>} />
        <Route path="/post-links/:id/edit" element={<ProtectedRoute permission="post_links.update"><PostLinkFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.TASKS} element={<ProtectedRoute permission="tasks.view"><TasksListPage /></ProtectedRoute>} />
        <Route path="/tasks/create" element={<ProtectedRoute permission="tasks.create"><TaskFormPage /></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute permission="tasks.view"><TaskDetailsPage /></ProtectedRoute>} />
        <Route path="/tasks/:id/edit" element={<ProtectedRoute permission="tasks.update"><TaskFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.ASSIGNMENTS} element={<ProtectedRoute permission="task_assignments.view"><AssignmentsListPage /></ProtectedRoute>} />
        <Route path="/assignments/:id" element={<ProtectedRoute permission="task_assignments.view"><AssignmentDetailsPage /></ProtectedRoute>} />
        <Route path={ROUTES.COMMENT_SUGGESTIONS} element={<ProtectedRoute permission="comment_suggestions.view"><CommentSuggestionsListPage /></ProtectedRoute>} />
        <Route path="/comment-suggestions/create" element={<ProtectedRoute permission="comment_suggestions.create"><CommentSuggestionFormPage /></ProtectedRoute>} />
        <Route path="/comment-suggestions/:id/edit" element={<ProtectedRoute permission="comment_suggestions.update"><CommentSuggestionFormPage /></ProtectedRoute>} />
        <Route path={ROUTES.PROOFS} element={<ProtectedRoute permission="proofs.view"><ProofsListPage /></ProtectedRoute>} />
        <Route path="/proofs/:id" element={<ProtectedRoute permission="proofs.view"><ProofDetailsPage /></ProtectedRoute>} />
        <Route path={ROUTES.REPORTS} element={<ProtectedRoute permission="reports.view"><ReportsOverviewPage /></ProtectedRoute>} />
        <Route path={ROUTES.REPORTS_CAMPAIGNS} element={<ProtectedRoute permission="reports.view"><CampaignsReportPage /></ProtectedRoute>} />
        <Route path={ROUTES.REPORTS_TEAMS} element={<ProtectedRoute permission="reports.view"><TeamsReportPage /></ProtectedRoute>} />
        <Route path={ROUTES.REPORTS_MEMBERS} element={<ProtectedRoute permission="reports.view"><MembersReportPage /></ProtectedRoute>} />
        <Route path={ROUTES.REPORTS_TASKS} element={<ProtectedRoute permission="reports.view"><TasksReportPage /></ProtectedRoute>} />
        <Route path={ROUTES.REPORTS_ACTIVITY} element={<ProtectedRoute permission="reports.view"><ActivityReportPage /></ProtectedRoute>} />
        <Route path={ROUTES.NOTIFICATIONS} element={<ProtectedRoute permission="notifications.view"><NotificationsPage /></ProtectedRoute>} />
        <Route path={ROUTES.QUICK_START} element={<ProtectedRoute permission={['post_links.create', 'tasks.create']}><QuickStartPage /></ProtectedRoute>} />
        <Route path={ROUTES.USAGE_GUIDE} element={<UsageGuidePage />} />
        <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInit>
          <AppRoutes />
        </AuthInit>
      </BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Almarai, sans-serif', direction: 'rtl' } }} />
    </QueryClientProvider>
  );
}
