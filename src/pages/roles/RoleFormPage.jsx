import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { rolesService } from '../../services/index.js';
import usePermissions from '../../hooks/usePermissions';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getApiErrorMessage } from '../../lib/formatters.js';
import { ROUTES } from '../../config/routes.js';

const schema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9_]+$/, 'المعرّف يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطة سفلية فقط'),
  description: z.string().max(500).optional().or(z.literal('')),
});

export default function RoleFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { can } = usePermissions();

  const { data: role, isLoading, error, refetch } = useQuery({
    queryKey: ['role', id],
    queryFn: () => rolesService.get(id),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', description: '' },
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        slug: role.slug,
        description: role.description || '',
      });
    }
  }, [role, reset]);

  const createMutation = useMutation({
    mutationFn: (data) => rolesService.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء الدور بنجاح');
      navigate(ROUTES.ROLES);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => rolesService.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الدور بنجاح');
      navigate(ROUTES.ROLES);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const onSubmit = (data) => {
    const payload = { ...data, description: data.description || null };
    if (isEdit) {
      if (!can('roles.update')) return toast.error('ليس لديك صلاحية التعديل');
      updateMutation.mutate(payload);
    } else {
      if (!can('roles.create')) return toast.error('ليس لديك صلاحية الإنشاء');
      createMutation.mutate(payload);
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoading) return <LoadingState />;
  if (isEdit && error) return <ErrorState message="فشل تحميل بيانات الدور" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'تعديل دور' : 'إضافة دور'}
        subtitle={isEdit ? `تعديل: ${role?.name}` : 'إنشاء دور جديد'}
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="الاسم" error={errors.name?.message} {...register('name')} />
          <Input
            label="المعرّف (slug)"
            placeholder="team_leader"
            error={errors.slug?.message}
            disabled={isEdit && role?.isSystem}
            {...register('slug')}
          />
          <Textarea label="الوصف" error={errors.description?.message} {...register('description')} />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>
              {isEdit ? 'حفظ التعديلات' : 'إنشاء الدور'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ROLES)}>
              إلغاء
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
