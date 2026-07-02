import usePermissions from '../../hooks/usePermissions';

export default function PermissionGate({ permission, children, fallback = null }) {
  const { can } = usePermissions();
  const required = Array.isArray(permission) ? permission : [permission];
  if (!required.some((p) => can(p))) return fallback;
  return children;
}
