import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pencil, ArrowRight } from 'lucide-react';
import { usersService } from '../../services/index.js';
import usePermissions from '../../hooks/usePermissions';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/Badge';
import { formatDateTime, formatStatus, getInitials } from '../../lib/formatters.js';
import { ROUTES } from '../../config/routes.js';

export default function UserDetailsPage() {
  const { id } = useParams();
  const { can } = usePermissions();

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.get(id),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="فشل تحميل بيانات المستخدم" onRetry={refetch} />;
  if (!user) return <ErrorState message="المستخدم غير موجود" />;

  const fields = [
    { label: 'البريد الإلكتروني', value: user.email },
    { label: 'الهاتف', value: user.phone || '—' },
    { label: 'الدور', value: user.role?.name || '—' },
    {
      label: 'الحالة',
      value: <StatusBadge status={user.status} label={formatStatus(user.status, 'user')} />,
    },
    { label: 'آخر تسجيل دخول', value: formatDateTime(user.lastLoginAt) },
    { label: 'تاريخ الإنشاء', value: formatDateTime(user.createdAt) },
    { label: 'آخر تحديث', value: formatDateTime(user.updatedAt) },
  ];

  return (
    <div>
      <PageHeader
        title="تفاصيل المستخدم"
        subtitle={user.name}
        action={
          <div className="flex gap-2">
            <Link to={ROUTES.USERS}>
              <Button variant="secondary">
                <ArrowRight size={16} />
                العودة للقائمة
              </Button>
            </Link>
            {can('users.update') && (
              <Link to={ROUTES.USER_EDIT(user.id)}>
                <Button>
                  <Pencil size={16} />
                  تعديل
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <Card className="max-w-2xl">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#7C3AED] flex items-center justify-center text-white text-xl font-extrabold">
            {getInitials(user.name)}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.role?.slug}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-bold text-gray-500 mb-1">{label}</dt>
              <dd className="text-sm font-bold text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>

        {user.role?.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 mb-1">وصف الدور</p>
            <p className="text-sm text-gray-700">{user.role.description}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
