import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

const COLUMN_COLORS = {
  NEW: 'border-t-blue-500',
  IN_PROGRESS: 'border-t-amber-500',
  REVIEW: 'border-t-purple-500',
  COMPLETED: 'border-t-green-500',
  CANCELLED: 'border-t-gray-400',
  ASSIGNED: 'border-t-blue-500',
  SUBMITTED: 'border-t-purple-500',
  REJECTED: 'border-t-red-500',
  APPROVED: 'border-t-green-500',
};

export default function KanbanColumn({ columnId, title, count = 0, children, onAdd, droppable = false }) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { type: 'column', columnId },
    disabled: !droppable,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm flex flex-col max-h-full ${COLUMN_COLORS[columnId] || 'border-t-gray-300'} border-t-4 ${isOver ? 'ring-2 ring-[#2563EB]/30 bg-blue-50/50' : ''}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-sm text-gray-800">{title}</h3>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
        </div>
        {onAdd && (
          <button type="button" onClick={onAdd} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Plus size={16} />
          </button>
        )}
      </div>
      <div className="p-3 space-y-3 overflow-y-auto flex-1">{children}</div>
    </div>
  );
}
