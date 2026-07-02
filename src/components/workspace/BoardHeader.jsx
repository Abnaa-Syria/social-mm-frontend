import { LayoutGrid } from 'lucide-react';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import { StatusBadge } from '../common/Badge';
import { STATUS_LABELS } from '../../config/constants';

export default function BoardHeader({ board, actions }) {
  if (!board) return null;
  const color = board.color || '#2563EB';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, #7C3AED)` }} />
      <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg" style={{ backgroundColor: color }}>
            <LayoutGrid size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-gray-900">{board.name}</h1>
              <StatusBadge status={board.status} label={STATUS_LABELS.board[board.status]} />
            </div>
            {board.description && <p className="text-sm text-gray-500 mt-1">{board.description}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{board.campaignsCount ?? 0} حملة</span>
              <span>{board.teamsCount ?? 0} فريق</span>
              <span className="font-bold text-[#2563EB]">{board.progress ?? 0}% إنجاز</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex-1">
            <ProgressBar value={board.progress ?? 0} />
          </div>
          {actions}
        </div>
      </div>
    </div>
  );
}
