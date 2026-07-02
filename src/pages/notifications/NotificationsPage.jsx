import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, CheckCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { notificationsService } from '../../services';
import { formatDateTime } from '../../lib/formatters';
import usePermissions from '../../hooks/usePermissions';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: () => notificationsService.list({ limit: 50 }),
    refetchInterval: 60000,
  });

  const markRead = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-list'] }),
  });

  const markAllRead = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-list'] }),
  });

  const remove = useMutation({
    mutationFn: notificationsService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-list'] }),
  });

  const notifications = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإشعارات"
        subtitle="متابعة التحديثات والتنبيهات الداخلية"
        action={can('notifications.update') && (
          <Button variant="outline" onClick={() => markAllRead.mutate()} className="gap-2">
            <CheckCheck size={16} /> تعيين الكل كمقروء
          </Button>
        )}
      />

      {isLoading ? <LoadingState /> : error ? <ErrorState onRetry={refetch} /> : !notifications.length ? (
        <EmptyState title="لا توجد إشعارات" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={`!p-4 ${!n.isRead ? 'border-blue-200 bg-blue-50/30' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-gray-900">{n.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDateTime(n.createdAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!n.isRead && can('notifications.update') && (
                    <Button size="sm" variant="ghost" onClick={() => markRead.mutate(n.id)}>قراءة</Button>
                  )}
                  {can('notifications.delete') && (
                    <button onClick={() => remove.mutate(n.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
