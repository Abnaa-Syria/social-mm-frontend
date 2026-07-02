import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Plus, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { postLinksService } from '../../services';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PlatformBadge from '../../components/workspace/PlatformBadge';
import TaskCard from '../../components/workspace/TaskCard';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/Badge';
import Select from '../../components/common/Select';
import usePermissions from '../../hooks/usePermissions';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { formatDate, formatDateTime, formatStatus, getApiErrorMessage } from '../../lib/formatters';

export default function PostLinkDetailsPage() {
  const { id } = useParams();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const { data: postLink, isLoading, error, refetch } = useQuery({
    queryKey: ['post-link', id],
    queryFn: () => postLinksService.get(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status) => postLinksService.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-link', id] });
      toast.success('تم تحديث الحالة');
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل تفاصيل الرابط" onRetry={refetch} />;
  if (!postLink) return <ErrorState message="الرابط غير موجود" />;

  const progress = postLink.progress || { percentage: 0, completedTasks: 0, totalTasks: 0 };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-l from-[#2563EB] to-[#14B8A6]" />
        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PlatformBadge platform={postLink.platform} />
              <StatusBadge status={postLink.status} label={formatStatus(postLink.status, 'postLink')} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">{postLink.title || 'رابط المنشور'}</h1>
            <p className="text-sm text-gray-500 mt-1 truncate max-w-xl">{postLink.url}</p>
            {postLink.campaign?.name && (
              <Link to={ROUTES.CAMPAIGN_DETAILS(postLink.campaign.id)} className="text-sm text-[#2563EB] hover:underline mt-1 inline-block">
                {postLink.campaign.name}
              </Link>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href={postLink.url} target="_blank" rel="noopener noreferrer">
              <Button variant="accent"><ExternalLink size={18} /> افتح المنشور الأصلي</Button>
            </a>
            {can('post_links.update') && (
              <Link to={ROUTES.POST_LINK_EDIT(id)}>
                <Button variant="secondary"><Pencil size={18} /> تعديل</Button>
              </Link>
            )}
            {can('tasks.create') && (
              <Link to={`${ROUTES.TASK_CREATE}?postLinkId=${id}`}>
                <Button><Plus size={18} /> أنشئ مهمة</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-extrabold text-gray-900 mb-4">معلومات الرابط</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><dt className="text-gray-500 font-bold">الحملة</dt><dd className="mt-1">{postLink.campaign?.name || '—'}</dd></div>
            <div><dt className="text-gray-500 font-bold">المنصة</dt><dd className="mt-1">{postLink.platform?.name || '—'}</dd></div>
            <div><dt className="text-gray-500 font-bold">الحالة</dt><dd className="mt-1"><StatusBadge status={postLink.status} label={formatStatus(postLink.status, 'postLink')} /></dd></div>
            <div><dt className="text-gray-500 font-bold">تاريخ الاستحقاق</dt><dd className="mt-1">{formatDate(postLink.dueDate)}</dd></div>
            <div><dt className="text-gray-500 font-bold">أنشأه</dt><dd className="mt-1">{postLink.createdBy?.name || '—'}</dd></div>
            <div><dt className="text-gray-500 font-bold">تاريخ الإنشاء</dt><dd className="mt-1">{formatDateTime(postLink.createdAt)}</dd></div>
            {postLink.description && (
              <div className="sm:col-span-2"><dt className="text-gray-500 font-bold">الوصف</dt><dd className="mt-1">{postLink.description}</dd></div>
            )}
          </dl>

          {can('post_links.update') && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Select
                label="تحديث الحالة"
                value={postLink.status}
                onChange={(e) => statusMutation.mutate(e.target.value)}
                disabled={statusMutation.isPending}
              >
                {Object.entries(STATUS_LABELS.postLink).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-extrabold text-gray-900 mb-4">التقدم</h3>
          <div className="space-y-3">
            <ProgressBar value={progress.percentage} />
            <p className="text-sm text-gray-600">
              {progress.completedTasks} من {progress.totalTasks} مهام مكتملة ({progress.percentage}%)
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-gray-900">المهام المرتبطة</h3>
          {can('tasks.create') && (
            <Link to={`${ROUTES.TASK_CREATE}?postLinkId=${id}`}>
              <Button size="sm"><Plus size={16} /> إضافة مهمة</Button>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(postLink.tasks || []).length ? (
            postLink.tasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <p className="text-gray-500 text-sm col-span-2 text-center py-8">لا توجد مهام بعد — أنشئ مهمة للبدء</p>
          )}
        </div>
      </Card>
    </div>
  );
}
