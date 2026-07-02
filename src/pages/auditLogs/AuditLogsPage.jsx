import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsService, usersService } from '../../services/index.js';
import { usePagination } from '../../hooks/usePagination';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import FilterBar from '../../components/common/FilterBar';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { formatDateTime } from '../../lib/formatters.js';

const ENTITY_LABELS = {
  user: 'المستخدمين',
  role: 'الأدوار',
  setting: 'الإعدادات',
  board: 'البوردات',
  campaign: 'الحملات',
  platform: 'المنصات',
  team: 'الفرق',
  post_link: 'روابط المنشورات',
  task_type: 'أنواع المهام',
  task: 'المهام',
  task_assignment: 'التعيينات',
  comment_suggestion: 'اقتراحات التعليقات',
  proof: 'إثباتات التنفيذ',
};

const ACTION_LABELS = {
  create: 'إنشاء',
  update: 'تحديث',
  delete: 'حذف',
  update_status: 'تحديث الحالة',
  update_permissions: 'تحديث الصلاحيات',
  approve: 'موافقة',
  reject: 'رفض',
};

const ENTITY_OPTIONS = Object.entries(ENTITY_LABELS);

export default function AuditLogsPage() {
  const { page, limit, setPage, resetPage } = usePagination();
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const [userId, setUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: usersData } = useQuery({
    queryKey: ['users-audit-filter'],
    queryFn: () => usersService.list({ limit: 100 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, limit, entity, action, userId, startDate, endDate],
    queryFn: () =>
      auditLogsService.list({
        page,
        limit,
        entity: entity || undefined,
        action: action || undefined,
        userId: userId || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(`${endDate}T23:59:59`).toISOString() : undefined,
      }),
  });

  const logs = data?.data || [];
  const meta = data?.meta;

  const columns = [
    {
      key: 'createdAt',
      title: 'التاريخ',
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: 'user',
      title: 'المستخدم',
      render: (row) => row.user?.name || '—',
    },
    {
      key: 'action',
      title: 'الإجراء',
      render: (row) => (
        <span className="font-bold">{ACTION_LABELS[row.action] || row.action}</span>
      ),
    },
    {
      key: 'entity',
      title: 'الكيان',
      render: (row) => ENTITY_LABELS[row.entity] || row.entity,
    },
    {
      key: 'entityId',
      title: 'معرّف الكيان',
      render: (row) => row.entityId ?? '—',
    },
    {
      key: 'ipAddress',
      title: 'عنوان IP',
      render: (row) => row.ipAddress || '—',
    },
  ];

  return (
    <div>
      <PageHeader
        title="سجل التدقيق"
        subtitle="تتبع جميع العمليات والتغييرات في النظام"
      />

      <Card padding={false} className="overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <FilterBar>
            <Select
              value={entity}
              onChange={(e) => {
                setEntity(e.target.value);
                resetPage();
              }}
              className="min-w-[160px]"
            >
              <option value="">كل الكيانات</option>
              {ENTITY_OPTIONS.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>

            <Select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                resetPage();
              }}
              className="min-w-[160px]"
            >
              <option value="">كل الإجراءات</option>
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>

            <Select
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                resetPage();
              }}
              className="min-w-[180px]"
            >
              <option value="">كل المستخدمين</option>
              {(usersData?.data || []).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>

            <Input
              type="date"
              label="من تاريخ"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                resetPage();
              }}
              className="min-w-[160px]"
            />

            <Input
              type="date"
              label="إلى تاريخ"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                resetPage();
              }}
              className="min-w-[160px]"
            />
          </FilterBar>
        </div>

        <div className="p-4">
          <Table columns={columns} data={logs} loading={isLoading} emptyMessage="لا توجد سجلات" />
          <Pagination
            page={meta?.page || page}
            totalPages={meta?.totalPages || 1}
            total={meta?.total || 0}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}
