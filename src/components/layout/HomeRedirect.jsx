import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../config/routes';

/** Redirect to the right home based on role permissions */
export default function HomeRedirect() {
  const { getPermissions } = useAuthStore();
  const perms = getPermissions();

  if (perms.includes('dashboard_stats.view') || perms.includes('boards.view')) {
    return <Navigate to={ROUTES.WORKSPACE} replace />;
  }
  if (perms.includes('task_assignments.view') && !perms.includes('boards.view')) {
    return <Navigate to={ROUTES.MY_WORK} replace />;
  }
  if (perms.includes('dashboard.view')) {
    return <Navigate to={ROUTES.WORKSPACE} replace />;
  }
  return <Navigate to={ROUTES.MY_WORK} replace />;
}
