import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersService, rolesService } from '../../services/index.js';
import usePermissions from '../../hooks/usePermissions';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getApiErrorMessage } from '../../lib/formatters.js';
import { ROUTES } from '../../config/routes.js';
import { STATUS_LABELS } from '../../config/constants.js';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const PASSWORD_MESSAGE =
  'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتتضمن حرفاً كبيراً وصغيراً ورقماً ورمزاً خاصاً';

const baseSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().max(20).optional().or(z.literal('')),
  roleId: z.coerce.number().positive('اختر دوراً'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

const createSchema = baseSchema.extend({
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
});

const editSchema = baseSchema;

const STATUS_OPTIONS = Object.entries(STATUS_LABELS.user);

export default function UserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { can } = usePermissions();

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.get(id),
    enabled: isEdit,
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles-all'],
    queryFn: () => rolesService.list({ limit: 100 }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      roleId: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        roleId: user.roleId,
        status: user.status,
      });
    }
  }, [user, reset]);

  const createMutation = useMutation({
    mutationFn: (data) => usersService.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء المستخدم بنجاح');
      navigate(ROUTES.USERS);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const { status, ...payload } = data;
      await usersService.update(id, payload);
      if (status !== user?.status) {
        await usersService.updateUserStatus(id, status);
      }
    },
    onSuccess: () => {
      toast.success('تم تحديث المستخدم بنجاح');
      navigate(ROUTES.USERS);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      phone: data.phone || null,
      roleId: Number(data.roleId),
    };
    if (isEdit) {
      if (!can('users.update')) return toast.error('ليس لديك صلاحية التعديل');
      updateMutation.mutate(payload);
    } else {
      if (!can('users.create')) return toast.error('ليس لديك صلاحية الإنشاء');
      createMutation.mutate(payload);
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoading) return <LoadingState />;
  if (isEdit && error) return <ErrorState message="فشل تحميل بيانات المستخدم" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'تعديل مستخدم' : 'إضافة مستخدم'}
        subtitle={isEdit ? `تعديل: ${user?.name}` : 'إنشاء حساب مستخدم جديد'}
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="الاسم" error={errors.name?.message} {...register('name')} />
          <Input label="البريد الإلكتروني" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="الهاتف" error={errors.phone?.message} {...register('phone')} />

          {!isEdit && (
            <Input
              label="كلمة المرور"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          )}

          <Select label="الدور" error={errors.roleId?.message} {...register('roleId')}>
            <option value="">اختر الدور</option>
            {(rolesData?.data || []).map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>

          <Select label="الحالة" error={errors.status?.message} {...register('status')}>
            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>
              {isEdit ? 'حفظ التعديلات' : 'إنشاء المستخدم'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.USERS)}>
              إلغاء
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
