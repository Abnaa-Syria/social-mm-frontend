import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { campaignsService, boardsService } from '../../services/index.js';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchInput from '../../components/common/SearchInput';
import FilterBar from '../../components/common/FilterBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatStatus, formatPriority, formatNumber, getApiErrorMessage } from '../../lib/formatters';
import { STATUS_LABELS } from '../../config/constants';
import { ROUTES } from '../../config/routes';

export default function CampaignsListPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { page, limit, setPage } = usePagination();
  const [search, setSearch] = useState('');
  const [boardId, setBoardId] = useState(searchParams.get('boardId') || '');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const debouncedSearch = useDebounce(search);

  const { data: boardsData } = useQuery({
    queryKey: ['boards', 'all'],
    queryFn: () => boardsService.list({ limit: 100 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page, limit, debouncedSearch, boardId, status, priority],
    queryFn: () => campaignsService.list({
      page,
      limit,
      search: debouncedSearch || undefined,
      boardId: boardId || undefined,
      status: status || undefined,
      priority: priority || undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: campaignsService.delete,
    onSuccess: () => {
      toast.success('تم حذف الحملة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setDeleteId(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const columns = [
    { key: 'name', title: 'الاسم', render: (row) => <span className="font-bold">{row.name}</span> },
    { key: 'board', title: 'البورد', render: (row) => row.board?.name || '—' },
    { key: 'status', title: 'الحالة', render: (row) => (
      <StatusBadge status={row.status} label={formatStatus(row.status, 'campaign')} />
    )},
    { key: 'priority', title: 'الأولوية', render: (row) => (
      <PriorityBadge priority={row.priority} label={formatPriority(row.priority)} />
    )},
    { key: 'postLinks', title: 'روابط المنشورات', render: (row) => formatNumber(row._count?.postLinks) },
    { key: 'actions', title: 'إجراءات', render: (row) => (
      <div className="flex items-center gap-2">
        <Link to={ROUTES.CAMPAIGN_DETAILS(row.id)}>
          <Button variant="ghost" size="sm"><Eye size={16} /></Button>
        </Link>
        <Link to={ROUTES.CAMPAIGN_EDIT(row.id)}>
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
        title="الحملات"
        subtitle="إدارة حملات السوشيال ميديا"
        action={
          <Link to={ROUTES.CAMPAIGN_CREATE}>
            <Button><Plus size={18} /> إضافة حملة</Button>
          </Link>
        }
      />

      <FilterBar>
        <div className="flex-1 min-w-[200px]">
          <SearchInput value={search} onChange={setSearch} placeholder="بحث بالاسم أو الهدف..." />
        </div>
        <Select value={boardId} onChange={(e) => { setBoardId(e.target.value); setPage(1); }} className="w-44">
          <option value="">كل البوردات</option>
          {(boardsData?.data || []).map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_LABELS.campaign).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }} className="w-40">
          <option value="">كل الأولويات</option>
          {Object.entries(STATUS_LABELS.priority).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </FilterBar>

      <Table columns={columns} data={data?.data} loading={isLoading} emptyMessage="لا توجد حملات" />

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
        title="حذف الحملة"
        message="هل أنت متأكد من حذف هذه الحملة؟ سيتم أرشفتها."
      />
    </div>
  );
}
