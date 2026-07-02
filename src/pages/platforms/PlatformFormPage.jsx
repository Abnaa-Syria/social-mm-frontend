import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { platformsService } from '../../services/index.js';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getApiErrorMessage } from '../../lib/formatters';
import { ROUTES } from '../../config/routes';

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  slug: z.string().regex(/^[a-z0-9_]+$/, 'المعرّف: أحرف إنجليزية صغيرة وأرقام و _ فقط'),
  baseUrl: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  icon: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
});

export default function PlatformFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: platform, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', id],
    queryFn: () => platformsService.get(id),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', baseUrl: '', icon: '', isActive: true },
  });

  useEffect(() => {
    if (platform) {
      reset({
        name: platform.name,
        slug: platform.slug,
        baseUrl: platform.baseUrl || '',
        icon: platform.icon || '',
        isActive: platform.isActive,
      });
    }
  }, [platform, reset]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        icon: formData.icon || null,
        baseUrl: formData.baseUrl || null,
        isActive: formData.isActive,
      };
      if (isEdit) {
        const { isActive, ...updateData } = payload;
        await platformsService.update(id, updateData);
        if (isActive !== platform?.isActive) {
          await platformsService.updateActive(id, isActive);
        }
        return;
      }
      return platformsService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'تم تحديث المنصة بنجاح' : 'تم إنشاء المنصة بنجاح');
      navigate(ROUTES.PLATFORMS);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isEdit && isLoading) return <LoadingState />;
  if (isEdit && error) return <ErrorState message="فشل تحميل المنصة" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'تعديل المنصة' : 'إضافة منصة'}
        subtitle={isEdit ? platform?.name : 'إنشاء منصة سوشيال ميديا جديدة'}
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
          <Input label="الاسم" error={errors.name?.message} {...register('name')} />
          <Input label="المعرّف (slug)" error={errors.slug?.message} placeholder="instagram" {...register('slug')} />
          <Input label="الرابط الأساسي" error={errors.baseUrl?.message} placeholder="https://instagram.com" {...register('baseUrl')} />
          <Input label="الأيقونة" error={errors.icon?.message} placeholder="📸" {...register('icon')} />
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <input type="checkbox" className="rounded" {...register('isActive')} />
            منصة نشطة
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending}>{isEdit ? 'حفظ التعديلات' : 'إنشاء المنصة'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.PLATFORMS)}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
