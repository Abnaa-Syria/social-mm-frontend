import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Pencil, UserPlus, ExternalLink } from 'lucide-react';
import { tasksService, assignmentsService } from '../../services';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import AssignmentCard from '../../components/workspace/AssignmentCard';
import TaskTypeChip from '../../components/workspace/TaskTypeChip';
import PlatformBadge from '../../components/workspace/PlatformBadge';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import usePermissions from '../../hooks/usePermissions';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { formatDate, formatDateTime, formatStatus, formatPriority, getApiErrorMessage } from '../../lib/formatters';

export default function TaskDetailsPage() {
  const { id } = useParams();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const { data: task, isLoading, error, refetch } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksService.get(id),
  });

  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ['task-activity', id],
    queryFn: () => tasksService.getActivity(id),
  });

  const { data: usersData } = useQuery({
    queryKey: ['task-available-members', id],
    queryFn: () => tasksService.getAvailableMembers(id),
    enabled: assignModalOpen,
  });

  const bulkAssignMutation = useMutation({
    mutationFn: (userIds) => tasksService.assignTeamMembers(id, userIds?.length ? { userIds } : {}),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['task-activity', id] });
      toast.success(`تم تعيين ${result.created?.length || 0} عضو`);
      setAssignModalOpen(false);
      setSelectedUsers([]);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: (status) => tasksService.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['task-activity', id] });
      toast.success('تم تحديث الحالة');
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const assignMutation = useMutation({
    mutationFn: () => assignmentsService.create({ taskId: Number(id), userIds: selectedUsers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['task-activity', id] });
      toast.success('تم إسناد المستخدمين');
      setAssignModalOpen(false);
      setSelectedUsers([]);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((u) => u !== userId) : [...prev, userId]
    );
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل المهمة" onRetry={refetch} />;
  if (!task) return <ErrorState message="المهمة غير موجودة" />;

  const progress = task.progress || { percentage: 0, completedCount: 0, targetCount: 0 };
  const availableUsers = usersData?.available || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-l from-[#7C3AED] to-[#2563EB]" />
        <div className="p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {task.taskType && <TaskTypeChip name={task.taskType.name} slug={task.taskType.slug} />}
              <StatusBadge status={task.status} label={formatStatus(task.status, 'task')} />
              <PriorityBadge priority={task.priority} label={formatPriority(task.priority)} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">{task.title}</h1>
            {task.postLink && (
              <div className="flex items-center gap-2 mt-2">
                {task.postLink.platform && <PlatformBadge platform={task.postLink.platform} />}
                <Link to={ROUTES.POST_LINK_DETAILS(task.postLink.id)} className="text-sm text-[#2563EB] hover:underline">
                  {task.postLink.title || 'رابط المنشور'}
                </Link>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {can('tasks.update') && (
              <Link to={ROUTES.TASK_EDIT(id)}>
                <Button variant="secondary" size="sm"><Pencil size={16} /> تعديل</Button>
              </Link>
            )}
            {can('task_assignments.create') && (
              <Button size="sm" onClick={() => setAssignModalOpen(true)}><UserPlus size={16} /> تعيين أعضاء</Button>
            )}
            {task.postLink?.url && (
              <a href={task.postLink.url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost"><ExternalLink size={16} /> المنشور</Button>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-extrabold text-gray-900 mb-4">معلومات المهمة</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><dt className="text-gray-500 font-bold">رابط المنشور</dt><dd className="mt-1 flex items-center gap-2">
              {task.postLink?.title || task.postLink?.url || '—'}
              {task.postLink?.url && (
                <a href={task.postLink.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  <ExternalLink size={14} />
                </a>
              )}
            </dd></div>
            <div><dt className="text-gray-500 font-bold">الفريق</dt><dd className="mt-1">{task.team?.name || '—'}</dd></div>
            <div><dt className="text-gray-500 font-bold">الحالة</dt><dd className="mt-1"><StatusBadge status={task.status} label={formatStatus(task.status, 'task')} /></dd></div>
            <div><dt className="text-gray-500 font-bold">الأولوية</dt><dd className="mt-1"><PriorityBadge priority={task.priority} label={formatPriority(task.priority)} /></dd></div>
            <div><dt className="text-gray-500 font-bold">تاريخ الاستحقاق</dt><dd className="mt-1">{formatDate(task.dueDate)}</dd></div>
            <div><dt className="text-gray-500 font-bold">أنشأها</dt><dd className="mt-1">{task.createdBy?.name || '—'}</dd></div>
            {task.description && (
              <div className="sm:col-span-2"><dt className="text-gray-500 font-bold">الوصف</dt><dd className="mt-1">{task.description}</dd></div>
            )}
          </dl>

          {can('tasks.update') && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Select
                label="تحديث الحالة"
                value={task.status}
                onChange={(e) => statusMutation.mutate(e.target.value)}
                disabled={statusMutation.isPending}
              >
                {Object.entries(STATUS_LABELS.task).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-extrabold text-gray-900 mb-4">التقدم</h3>
          <ProgressBar value={progress.percentage} />
          <p className="text-sm text-gray-600 mt-2">
            {progress.completedCount} من {progress.targetCount} ({progress.percentage}%)
          </p>
          {task.assignmentsByStatus && (
            <div className="mt-4 space-y-1 text-xs text-gray-500">
              {Object.entries(task.assignmentsByStatus).map(([s, count]) => (
                <div key={s}>{formatStatus(s, 'assignment')}: {count}</div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="font-extrabold text-gray-900 mb-4">التعيينات</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(task.assignments || []).length ? (
            task.assignments.map((a) => <AssignmentCard key={a.id} assignment={a} />)
          ) : (
            <p className="text-gray-500 text-sm col-span-full text-center py-6">لا توجد تعيينات — عيّن أعضاء الفريق</p>
          )}
        </div>
      </Card>

      {(task.commentSuggestions?.length > 0) && (
        <Card>
          <h3 className="font-extrabold text-gray-900 mb-4">اقتراحات التعليقات</h3>
          <div className="space-y-3">
            {task.commentSuggestions.map((s) => (
              <div key={s.id} className="p-3 bg-gray-50 rounded-xl text-sm">
                <p>{s.text}</p>
                <div className="flex gap-2 mt-2 text-xs text-gray-500">
                  <span>{s.language}</span>
                  <span>•</span>
                  <span>{STATUS_LABELS.commentTone[s.tone] || s.tone}</span>
                  {s.usageLimit != null && <span>• {s.usedCount}/{s.usageLimit}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="font-extrabold text-gray-900 mb-4">سجل النشاط</h3>
        {loadingActivity ? <LoadingState /> : <ActivityTimeline activities={activity || []} />}
      </Card>

      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="إسناد مستخدمين" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">اختر المستخدمين لإسناد المهمة إليهم</p>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableUsers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">لا يوجد مستخدمون متاحون</p>
            ) : (
              availableUsers.map((user) => (
                <label key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="rounded"
                  />
                  <span className="text-sm font-bold">{user.name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </label>
              ))
            )}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>إلغاء</Button>
            <Button
              loading={assignMutation.isPending || bulkAssignMutation.isPending}
              disabled={selectedUsers.length === 0}
              onClick={() => bulkAssignMutation.mutate(selectedUsers)}
            >
              تعيين ({selectedUsers.length})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
