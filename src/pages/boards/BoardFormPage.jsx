import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { boardsService } from '../../services/index.js';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getApiErrorMessage } from '../../lib/formatters';
import { STATUS_LABELS } from '../../config/constants';
import { ROUTES } from '../../config/routes';

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  description: z.string().max(1000).optional(),
  color: z.string().max(20).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export default function BoardFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: board, isLoading, error, refetch } = useQuery({
    queryKey: ['board', id],
    queryFn: () => boardsService.get(id),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', color: '#2563EB', status: 'ACTIVE' },
  });

  useEffect(() => {
    if (board) {
      reset({
        name: board.name,
        description: board.description || '',
        color: board.color || '#2563EB',
        status: board.status,
      });
    }
  }, [board, reset]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        color: formData.color || null,
      };
      if (isEdit) {
        await boardsService.update(id, payload);
        if (formData.status !== board?.status) {
          await boardsService.updateStatus(id, { status: formData.status });
        }
        return;
      }
      return boardsService.create({ ...payload, status: formData.status });
    },
    onSuccess: () => {
      toast.success(isEdit ? 'تم تحديث البورد بنجاح' : 'تم إنشاء البورد بنجاح');
      navigate(ROUTES.BOARDS);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isEdit && isLoading) return <LoadingState />;
  if (isEdit && error) return <ErrorState message="فشل تحميل البورد" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'تعديل البورد' : 'إضافة بورد'}
        subtitle={isEdit ? board?.name : 'إنشاء بورد عمل جديد'}
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
          <Input label="الاسم" error={errors.name?.message} {...register('name')} />
          <Textarea label="الوصف" error={errors.description?.message} {...register('description')} />
          <Input label="اللون" type="color" error={errors.color?.message} className="h-12 p-1" {...register('color')} />
          <Select label="الحالة" error={errors.status?.message} {...register('status')}>
            {Object.entries(STATUS_LABELS.board).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending}>{isEdit ? 'حفظ التعديلات' : 'إنشاء البورد'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.BOARDS)}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
