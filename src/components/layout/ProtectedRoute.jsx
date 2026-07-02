import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LoadingState from '../common/LoadingState';
import ForbiddenPage from '../../pages/errors/ForbiddenPage';
import { ROUTES } from '../../config/routes';

export default function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, isLoading, getPermissions } = useAuthStore();

  if (isLoading) return <LoadingState />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  if (permission) {
    const perms = getPermissions();
    const required = Array.isArray(permission) ? permission : [permission];
    if (!required.some((p) => perms.includes(p))) {
      return <ForbiddenPage />;
    }
  }

  return children;
}
