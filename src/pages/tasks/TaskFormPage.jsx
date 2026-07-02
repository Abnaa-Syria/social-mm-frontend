import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tasksService, postLinksService, taskTypesService, teamsService } from '../../services';
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
  postLinkId: z.coerce.number().positive('رابط المنشور مطلوب'),
  taskTypeId: z.coerce.number().positive('نوع المهمة مطلوب'),
  teamId: z.coerce.number().positive().optional().or(z.literal('')),
  title: z.string().min(2, 'العنوان مطلوب').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  targetCount: z.coerce.number().min(0).optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional().or(z.literal('')),
});

const toDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 16);
};

export default function TaskFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const prefillPostLinkId = searchParams.get('postLinkId');
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: task, isLoading: loadingTask, error: loadError } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksService.get(id),
    enabled: isEdit,
  });

  const { data: postLinksData } = useQuery({ queryKey: ['post-links-select'], queryFn: () => postLinksService.list({ limit: 100 }) });
  const { data: taskTypesData } = useQuery({ queryKey: ['task-types-select'], queryFn: () => taskTypesService.list({ limit: 100 }) });
  const { data: teamsData } = useQuery({ queryKey: ['teams-select'], queryFn: () => teamsService.list({ limit: 100 }) });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      postLinkId: prefillPostLinkId || '',
      taskTypeId: '',
      teamId: '',
      title: '',
      description: '',
      targetCount: 0,
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        postLinkId: task.postLinkId,
        taskTypeId: task.taskTypeId,
        teamId: task.teamId || '',
        title: task.title,
        description: task.description || '',
        targetCount: task.targetCount || 0,
        status: task.status,
        priority: task.priority,
        dueDate: toDateInput(task.dueDate),
      });
    }
  }, [task, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        teamId: data.teamId ? Number(data.teamId) : null,
        description: data.description || null,
        targetCount: Number(data.targetCount) || 0,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };
      if (isEdit) {
        const { postLinkId: _, taskTypeId: __, status: ___, ...updateData } = payload;
        return tasksService.update(id, updateData);
      }
      return tasksService.create(payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(isEdit ? 'تم تحديث المهمة' : 'تم إنشاء المهمة');
      navigate(isEdit ? ROUTES.TASK_DETAILS(id) : ROUTES.TASK_DETAILS(result.id));
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isEdit && loadingTask) return <LoadingState />;
  if (isEdit && loadError) return <ErrorState message="فشل تحميل المهمة" />;

  return (
    <div>
      <PageHeader title={isEdit ? 'تعديل المهمة' : 'إضافة مهمة'} subtitle={isEdit ? task?.title : 'إنشاء مهمة جديدة'} />

      <Card>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5 max-w-2xl">
          {!isEdit && (
            <Select label="رابط المنشور *" error={errors.postLinkId?.message} {...register('postLinkId')}>
              <option value="">اختر الرابط</option>
              {(postLinksData?.data || []).map((pl) => (
                <option key={pl.id} value={pl.id}>{pl.title || pl.url}</option>
              ))}
            </Select>
          )}

          {!isEdit && (
            <Select label="نوع المهمة *" error={errors.taskTypeId?.message} {...register('taskTypeId')}>
              <option value="">اختر النوع</option>
              {(taskTypesData?.data || []).map((tt) => (
                <option key={tt.id} value={tt.id}>{tt.name}</option>
              ))}
            </Select>
          )}

          <Input label="العنوان *" error={errors.title?.message} {...register('title')} />
          <Textarea label="الوصف" error={errors.description?.message} {...register('description')} />
          <Input label="العدد المستهدف" type="number" min={0} error={errors.targetCount?.message} {...register('targetCount')} />

          <Select label="الفريق" error={errors.teamId?.message} {...register('teamId')}>
            <option value="">بدون فريق</option>
            {(teamsData?.data || []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>

          <Select label="الأولوية" {...register('priority')}>
            {Object.entries(STATUS_LABELS.priority).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>

          <Input label="تاريخ الاستحقاق" type="datetime-local" error={errors.dueDate?.message} {...register('dueDate')} />

          {!isEdit && (
            <Select label="الحالة" {...register('status')}>
              {Object.entries(STATUS_LABELS.task).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending}>{isEdit ? 'حفظ' : 'إنشاء'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
