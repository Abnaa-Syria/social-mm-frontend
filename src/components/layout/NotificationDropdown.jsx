import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { notificationsService } from '../../services';
import { ROUTES } from '../../config/routes';
import usePermissions from '../../hooks/usePermissions';
import { formatDateTime } from '../../lib/formatters';

const entityRoutes = {
  task_assignment: (id) => ROUTES.ASSIGNMENT_DETAILS(id),
  proof: (id) => ROUTES.PROOF_DETAILS(id),
  campaign: (id) => ROUTES.CAMPAIGN_DETAILS(id),
  task: (id) => ROUTES.TASK_DETAILS(id),
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const { data: unread } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: notificationsService.getUnreadCount,
    enabled: can('notifications.view'),
    refetchInterval: 60000,
  });

  const { data: listData } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: () => notificationsService.list({ limit: 8 }),
    enabled: can('notifications.view') && open,
    refetchInterval: open ? 60000 : false,
  });

  const markRead = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    },
  });

  if (!can('notifications.view')) return null;

  const notifications = listData?.data || [];
  const count = unread?.count ?? unread ?? 0;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 relative">
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h3 className="font-extrabold text-sm">الإشعارات</h3>
            {count > 0 && can('notifications.update') && (
              <button onClick={() => markAllRead.mutate()} className="text-xs text-blue-600 font-bold">تعيين الكل كمقروء</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!notifications.length ? (
              <p className="text-sm text-gray-500 text-center py-8">لا توجد إشعارات</p>
            ) : notifications.map((n) => {
              const href = n.entity && n.entityId && entityRoutes[n.entity] ? entityRoutes[n.entity](n.entityId) : null;
              const content = (
                <div className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/40' : ''}`}>
                  <p className="text-sm font-bold text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
              );
              return (
                <div key={n.id} onClick={() => !n.isRead && can('notifications.update') && markRead.mutate(n.id)}>
                  {href ? <Link to={href} onClick={() => setOpen(false)}>{content}</Link> : content}
                </div>
              );
            })}
          </div>
          <Link to={ROUTES.NOTIFICATIONS} onClick={() => setOpen(false)} className="block text-center text-sm font-bold text-blue-600 py-3 border-t border-gray-50 hover:bg-gray-50">
            عرض كل الإشعارات
          </Link>
        </div>
      )}
    </div>
  );
}
