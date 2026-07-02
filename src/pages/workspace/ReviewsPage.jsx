import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { workspaceService, assignmentsService } from '../../services';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ReviewCard from '../../components/workspace/ReviewCard';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getApiErrorMessage } from '../../lib/formatters';

const rejectSchema = z.object({
  rejectionReason: z.string().min(3, 'سبب الرفض مطلوب').max(500),
});

const TABS = [
  { id: 'assignments', label: 'تعيينات قيد المراجعة' },
  { id: 'proofs', label: 'إثباتات قيد المراجعة' },
  { id: 'rejected', label: 'مرفوضة مؤخراً' },
  { id: 'approved', label: 'معتمدة مؤخراً' },
];

export default function ReviewsPage() {
  const [tab, setTab] = useState('assignments');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['review-queue'],
    queryFn: workspaceService.getReviewQueue,
  });

  const rejectForm = useForm({ resolver: zodResolver(rejectSchema), defaultValues: { rejectionReason: '' } });

  const approveMutation = useMutation({
    mutationFn: (id) => assignmentsService.approve(id),
    onSuccess: () => {
      toast.success('تم الاعتماد بنجاح');
      setApproveTarget(null);
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, data: body }) => assignmentsService.reject(id, body),
    onSuccess: () => {
      toast.success('تم الرفض');
      setRejectTarget(null);
      rejectForm.reset();
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل قائمة المراجعة" onRetry={refetch} />;

  const items = {
    assignments: data?.submittedAssignments || [],
    proofs: data?.pendingProofs || [],
    rejected: data?.recentlyRejected || [],
    approved: data?.recentlyApproved || [],
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-2xl font-extrabold text-gray-900">قيد المراجعة</h1>
        <p className="text-gray-500 mt-1">راجع التنفيذ، اعتمد أو ارفض التعيينات والإثباتات.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-[#2563EB] text-white shadow' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}
          >
            {t.label}
            {t.id === 'assignments' && data?.counts?.assignments ? ` (${data.counts.assignments})` : ''}
            {t.id === 'proofs' && data?.counts?.proofs ? ` (${data.counts.proofs})` : ''}
          </button>
        ))}
      </div>

      {tab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {items.assignments.length ? items.assignments.map((a) => (
            <ReviewCard
              key={a.id}
              assignment={a}
              isLoading={approveMutation.isPending || rejectMutation.isPending}
              onApprove={(item) => setApproveTarget(item)}
              onReject={(item) => setRejectTarget(item)}
            />
          )) : (
            <p className="text-gray-500 col-span-2 text-center py-12">لا توجد تعيينات قيد المراجعة</p>
          )}
        </div>
      )}

      {tab === 'proofs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {items.proofs.length ? items.proofs.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border p-5">
              <p className="font-bold">{p.assignment?.user?.name}</p>
              <p className="text-sm text-gray-500 mt-1">{p.assignment?.task?.title}</p>
              {p.fileUrl && <img src={p.fileUrl} alt="" className="mt-3 rounded-lg max-h-40" />}
            </div>
          )) : (
            <p className="text-gray-500 col-span-2 text-center py-12">لا توجد إثباتات قيد المراجعة</p>
          )}
        </div>
      )}

      {(tab === 'rejected' || tab === 'approved') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items[tab].map((a) => (
            <ReviewCard key={a.id} assignment={a} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => approveMutation.mutate(approveTarget.id)}
        title="تأكيد الاعتماد"
        message={`هل تريد اعتماد تعيين ${approveTarget?.user?.name}؟`}
        loading={approveMutation.isPending}
      />

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="رفض التعيين">
        <form onSubmit={rejectForm.handleSubmit((formData) => rejectMutation.mutate({ id: rejectTarget.id, data: formData }))} className="space-y-4">
          <Textarea
            label="سبب الرفض"
            {...rejectForm.register('rejectionReason')}
            error={rejectForm.formState.errors.rejectionReason?.message}
            rows={4}
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setRejectTarget(null)}>إلغاء</Button>
            <Button type="submit" variant="danger" loading={rejectMutation.isPending}>رفض</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
