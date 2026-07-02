import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import TaskTypeChip from './TaskTypeChip';
import ProgressBar from '../common/ProgressBar';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import AvatarStack from './AvatarStack';
import { STATUS_LABELS } from '../../config/constants';
import { formatDate } from '../../lib/formatters';

export default function TaskCard({ task, assignments = [] }) {
  const assignees = assignments.map((a) => a.user).filter(Boolean);

  return (
    <Link to={ROUTES.TASK_DETAILS(task.id)} className="block group">
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-100 transition-all">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <ClipboardList size={16} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#2563EB]">{task.title}</h4>
              {task.taskType && <TaskTypeChip name={task.taskType.name} slug={task.taskType.slug} className="mt-1" />}
            </div>
          </div>
          <StatusBadge status={task.status} label={STATUS_LABELS.task[task.status]} />
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {task.priority && <PriorityBadge priority={task.priority} label={STATUS_LABELS.priority[task.priority]} />}
          {task.team?.name && <span className="text-xs text-gray-500">{task.team.name}</span>}
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>{task.completedCount || 0}/{task.targetCount || 0}</span>
            <span>{task.dueDate ? formatDate(task.dueDate) : ''}</span>
          </div>
          <ProgressBar value={task.targetCount ? Math.round(((task.completedCount || 0) / task.targetCount) * 100) : 0} />
        </div>
        {assignees.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <AvatarStack users={assignees} />
          </div>
        )}
      </div>
    </Link>
  );
}
