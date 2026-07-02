import { useNavigate } from 'react-router-dom';
import { ExternalLink, GripVertical, MoreHorizontal } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import PlatformBadge from './PlatformBadge';
import TaskTypeChip from './TaskTypeChip';
import AvatarStack from './AvatarStack';
import ProgressBar from '../common/ProgressBar';
import { formatDate } from '../../lib/formatters';
import { useKanbanDragHandle } from './KanbanDragHandleContext';

export default function PostLinkKanbanCard({ card, onStatusChange, draggable = false }) {
  const navigate = useNavigate();
  const dragHandle = useKanbanDragHandle();

  const openDetails = (e) => {
    if (e.target.closest('a, button')) return;
    navigate(ROUTES.POST_LINK_DETAILS(card.id));
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group cursor-pointer"
      onClick={openDetails}
      onKeyDown={(e) => e.key === 'Enter' && openDetails(e)}
      role="button"
      tabIndex={0}
    >
      <div className="p-3.5 space-y-3">
        <div className="flex items-start gap-2">
          {draggable && dragHandle && (
            <button
              type="button"
              ref={dragHandle.ref}
              onPointerDown={dragHandle.onPointerDown}
              onKeyDown={dragHandle.onKeyDown}
              className="text-gray-300 hover:text-gray-500 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition cursor-grab active:cursor-grabbing touch-none"
              onClick={(e) => e.stopPropagation()}
              aria-label="اسحب البطاقة"
            >
              <GripVertical size={14} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <PlatformBadge platform={card.platform} />
              {onStatusChange && (
                <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal size={14} />
                </button>
              )}
            </div>
            <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mt-2 group-hover:text-[#2563EB]">{card.title}</h4>
            {card.campaign?.name && (
              <p className="text-[11px] text-gray-400 mt-1">{card.campaign.name}</p>
            )}
          </div>
        </div>

        {card.taskTypes?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.taskTypes.map((name, i) => (
              <TaskTypeChip key={i} name={name} slug={name?.toLowerCase()} />
            ))}
          </div>
        )}

        <div>
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>{card.completedTaskCount || 0}/{card.taskCount || 0} مكتمل</span>
            <span>{card.progress || 0}%</span>
          </div>
          <ProgressBar value={card.progress || 0} />
        </div>

        <div className="flex items-center justify-between">
          <AvatarStack users={card.assignees || []} />
          <div className="flex items-center gap-2">
            {card.dueDate && <span className="text-[10px] text-gray-400">{formatDate(card.dueDate)}</span>}
            {card.url && (
              <a href={card.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#2563EB]" onClick={(e) => e.stopPropagation()}>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
