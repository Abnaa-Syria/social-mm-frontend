import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taskTypesService } from '../../services/index.js';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getApiErrorMessage } from '../../lib/formatters';
import { ROUTES } from '../../config/routes';

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  slug: z.string().regex(/^[a-z0-9_]+$/, 'المعرّف: أحرف إنجليزية صغيرة وأرقام و _ فقط'),
  description: z.string().max(500).optional(),
  requiresComment: z.boolean().default(false),
  requiresProof: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export default function TaskTypeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: taskType, isLoading, error, refetch } = useQuery({
    queryKey: ['task-type', id],
    queryFn: () => taskTypesService.get(id),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      requiresComment: false,
      requiresProof: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (taskType) {
      reset({
        name: taskType.name,
        slug: taskType.slug,
        description: taskType.description || '',
        requiresComment: taskType.requiresComment,
        requiresProof: taskType.requiresProof,
        isActive: taskType.isActive,
      });
    }
  }, [taskType, reset]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        requiresComment: formData.requiresComment,
        requiresProof: formData.requiresProof,
        isActive: formData.isActive,
      };
      if (isEdit) {
        const { isActive, ...updateData } = payload;
        await taskTypesService.update(id, updateData);
        if (isActive !== taskType?.isActive) {
          await taskTypesService.updateActive(id, isActive);
        }
        return;
      }
      return taskTypesService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'تم تحديث نوع المهمة بنجاح' : 'تم إنشاء نوع المهمة بنجاح');
      navigate(ROUTES.TASK_TYPES);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isEdit && isLoading) return <LoadingState />;
  if (isEdit && error) return <ErrorState message="فشل تحميل نوع المهمة" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'تعديل نوع المهمة' : 'إضافة نوع مهمة'}
        subtitle={isEdit ? taskType?.name : 'إنشاء نوع مهمة جديد'}
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
          <Input label="الاسم" error={errors.name?.message} {...register('name')} />
          <Input label="المعرّف (slug)" error={errors.slug?.message} placeholder="like_post" {...register('slug')} disabled={taskType?.isSystem} />
          <Textarea label="الوصف" error={errors.description?.message} {...register('description')} />

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <input type="checkbox" className="rounded" {...register('requiresComment')} />
              يتطلب تعليق
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <input type="checkbox" className="rounded" {...register('requiresProof')} />
              يتطلب إثبات تنفيذ
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <input type="checkbox" className="rounded" {...register('isActive')} />
              نوع نشط
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending} disabled={taskType?.isSystem}>
              {isEdit ? 'حفظ التعديلات' : 'إنشاء نوع المهمة'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.TASK_TYPES)}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
