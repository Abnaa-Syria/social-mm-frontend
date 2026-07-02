import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { teamsService, boardsService, usersService } from '../../services/index.js';
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
  boardId: z.coerce.number().positive().optional().or(z.literal('')),
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  description: z.string().max(1000).optional(),
  type: z.enum(['LIKES', 'COMMENTS', 'SHARES', 'SAVES', 'FOLLOWS', 'REVIEWS', 'CUSTOM']).default('CUSTOM'),
  color: z.string().max(20).optional(),
  leaderId: z.coerce.number().positive().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export default function TeamFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: boardsData } = useQuery({
    queryKey: ['boards', 'all'],
    queryFn: () => boardsService.list({ limit: 100 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', 'active'],
    queryFn: () => usersService.list({ limit: 100, status: 'ACTIVE' }),
  });

  const { data: team, isLoading, error, refetch } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamsService.get(id),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      boardId: '',
      name: '',
      description: '',
      type: 'CUSTOM',
      color: '#7C3AED',
      leaderId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (team) {
      reset({
        boardId: team.boardId || '',
        name: team.name,
        description: team.description || '',
        type: team.type,
        color: team.color || '#7C3AED',
        leaderId: team.leaderId || '',
        isActive: team.isActive,
      });
    }
  }, [team, reset]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        boardId: formData.boardId || null,
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        color: formData.color || null,
        leaderId: formData.leaderId || null,
        isActive: formData.isActive,
      };
      if (isEdit) {
        const { isActive, ...updateData } = payload;
        await teamsService.update(id, updateData);
        if (isActive !== team?.isActive) {
          await teamsService.updateActive(id, isActive);
        }
        return;
      }
      return teamsService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'تم تحديث الفريق بنجاح' : 'تم إنشاء الفريق بنجاح');
      navigate(ROUTES.TEAMS);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isEdit && isLoading) return <LoadingState />;
  if (isEdit && error) return <ErrorState message="فشل تحميل الفريق" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'تعديل الفريق' : 'إضافة فريق'}
        subtitle={isEdit ? team?.name : 'إنشاء فريق تنفيذ جديد'}
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
          <Select label="البورد (اختياري)" error={errors.boardId?.message} {...register('boardId')}>
            <option value="">بدون بورد</option>
            {(boardsData?.data || []).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
          <Input label="الاسم" error={errors.name?.message} {...register('name')} />
          <Textarea label="الوصف" error={errors.description?.message} {...register('description')} />
          <Select label="النوع" error={errors.type?.message} {...register('type')}>
            {Object.entries(STATUS_LABELS.teamType).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          <Input label="اللون" type="color" error={errors.color?.message} className="h-12 p-1" {...register('color')} />
          <Select label="القائد" error={errors.leaderId?.message} {...register('leaderId')}>
            <option value="">بدون قائد</option>
            {(usersData?.data || []).map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <input type="checkbox" className="rounded" {...register('isActive')} />
            فريق نشط
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending}>{isEdit ? 'حفظ التعديلات' : 'إنشاء الفريق'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.TEAMS)}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
