import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { postLinksService, campaignsService, platformsService } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { getApiErrorMessage } from '../../lib/formatters';

const schema = z.object({
  campaignId: z.coerce.number().positive('الحملة مطلوبة'),
  platformId: z.coerce.number().positive('المنصة مطلوبة'),
  title: z.string().max(200).optional().or(z.literal('')),
  url: z.string().url('الرابط غير صالح'),
  description: z.string().max(1000).optional().or(z.literal('')),
  thumbnailUrl: z.string().url('رابط الصورة غير صالح').optional().or(z.literal('')),
  status: z.string().optional(),
  dueDate: z.string().optional().or(z.literal('')),
});

const toDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 16);
};

export default function PostLinkFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: postLink, isLoading: loadingPostLink, error: loadError } = useQuery({
    queryKey: ['post-link', id],
    queryFn: () => postLinksService.get(id),
    enabled: isEdit,
  });

  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns-select'],
    queryFn: () => campaignsService.list({ limit: 100 }),
  });

  const { data: platformsData } = useQuery({
    queryKey: ['platforms-select'],
    queryFn: () => platformsService.list({ limit: 100 }),
  });

  const campaigns = campaignsData?.data || [];
  const platforms = platformsData?.data || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      campaignId: '',
      platformId: '',
      title: '',
      url: '',
      description: '',
      thumbnailUrl: '',
      status: 'NEW',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (postLink) {
      reset({
        campaignId: postLink.campaignId,
        platformId: postLink.platformId,
        title: postLink.title || '',
        url: postLink.url,
        description: postLink.description || '',
        thumbnailUrl: postLink.thumbnailUrl || '',
        status: postLink.status,
        dueDate: toDateInput(postLink.dueDate),
      });
    }
  }, [postLink, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        title: data.title || null,
        description: data.description || null,
        thumbnailUrl: data.thumbnailUrl || null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };
      if (isEdit) {
        const { campaignId: _, status: __, ...updateData } = payload;
        return postLinksService.update(id, updateData);
      }
      return postLinksService.create(payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['post-links'] });
      toast.success(isEdit ? 'تم تحديث الرابط بنجاح' : 'تم إنشاء الرابط بنجاح');
      navigate(isEdit ? ROUTES.POST_LINK_DETAILS(id) : ROUTES.POST_LINK_DETAILS(result.id));
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isEdit && loadingPostLink) return <LoadingState />;
  if (isEdit && loadError) return <ErrorState message="فشل تحميل الرابط" />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'تعديل رابط المنشور' : 'إضافة رابط منشور'}
        subtitle={isEdit ? postLink?.title || postLink?.url : 'إنشاء رابط منشور جديد للحملة'}
      />

      <Card>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5 max-w-2xl">
          {!isEdit && (
            <Select label="الحملة *" error={errors.campaignId?.message} {...register('campaignId')}>
              <option value="">اختر الحملة</option>
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          )}

          <Select label="المنصة *" error={errors.platformId?.message} {...register('platformId')}>
            <option value="">اختر المنصة</option>
            {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>

          <Input label="العنوان" placeholder="عنوان اختياري" error={errors.title?.message} {...register('title')} />
          <Input label="الرابط *" type="url" placeholder="https://..." error={errors.url?.message} {...register('url')} dir="ltr" />
          <Textarea label="الوصف" placeholder="وصف اختياري" error={errors.description?.message} {...register('description')} />
          <Input label="رابط الصورة المصغرة" type="url" placeholder="https://..." error={errors.thumbnailUrl?.message} {...register('thumbnailUrl')} dir="ltr" />
          <Input label="تاريخ الاستحقاق" type="datetime-local" error={errors.dueDate?.message} {...register('dueDate')} />

          {!isEdit && (
            <Select label="الحالة" {...register('status')}>
              {Object.entries(STATUS_LABELS.postLink).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? 'حفظ التعديلات' : 'إنشاء الرابط'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
