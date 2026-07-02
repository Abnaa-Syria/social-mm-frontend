import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { campaignsService, boardsService } from '../../services/index.js';
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
  boardId: z.coerce.number().positive('يجب اختيار البورد'),
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  description: z.string().max(1000).optional(),
  objective: z.string().max(500).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).default('DRAFT'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export default function CampaignFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: boardsData } = useQuery({
    queryKey: ['boards', 'all'],
    queryFn: () => boardsService.list({ limit: 100, status: 'ACTIVE' }),
  });

  const { data: campaign, isLoading, error, refetch } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsService.get(id),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      boardId: '',
      name: '',
      description: '',
      objective: '',
      startDate: '',
      endDate: '',
      status: 'DRAFT',
      priority: 'MEDIUM',
    },
  });

  useEffect(() => {
    if (campaign) {
      reset({
        boardId: campaign.boardId,
        name: campaign.name,
        description: campaign.description || '',
        objective: campaign.objective || '',
        startDate: campaign.startDate ? campaign.startDate.slice(0, 10) : '',
        endDate: campaign.endDate ? campaign.endDate.slice(0, 10) : '',
        status: campaign.status,
        priority: campaign.priority,
      });
    }
  }, [campaign, reset]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        boardId: formData.boardId,
        name: formData.name,
        description: formData.description || null,
        objective: formData.objective || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        priority: formData.priority,
      };
      if (isEdit) {
        await campaignsService.update(id, payload);
        if (formData.status !== campaign?.status) {
          await campaignsService.updateStatus(id, { status: formData.status });
        }
        return;
      }
      return campaignsService.create({ ...payload, status: formData.status });
    },
    onSuccess: () => {
      toast.success(isEdit ? 'تم تحديث الحملة بنجاح' : 'تم إنشاء الحملة بنجاح');
      navigate(ROUTES.CAMPAIGNS);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isEdit && isLoading) return <LoadingState />;
  if (isEdit && error) return <ErrorState message="فشل تحميل الحملة" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'تعديل الحملة' : 'إضافة حملة'}
        subtitle={isEdit ? campaign?.name : 'إنشاء حملة سوشيال ميديا جديدة'}
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
          <Select label="البورد" error={errors.boardId?.message} {...register('boardId')} disabled={isEdit}>
            <option value="">اختر البورد</option>
            {(boardsData?.data || []).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
          <Input label="الاسم" error={errors.name?.message} {...register('name')} />
          <Textarea label="الوصف" error={errors.description?.message} {...register('description')} />
          <Textarea label="الهدف" error={errors.objective?.message} {...register('objective')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="تاريخ البداية" type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Input label="تاريخ النهاية" type="date" error={errors.endDate?.message} {...register('endDate')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="الحالة" error={errors.status?.message} {...register('status')}>
              {Object.entries(STATUS_LABELS.campaign).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
            <Select label="الأولوية" error={errors.priority?.message} {...register('priority')}>
              {Object.entries(STATUS_LABELS.priority).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending}>{isEdit ? 'حفظ التعديلات' : 'إنشاء الحملة'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.CAMPAIGNS)}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
