import { formatDateTime } from '../../lib/formatters';

export default function ActivityTimeline({ activities = [] }) {
  if (!activities.length) {
    return <p className="text-sm text-gray-500 text-center py-6">لا يوجد نشاط بعد</p>;
  }

  return (
    <div className="space-y-4">
      {activities.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="w-2 h-2 mt-2 rounded-full bg-[#2563EB] shrink-0" />
          <div className="flex-1 pb-4 border-b border-gray-50 last:border-0">
            <p className="text-sm font-bold text-gray-800">{item.message}</p>
            <div className="flex gap-2 mt-1 text-xs text-gray-500">
              {item.user?.name && <span>{item.user.name}</span>}
              <span>•</span>
              <span>{formatDateTime(item.createdAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
