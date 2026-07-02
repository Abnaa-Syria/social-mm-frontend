import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { settingsService } from '../../services/index.js';
import usePermissions from '../../hooks/usePermissions';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getApiErrorMessage } from '../../lib/formatters.js';

const SETTING_KEYS = [
  'platform_name',
  'default_language',
  'direction',
  'primary_font',
  'timezone',
];

const schema = z.object({
  platform_name: z.string().min(1, 'اسم المنصة مطلوب'),
  default_language: z.string().min(1, 'اللغة الافتراضية مطلوبة'),
  direction: z.enum(['rtl', 'ltr']),
  primary_font: z.string().min(1, 'الخط الأساسي مطلوب'),
  timezone: z.string().min(1, 'المنطقة الزمنية مطلوبة'),
});

const FIELD_LABELS = {
  platform_name: 'اسم المنصة',
  default_language: 'اللغة الافتراضية',
  direction: 'اتجاه الواجهة',
  primary_font: 'الخط الأساسي',
  timezone: 'المنطقة الزمنية',
};

export default function SettingsPage() {
  const { can } = usePermissions();

  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.list,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      platform_name: '',
      default_language: 'ar',
      direction: 'rtl',
      primary_font: 'Almarai',
      timezone: 'Africa/Cairo',
    },
  });

  useEffect(() => {
    if (settings?.length) {
      const values = {};
      settings.forEach((s) => {
        if (SETTING_KEYS.includes(s.key)) {
          values[s.key] = s.value;
        }
      });
      reset({
        platform_name: values.platform_name || '',
        default_language: values.default_language || 'ar',
        direction: values.direction || 'rtl',
        primary_font: values.primary_font || 'Almarai',
        timezone: values.timezone || 'Africa/Cairo',
      });
    }
  }, [settings, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      await Promise.all(
        SETTING_KEYS.map((key) =>
          settingsService.update(key, { value: data[key] })
        )
      );
    },
    onSuccess: () => {
      toast.success('تم حفظ الإعدادات بنجاح');
      refetch();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const onSubmit = (data) => {
    if (!can('settings.update')) return toast.error('ليس لديك صلاحية التعديل');
    saveMutation.mutate(data);
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل الإعدادات" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="الإعدادات"
        subtitle="إعدادات المنصة العامة والتخصيص"
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label={FIELD_LABELS.platform_name}
            error={errors.platform_name?.message}
            disabled={!can('settings.update')}
            {...register('platform_name')}
          />

          <Select
            label={FIELD_LABELS.default_language}
            error={errors.default_language?.message}
            disabled={!can('settings.update')}
            {...register('default_language')}
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </Select>

          <Select
            label={FIELD_LABELS.direction}
            error={errors.direction?.message}
            disabled={!can('settings.update')}
            {...register('direction')}
          >
            <option value="rtl">من اليمين لليسار (RTL)</option>
            <option value="ltr">من اليسار لليمين (LTR)</option>
          </Select>

          <Input
            label={FIELD_LABELS.primary_font}
            error={errors.primary_font?.message}
            disabled={!can('settings.update')}
            {...register('primary_font')}
          />

          <Select
            label={FIELD_LABELS.timezone}
            error={errors.timezone?.message}
            disabled={!can('settings.update')}
            {...register('timezone')}
          >
            <option value="Africa/Cairo">Africa/Cairo</option>
            <option value="Asia/Riyadh">Asia/Riyadh</option>
            <option value="Asia/Dubai">Asia/Dubai</option>
            <option value="UTC">UTC</option>
          </Select>

          {can('settings.update') && (
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={saveMutation.isPending} disabled={!isDirty}>
                حفظ الإعدادات
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
