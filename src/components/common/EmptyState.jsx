import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'لا توجد بيانات', description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Inbox className="text-gray-400" size={28} />
      </div>
      <p className="font-bold text-gray-700">{message}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
}
