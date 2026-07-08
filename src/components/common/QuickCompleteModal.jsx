import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ExternalLink, Zap } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Textarea from './Textarea';
import Select from './Select';
import FileUploader from './FileUploader';
import { assignmentsService, proofsService, tasksService } from '../../services';
import { getApiErrorMessage } from '../../lib/formatters';

const schema = z.object({
  selectedCommentSuggestionId: z.coerce.number().optional().or(z.literal('')),
  submittedComment: z.string().max(2000).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
  proofType: z.string().optional(),
  proofUrl: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  proofText: z.string().max(5000).optional().or(z.literal('')),
});

export default function QuickCompleteModal({ assignment, open, onClose }) {
  const queryClient = useQueryClient();
  const [proofFile, setProofFile] = useState(null);

  const taskId = assignment?.taskId;
  const requiresProof = assignment?.requiresProof || assignment?.task?.taskType?.requiresProof;
  const requiresComment = assignment?.requiresComment || assignment?.task?.taskType?.requiresComment;

  const { data: suggestions } = useQuery({
    queryKey: ['comment-suggestions', taskId],
    queryFn: () => tasksService.getAvailableCommentSuggestions(taskId),
    enabled: open && !!taskId && requiresComment,
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      selectedCommentSuggestionId: '',
      submittedComment: '',
      notes: '',
      proofType: requiresProof ? 'SCREENSHOT' : '',
      proofUrl: '',
      proofText: '',
    },
  });

  const proofType = watch('proofType');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['my-work'] });
    queryClient.invalidateQueries({ queryKey: ['workspace-overview'] });
    if (assignment?.id) {
      queryClient.invalidateQueries({ queryKey: ['assignment', String(assignment.id)] });
    }
  };

  const completeMutation = useMutation({
    mutationFn: async (data) => {
      const id = assignment.id;

      if (['ASSIGNED', 'REJECTED'].includes(assignment.status)) {
        await assignmentsService.start(id);
      }

      if (requiresProof && data.proofType) {
        const formData = new FormData();
        formData.append('assignmentId', String(id));
        formData.append('type', data.proofType);
        if (data.proofType === 'URL' && data.proofUrl) formData.append('proofUrl', data.proofUrl);
        if (data.proofType === 'TEXT' && data.proofText) formData.append('text', data.proofText);
        if ((data.proofType === 'SCREENSHOT' || data.proofType === 'FILE') && proofFile) {
          formData.append('file', proofFile);
        }
        await proofsService.create(formData);
      }

      await assignmentsService.submit(id, {
        selectedCommentSuggestionId: data.selectedCommentSuggestionId ? Number(data.selectedCommentSuggestionId) : null,
        submittedComment: data.submittedComment || null,
        notes: data.notes || null,
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success('تم التنفيذ والإرسال للمراجعة بنجاح');
      onClose();
      setProofFile(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (!assignment) return null;

  const postUrl = assignment.task?.postLink?.url;

  return (
    <Modal open={open} onClose={onClose} title="تنفيذ سريع — إنجاز وإرسال" size="md">
      <div className="space-y-4">
        <div className="rounded-xl bg-teal-50 border border-teal-100 p-4 text-sm">
          <div className="flex items-start gap-2">
            <Zap size={18} className="text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-teal-900">خطوة واحدة بدل عدة صفحات</p>
              <p className="text-teal-700 mt-1 text-xs leading-relaxed">
                سيبدأ التنفيذ تلقائياً (إن لم يبدأ)، ثم يُرسل للمراجعة. نفّذ الإجراء على المنصة أولاً ثم أكمل هنا.
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm">
          <p className="font-bold text-gray-900">{assignment.task?.title}</p>
          {postUrl && (
            <a href={postUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#2563EB] text-xs mt-1 hover:underline">
              <ExternalLink size={14} /> افتح المنشور ونفّذ الآن
            </a>
          )}
        </div>

        <form onSubmit={handleSubmit((data) => completeMutation.mutate(data))} className="space-y-4">
          {requiresComment && (
            <>
              {suggestions?.length > 0 && (
                <Select
                  label="اقتراح تعليق (اختياري)"
                  error={errors.selectedCommentSuggestionId?.message}
                  {...register('selectedCommentSuggestionId')}
                >
                  <option value="">— اختر اقتراحاً —</option>
                  {suggestions.map((s) => (
                    <option key={s.id} value={s.id}>{s.text?.slice(0, 80)}</option>
                  ))}
                </Select>
              )}
              <Textarea label="التعليق المُرسل" error={errors.submittedComment?.message} {...register('submittedComment')} />
            </>
          )}

          {requiresProof && (
            <div className="space-y-3 rounded-xl border border-gray-100 p-4 bg-gray-50/50">
              <p className="text-sm font-bold text-gray-700">إثبات التنفيذ</p>
              <Select label="نوع الإثبات" {...register('proofType')}>
                <option value="SCREENSHOT">لقطة شاشة</option>
                <option value="URL">رابط</option>
                <option value="TEXT">نص</option>
                <option value="FILE">ملف</option>
              </Select>
              {proofType === 'URL' && (
                <Textarea label="رابط الإثبات" dir="ltr" error={errors.proofUrl?.message} {...register('proofUrl')} />
              )}
              {proofType === 'TEXT' && (
                <Textarea label="نص الإثبات" error={errors.proofText?.message} {...register('proofText')} />
              )}
              {(proofType === 'SCREENSHOT' || proofType === 'FILE') && (
                <FileUploader label="ارفع الإثبات" onChange={setProofFile} />
              )}
            </div>
          )}

          <Textarea label="ملاحظات (اختياري)" error={errors.notes?.message} {...register('notes')} />

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
            <Button type="submit" loading={completeMutation.isPending}>
              <Zap size={16} /> أنجز وأرسل للمراجعة
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
