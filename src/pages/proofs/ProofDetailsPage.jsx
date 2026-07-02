import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { proofsService } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/Badge';
import usePermissions from '../../hooks/usePermissions';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { formatDateTime, formatStatus, getApiErrorMessage } from '../../lib/formatters';

const rejectSchema = z.object({
  rejectionReason: z.string().min(3, 'سبب الرفض مطلوب').max(500),
});

const isImageUrl = (url) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(url) || url.includes('/uploads/');
};

export default function ProofDetailsPage() {
  const { id } = useParams();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);

  const { data: proof, isLoading, error, refetch } = useQuery({
    queryKey: ['proof', id],
    queryFn: () => proofsService.get(id),
  });

  const rejectForm = useForm({ resolver: zodResolver(rejectSchema), defaultValues: { rejectionReason: '' } });

  const approveMutation = useMutation({
    mutationFn: () => proofsService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proof', id] });
      toast.success('تمت الموافقة على الإثبات');
      setApproveModal(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: (data) => proofsService.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proof', id] });
      toast.success('تم رفض الإثبات');
      setRejectModal(false);
      rejectForm.reset();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل الإثبات" onRetry={refetch} />;
  if (!proof) return <ErrorState message="الإثبات غير موجود" />;

  const canApprove = can('proofs.approve') && proof.status === 'PENDING';
  const canReject = can('proofs.reject') && proof.status === 'PENDING';
  const imageUrl = proof.fileUrl || (isImageUrl(proof.proofUrl) ? proof.proofUrl : null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="تفاصيل الإثبات"
        subtitle={`تعيين #${proof.assignmentId}`}
        action={
          <div className="flex gap-2">
            {canApprove && (
              <Button onClick={() => setApproveModal(true)}><CheckCircle size={18} /> موافقة</Button>
            )}
            {canReject && (
              <Button variant="danger" onClick={() => setRejectModal(true)}><XCircle size={18} /> رفض</Button>
            )}
            <Link to={ROUTES.ASSIGNMENT_DETAILS(proof.assignmentId)}>
              <Button variant="secondary">عرض التعيين</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-extrabold text-gray-900 mb-4">معلومات الإثبات</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500 font-bold">النوع</dt><dd>{STATUS_LABELS.proofType[proof.type] || proof.type}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 font-bold">الحالة</dt><dd><StatusBadge status={proof.status} label={formatStatus(proof.status, 'proof')} /></dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 font-bold">التعيين</dt><dd>
              <Link to={ROUTES.ASSIGNMENT_DETAILS(proof.assignmentId)} className="text-blue-600 font-bold">#{proof.assignmentId}</Link>
            </dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 font-bold">تاريخ الإنشاء</dt><dd>{formatDateTime(proof.createdAt)}</dd></div>
            {proof.reviewedAt && <div className="flex justify-between"><dt className="text-gray-500 font-bold">تاريخ المراجعة</dt><dd>{formatDateTime(proof.reviewedAt)}</dd></div>}
            {proof.rejectionReason && (
              <div><dt className="text-gray-500 font-bold">سبب الرفض</dt><dd className="mt-1 text-red-600">{proof.rejectionReason}</dd></div>
            )}
            {proof.text && (
              <div><dt className="text-gray-500 font-bold">النص</dt><dd className="mt-1 whitespace-pre-wrap">{proof.text}</dd></div>
            )}
            {proof.proofUrl && !imageUrl && (
              <div><dt className="text-gray-500 font-bold">الرابط</dt><dd className="mt-1">
                <a href={proof.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center gap-1" dir="ltr">
                  {proof.proofUrl} <ExternalLink size={14} />
                </a>
              </dd></div>
            )}
          </dl>
        </Card>

        {imageUrl && (
          <Card>
            <h3 className="font-extrabold text-gray-900 mb-4">الصورة</h3>
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
              <img
                src={imageUrl}
                alt="إثبات التنفيذ"
                className="w-full max-h-[400px] object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600">
              فتح الصورة <ExternalLink size={14} />
            </a>
          </Card>
        )}
      </div>

      <Modal open={approveModal} onClose={() => setApproveModal(false)} title="تأكيد الموافقة" size="sm">
        <p className="text-gray-600 mb-6">هل أنت متأكد من الموافقة على هذا الإثبات؟</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setApproveModal(false)}>إلغاء</Button>
          <Button loading={approveMutation.isPending} onClick={() => approveMutation.mutate()}>موافقة</Button>
        </div>
      </Modal>

      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="رفض الإثبات" size="md">
        <form onSubmit={rejectForm.handleSubmit((data) => rejectMutation.mutate(data))} className="space-y-4">
          <Textarea label="سبب الرفض *" error={rejectForm.formState.errors.rejectionReason?.message} {...rejectForm.register('rejectionReason')} />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setRejectModal(false)}>إلغاء</Button>
            <Button type="submit" variant="danger" loading={rejectMutation.isPending}>رفض</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
