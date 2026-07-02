import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import AvatarStack from './AvatarStack';
import { StatusBadge } from '../common/Badge';
import { STATUS_LABELS } from '../../config/constants';
import { formatDateTime } from '../../lib/formatters';
import Button from '../common/Button';

export default function AssignmentCard({ assignment, onApprove, onReject, showActions }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3">
        <AvatarStack users={[assignment.user]} max={1} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{assignment.user?.name}</p>
          <StatusBadge status={assignment.status} label={STATUS_LABELS.assignment[assignment.status]} />
        </div>
      </div>
      {assignment.submittedComment && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2 bg-gray-50 rounded-lg p-2">{assignment.submittedComment}</p>
      )}
      <p className="text-[11px] text-gray-400 mt-2">{assignment.assignedAt ? formatDateTime(assignment.assignedAt) : ''}</p>
      <div className="flex gap-2 mt-3">
        <Link to={ROUTES.ASSIGNMENT_DETAILS(assignment.id)} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">التفاصيل</Button>
        </Link>
        {showActions && assignment.status === 'SUBMITTED' && (
          <>
            {onApprove && <Button size="sm" className="!bg-green-600" onClick={() => onApprove(assignment)}>اعتماد</Button>}
            {onReject && <Button size="sm" variant="danger" onClick={() => onReject(assignment)}>رفض</Button>}
          </>
        )}
      </div>
    </div>
  );
}
