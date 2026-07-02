import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { permissionsService } from '../../services/index.js';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import Badge from '../../components/common/Badge';
import { MODULE_LABELS } from '../../config/constants.js';

export default function PermissionsPage() {
  const { data: grouped, isLoading, error, refetch } = useQuery({
    queryKey: ['permissions-grouped'],
    queryFn: permissionsService.grouped,
  });

  const modules = useMemo(() => Object.entries(grouped || {}), [grouped]);
  const totalCount = useMemo(
    () => modules.reduce((sum, [, perms]) => sum + perms.length, 0),
    [modules]
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل الصلاحيات" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="الصلاحيات"
        subtitle={`عرض جميع صلاحيات النظام (${totalCount} صلاحية)`}
      />

      <div className="space-y-4">
        {modules.map(([module, permissions]) => (
          <Card key={module}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900">
                {MODULE_LABELS[module] || module}
              </h3>
              <Badge color="info">{permissions.length}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissions.map((perm) => (
                <div
                  key={perm.id}
                  className="p-3 rounded-xl border border-gray-100 bg-gray-50/50"
                >
                  <p className="text-sm font-bold text-gray-900">{perm.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">{perm.slug}</p>
                  {perm.description && (
                    <p className="text-xs text-gray-400 mt-1">{perm.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}

        {!modules.length && (
          <Card>
            <p className="text-sm text-gray-500 text-center py-8">لا توجد صلاحيات</p>
          </Card>
        )}
      </div>
    </div>
  );
}
