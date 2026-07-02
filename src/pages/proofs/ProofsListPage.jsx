import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { proofsService, assignmentsService } from '../../services';
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

export default function ProofsListPage() {
  const { page, limit, setPage, resetPage } = usePagination();
  const [assignmentId, setAssignmentId] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const params = {
    page,
    limit,
    ...(assignmentId && { assignmentId: Number(assignmentId) }),
    ...(status && { status }),
    ...(type && { type }),
    ...(startDate && { startDate: new Date(startDate).toISOString() }),
    ...(endDate && { endDate: new Date(endDate).toISOString() }),
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['proofs', params],
    queryFn: () => proofsService.list(params),
  });

  const { data: assignmentsData } = useQuery({
    queryKey: ['assignments-select'],
    queryFn: () => assignmentsService.list({ limit: 100 }),
  });

  const proofs = data?.data || [];
  const meta = data?.meta;

  const columns = [
    { key: 'assignmentId', title: 'التعيين', render: (row) => `#${row.assignmentId}` },
    { key: 'type', title: 'النوع', render: (row) => STATUS_LABELS.proofType[row.type] || row.type },
    {
      key: 'status',
      title: 'الحالة',
      render: (row) => <StatusBadge status={row.status} label={formatStatus(row.status, 'proof')} />,
    },
    { key: 'createdAt', title: 'التاريخ', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actions',
      title: 'إجراءات',
      render: (row) => (
        <Link to={ROUTES.PROOF_DETAILS(row.id)}>
          <Button variant="ghost" size="sm"><Eye size={16} /></Button>
        </Link>
      ),
    },
  ];

  if (error) return <ErrorState message="فشل تحميل الإثباتات" onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="إثباتات التنفيذ" subtitle="مراجعة إثباتات تنفيذ المهام" />

      <FilterBar>
        <Select label="التعيين" value={assignmentId} onChange={(e) => { setAssignmentId(e.target.value); resetPage(); }} className="min-w-[180px]">
          <option value="">الكل</option>
          {(assignmentsData?.data || []).map((a) => (
            <option key={a.id} value={a.id}>{a.task?.title} - {a.user?.name}</option>
          ))}
        </Select>
        <Select label="الحالة" value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="min-w-[140px]">
          <option value="">الكل</option>
          {Object.entries(STATUS_LABELS.proof).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Select label="النوع" value={type} onChange={(e) => { setType(e.target.value); resetPage(); }} className="min-w-[140px]">
          <option value="">الكل</option>
          {Object.entries(STATUS_LABELS.proofType).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Input label="من تاريخ" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); resetPage(); }} />
        <Input label="إلى تاريخ" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); resetPage(); }} />
      </FilterBar>

      <Table columns={columns} data={proofs} loading={isLoading} emptyMessage="لا توجد إثباتات" />
      <Pagination page={meta?.page || page} totalPages={meta?.totalPages} total={meta?.total} onPageChange={setPage} />
    </div>
  );
}
