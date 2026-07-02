import { Link } from 'react-router-dom';
import { Check, X, ExternalLink } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import PlatformBadge from './PlatformBadge';
import AvatarStack from './AvatarStack';
import { formatDate } from '../../lib/formatters';
import Button from '../common/Button';

export default function ReviewCard({ assignment, onApprove, onReject, isLoading }) {
  const task = assignment.task;
  const postLink = task?.postLink;
  const proof = assignment.proofs?.[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <AvatarStack users={[assignment.user]} max={1} size="lg" />
          <div>
            <p className="font-extrabold text-gray-900">{assignment.user?.name}</p>
            <p className="text-xs text-gray-500">{assignment.user?.email}</p>
          </div>
        </div>
        <span className="text-xs text-gray-400">{assignment.submittedAt ? formatDate(assignment.submittedAt) : ''}</span>
      </div>

      <div>
        <Link to={ROUTES.TASK_DETAILS(task?.id)} className="font-bold text-gray-900 hover:text-[#2563EB]">
          {task?.title}
        </Link>
        {postLink?.campaign?.name && (
          <p className="text-sm text-gray-500 mt-1">{postLink.campaign.name}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {postLink?.platform && <PlatformBadge platform={postLink.platform} />}
        {postLink?.url && (
          <a href={postLink.url} target="_blank" rel="noreferrer" className="text-xs text-[#2563EB] flex items-center gap-1">
            <ExternalLink size={12} /> افتح المنشور
          </a>
        )}
      </div>

      {assignment.submittedComment && (
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">التعليق المُرسل</p>
          <p className="text-sm text-gray-800">{assignment.submittedComment}</p>
        </div>
      )}

      {proof && (
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">الإثبات</p>
          {proof.fileUrl ? (
            <img src={proof.fileUrl} alt="إثبات" className="rounded-lg max-h-32 object-cover" />
          ) : (
            <p className="text-sm text-gray-700">{proof.text || proof.proofUrl || '—'}</p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={() => onApprove?.(assignment)} disabled={isLoading} className="flex-1 !bg-green-600 hover:!bg-green-700">
          <Check size={16} /> اعتماد
        </Button>
        <Button size="sm" variant="danger" onClick={() => onReject?.(assignment)} disabled={isLoading} className="flex-1">
          <X size={16} /> رفض
        </Button>
        <Link to={ROUTES.ASSIGNMENT_DETAILS(assignment.id)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 flex items-center">
          التفاصيل
        </Link>
      </div>
    </div>
  );
}
