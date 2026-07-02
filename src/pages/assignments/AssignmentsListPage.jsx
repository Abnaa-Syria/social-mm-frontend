import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { assignmentsService, tasksService, usersService, teamsService } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import usePagination from '../../hooks/usePagination';
import { ROUTES } from '../../config/routes';
import { STATUS_LABELS } from '../../config/constants';
import { formatDateTime, formatStatus } from '../../lib/formatters';

export default function AssignmentsListPage() {
  const { page, limit, setPage, resetPage } = usePagination();
  const [taskId, setTaskId] = useState('');
  const [userId, setUserId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const params = {
    page,
    limit,
    ...(taskId && { taskId: Number(taskId) }),
    ...(userId && { userId: Number(userId) }),
    ...(teamId && { teamId: Number(teamId) }),
    ...(status && { status }),
    ...(startDate && { startDate: new Date(startDate).toISOString() }),
    ...(endDate && { endDate: new Date(endDate).toISOString() }),
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['assignments', params],
    queryFn: () => assignmentsService.list(params),
  });

  const { data: tasksData } = useQuery({ queryKey: ['tasks-select'], queryFn: () => tasksService.list({ limit: 100 }) });
  const { data: usersData } = useQuery({ queryKey: ['users-select'], queryFn: () => usersService.list({ limit: 100 }) });
  const { data: teamsData } = useQuery({ queryKey: ['teams-select'], queryFn: () => teamsService.list({ limit: 100 }) });

  const assignments = data?.data || [];
  const meta = data?.meta;

  const columns = [
    { key: 'task', title: 'المهمة', render: (row) => row.task?.title || '—' },
    { key: 'user', title: 'المستخدم', render: (row) => row.user?.name || '—' },
    { key: 'team', title: 'الفريق', render: (row) => row.team?.name || '—' },
    {
      key: 'status',
      title: 'الحالة',
      render: (row) => <StatusBadge status={row.status} label={formatStatus(row.status, 'assignment')} />,
    },
    { key: 'assignedAt', title: 'تاريخ الإسناد', render: (row) => formatDateTime(row.assignedAt) },
    {
      key: 'actions',
      title: 'إجراءات',
      render: (row) => (
        <Link to={ROUTES.ASSIGNMENT_DETAILS(row.id)}>
          <Button variant="ghost" size="sm"><Eye size={16} /></Button>
        </Link>
      ),
    },
  ];

  if (error) return <ErrorState message="فشل تحميل التعيينات" onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="التعيينات" subtitle="متابعة إسناد المهام للمستخدمين" />

      <FilterBar>
        <Select label="المهمة" value={taskId} onChange={(e) => { setTaskId(e.target.value); resetPage(); }} className="min-w-[160px]">
          <option value="">الكل</option>
          {(tasksData?.data || []).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </Select>
        <Select label="المستخدم" value={userId} onChange={(e) => { setUserId(e.target.value); resetPage(); }} className="min-w-[160px]">
          <option value="">الكل</option>
          {(usersData?.data || []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </Select>
        <Select label="الفريق" value={teamId} onChange={(e) => { setTeamId(e.target.value); resetPage(); }} className="min-w-[160px]">
          <option value="">الكل</option>
          {(teamsData?.data || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
        <Select label="الحالة" value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="min-w-[160px]">
          <option value="">الكل</option>
          {Object.entries(STATUS_LABELS.assignment).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Input label="من تاريخ" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); resetPage(); }} />
        <Input label="إلى تاريخ" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); resetPage(); }} />
      </FilterBar>

      <Table columns={columns} data={assignments} loading={isLoading} emptyMessage="لا توجد تعيينات" />
      <Pagination page={meta?.page || page} totalPages={meta?.totalPages} total={meta?.total} onPageChange={setPage} />
    </div>
  );
}
