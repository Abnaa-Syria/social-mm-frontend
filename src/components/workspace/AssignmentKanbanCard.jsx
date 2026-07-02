import { Link } from 'react-router-dom';
import { ExternalLink, MessageSquare, FileCheck, Play, Send } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import PlatformBadge from './PlatformBadge';
import TaskTypeChip from './TaskTypeChip';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { STATUS_LABELS } from '../../config/constants';
import { formatDate } from '../../lib/formatters';

export default function AssignmentKanbanCard({ card, onOpen }) {
  const task = card.task;
  const postLink = task?.postLink;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer"
      onClick={() => onOpen?.(card)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen?.(card)}
    >
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={card.status} label={STATUS_LABELS.assignment[card.status]} />
          {task?.priority && (
            <PriorityBadge priority={task.priority} label={STATUS_LABELS.priority[task.priority]} />
          )}
        </div>

        <div>
          <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{task?.title}</h4>
          {postLink?.campaign?.name && (
            <p className="text-[11px] text-gray-400 mt-1">{postLink.campaign.name}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {postLink?.platform && <PlatformBadge platform={postLink.platform} />}
          {task?.taskType && <TaskTypeChip name={task.taskType.name} slug={task.taskType.slug} />}
        </div>

        <div className="flex items-center gap-3 text-gray-400">
          {card.requiresComment && <MessageSquare size={14} title="تعليق مطلوب" />}
          {card.requiresProof && <FileCheck size={14} title="إثبات مطلوب" />}
          {postLink?.url && (
            <a href={postLink.url} target="_blank" rel="noreferrer" className="hover:text-[#2563EB] mr-auto" onClick={(e) => e.stopPropagation()}>
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {task?.dueDate && (
          <p className="text-[11px] text-gray-500">الموعد: {formatDate(task.dueDate)}</p>
        )}

        <div className="flex gap-2 pt-1">
          {card.status === 'ASSIGNED' && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-1 rounded-lg">
              <Play size={12} /> ابدأ التنفيذ
            </span>
          )}
          {['IN_PROGRESS', 'REJECTED'].includes(card.status) && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg">
              <Send size={12} /> أرسل للمراجعة
            </span>
          )}
          <Link
            to={ROUTES.ASSIGNMENT_DETAILS(card.id)}
            className="text-xs text-gray-500 hover:text-gray-700 mr-auto"
            onClick={(e) => e.stopPropagation()}
          >
            التفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
}
