import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Ban, Send, Play } from 'lucide-react';
import { assignmentsService } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import { StatusBadge } from '../../components/common/Badge';
import usePermissions from '../../hooks/usePermissions';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { formatDateTime, formatStatus, getApiErrorMessage } from '../../lib/formatters';

const rejectSchema = z.object({
  rejectionReason: z.string().min(3, 'سبب الرفض مطلوب').max(500),
});

const submitSchema = z.object({
  selectedCommentSuggestionId: z.coerce.number().optional().or(z.literal('')),
  submittedComment: z.string().max(2000).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export default function AssignmentDetailsPage() {
  const { id } = useParams();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const [rejectModal, setRejectModal] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);

  const { data: assignment, isLoading, error, refetch } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentsService.get(id),
  });

  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ['assignment-activity', id],
    queryFn: () => assignmentsService.getActivity(id),
  });

  const rejectForm = useForm({ resolver: zodResolver(rejectSchema), defaultValues: { rejectionReason: '' } });
  const submitForm = useForm({ resolver: zodResolver(submitSchema), defaultValues: { selectedCommentSuggestionId: '', submittedComment: '', notes: '' } });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['assignment', id] });
    queryClient.invalidateQueries({ queryKey: ['assignment-activity', id] });
  };

  const approveMutation = useMutation({
    mutationFn: () => assignmentsService.approve(id),
    onSuccess: () => { invalidate(); toast.success('تمت الموافقة'); setApproveModal(false); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: (data) => assignmentsService.reject(id, data),
    onSuccess: () => { invalidate(); toast.success('تم الرفض'); setRejectModal(false); rejectForm.reset(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const submitMutation = useMutation({
    mutationFn: (data) => assignmentsService.submit(id, {
      ...data,
      selectedCommentSuggestionId: data.selectedCommentSuggestionId ? Number(data.selectedCommentSuggestionId) : null,
      submittedComment: data.submittedComment || null,
      notes: data.notes || null,
    }),
    onSuccess: () => { invalidate(); toast.success('تم الإرسال'); setSubmitModal(false); submitForm.reset(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const cancelMutation = useMutation({
    mutationFn: () => assignmentsService.cancel(id),
    onSuccess: () => { invalidate(); toast.success('تم الإلغاء'); setCancelModal(false); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const startMutation = useMutation({
    mutationFn: () => assignmentsService.start(id),
    onSuccess: () => { invalidate(); toast.success('تم بدء التنفيذ'); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل التعيين" onRetry={refetch} />;
  if (!assignment) return <ErrorState message="التعيين غير موجود" />;

  const canApprove = can('task_assignments.approve') && assignment.status === 'SUBMITTED';
  const canReject = can('task_assignments.reject') && assignment.status === 'SUBMITTED';
  const canSubmit = can('task_assignments.update') && ['IN_PROGRESS', 'REJECTED'].includes(assignment.status);
  const canStart = can('task_assignments.update') && ['ASSIGNED', 'REJECTED'].includes(assignment.status);
  const canCancel = can('task_assignments.update') && !['APPROVED', 'CANCELLED'].includes(assignment.status);

  const proofColumns = [
    { key: 'type', title: 'النوع', render: (row) => STATUS_LABELS.proofType[row.type] || row.type },
    {
      key: 'status',
      title: 'الحالة',
      render: (row) => <StatusBadge status={row.status} label={formatStatus(row.status, 'proof')} />,
    },
    { key: 'createdAt', title: 'التاريخ', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actions',
      title: 'عرض',
      render: (row) => (
        <Link to={ROUTES.PROOF_DETAILS(row.id)}>
          <Button variant="ghost" size="sm">تفاصيل</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`تعيين: ${assignment.task?.title || ''}`}
        subtitle={assignment.user?.name}
        action={
          <div className="flex gap-2 flex-wrap">
            {canStart && (
              <Button variant="accent" loading={startMutation.isPending} onClick={() => startMutation.mutate()}>
                <Play size={18} /> بدء التنفيذ
              </Button>
            )}
            {canSubmit && (
              <Button onClick={() => setSubmitModal(true)}><Send size={18} /> إرسال للمراجعة</Button>
            )}
            {canApprove && (
              <Button onClick={() => setApproveModal(true)}><CheckCircle size={18} /> موافقة</Button>
            )}
            {canReject && (
              <Button variant="danger" onClick={() => setRejectModal(true)}><XCircle size={18} /> رفض</Button>
            )}
            {canCancel && (
              <Button variant="secondary" onClick={() => setCancelModal(true)}><Ban size={18} /> إلغاء</Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-extrabold text-gray-900 mb-4">معلومات التعيين</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500 font-bold">المهمة</dt><dd>
              <Link to={ROUTES.TASK_DETAILS(assignment.taskId)} className="text-blue-600 font-bold">{assignment.task?.title}</Link>
            </dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 font-bold">المستخدم</dt><dd>{assignment.user?.name}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 font-bold">الفريق</dt><dd>{assignment.team?.name || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 font-bold">الحالة</dt><dd><StatusBadge status={assignment.status} label={formatStatus(assignment.status, 'assignment')} /></dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 font-bold">تاريخ الإسناد</dt><dd>{formatDateTime(assignment.assignedAt)}</dd></div>
            {assignment.startedAt && <div className="flex justify-between"><dt className="text-gray-500 font-bold">بدء التنفيذ</dt><dd>{formatDateTime(assignment.startedAt)}</dd></div>}
            {assignment.submittedAt && <div className="flex justify-between"><dt className="text-gray-500 font-bold">تاريخ الإرسال</dt><dd>{formatDateTime(assignment.submittedAt)}</dd></div>}
            {assignment.reviewedAt && <div className="flex justify-between"><dt className="text-gray-500 font-bold">تاريخ المراجعة</dt><dd>{formatDateTime(assignment.reviewedAt)}</dd></div>}
            {assignment.rejectionReason && (
              <div><dt className="text-gray-500 font-bold">سبب الرفض</dt><dd className="mt-1 text-red-600">{assignment.rejectionReason}</dd></div>
            )}
            {assignment.submittedComment && (
              <div><dt className="text-gray-500 font-bold">التعليق المُرسل</dt><dd className="mt-1">{assignment.submittedComment}</dd></div>
            )}
            {assignment.selectedCommentSuggestion && (
              <div><dt className="text-gray-500 font-bold">اقتراح التعليق</dt><dd className="mt-1">{assignment.selectedCommentSuggestion.text}</dd></div>
            )}
            {assignment.notes && (
              <div><dt className="text-gray-500 font-bold">ملاحظات</dt><dd className="mt-1">{assignment.notes}</dd></div>
            )}
          </dl>
        </Card>

        <Card>
          <h3 className="font-extrabold text-gray-900 mb-4">سجل النشاط</h3>
          {loadingActivity ? <LoadingState /> : <ActivityTimeline activities={activity || []} />}
        </Card>
      </div>

      <Card>
        <h3 className="font-extrabold text-gray-900 mb-4">إثباتات التنفيذ</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {proofColumns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-right font-extrabold text-gray-600">{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(assignment.proofs || []).length === 0 ? (
              <tr><td colSpan={proofColumns.length} className="px-4 py-8 text-center text-gray-500">لا توجد إثباتات</td></tr>
            ) : (
              assignment.proofs.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/30">
                  {proofColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3">{col.render ? col.render(row) : row[col.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Approve Modal */}
      <Modal open={approveModal} onClose={() => setApproveModal(false)} title="تأكيد الموافقة" size="sm">
        <p className="text-gray-600 mb-6">هل أنت متأكد من الموافقة على هذا التعيين؟</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setApproveModal(false)}>إلغاء</Button>
          <Button loading={approveMutation.isPending} onClick={() => approveMutation.mutate()}>موافقة</Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="رفض التعيين" size="md">
        <form onSubmit={rejectForm.handleSubmit((data) => rejectMutation.mutate(data))} className="space-y-4">
          <Textarea label="سبب الرفض *" error={rejectForm.formState.errors.rejectionReason?.message} {...rejectForm.register('rejectionReason')} />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setRejectModal(false)}>إلغاء</Button>
            <Button type="submit" variant="danger" loading={rejectMutation.isPending}>رفض</Button>
          </div>
        </form>
      </Modal>

      {/* Submit Modal */}
      <Modal open={submitModal} onClose={() => setSubmitModal(false)} title="إرسال للمراجعة" size="md">
        <form onSubmit={submitForm.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-4">
          <Textarea label="التعليق المُرسل" error={submitForm.formState.errors.submittedComment?.message} {...submitForm.register('submittedComment')} />
          <Textarea label="ملاحظات" error={submitForm.formState.errors.notes?.message} {...submitForm.register('notes')} />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setSubmitModal(false)}>إلغاء</Button>
            <Button type="submit" loading={submitMutation.isPending}>إرسال</Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="إلغاء التعيين" size="sm">
        <p className="text-gray-600 mb-6">هل أنت متأكد من إلغاء هذا التعيين؟</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setCancelModal(false)}>تراجع</Button>
          <Button variant="danger" loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>إلغاء</Button>
        </div>
      </Modal>
    </div>
  );
}
