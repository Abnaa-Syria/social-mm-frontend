import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { teamsService } from '../../services/index.js';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import FilterBar from '../../components/common/FilterBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatNumber, getApiErrorMessage } from '../../lib/formatters';
import { STATUS_LABELS } from '../../config/constants';
import { ROUTES } from '../../config/routes';

export default function TeamsListPage() {
  const queryClient = useQueryClient();
  const { page, limit, setPage } = usePagination();
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['teams', page, limit, debouncedSearch, isActive],
    queryFn: () => teamsService.list({
      page,
      limit,
      search: debouncedSearch || undefined,
      isActive: isActive === '' ? undefined : isActive === 'true',
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: teamsService.delete,
    onSuccess: () => {
      toast.success('تم حذف الفريق بنجاح');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setDeleteId(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => teamsService.updateActive(id, active),
    onSuccess: () => {
      toast.success('تم تحديث حالة الفريق');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const columns = [
    { key: 'name', title: 'الاسم', render: (row) => (
      <div className="flex items-center gap-2">
        {row.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />}
        <span className="font-bold">{row.name}</span>
      </div>
    )},
    { key: 'type', title: 'النوع', render: (row) => STATUS_LABELS.teamType[row.type] || row.type },
    { key: 'board', title: 'البورد', render: (row) => row.board?.name || '—' },
    { key: 'leader', title: 'القائد', render: (row) => row.leader?.name || '—' },
    { key: 'members', title: 'الأعضاء', render: (row) => formatNumber(row._count?.members) },
    { key: 'isActive', title: 'الحالة', render: (row) => (
      <Badge color={row.isActive ? 'success' : 'default'}>{row.isActive ? 'نشط' : 'غير نشط'}</Badge>
    )},
    { key: 'actions', title: 'إجراءات', render: (row) => (
      <div className="flex items-center gap-2">
        <Link to={ROUTES.TEAM_DETAILS(row.id)}>
          <Button variant="ghost" size="sm"><Eye size={16} /></Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleMutation.mutate({ id: row.id, active: !row.isActive })}
        >
          {row.isActive ? 'تعطيل' : 'تفعيل'}
        </Button>
        <Link to={ROUTES.TEAM_EDIT(row.id)}>
          <Button variant="ghost" size="sm"><Pencil size={16} /></Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)}>
          <Trash2 size={16} className="text-red-500" />
        </Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="الفرق"
        subtitle="إدارة فرق التنفيذ"
        action={
          <Link to={ROUTES.TEAM_CREATE}>
            <Button><Plus size={18} /> إضافة فريق</Button>
          </Link>
        }
      />

      <FilterBar>
        <div className="flex-1 min-w-[200px]">
          <SearchInput value={search} onChange={setSearch} placeholder="بحث بالاسم..." />
        </div>
        <Select value={isActive} onChange={(e) => { setIsActive(e.target.value); setPage(1); }} className="w-40">
          <option value="">كل الحالات</option>
          <option value="true">نشطة</option>
          <option value="false">غير نشطة</option>
        </Select>
      </FilterBar>

      <Table columns={columns} data={data?.data} loading={isLoading} emptyMessage="لا توجد فرق" />

      <Pagination
        page={page}
        totalPages={data?.meta?.totalPages}
        total={data?.meta?.total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="حذف الفريق"
        message="هل أنت متأكد من حذف هذا الفريق؟"
      />
    </div>
  );
}
