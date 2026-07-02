import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { rolesService, permissionsService } from '../../services/index.js';
import usePermissions from '../../hooks/usePermissions';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getApiErrorMessage } from '../../lib/formatters.js';
import { ROUTES } from '../../config/routes.js';
import { MODULE_LABELS } from '../../config/constants.js';

export default function RolePermissionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: grouped, isLoading: loadingGrouped } = useQuery({
    queryKey: ['permissions-grouped'],
    queryFn: permissionsService.grouped,
  });

  const { data: rolePerms, isLoading: loadingRole, error, refetch } = useQuery({
    queryKey: ['role-permissions', id],
    queryFn: () => rolesService.getPermissions(id),
  });

  useEffect(() => {
    if (rolePerms?.permissions) {
      setSelectedIds(rolePerms.permissions.map((p) => p.id));
    }
  }, [rolePerms]);

  const saveMutation = useMutation({
    mutationFn: (permissionIds) => rolesService.updatePermissions(id, permissionIds),
    onSuccess: () => {
      toast.success('تم حفظ الصلاحيات بنجاح');
      navigate(ROUTES.ROLES);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const modules = useMemo(() => Object.entries(grouped || {}), [grouped]);

  const togglePermission = (permId) => {
    setSelectedIds((prev) =>
      prev.includes(permId) ? prev.filter((x) => x !== permId) : [...prev, permId]
    );
  };

  const toggleModule = (permissions) => {
    const ids = permissions.map((p) => p.id);
    const allSelected = ids.every((pid) => selectedIds.includes(pid));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((pid) => !ids.includes(pid)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const handleSave = () => {
    if (!can('roles.update')) return toast.error('ليس لديك صلاحية التعديل');
    saveMutation.mutate(selectedIds);
  };

  if (loadingGrouped || loadingRole) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل الصلاحيات" onRetry={refetch} />;

  const roleName = rolePerms?.role?.name || '';

  return (
    <div>
      <PageHeader
        title="صلاحيات الدور"
        subtitle={`إدارة صلاحيات: ${roleName}`}
        action={
          <span className="text-sm font-bold text-gray-500">
            {selectedIds.length} صلاحية محددة
          </span>
        }
      />

      <div className="space-y-4 mb-6">
        {modules.map(([module, permissions]) => {
          const ids = permissions.map((p) => p.id);
          const allSelected = ids.every((pid) => selectedIds.includes(pid));
          const someSelected = ids.some((pid) => selectedIds.includes(pid));

          return (
            <Card key={module}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={() => toggleModule(permissions)}
                    className="rounded w-4 h-4"
                  />
                  <h3 className="font-extrabold text-gray-900">
                    {MODULE_LABELS[module] || module}
                  </h3>
                </label>
                <span className="text-xs text-gray-500">{permissions.length} صلاحية</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      className="rounded mt-0.5 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{perm.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{perm.slug}</p>
                      {perm.description && (
                        <p className="text-xs text-gray-400 mt-1">{perm.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button loading={saveMutation.isPending} onClick={handleSave}>
          حفظ الصلاحيات
        </Button>
        <Button variant="secondary" onClick={() => navigate(ROUTES.ROLES)}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
