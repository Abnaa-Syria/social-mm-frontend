import { LayoutGrid } from 'lucide-react';
import Button from '../common/Button';

export default function EmptyBoardState({ title = 'لا توجد بيانات بعد', description = 'ابدأ بتنظيم حملتك الأولى', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#2563EB]/10 to-[#7C3AED]/10 flex items-center justify-center mb-6">
        <LayoutGrid size={36} className="text-[#2563EB]" />
      </div>
      <h3 className="text-xl font-extrabold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">{actionLabel}</Button>
      )}
    </div>
  );
}
