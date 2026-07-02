import useAuthStore from '../store/authStore';
import { can, canAny, canAll } from '../lib/permissions';

const normalizePermissions = (user) => {
  if (!user?.permissions) return [];
  return user.permissions.map((p) => (typeof p === 'string' ? p : p.slug));
};

export const usePermissions = () => {
  const user = useAuthStore((s) => s.user);
  const permissions = normalizePermissions(user);

  return {
    permissions,
    can: (slug) => can(permissions, slug),
    canAny: (slugs) => canAny(permissions, slugs),
    canAll: (slugs) => canAll(permissions, slugs),
  };
};

export default usePermissions;
