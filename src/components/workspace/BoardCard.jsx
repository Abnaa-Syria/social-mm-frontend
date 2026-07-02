import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import ProgressBar from '../common/ProgressBar';
import AvatarStack from './AvatarStack';
import { StatusBadge } from '../common/Badge';
import { STATUS_LABELS } from '../../config/constants';
import { formatDate } from '../../lib/formatters';

export default function BoardCard({ board, onEdit }) {
  const color = board.color || '#2563EB';

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden">
      <div className="h-2" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: color }}>
              <LayoutGrid size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-gray-900 truncate">{board.name}</h3>
              <StatusBadge status={board.status} label={STATUS_LABELS.board[board.status]} />
            </div>
          </div>
        </div>

        {board.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{board.description}</p>
        )}

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-xl py-2">
            <p className="text-lg font-extrabold text-gray-900">{board.campaignsCount ?? 0}</p>
            <p className="text-[10px] text-gray-500">حملات</p>
          </div>
          <div className="bg-gray-50 rounded-xl py-2">
            <p className="text-lg font-extrabold text-gray-900">{board.tasksCount ?? 0}</p>
            <p className="text-[10px] text-gray-500">مهام</p>
          </div>
          <div className="bg-gray-50 rounded-xl py-2">
            <p className="text-lg font-extrabold text-gray-900">{board.teamsCount ?? 0}</p>
            <p className="text-[10px] text-gray-500">فرق</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">نسبة الإنجاز</span>
            <span className="font-bold text-gray-700">{board.progress ?? 0}%</span>
          </div>
          <ProgressBar value={board.progress ?? 0} />
        </div>

        <div className="flex items-center justify-between pt-1">
          <AvatarStack users={board.avatars || []} />
          <span className="text-[11px] text-gray-400">{board.updatedAt ? formatDate(board.updatedAt) : ''}</span>
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-50">
          <Link
            to={ROUTES.BOARD_DETAILS(board.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-l from-[#2563EB] to-[#7C3AED] text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition"
          >
            <ArrowLeft size={16} />
            افتح البورد
          </Link>
          {onEdit && (
            <button type="button" onClick={() => onEdit(board)} className="px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100">
              تعديل
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
